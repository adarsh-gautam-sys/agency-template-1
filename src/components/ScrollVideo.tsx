import { useEffect, useRef, useState, useCallback } from 'react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260611_104107_121bfb5a-b1df-4e0d-8240-25b81f7cc85d.mp4';

const MAX_CANVAS_DPR = 2;
const MAX_FRAME_WIDTH = 1280;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function ScrollVideo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackVideoRef = useRef<HTMLVideoElement>(null);
  const framesRef = useRef<ImageBitmap[]>([]);
  const [framesReady, setFramesReady] = useState(false);

  // Scrub state for fallback video
  const seekingRef = useRef(false);
  const lastSeekTimeRef = useRef(-1);

  // Animation loop refs
  const rafRef = useRef<number>(0);
  const smoothedRef = useRef(0);
  const lastFrameIndexRef = useRef(-1);

  // ── Visibility guard — pauses rAF when tab is hidden ──────────────────────
  // Both loops read this flag at the top of each tick.
  const pausedRef = useRef(false);

  useEffect(() => {
    const onVisibilityChange = () => {
      pausedRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  // ── Frame extraction ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    const extractedBitmaps: ImageBitmap[] = [];

    async function extractFrames() {
      try {
        const resp = await fetch(VIDEO_URL);
        if (cancelled) return;
        const blob = await resp.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);

        const vid = document.createElement('video');
        vid.muted = true;
        vid.playsInline = true;
        vid.preload = 'auto';
        vid.src = objectUrl;

        await new Promise<void>((resolve, reject) => {
          vid.onloadedmetadata = () => resolve();
          vid.onerror = reject;
          vid.load();
        });

        if (cancelled) return;

        const duration = vid.duration;
        const frameCount = clamp(Math.round(duration * 24), 30, 120);
        const scaleW = Math.min(vid.videoWidth, MAX_FRAME_WIDTH);
        const scaleH = Math.round((scaleW / vid.videoWidth) * vid.videoHeight);

        for (let i = 0; i < frameCount; i++) {
          if (cancelled) break;
          const t = (i / (frameCount - 1)) * (duration - 0.05);
          vid.currentTime = t;

          await new Promise<void>((resolve) => {
            const onSeeked = () => {
              vid.removeEventListener('seeked', onSeeked);
              resolve();
            };
            vid.addEventListener('seeked', onSeeked);
          });

          if (cancelled) break;

          const bitmap = await createImageBitmap(vid, {
            resizeWidth: scaleW,
            resizeHeight: scaleH,
            resizeQuality: 'medium',
          });
          extractedBitmaps.push(bitmap);
        }

        if (!cancelled) {
          framesRef.current = extractedBitmaps;
          setFramesReady(true);
        } else {
          extractedBitmaps.forEach((b) => b.close());
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Frame extraction failed, using fallback video:', err);
        }
      }
    }

    extractFrames();

    return () => {
      cancelled = true;
      framesRef.current.forEach((b) => b.close());
      framesRef.current = [];
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  // ── Canvas resize helper ───────────────────────────────────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_CANVAS_DPR);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // ── Draw a bitmap to canvas with cover math ──────────────────────────────
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    const frames = framesRef.current;
    if (!canvas || frames.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frame = frames[frameIndex];
    const cw = canvas.width;
    const ch = canvas.height;
    const fw = frame.width;
    const fh = frame.height;

    const scale = Math.max(cw / fw, ch / fh);
    const drawW = fw * scale;
    const drawH = fh * scale;
    const dx = (cw - drawW) / 2;
    const dy = (ch - drawH) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(frame, dx, dy, drawW, drawH);
  }, []);

  // ── Animation loop (canvas scrub) ────────────────────────────────────────
  useEffect(() => {
    if (!framesReady) return;

    const tick = () => {
      // Skip work while tab is hidden — browser may throttle anyway,
      // but the explicit guard ensures we never do canvas draw ops in background.
      if (!pausedRef.current) {
        const scrollHeight = document.documentElement.scrollHeight;
        const innerHeight = window.innerHeight;
        const target = clamp(
          window.scrollY / (scrollHeight - innerHeight || 1),
          0,
          1
        );

        smoothedRef.current += (target - smoothedRef.current) * 0.1;

        const frames = framesRef.current;
        if (frames.length > 0) {
          const frameIndex = Math.round(
            smoothedRef.current * (frames.length - 1)
          );
          if (frameIndex !== lastFrameIndexRef.current) {
            lastFrameIndexRef.current = frameIndex;
            drawFrame(frameIndex);
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [framesReady, drawFrame]);

  // ── Fallback video scrub (before frames ready) ───────────────────────────
  useEffect(() => {
    if (framesReady) return;

    const vid = fallbackVideoRef.current;
    if (!vid) return;

    const handleSeeked = () => {
      seekingRef.current = false;
    };
    vid.addEventListener('seeked', handleSeeked);

    const tick = () => {
      if (!pausedRef.current) {
        const scrollHeight = document.documentElement.scrollHeight;
        const innerHeight = window.innerHeight;
        const target = clamp(
          window.scrollY / (scrollHeight - innerHeight || 1),
          0,
          1
        );

        smoothedRef.current += (target - smoothedRef.current) * 0.1;

        if (!seekingRef.current && vid.duration) {
          const desiredTime = smoothedRef.current * (vid.duration - 0.05);
          if (Math.abs(desiredTime - lastSeekTimeRef.current) > 0.001) {
            seekingRef.current = true;
            lastSeekTimeRef.current = desiredTime;
            vid.currentTime = desiredTime;
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      vid.removeEventListener('seeked', handleSeeked);
    };
  }, [framesReady]);

  return (
    <div className="fixed inset-0 -z-10 bg-[#0a0a0a]">
      {/* Fallback video (shown while frames extract) */}
      {!framesReady && (
        <video
          ref={fallbackVideoRef}
          src={VIDEO_URL}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Canvas (shown once frames are ready) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ display: framesReady ? 'block' : 'none' }}
      />

      {/* Dark overlay for text contrast */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
}
