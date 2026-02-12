'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header, Footer } from '@/components/organisms';
import { Button } from '@/components/atoms';
import { useAuth } from '@/lib/hooks/useAuth';
import { paymentService } from '@/lib/services/payment.service';
import { Check, Star, Building2, Zap, Crown, ArrowRight, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

interface SubscriptionPlan {
  id: string;
  name: string;
  category: 'standard' | 'premium' | 'enterprise';
  price: number;
  currency: string;
  duration: number;
  features: string[];
  isPopular: boolean;
  requiresQuote: boolean;
  isActive: boolean;
}

function SubscriptionsContent() {
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [standardDuration, setStandardDuration] = useState<number>(1);
  const [premiumDuration, setPremiumDuration] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/proxy/subscriptions/plans');
        if (response.ok) {
          const result = await response.json();
          setPlans(result.data || []);
        } else {
          // Fallback plans if API not available
          setPlans(getDefaultPlans());
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        setPlans(getDefaultPlans());
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getDefaultPlans = (): SubscriptionPlan[] => [
    {
      id: 'standard-1',
      name: 'Standard',
      category: 'standard',
      price: 2500,
      currency: 'XOF',
      duration: 1,
      features: [
        'Accès aux articles publics',
        'Résumés quotidiens',
        'Newsletter hebdomadaire',
        'Accès mobile et web',
      ],
      isPopular: false,
      requiresQuote: false,
      isActive: true,
    },
    {
      id: 'premium-1',
      name: 'Premium',
      category: 'premium',
      price: 5000,
      currency: 'XOF',
      duration: 1,
      features: [
        'Tout le contenu Standard',
        'Articles Premium exclusifs',
        'Focus et Chroniques',
        'Archives complètes',
        'Alertes personnalisées',
        'Support prioritaire',
      ],
      isPopular: true,
      requiresQuote: false,
      isActive: true,
    },
    {
      id: 'enterprise-12',
      name: 'Enterprise',
      category: 'enterprise',
      price: 0,
      currency: 'XOF',
      duration: 12,
      features: [
        'Tout le contenu Premium',
        'Accès multi-utilisateurs',
        'Tableau de bord analytique',
        'API dédiée',
        'Gestionnaire de compte',
        'Formation personnalisée',
        'SLA garanti',
      ],
      isPopular: false,
      requiresQuote: true,
      isActive: true,
    },
  ];

  const getPlanIcon = (category: string) => {
    switch (category) {
      case 'standard':
        return <Zap className="h-8 w-8" />;
      case 'premium':
        return <Crown className="h-8 w-8" />;
      case 'enterprise':
        return <Building2 className="h-8 w-8" />;
      default:
        return <Zap className="h-8 w-8" />;
    }
  };

  const getPlanColors = (category: string) => {
    switch (category) {
      case 'standard':
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          button: 'bg-gray-900 hover:bg-gray-800',
        };
      case 'premium':
        return {
          bg: 'bg-primary-50',
          border: 'border-primary-300 ring-2 ring-primary-500',
          icon: 'text-primary-600',
          button: 'bg-primary-600 hover:bg-primary-700',
        };
      case 'enterprise':
        return {
          bg: 'bg-gray-900',
          border: 'border-gray-700',
          icon: 'text-white',
          button: 'bg-white text-gray-900 hover:bg-gray-100',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          button: 'bg-gray-900 hover:bg-gray-800',
        };
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Sur devis';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubscribe = async (planId: string, category: string) => {
    setError(null);
    
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/subscriptions&plan=${planId}`;
      return;
    }

    if (category === 'enterprise') {
      window.location.href = '/contact?type=enterprise';
      return;
    }

    // Flux simplifié: créer le paiement et rediriger directement vers Paystack
    setSelectedPlan(planId);
    setProcessingPayment(true);

    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan non trouvé');
      }

      // Créer le paiement via le backend
      // Paystack gère tous les moyens de paiement sur sa page
      const payment = await paymentService.createPayment({
        subscriptionPlanId: plan.id,
        amount: plan.price,
        currency: plan.currency,
        paymentMethod: 'mobile_money', // Paystack gère le choix sur sa page
      });

      // Récupérer l'URL de paiement Paystack et rediriger
      const paystackUrl = await paymentService.getPaymentUrl(payment.id);
      
      // Rediriger vers la page de paiement Paystack
      window.location.href = paystackUrl;
    } catch (err: any) {
      console.error('Erreur lors du paiement:', err);
      setError(err.message || 'Une erreur est survenue lors du paiement. Veuillez réessayer.');
      setProcessingPayment(false);
      setSelectedPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-8">
              <div className="mx-auto h-12 w-64 rounded bg-gray-200" />
              <div className="grid gap-8 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-96 rounded-xl bg-gray-200" />
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
              Choisissez votre formule
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-primary-100">
              Accédez à l'information de qualité avec nos différentes formules
              d'abonnement adaptées à vos besoins.
            </p>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-center">
              <p className="text-red-700">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-600 underline hover:text-red-800"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <section className="mx-auto max-w-7xl mt-16 px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Standard Plan */}
            {(() => {
              const standardPlans = plans.filter(p => p.category === 'standard');
              if (standardPlans.length === 0) return null;
              
              const selectedStandardPlan = standardPlans.find(p => p.duration === standardDuration) || standardPlans[0];
              const colors = getPlanColors('standard');
              
              return (
                <div className={`relative rounded-2xl border-2 p-8 ${colors.bg} ${colors.border} transition-transform hover:scale-105`}>
                  <div className={`mb-6 ${colors.icon}`}>
                    <Zap className="h-8 w-8" />
                  </div>

                  <h3 className="mb-2 text-2xl font-bold text-gray-900">
                    Particuliers Standard
                  </h3>

                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Durée</label>
                    <select
                      value={standardDuration}
                      onChange={(e) => setStandardDuration(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xl font-medium focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {standardPlans.map(plan => (
                        <option key={plan.id} value={plan.duration}>
                          {plan.duration} mois - {formatPrice(plan.price, plan.currency)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <ul className="mb-8 space-y-3">
                    {selectedStandardPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(selectedStandardPlan.id, 'standard')}
                    disabled={processingPayment}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors ${colors.button} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {processingPayment && selectedPlan === selectedStandardPlan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        Souscrire
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              );
            })()}

            {/* Premium Plan */}
            {(() => {
              const premiumPlans = plans.filter(p => p.category === 'premium');
              if (premiumPlans.length === 0) return null;
              
              const selectedPremiumPlan = premiumPlans.find(p => p.duration === premiumDuration) || premiumPlans[0];
              const colors = getPlanColors('premium');
              
              return (
                <div className={`relative rounded-2xl border-2 p-8 ${colors.bg} ${colors.border} transition-transform hover:scale-105`}>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-600 px-4 py-1 text-sm font-medium text-white">
                      <Star className="h-4 w-4 fill-current" />
                      Populaire
                    </span>
                  </div>

                  <div className={`mb-6 ${colors.icon}`}>
                    <Crown className="h-8 w-8" />
                  </div>

                  <h3 className="mb-2 text-2xl font-bold text-gray-900">
                    Particuliers Premium
                  </h3>

                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Durée</label>
                    <select
                      value={premiumDuration}
                      onChange={(e) => setPremiumDuration(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xl font-medium focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {premiumPlans.map(plan => (
                        <option key={plan.id} value={plan.duration}>
                          {plan.duration} mois - {formatPrice(plan.price, plan.currency)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <ul className="mb-8 space-y-3">
                    {selectedPremiumPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(selectedPremiumPlan.id, 'premium')}
                    disabled={processingPayment}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors ${colors.button} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {processingPayment && selectedPlan === selectedPremiumPlan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        Souscrire
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              );
            })()}

            {/* Enterprise Plan */}
            {(() => {
              const enterprisePlans = plans.filter(p => p.category === 'enterprise');
              if (enterprisePlans.length === 0) return null;
              
              const enterprisePlan = enterprisePlans[0];
              const colors = getPlanColors('enterprise');
              
              return (
                <div className={`relative rounded-2xl border-2 p-8 ${colors.bg} ${colors.border} transition-transform hover:scale-105`}>
                  <div className={`mb-6 ${colors.icon}`}>
                    <Building2 className="h-8 w-8" />
                  </div>

                  <h3 className="mb-2 text-2xl font-bold text-white">
                    Entreprises
                  </h3>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">
                      Sur devis
                    </span>
                  </div>

                  <ul className="mb-8 space-y-3">
                    {enterprisePlan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(enterprisePlan.id, 'enterprise')}
                    disabled={processingPayment}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors ${colors.button} text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Demander un devis
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              );
            })()}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="border-t border-gray-200 bg-gray-50 py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
              Questions fréquentes
            </h2>
            
            <div className="space-y-4">
              {/* <details className="group rounded-lg bg-white p-4 shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between font-medium text-gray-900">
                  Comment fonctionne la période d'essai ?
                  <span className="ml-2 transition-transform group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-3 text-gray-600">
                  Nous offrons 7 jours d'essai gratuit pour les formules Standard et Premium. 
                  Vous pouvez annuler à tout moment pendant cette période sans être facturé.
                </p>
              </details> */}

              <details className="group rounded-lg bg-white p-4 shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between font-medium text-gray-900">
                  Quels moyens de paiement acceptez-vous ?
                  <span className="ml-2 transition-transform group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-3 text-gray-600">
                  Nous acceptons Wave, Orange Money, MTN Money, Moov Money, 
                  ainsi que les cartes bancaires Visa et Mastercard.
                </p>
              </details>

              <details className="group rounded-lg bg-white p-4 shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between font-medium text-gray-900">
                  Puis-je changer de formule à tout moment ?
                  <span className="ml-2 transition-transform group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-3 text-gray-600">
                  Oui, vous pouvez passer à une formule supérieure à tout moment. 
                  Le montant sera calculé au prorata de votre période restante.
                </p>
              </details>

              <details className="group rounded-lg bg-white p-4 shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between font-medium text-gray-900">
                  Comment fonctionne la formule Enterprise ?
                  <span className="ml-2 transition-transform group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-3 text-gray-600">
                  La formule Enterprise est personnalisée selon vos besoins. 
                  Contactez-nous pour un devis adapté à votre organisation.
                  Les comptes Enterprise bénéficient d'une gestion centralisée des utilisateurs.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary-600 py-12">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Besoin d'aide pour choisir ?
            </h2>
            <p className="mb-6 text-primary-100">
              Notre équipe est disponible pour vous accompagner dans votre choix.
            </p>
            <Link href="/contact">
              <Button variant="secondary" size="lg">
                Nous contacter
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary-600" />
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <SubscriptionsContent />
    </Suspense>
  );
}
