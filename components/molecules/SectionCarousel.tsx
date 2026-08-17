'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/atoms';
import { Article } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface SectionCarouselProps {
  articles: Article[];
  /** Nombre de cartes visibles par vue (défaut 2) */
  perView?: number;
  getHref: (article: Article) => string;
  badgeLabel: string;
  badgeVariant?: 'primary' | 'secondary' | 'error' | 'success' | 'warning';
  placeholderClassName?: string;
  placeholderLetter?: string;
  className?: string;
  autoPlayMs?: number;
}

const SectionCarousel = ({
  articles,
  perView = 2,
  getHref,
  badgeLabel,
  badgeVariant = 'secondary',
  placeholderClassName = 'from-gray-100 to-gray-200',
  placeholderLetter = '•',
  className,
  autoPlayMs = 5000,
}: SectionCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const pageCount = Math.ceil(articles.length / perView);

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const pageWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: index * pageWidth,
        behavior: 'smooth',
      });
    }
  };

  const handlePrev = () => {
    const newIndex = activeIndex > 0 ? activeIndex - 1 : pageCount - 1;
    setActiveIndex(newIndex);
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = activeIndex < pageCount - 1 ? activeIndex + 1 : 0;
    setActiveIndex(newIndex);
    scrollToIndex(newIndex);
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const pageWidth = carouselRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / pageWidth);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  };

  useEffect(() => {
    if (pageCount <= 1 || !autoPlayMs) return;
    const interval = setInterval(() => {
      handleNext();
    }, autoPlayMs);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, pageCount, autoPlayMs]);

  if (articles.length === 0) {
    return null;
  }

  // Regroupe les articles par page de `perView`
  const pages: Article[][] = [];
  for (let i = 0; i < articles.length; i += perView) {
    pages.push(articles.slice(i, i + perView));
  }

  return (
    <div className={cn('relative', className)}>
      <div
        ref={carouselRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {pages.map((page, pageIndex) => (
          <div
            key={pageIndex}
            className="grid w-full shrink-0 snap-center grid-cols-2 gap-3"
          >
            {page.map((article) => {
              const articleImage = article.coverImage || article.imageUrl;
              return (
                <Link
                  key={article.id}
                  href={getHref(article)}
                  className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="relative aspect-video w-full overflow-hidden">
                    {articleImage ? (
                      <img
                        src={articleImage}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className={cn('flex h-full w-full items-center justify-center bg-linear-to-br', placeholderClassName)}>
                        <span className="text-2xl font-bold text-white/60">{placeholderLetter}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-2.5">
                    <Badge variant={badgeVariant} size="sm" className="mb-1.5 self-start">
                      {badgeLabel}
                    </Badge>
                    <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-gray-900 group-hover:text-primary-600 transition-colors">
                      {article.title}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/3 -translate-x-2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-lg transition-colors hover:bg-white"
            title="Précédent"
          >
            <ChevronLeft className="h-4 w-4 text-gray-800" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/3 -translate-y-1/2 translate-x-2 rounded-full bg-white/90 p-1.5 shadow-lg transition-colors hover:bg-white"
            title="Suivant"
          >
            <ChevronRight className="h-4 w-4 text-gray-800" />
          </button>
        </>
      )}

      {pageCount > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveIndex(index);
                scrollToIndex(index);
              }}
              title={`Aller à la page ${index + 1}`}
              aria-label={`Aller à la page ${index + 1}`}
              className={cn(
                'h-1.5 rounded-full transition-all',
                activeIndex === index ? 'w-5 bg-primary-500' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export { SectionCarousel };
