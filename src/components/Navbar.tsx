import { ArrowUpRight } from 'lucide-react';
import Reveal from './Reveal';

const NAV_LINKS = ['main', 'tiers', 'features', 'talk to us'];

export default function Navbar() {
  return (
    <>
      {/* Top-left: wordmark + version */}
      {/* On very short viewports (landscape phones) we tighten the top offset
          and hide the version string so the wordmark doesn't overlap headlines. */}
      <div className="fixed left-5 top-4 z-50 sm:left-8 sm:top-7 md:left-12">
        <Reveal>
          <a
            href="#"
            className="font-mono text-lg font-medium tracking-tight text-white drop-shadow-md sm:text-xl md:text-2xl"
          >
            (NOVA_AI)
          </a>
        </Reveal>
        {/* Hidden below 480px height (landscape phone) to prevent overlap */}
        <Reveal delay={150} className="[@media(max-height:480px)]:hidden">
          <p className="mt-4 font-mono text-[10px] text-white/60 sm:mt-6 sm:text-xs md:mt-8">
            [ v.01b ]
          </p>
        </Reveal>
      </div>

      {/* Top-right: nav links */}
      {/* On very short viewports collapse nav text to icons-only to prevent
          overlap with section counters. */}
      <nav className="fixed right-5 top-4 z-50 sm:right-8 sm:top-7 md:right-12">
        <ul className="flex flex-col items-end gap-1 sm:gap-2">
          {NAV_LINKS.map((link, i) => (
            <li key={link}>
              <Reveal delay={100 + i * 120}>
                <a
                  href={`#${link.replace(/\s+/g, '-')}`}
                  className="group flex items-center gap-1 font-mono text-xs text-white/80 drop-shadow-md transition-colors duration-300 hover:text-white sm:text-sm"
                >
                  {/* Label hidden on very short viewports to avoid overlapping counters */}
                  <span className="[@media(max-height:480px)]:hidden">{link}</span>
                  <ArrowUpRight
                    size={14}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
