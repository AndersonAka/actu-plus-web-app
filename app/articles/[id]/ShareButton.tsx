'use client';

import { useState } from 'react';
import { Share2, Copy, Check, X, Facebook, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/atoms';

interface ShareButtonProps {
  title: string;
  excerpt?: string;
  articleId: string;
}

export function ShareButton({ title, excerpt, articleId }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/articles/${articleId}`
    : `/articles/${articleId}`;

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
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-600 hover:text-white',
    },
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
        variant="outline" 
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
          <div className="absolute right-0 bottom-full mb-2 z-50 w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-900">Partager</span>
              <button 
                onClick={() => setShowMenu(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 transition-all ${link.color}`}
                  onClick={() => setShowMenu(false)}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="text-xs">{link.name}</span>
                </a>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-3">
              <p className="text-xs text-gray-500 mb-2">Ou copier le lien</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    copied 
                      ? 'bg-green-500 text-white' 
                      : 'bg-primary-500 text-white hover:bg-primary-600'
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
