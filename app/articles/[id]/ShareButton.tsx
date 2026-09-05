'use client';

import { useState } from 'react';
import { Share2, Copy, Check, X, Facebook, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/atoms';

interface ShareButtonProps {
  title: string;
  excerpt?: string;
  /** Chemin relatif, ex. /articles/mon-slug-123 */
  articlePath: string;
}

export function ShareButton({ title, excerpt, articlePath }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${articlePath}`
    : articlePath;

  const shareText = excerpt ? `${title} - ${excerpt.substring(0, 100)}...` : title;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setShowMenu(true);
        }
      }
    } else {
      setShowMenu(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLinks = [
    // {
    //   name: 'Facebook',
    //   icon: Facebook,
    //   url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    //   color: 'hover:bg-blue-600 hover:text-white',
    // },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-sky-500 hover:text-white',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-700 hover:text-white',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      color: 'hover:bg-green-500 hover:text-white',
    },
  ];

  return (
    <div className="relative">
      <Button
        variant="modernist-outline"
        size="sm"
        leftIcon={<Share2 className="h-4 w-4" />}
        onClick={handleNativeShare}
      >
        Partager
      </Button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 bottom-full mb-2 z-50 w-64 border border-[#201e1d]/40 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-[#201e1d]">Partager</span>
              <button
                title="Fermer le menu"
                onClick={() => setShowMenu(false)}
                className="p-1 hover:bg-[#eae9e9] transition-colors"
              >
                <X className="h-4 w-4 text-[#605d5d]" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center gap-1 p-2 border border-[#d7d3d3] transition-all ${link.color}`}
                  onClick={() => setShowMenu(false)}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="text-xs">{link.name}</span>
                </a>
              ))}
            </div>

            <div className="border-t border-[#d7d3d3] pt-3">
              <p className="text-xs text-[#605d5d] mb-2">Ou copier le lien</p>
              <div className="flex gap-2">
                <input
                  title="Lien à copier"
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-xs bg-[#f8f4f4] border border-[#d7d3d3] truncate"
                />
                <button
                  title="Copier le lien"
                  onClick={handleCopyLink}
                  className={`px-3 py-2 transition-colors ${
                    copied
                      ? 'bg-[#166534] text-white'
                      : 'bg-[#ec3013] text-white hover:bg-[#dd2b0f]'
                  }`}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
