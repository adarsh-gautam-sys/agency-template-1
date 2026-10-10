import { Share2 } from 'lucide-react';
import Reveal from './Reveal';

export default function SectionTwo() {
  return (
    <section
      id="features"
      className="relative flex min-h-screen flex-col supports-[height:100svh]:min-h-[100svh] [@media(max-height:480px)]:pt-16"
    >
      {/* Middle row: headline + section label */}
      <div className="relative flex flex-1 flex-col justify-center gap-10 px-5 pt-24 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8 sm:pt-0 md:px-12">
        {/* Left: headline */}
        <h2 className="max-w-sm text-4xl font-medium uppercase leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl">
          <Reveal as="span" className="block" delay={100}>
            Learn{' '}
            <span className="normal-case italic font-light">to see</span>
          </Reveal>
          <Reveal as="span" className="block" delay={220}>
            Brilliantly
          </Reveal>
        </h2>

        {/* Right: section label + counter */}
        <Reveal delay={340}>
          <div className="flex items-center justify-between font-mono text-white sm:justify-start sm:gap-16 md:gap-24">
            <span className="text-lg">( B )</span>
            <span className="text-xs text-white/70">[ 002 /004 ]</span>
          </div>
        </Reveal>
      </div>

      {/* Bottom block: description + CTA
          Layout: flex-col on all sizes.
          CTA is in normal flow — no absolute positioning — so it can never
          overlap the description on short landscape viewports.
          On sm+ a flex-1 spacer pushes the CTA to the bottom, mimicking
          the original abs-centered look without the overlap risk. */}
      <div className="relative flex flex-col gap-6 px-5 pb-16 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:px-8 md:px-12 md:pb-20">
        {/* Description */}
        <Reveal delay={460}>
          <p className="max-w-xs text-sm leading-relaxed text-white/85 drop-shadow-md">
            Our AI doesn't just respond — it interprets, sharpens, and delivers.
            From outline to final render, it supplies the insight you want.
          </p>
        </Reveal>

        {/* CTA — full-width on mobile, right-aligned in-flow on sm+.
            Centred on sm+ by pushing it to a separate row via the flex layout. */}
        <Reveal delay={580} className="w-full sm:flex sm:justify-center sm:w-auto">
          <a
            href="#"
            className="block w-full rounded-full border border-white/60 px-10 py-3 text-center font-mono text-xs uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-white hover:text-black sm:w-auto sm:min-w-[200px]"
          >
            Run The Demo
          </a>
        </Reveal>
      </div>

      {/* Bottom-left: share button — p-2 expands tap target to ≥44px */}
      <Reveal
        delay={700}
        className="absolute bottom-3 left-3 sm:bottom-4 sm:left-6 md:left-10"
      >
        <button
          aria-label="Share"
          className="-m-2 p-2 text-white/80 transition-colors duration-300 hover:text-white"
        >
          <Share2 size={18} />
        </button>
      </Reveal>
    </section>
  );
}
