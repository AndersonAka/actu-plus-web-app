'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PublicShell } from '../../PublicShell';
import { Button } from '@/components/atoms';
import { paymentService, PaymentStatus } from '@/lib/services/payment.service';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Suspense } from 'react';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Notre backend ajoute ?payment_id=xxx dans le callback_url après le paiement GeniusPay
    const paymentId = searchParams.get('payment_id');
    const trxref = searchParams.get('trxref');
    const reference = searchParams.get('reference');

    if (!paymentId && !trxref && !reference) {
      setStatus('failed');
      setMessage('ID de paiement manquant');
      return;
    }

    let retryCount = 0;
    const maxRetries = 5;

    const verifyPayment = async () => {
      try {
        let payment;

        if (paymentId) {
          // Vérifier via l'API GeniusPay et activer l'abonnement si succès
          payment = await paymentService.verifyPayment(paymentId);
        } else {
          // Si on n'a qu'une référence externe, on ne peut pas vérifier directement
          // car verifyPayment attend un paymentId
          setStatus('failed');
          setMessage('Impossible de vérifier le paiement. Veuillez contacter le support.');
          return;
        }

        switch (payment.status) {
          case PaymentStatus.COMPLETED:
            setStatus('success');
            setMessage('Votre paiement a été effectué avec succès !');
            break;
          case PaymentStatus.FAILED:
            setStatus('failed');
            setMessage('Le paiement a échoué. Veuillez réessayer.');
            break;
          case PaymentStatus.CANCELLED:
            setStatus('failed');
            setMessage('Le paiement a été annulé.');
            break;
          default:
            retryCount++;
            if (retryCount < maxRetries) {
              setStatus('pending');
              setMessage('Votre paiement est en cours de traitement...');
              // Revérifier après quelques secondes
              setTimeout(verifyPayment, 3000);
            } else {
              setStatus('pending');
              setMessage('Le traitement prend plus de temps que prévu. Vous recevrez une notification dès confirmation.');
            }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du paiement:', error);
        setStatus('failed');
        setMessage('Une erreur est survenue lors de la vérification du paiement.');
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <PublicShell>
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md border border-[#d7d3d3] bg-white p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center bg-[#ffe0d9]">
                <Loader2 className="h-10 w-10 animate-spin text-[#ec3013]" />
              </div>
              <h1 className="mb-2 text-2xl font-extrabold text-[#201e1d]">
                Vérification en cours...
              </h1>
              <p className="text-[#605d5d]">
                Veuillez patienter pendant que nous vérifions votre paiement.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center bg-[#dcfce7]">
                <CheckCircle className="h-10 w-10 text-[#166534]" />
              </div>
              <h1 className="mb-2 text-2xl font-extrabold text-[#201e1d]">
                Paiement réussi !
              </h1>
              <p className="mb-6 text-[#605d5d]">{message}</p>
              <p className="mb-8 text-sm text-[#9b9797]">
                Votre abonnement est maintenant actif. Profitez de tous les avantages de votre formule.
              </p>
              <div className="space-y-3">
                <Link href="/">
                  <Button variant="modernist" className="w-full">
                    Accéder à l'accueil
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="modernist-outline" className="w-full">
                    Voir mon abonnement
                  </Button>
                </Link>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center bg-[#ffe0d9]">
                <XCircle className="h-10 w-10 text-[#ae1800]" />
              </div>
              <h1 className="mb-2 text-2xl font-extrabold text-[#201e1d]">
                Paiement échoué
              </h1>
              <p className="mb-8 text-[#605d5d]">{message}</p>
              <div className="space-y-3">
                <Link href="/subscriptions">
                  <Button variant="modernist" className="w-full">
                    Réessayer
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="modernist-outline" className="w-full">
                    Retour à l'accueil
                  </Button>
                </Link>
              </div>
            </>
          )}

          {status === 'pending' && (
            <>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center bg-[#fef9c3]">
                <Loader2 className="h-10 w-10 animate-spin text-[#a16207]" />
              </div>
              <h1 className="mb-2 text-2xl font-extrabold text-[#201e1d]">
                Paiement en attente
              </h1>
              <p className="mb-6 text-[#605d5d]">{message}</p>
              <p className="text-sm text-[#9b9797]">
                Vous recevrez une notification dès que votre paiement sera confirmé.
              </p>
            </>
          )}
        </div>
      </div>
    </PublicShell>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <PublicShell>
        <div className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="w-full max-w-md border border-[#d7d3d3] bg-white p-8 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#ec3013]" />
            <p className="mt-4 text-[#605d5d]">Chargement...</p>
          </div>
        </div>
      </PublicShell>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
