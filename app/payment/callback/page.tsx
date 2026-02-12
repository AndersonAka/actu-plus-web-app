'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header, Footer } from '@/components/organisms';
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
    // Paystack redirige avec ?trxref=xxx&reference=xxx
    // Notre backend ajoute aussi ?payment_id=xxx dans le callback_url
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
          // Vérifier via Paystack API et activer l'abonnement si succès
          payment = await paymentService.checkPaystackStatus(paymentId);
        } else {
          // Si on n'a que la référence Paystack, on ne peut pas vérifier directement
          // car checkPaystackStatus attend un paymentId
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
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          {status === 'loading' && (
            <>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
                <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                Vérification en cours...
              </h1>
              <p className="text-gray-600">
                Veuillez patienter pendant que nous vérifions votre paiement.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                Paiement réussi !
              </h1>
              <p className="mb-6 text-gray-600">{message}</p>
              <p className="mb-8 text-sm text-gray-500">
                Votre abonnement est maintenant actif. Profitez de tous les avantages de votre formule.
              </p>
              <div className="space-y-3">
                <Link href="/">
                  <Button variant="primary" className="w-full">
                    Accéder à l'accueil
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" className="w-full">
                    Voir mon abonnement
                  </Button>
                </Link>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                Paiement échoué
              </h1>
              <p className="mb-8 text-gray-600">{message}</p>
              <div className="space-y-3">
                <Link href="/subscriptions">
                  <Button variant="primary" className="w-full">
                    Réessayer
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Retour à l'accueil
                  </Button>
                </Link>
              </div>
            </>
          )}

          {status === 'pending' && (
            <>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
                <Loader2 className="h-10 w-10 animate-spin text-yellow-600" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                Paiement en attente
              </h1>
              <p className="mb-6 text-gray-600">{message}</p>
              <p className="text-sm text-gray-500">
                Vous recevrez une notification dès que votre paiement sera confirmé.
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-16">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary-600" />
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
