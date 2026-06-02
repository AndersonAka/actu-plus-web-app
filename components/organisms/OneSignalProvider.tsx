'use client';

/**
 * Intégration OneSignal Web (push navigateur).
 *
 * - L'init est gardée par NEXT_PUBLIC_ONESIGNAL_APP_ID : sans cette variable,
 *   le composant est un no-op (aucun impact sur la plateforme).
 * - Le binding `external_id = user.id` permet au backend de cibler l'utilisateur
 *   via include_aliases (voir NotificationsService.sendPushSafe).
 */

import { useEffect, useRef } from 'react';
import OneSignal from 'react-onesignal';
import { useAuth } from '@/lib/hooks/useAuth';

let initPromise: Promise<void> | null = null;

function ensureInit(appId: string): Promise<void> {
  if (!initPromise) {
    initPromise = OneSignal.init({
      appId,
      allowLocalhostAsSecureOrigin: true,
      serviceWorkerParam: { scope: '/' },
      serviceWorkerPath: 'OneSignalSDKWorker.js',
    }).catch((err) => {
      // En cas d'échec, on réautorise une future tentative.
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

export function OneSignalProvider() {
  const { user, isAuthenticated } = useAuth();
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  const boundUserRef = useRef<string | null>(null);

  // Init une seule fois
  useEffect(() => {
    if (!appId) return;
    ensureInit(appId).catch((err) =>
      console.warn('OneSignal init failed:', err),
    );
  }, [appId]);

  // Lier / délier l'utilisateur selon l'état d'authentification
  useEffect(() => {
    if (!appId) return;

    const sync = async () => {
      try {
        await ensureInit(appId);

        if (isAuthenticated && user?.id) {
          if (boundUserRef.current !== user.id) {
            await OneSignal.login(user.id);
            boundUserRef.current = user.id;
          }
        } else if (boundUserRef.current) {
          await OneSignal.logout();
          boundUserRef.current = null;
        }
      } catch (err) {
        console.warn('OneSignal sync failed:', err);
      }
    };

    sync();
  }, [appId, isAuthenticated, user?.id]);

  return null;
}
