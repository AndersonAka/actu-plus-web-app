'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

const Footer = ({ className }: { className?: string }) => {
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

        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © {currentYear} Actu Plus. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
