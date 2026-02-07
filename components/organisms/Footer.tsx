'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import { useCookieConsent } from '@/lib/contexts/CookieConsentContext';
import { Cookie } from 'lucide-react';

const Footer = ({ className }: { className?: string }) => {
  const { openSettings } = useCookieConsent();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    navigation: [
      { href: '/', label: 'Accueil' },
      { href: '/articles', label: 'Articles' },
      { href: '/subscriptions', label: 'Abonnements' },
      { href: '/about', label: 'À propos' },
    ],
    legal: [
      { href: '/terms', label: "Conditions d'utilisation" },
      { href: '/privacy', label: 'Politique de confidentialité' },
      { href: '/contact', label: 'Contact' },
    ],
  };

  return (
    <footer className={cn('border-t border-gray-200 bg-gray-50', className)}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo-actu-plus.webp"
                alt="Actu Plus"
                width={120}
                height={40}
                className="h-8 w-auto"
                unoptimized={true}
              />
            </Link>
            <p className="mt-3 text-sm text-gray-600">
              L'actualité et plus encore. Restez informé avec Actu Plus.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">Navigation</h3>
            <ul className="space-y-2">
              {footerLinks.navigation.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-primary-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">Informations</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-primary-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-500">
              © {currentYear} Actu Plus. Tous droits réservés.
            </p>
            <button
              onClick={openSettings}
              className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-primary-600"
            >
              <Cookie className="h-4 w-4" />
              Gérer les cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
