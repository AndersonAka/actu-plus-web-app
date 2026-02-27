'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import { Card, CardContent } from '@/components/atoms';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ImageIcon,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────

export interface HelpImage {
  src: string;
  alt: string;
  caption?: string;
  defaultSize?: 'sm' | 'md' | 'lg' | 'full';
}

export interface HelpStep {
  title?: string;
  text: string;
}

export interface HelpSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  content: string | React.ReactNode;
  steps?: HelpStep[];
  tips?: string[];
  images?: HelpImage[];
}

export interface HelpGuideProps {
  title: string;
  subtitle: string;
  sections: HelpSection[];
}

// ─── Taille d'image ───────────────────────────────────────────────────────

const IMAGE_SIZES = {
  sm: 'max-w-xs',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-full',
} as const;

type ImageSize = keyof typeof IMAGE_SIZES;

// ─── Composant image redimensionnable ─────────────────────────────────────

function ResizableImage({ image }: { image: HelpImage }) {
  const [size, setSize] = useState<ImageSize>(image.defaultSize || 'md');
  const [lightbox, setLightbox] = useState(false);
  const [imageError, setImageError] = useState(false);

  const sizes: ImageSize[] = ['sm', 'md', 'lg', 'full'];
  const currentIndex = sizes.indexOf(size);

  const zoomIn = () => {
    if (currentIndex < sizes.length - 1) setSize(sizes[currentIndex + 1]);
  };
  const zoomOut = () => {
    if (currentIndex > 0) setSize(sizes[currentIndex - 1]);
  };

  return (
    <>
      <div className={cn('group relative mx-auto transition-all duration-300', IMAGE_SIZES[size])}>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
          <div className="relative cursor-pointer" onClick={() => !imageError && setLightbox(true)}>
            {imageError ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-400">
                <ImageIcon className="h-10 w-10" />
                <p className="text-xs">Image à ajouter</p>
                <p className="text-[10px] text-gray-300">{image.src}</p>
              </div>
            ) : (
              <Image
                src={image.src}
                alt={image.alt}
                width={1200}
                height={800}
                className="h-auto w-full object-contain"
                unoptimized
                onError={() => setImageError(true)}
              />
            )}
          </div>
          {/* Contrôles de taille */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-3 py-1.5">
            <div className="flex items-center gap-1">
              <button
                onClick={zoomOut}
                disabled={currentIndex === 0}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                title="Réduire"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="min-w-[2.5rem] text-center text-xs font-medium text-gray-500 uppercase">
                {size}
              </span>
              <button
                onClick={zoomIn}
                disabled={currentIndex === sizes.length - 1}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                title="Agrandir"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => setLightbox(true)}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="Plein écran"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {image.caption && (
          <p className="mt-1.5 text-center text-xs italic text-gray-500">{image.caption}</p>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
            onClick={() => setLightbox(false)}
          >
            <X className="h-6 w-6" />
          </button>
          <Image
            src={image.src}
            alt={image.alt}
            width={1600}
            height={1000}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            unoptimized
            onClick={(e) => e.stopPropagation()}
          />
          {image.caption && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-black/60 px-4 py-2 text-sm text-white">
              {image.caption}
            </p>
          )}
        </div>
      )}
    </>
  );
}

// ─── Section accordéon ────────────────────────────────────────────────────

function HelpSectionCard({ section, defaultOpen }: { section: HelpSection; defaultOpen: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <Card padding="none" className="overflow-hidden">
      <button
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          {section.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900">{section.title}</h3>
          <p className="mt-0.5 text-sm text-gray-500 line-clamp-1">{section.description}</p>
        </div>
        {isOpen ? (
          <ChevronDown className="h-5 w-5 shrink-0 text-gray-400" />
        ) : (
          <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
        )}
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div ref={contentRef} className="border-t border-gray-100 px-5 py-5 space-y-5">
          {/* Contenu textuel */}
          <div className="prose prose-sm prose-gray max-w-none">
            {typeof section.content === 'string' ? (
              <p className="text-gray-700 leading-relaxed">{section.content}</p>
            ) : (
              section.content
            )}
          </div>

          {/* Étapes numérotées */}
          {section.steps && section.steps.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-800">Étapes</h4>
              <ol className="space-y-2">
                {section.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                      {idx + 1}
                    </span>
                    <div className="pt-0.5">
                      {step.title && (
                        <span className="font-medium text-gray-900">{step.title} — </span>
                      )}
                      <span className="text-sm text-gray-700">{step.text}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Astuces */}
          {section.tips && section.tips.length > 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
              <h4 className="mb-1.5 text-sm font-semibold text-amber-800">💡 Astuces</h4>
              <ul className="space-y-1">
                {section.tips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-amber-700 flex gap-2">
                    <span className="shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Images */}
          {section.images && section.images.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-800">Aperçu</h4>
              <div className="space-y-4">
                {section.images.map((image, idx) => (
                  <ResizableImage key={idx} image={image} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Table des matières ───────────────────────────────────────────────────

function TableOfContents({ sections }: { sections: HelpSection[] }) {
  return (
    <Card padding="md" className="sticky top-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <BookOpen className="h-4 w-4 text-primary-500" />
        Table des matières
      </h3>
      <nav>
        <ul className="space-y-1">
          {sections.map((section, idx) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary-600"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-medium text-gray-400">
                  {idx + 1}.
                </span>
                <span className="truncate">{section.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </Card>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────

export default function HelpGuide({ title, subtitle, sections }: HelpGuideProps) {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-gray-600">{subtitle}</p>
      </div>

      <div className="flex gap-6">
        {/* Table des matières - desktop */}
        <div className="hidden lg:block w-64 shrink-0">
          <TableOfContents sections={sections} />
        </div>

        {/* Sections */}
        <div className="flex-1 space-y-4">
          {/* Table des matières - mobile */}
          <div className="lg:hidden">
            <TableOfContents sections={sections} />
          </div>

          {sections.map((section, idx) => (
            <div key={section.id} id={section.id}>
              <HelpSectionCard section={section} defaultOpen={idx === 0} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
