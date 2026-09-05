'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Article } from '@/types';
import { getArticlePublicPath } from '@/lib/articles/article-url';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface HomeHeroItem {
  article: Article;
  timeLabel: string | null;
}

export function HomeHeroCarousel({ items }: { items: HomeHeroItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (items.length <= 1 || isPaused) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % items.length);
    }, 5000);
    return () => clearInterval(id);
  }, [items.length, isPaused]);

  if (items.length === 0) {
    return <p className="text-[#605d5d]">Aucun article à la une pour le moment.</p>;
  }

  const safeIndex = activeIndex % items.length;
  const { article, timeLabel } = items[safeIndex];
  const categoryLabel = article.category?.name || 'Actualité';
  const scopeLabel = article.scope === 'international' ? 'International' : 'National';
  const image = article.coverImage || article.imageUrl;

  const goTo = (index: number) => setActiveIndex(((index % items.length) + items.length) % items.length);
  const prev = () => goTo(safeIndex - 1);
  const next = () => goTo(safeIndex + 1);

  return (
    <div onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <Link href={getArticlePublicPath(article)} className="block">
        <div className="mb-4.5 flex flex-wrap items-center gap-3.5">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#ec3013]">
            {categoryLabel} · {scopeLabel}
          </span>
          <span className="h-px flex-1 bg-[#d7d3d3]" />
          {timeLabel && (
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#605d5d]">{timeLabel}</span>
          )}
        </div>
        {image && (
          <div className="mb-6 h-60 overflow-hidden sm:h-85">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={article.title} className="h-full w-full object-cover" />
          </div>
        )}
        <h1 className="mb-4 max-w-[20ch] text-[32px] font-extrabold leading-[1.05] tracking-[-0.025em] sm:text-[56px]">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="max-w-[62ch] text-[17px] leading-normal text-[#444141] sm:text-[19px]">{article.excerpt}</p>
        )}
      </Link>

      {items.length > 1 && (
        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Aller à l'article ${i + 1}`}
                className={`h-1.5 transition-all ${i === safeIndex ? 'w-8 bg-[#ec3013]' : 'w-4 bg-[#d7d3d3] hover:bg-[#9b9797]'}`}
              />
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              aria-label="Article précédent"
              className="flex h-9 w-9 items-center justify-center border border-[#201e1d] transition-colors hover:bg-[#eae9e9]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Article suivant"
              className="flex h-9 w-9 items-center justify-center border border-[#201e1d] transition-colors hover:bg-[#eae9e9]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
