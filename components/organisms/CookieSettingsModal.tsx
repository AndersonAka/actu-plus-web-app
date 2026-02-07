'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/atoms';
import { useCookieConsent } from '@/lib/contexts/CookieConsentContext';
import { COOKIE_CATEGORIES, CookieCategory, CookieCategoryInfo } from '@/lib/types/cookie.types';
import { X, ChevronDown, ChevronUp, Shield } from 'lucide-react';

export const CookieSettingsModal: React.FC = () => {
  const {
    showSettings,
    closeSettings,
    state,
    updatePreference,
    savePreferences,
    acceptAll,
    rejectAll,
  } = useCookieConsent();

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  if (!showSettings) return null;

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = () => {
    savePreferences(state.preferences);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
        onClick={closeSettings}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                <Shield className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Gestion du consentement
                </h2>
                <p className="text-sm text-gray-500">Actu Plus</p>
              </div>
            </div>
            <button
              onClick={closeSettings}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            <p className="mb-6 text-sm text-gray-600">
              Nos partenaires et nous déposons des cookies et utilisons des informations non
              sensibles de votre appareil pour améliorer nos produits et afficher des publicités
              et contenus personnalisés. Vous pouvez accepter ou refuser ces différentes
              opérations. Pour en savoir plus sur les cookies, les données que nous utilisons,
              les traitements que nous réalisons et les partenaires avec qui nous travaillons,
              vous pouvez consulter notre{' '}
              <Link
                href="/privacy"
                className="font-medium text-primary-600 underline hover:text-primary-700"
              >
                politique de confidentialité
              </Link>
              .
            </p>

            {/* Categories */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Vous autorisez
              </p>

              {COOKIE_CATEGORIES.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  isExpanded={expandedCategories.has(category.id)}
                  isEnabled={state.preferences[category.id]}
                  onToggleExpand={() => toggleCategory(category.id)}
                  onToggleEnabled={(value) => updatePreference(category.id, value)}
                />
              ))}
            </div>

            {/* Additional Info */}
            <div className="mt-6 rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-600">
                <strong>Ce site et ses partenaires pourront également réaliser les traitements de données suivants :</strong>{' '}
                Assurer la sécurité, prévenir et détecter la fraude et réparer les erreurs.
                Enregistrer et communiquer les choix en matière de confidentialité. Fournir et
                présenter des publicités et du contenu. Identifier les appareils en fonction des
                informations transmises automatiquement. Mettre en correspondance et combiner des
                données à partir d'autres sources de données. Relier différents appareils.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col gap-3 border-t border-gray-100 p-6 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={rejectAll}
            >
              Refuser tout
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={acceptAll}
            >
              Accepter tout
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSave}
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

interface CategoryItemProps {
  category: CookieCategoryInfo;
  isExpanded: boolean;
  isEnabled: boolean;
  onToggleExpand: () => void;
  onToggleEnabled: (value: boolean) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  isExpanded,
  isEnabled,
  onToggleExpand,
  onToggleEnabled,
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={onToggleExpand}
          className="flex flex-1 items-center gap-2 text-left"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
          <span className="text-sm font-medium text-gray-900">{category.name}</span>
        </button>

        <div className="flex items-center gap-2">
          {category.required ? (
            <span className="text-xs font-medium text-gray-500">REQUIS</span>
          ) : (
            <>
              <button
                onClick={() => onToggleEnabled(false)}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                  !isEnabled
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Refuser
              </button>
              <button
                onClick={() => onToggleEnabled(true)}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                  isEnabled
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Accepter
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <p className="mb-3 text-sm text-gray-600">{category.description}</p>
          
          {category.cookies.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500">Cookies utilisés :</p>
              <div className="rounded border border-gray-200 bg-white">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Nom</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Fournisseur</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Durée</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.cookies.map((cookie, idx) => (
                      <tr key={idx} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-2 font-mono text-gray-800">{cookie.name}</td>
                        <td className="px-3 py-2 text-gray-600">{cookie.provider}</td>
                        <td className="px-3 py-2 text-gray-600">{cookie.expiry}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
