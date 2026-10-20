import Image from 'next/image';
import Link from 'next/link';

const LINES = [
  "L'actualité, et plus encore",
  'La veille lue avant la réunion de 9 h',
  'Focus, chroniques et archives',
  'Résumés quotidiens, pays par pays',
  'Passez à Actu Plus Pro',
];

export function HomeAdSlot() {
  return (
    <aside aria-label="Publicité Actu Plus" className="min-w-0">
      <Link
        href="/subscriptions"
        className="flex h-16 items-center gap-4 overflow-hidden border border-[#ec3013]/25 bg-white px-4 transition-colors hover:bg-[#fff6f1]"
      >
        <span className="shrink-0 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#9b9797]">
          Publicité
        </span>
        <Image
          src="/images/logo-actu-plus.webp"
          alt="Actu Plus"
          width={120}
          height={38}
          className="h-9 w-auto shrink-0"
          unoptimized
        />
        <span className="hidden h-6 w-px shrink-0 bg-[#ec3013]/40 sm:block" />
        <span className="relative h-6 min-w-0 flex-1 overflow-hidden">
          <span className="home-ad-cycle block">
            {[...LINES, LINES[0]].map((line, index) => (
              <span key={`${line}-${index}`} className="flex h-6 items-center truncate text-sm font-semibold text-[#201e1d]">
                {line}
              </span>
            ))}
          </span>
        </span>
        <span className="shrink-0 text-xs font-extrabold uppercase tracking-[0.08em] text-[#ec3013]">
          Découvrir
        </span>
      </Link>
    </aside>
  );
}
