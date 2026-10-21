'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Search, X } from 'lucide-react';
import { HomeAuthButton } from './HomeAuthButton';

type HomeMobileMenuProps = {
  economieId?: string;
  politiqueId?: string;
};

export function HomeMobileMenu({ economieId, politiqueId }: HomeMobileMenuProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="border-b border-[var(--public-divider)] lg:hidden">
      <div className="flex items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="shrink-0" onClick={close}>
          <Image
            src="/images/logo-actu-plus.webp"
            alt="Actu Plus"
            width={180}
            height={57}
            priority
            unoptimized
            className="h-11 w-auto"
          />
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="home-mobile-nav"
          onClick={() => setOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center border border-[var(--public-border)] text-[#201e1d]"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">{open ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
        </button>
      </div>

      {open && (
        <nav id="home-mobile-nav" className="border-t border-[var(--public-divider)] bg-[#fafafa]">
          <Link
            href="/"
            onClick={close}
            className="flex items-center px-5 py-3.5 text-sm font-extrabold text-[#201e1d] shadow-[inset_3px_0_0_#ec3013]"
          >
            À la une
          </Link>
          {economieId && (
            <Link
              href={`/articles?category=${economieId}`}
              onClick={close}
              className="flex items-center border-t border-[var(--public-divider)] px-5 py-3.5 text-sm font-semibold text-[#201e1d]"
            >
              Économie
            </Link>
          )}
          {politiqueId && (
            <Link
              href={`/articles?category=${politiqueId}`}
              onClick={close}
              className="flex items-center border-t border-[var(--public-divider)] px-5 py-3.5 text-sm font-semibold text-[#201e1d]"
            >
              Politique
            </Link>
          )}
          <Link
            href="#revue-de-presse"
            onClick={close}
            className="flex items-center border-t border-[var(--public-divider)] px-5 py-3.5 text-sm font-semibold text-[#201e1d]"
          >
            Revue de presse
          </Link>
          <Link
            href="/veille-sectorielle"
            onClick={close}
            className="flex items-center justify-between gap-3 border-t border-[var(--public-divider)] px-5 py-3.5 text-sm font-semibold text-[#201e1d]"
          >
            Veille sectorielle
            <span className="bg-[#ffe0d9] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[#ae1800]">
              Pro
            </span>
          </Link>
          <Link
            href="/focus"
            onClick={close}
            className="flex items-center justify-between gap-3 border-t border-[var(--public-divider)] px-5 py-3.5 text-sm font-semibold text-[#201e1d]"
          >
            Focus
            <span className="bg-[#ffe0d9] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[#ae1800]">
              Pro
            </span>
          </Link>
          <Link
            href="/archives"
            onClick={close}
            className="flex items-center border-t border-[var(--public-divider)] px-5 py-3.5 text-sm font-semibold text-[#201e1d]"
          >
            Archives
          </Link>
        </nav>
      )}

      <div className="flex flex-col gap-3 px-5 py-3">
        <form action="/articles" method="GET" className="flex h-11 w-full items-center gap-2.5 border border-[var(--public-border)] bg-white px-4 text-sm text-[#605d5d]">
          <Search className="h-4 w-4 shrink-0" strokeWidth={2} />
          <input
            type="text"
            name="search"
            placeholder="Rechercher un sujet, un pays…"
            className="w-full bg-transparent text-sm text-[#201e1d] placeholder:text-[#605d5d] focus:outline-none"
          />
        </form>
        <div className="grid grid-cols-3 gap-2">
          <Link
            href="/favorites"
            className="flex h-11 items-center justify-center border border-[var(--public-border)] px-2 text-sm font-semibold text-[#201e1d]"
          >
            Favoris
          </Link>
          <Link
            href="/subscriptions"
            className="flex h-11 items-center justify-center bg-[#ec3013] px-2 text-sm font-extrabold text-white"
          >
            S'abonner
          </Link>
          <HomeAuthButton className="h-11 w-full justify-center px-2" />
        </div>
      </div>
    </div>
  );
}
