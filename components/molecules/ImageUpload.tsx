'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Upload, X, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button, Input } from '@/components/atoms';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  aspectRatio?: string;
}

export function ImageUpload({
  value,
  onChange,
  label,
  error,
  aspectRatio = '16/9',
}: ImageUploadProps) {
  const [mode, setMode] = useState<'url' | 'preview'>(value ? 'preview' : 'url');
  const [urlInput, setUrlInput] = useState(value || '');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      setMode('preview');
      setUrlInput(value);
    } else {
      setMode('url');
      setUrlInput('');
    }
  }, [value]);

  const handleUrlSubmit = useCallback(() => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setMode('preview');
    }
  }, [urlInput, onChange]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // Upload vers le backend
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/proxy/uploads/image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const imageUrl = result.data?.url || result.url;
        onChange(imageUrl);
        setMode('preview');
      } else {
        const error = await response.json();
        console.error('Upload error:', error.message);
        alert(error.message || "Erreur lors de l'upload de l'image");
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      alert("Erreur lors de l'upload de l'image");
    } finally {
      setIsLoading(false);
    }
  }, [onChange]);

  const handleRemove = useCallback(() => {
    onChange('');
    setUrlInput('');
    setMode('url');
  }, [onChange]);

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {value && mode === 'preview' ? (
        <div className="relative">
          <div
            className="relative w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
            style={{ aspectRatio }}
          >
            <Image
              src={value}
              alt="Aperçu"
              fill
              className="object-cover"
              unoptimized={true}
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 shadow-sm hover:bg-white transition-colors"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      ) : (
        <div className={cn(
          'rounded-lg border-2 border-dashed p-6',
          error ? 'border-error-300 bg-error-50' : 'border-gray-300 bg-gray-50',
          'transition-colors hover:border-primary-300 hover:bg-primary-50'
        )}>
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-gray-100 p-3">
              <ImageIcon className="h-6 w-6 text-gray-400" />
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Ajouter une image de couverture
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Téléchargez une image ou entrez une URL
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-md">
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  leftIcon={<LinkIcon className="h-4 w-4" />}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim()}
                >
                  Ajouter
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-xs text-gray-400">ou</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isLoading}
                leftIcon={<Upload className="h-4 w-4" />}
                className="w-full"
              >
                Télécharger une image
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-error-500">{error}</p>
      )}
    </div>
  );
}
