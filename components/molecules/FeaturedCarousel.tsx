'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/atoms';
import { Article } from '@/types';
import { ChevronLeft, ChevronRight, Heart, Share2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useFavorites } from '@/hooks/useFavorites';
import { useShare } from '@/hooks/useShare';

export interface FeaturedCarouselProps {
  articles: Article[];
  className?: string;
}

const FeaturedCarousel = ({ articles, className }: FeaturedCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { toggleFavorite, isFavorite, isLoading } = useFavorites();
  const { shareArticle } = useShare();

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
    }
  };

  const handlePrev = () => {
    const newIndex = activeIndex > 0 ? activeIndex - 1 : articles.length - 1;
    setActiveIndex(newIndex);
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = activeIndex < articles.length - 1 ? activeIndex + 1 : 0;
    setActiveIndex(newIndex);
    scrollToIndex(newIndex);
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const cardWidth = carouselRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIndex, articles.length]);

  if (articles.length === 0) {
    return null;
  }

  return (
    <div className={cn('relative', className)}>
      {/* Carousel Container */}
      <div
        ref={carouselRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {articles.map((article, index) => {
          const articleImage = article.coverImage || article.imageUrl;
          return (
          <div
            key={article.id}
            className="w-full flex-shrink-0 snap-center"
          >
            <Link href={`/articles/${article.id}`}>
              <div className="relative aspect-[21/9] overflow-hidden rounded-xl bg-gray-100">
                {articleImage ? (
                  <Image
                    src={articleImage}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    unoptimized={true}
                    priority={index === 0}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
                    <span className="text-6xl font-bold text-white/20">A+</span>
                  </div>
                )}
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent" />
                
                {/* Content */}
                <div className="absolute top-0 left-0 p-4 sm:p-5 max-w-xl">
                  <Badge variant="primary" className="mb-2">
                    {article.category?.name || 'Actualité'}
                  </Badge>
                  <h3 className="mb-1 text-lg font-bold text-white line-clamp-2 sm:text-xl">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-xs text-gray-200 line-clamp-1 sm:text-sm sm:line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-300 sm:text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      {format(new Date(article.createdAt), 'dd MMM yyyy', { locale: fr })}
                    </span>
                    {article.author && (
                      <span className="hidden sm:inline">Par {article.author.firstName} {article.author.lastName}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="absolute right-4 top-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(article.id);
                    }}
                    disabled={isLoading(article.id)}
                    className={cn(
                      "rounded-full p-2 backdrop-blur-sm transition-colors",
                      isFavorite(article.id)
                        ? "bg-red-500/90 hover:bg-red-600/90"
                        : "bg-white/20 hover:bg-white/30"
                    )}
                    title={isFavorite(article.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    <Heart 
                      className={cn(
                        "h-5 w-5",
                        isFavorite(article.id) ? "fill-white text-white" : "text-white"
                      )} 
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      shareArticle(article.id, article.title);
                    }}
                    className="rounded-full bg-white/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/30"
                    title="Partager l'article"
                  >
                    <Share2 className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
            </Link>
          </div>
        );
        })}
      </div>

      {/* Navigation Arrows */}
      {articles.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-colors hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5 text-gray-800" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-colors hover:bg-white"
          >
            <ChevronRight className="h-5 w-5 text-gray-800" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {articles.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {articles.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveIndex(index);
                scrollToIndex(index);
              }}
              className={cn(
                'h-2 rounded-full transition-all',
                activeIndex === index
                  ? 'w-6 bg-primary-500'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export { FeaturedCarousel };
