import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

type RevealAs = 'div' | 'span';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: RevealAs;
}

// Duration must match the Tailwind duration-700 class (700ms).
const TRANSITION_DURATION = 700;

export default function Reveal({
  children,
  delay = 0,
  className = '',
  as = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  // willChange is true only during the active transition window, not permanently.
  const [willChange, setWillChange] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const entering = entry.isIntersecting;
        setVisible(entering);

        // Activate will-change for the duration of the transition then drop it.
        // This promotes the layer only while the GPU actually needs it.
        if (timerRef.current) clearTimeout(timerRef.current);
        setWillChange(true);
        timerRef.current = setTimeout(() => {
          setWillChange(false);
        }, delay + TRANSITION_DURATION + 50); // +50ms safety margin
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [delay]);

  const baseClasses = [
    'transition-all duration-700 ease-out',
    willChange ? 'will-change-transform' : '',
    visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const props = {
    ref: ref as RefObject<any>,
    className: baseClasses,
    style: { transitionDelay: `${delay}ms` },
  };

  if (as === 'span') {
    return <span {...props}>{children}</span>;
  }
  return <div {...props}>{children}</div>;
}
