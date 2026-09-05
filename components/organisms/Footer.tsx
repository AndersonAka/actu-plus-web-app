'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import { useCookieConsent } from '@/lib/contexts/CookieConsentContext';
import { Cookie, Mail, Phone } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants/contact';

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
    <footer className={cn('border-t-2 border-[#201e1d]/40 bg-[#201e1d] text-[#bab6b6]', className)}>
      <div className="mx-auto max-w-360 px-5 py-12 sm:px-9">
        <div className="grid gap-8 border-b-2 border-[#f3f2f2]/20 pb-9 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="mb-4 inline-block w-max bg-[#f3f2f2] px-3 py-2.5">
              <Image
                src="/images/logo-actu-plus.webp"
                alt="Actu Plus"
                width={120}
                height={40}
                className="h-8 w-auto"
                unoptimized={true}
              />
            </Link>
            <p className="mt-3 max-w-[40ch] text-sm leading-[1.6]">
              Actu Plus est une plateforme d'actualité dédiée à l'information en
              Afrique de l'Ouest et au-delà, accessible sur le web et via
              l'application mobile.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#f3f2f2]">Navigation</h3>
            <ul className="space-y-2.5">
              {footerLinks.navigation.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#f3f2f2]">Informations</h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="flex items-center gap-1.5 text-sm hover:text-white"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${CONTACT_INFO.phoneTel}`}
                  className="flex items-center gap-1.5 text-sm hover:text-white"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {CONTACT_INFO.phoneDisplay}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-5.5 text-[12.5px] text-[#9b9797] sm:flex-row">
          <p>© {currentYear} Actu Plus. Tous droits réservés.</p>
          <button
            onClick={openSettings}
            className="flex items-center gap-2 hover:text-white"
          >
            <Cookie className="h-4 w-4" />
            Gérer les cookies
          </button>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
