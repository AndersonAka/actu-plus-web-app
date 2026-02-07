'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/atoms';
import { useCookieConsent } from '@/lib/contexts/CookieConsentContext';
import { X } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const { showBanner, acceptAll, rejectAll, openSettings, isLoading } = useCookieConsent();

  if (isLoading || !showBanner) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm" />
      
      {/* Banner Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header with Logo */}
          <div className="border-b border-gray-100 p-6 pb-4">
            <Image
              src="/images/logo-actu-plus.webp"
              alt="Actu Plus"
              width={120}
              height={40}
              className="h-8 w-auto"
              unoptimized
            />
          </div>

          {/* Content */}
          <div className="p-6 pt-4">
            <p className="text-sm leading-relaxed text-gray-700">
              Avec votre accord, nous et{' '}
              <button
                onClick={openSettings}
                className="font-medium text-primary-600 underline hover:text-primary-700"
              >
                nos partenaires
              </button>{' '}
              utilisons des cookies ou technologies similaires pour stocker, consulter et traiter
              des données personnelles telles que votre visite sur ce site internet, les adresses
              IP et les identifiants de cookie. Certains partenaires ne demandent pas votre
              consentement pour traiter vos données et se fondent sur leur intérêt commercial
              légitime. À tout moment, vous pouvez retirer votre consentement ou vous opposer au
              traitement des données fondé sur l'intérêt légitime en cliquant sur « En savoir plus »
              ou en allant dans notre{' '}
              <Link
                href="/privacy"
                className="font-medium text-primary-600 underline hover:text-primary-700"
              >
                politique de confidentialité
              </Link>
              .
            </p>

            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Vos données personnelles sont traitées pour les finalités suivantes :
              </p>
              <p className="text-xs text-gray-600">
                Données de géolocalisation précises et identification par analyse de l'appareil,
                Fonctionnement, Publicités et contenu personnalisés, mesure de performance des
                publicités et du contenu, études d'audience et développement de services, Stocker
                et/ou accéder à des informations sur un appareil, Utiliser mes informations
                personnelles pour des publicités ciblées
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t border-gray-100 p-6 pt-4 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={openSettings}
            >
              En savoir plus →
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={rejectAll}
            >
              Refuser
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={acceptAll}
            >
              Accepter & Fermer
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
