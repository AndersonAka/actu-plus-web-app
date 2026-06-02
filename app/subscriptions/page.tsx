'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header, Footer } from '@/components/organisms';
import { Button } from '@/components/atoms';
import { useAuth } from '@/lib/hooks/useAuth';
import { paymentService } from '@/lib/services/payment.service';
import { Check, Star, Building2, Zap, Crown, ArrowRight, Loader2, X, Users } from 'lucide-react';
import { Suspense } from 'react';

interface SubscriptionPlan {
  id: string;
  name: string;
  category: 'standard' | 'enterprise';
  price: number;
  currency: string;
  duration: number;
  features: string[];
  isPopular: boolean;
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
  const [error, setError] = useState<string | null>(null);

  const [showEnterpriseForm, setShowEnterpriseForm] = useState(false);
  const [enterpriseForm, setEnterpriseForm] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    numberOfAccess: '',
    message: '',
  });
  const [enterpriseFormError, setEnterpriseFormError] = useState<string | null>(null);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

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
        'Focus et Chroniques',
        'Newsletter hebdomadaire',
        'Accès mobile et web',
      ],
      isPopular: true,
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
        'Tout le contenu Standard',
        'Accès multi-utilisateurs',
        'Tableau de bord analytique',
        'API dédiée',
        'Gestionnaire de compte',
        'Formation personnalisée',
        'SLA garanti',
      ],
      isPopular: false,
      isActive: true,
    },
  ];

  const getPlanIcon = (category: string) => {
    switch (category) {
      case 'standard':
        return <Zap className="h-8 w-8" />;
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
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const openEnterpriseForm = () => {
    setEnterpriseFormError(null);
    setQuoteSubmitted(false);
    // Pré-remplir avec le profil si l'utilisateur est connecté
    if (user) {
      setEnterpriseForm(f => ({
        ...f,
        firstName: f.firstName || user.firstName || '',
        lastName: f.lastName || user.lastName || '',
        email: f.email || user.email || '',
      }));
    }
    setShowEnterpriseForm(true);
  };

  const handleEnterpriseSubmit = async () => {
    setEnterpriseFormError(null);
    const { companyName, firstName, lastName, email, phone, country, numberOfAccess, message } = enterpriseForm;
    if (!companyName || !firstName || !lastName || !email || !phone) {
      setEnterpriseFormError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setProcessingPayment(true);
    try {
      const response = await fetch('/api/proxy/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          firstName,
          lastName,
          email,
          phone,
          ...(country ? { country } : {}),
          ...(numberOfAccess ? { numberOfAccess: Number(numberOfAccess) } : {}),
          ...(message ? { message } : {}),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'envoi de la demande.");
      }

      setQuoteSubmitted(true);
    } catch (err: any) {
      setEnterpriseFormError(err.message || "Erreur lors de l'envoi de la demande de devis.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSubscribe = async (planId: string, category: string) => {
    setError(null);

    if (category === 'enterprise') {
      // Modèle "devis" : aucune authentification ni paiement requis.
      openEnterpriseForm();
      return;
    }

    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/subscriptions&plan=${planId}`;
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
              <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                {[1, 2].map((i) => (
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
        <section className="bg-linear-to-br from-primary-600 to-primary-800 py-16 text-white">
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
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Standard Plan */}
            {(() => {
              const standardPlans = plans.filter(p => p.category === 'standard');
              if (standardPlans.length === 0) return null;
              
              const selectedStandardPlan = standardPlans.find(p => p.duration === standardDuration) || standardPlans[0];
              const colors = getPlanColors('standard');
              
              return (
                <div className={`relative rounded-2xl border-2 p-8 ${colors.bg} ${colors.border} transition-transform hover:scale-105`}>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-600 px-4 py-1 text-sm font-medium text-white">
                      <Star className="h-4 w-4 fill-current" />
                      Populaire
                    </span>
                  </div>

                  <div className={`mb-6 ${colors.icon}`}>
                    <Zap className="h-8 w-8" />
                  </div>

                  <h3 className="mb-2 text-2xl font-bold text-gray-900">
                    Particuliers Standard
                  </h3>

                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Durée</label>
                    <select
                      title="Durée"
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
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    title="Souscrire"
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

            {/* Enterprise Plan */}
            {(() => {
              const enterprisePlans = plans.filter(p => p.category === 'enterprise');
              const colors = getPlanColors('enterprise');
              const samplePlan = enterprisePlans[0];
              // Build dynamic pricing summary from saved plans
              const headcountSet = [...new Set(enterprisePlans.map(p => (p as any).headcount as number).filter(Boolean))].sort((a, b) => a - b);
              const durationSet = [...new Set(enterprisePlans.map(p => p.duration))].sort((a, b) => a - b);
              // Show cheapest per duration
              const cheapestByDuration = durationSet.map(d => {
                const dPlans = enterprisePlans.filter(p => p.duration === d).sort((a, b) => a.price - b.price);
                return dPlans[0];
              }).filter(Boolean);
              
              return (
                <div className={`relative rounded-2xl border-2 p-8 ${colors.bg} ${colors.border}`}>
                  <div className={`mb-4 ${colors.icon}`}>
                    <Building2 className="h-8 w-8" />
                  </div>

                  <h3 className="mb-2 text-2xl font-bold text-white">Entreprises</h3>
                  <p className="mb-4 text-sm text-gray-400">Tarification selon le nombre de collaborateurs</p>

                  {/* Pricing grid summary — dynamic from saved plans */}
                  {cheapestByDuration.length > 0 ? (
                    <div className="mb-5 rounded-xl bg-white/10 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-300 uppercase tracking-wide">
                        <Users className="h-3.5 w-3.5" /> Tarifs à partir de
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {cheapestByDuration.map(plan => (
                          <div key={plan!.id} className="contents">
                            <div className="text-gray-300">{(plan as any).headcount} pers. / {plan!.duration} mois</div>
                            <div className="text-right font-semibold text-white">{Number(plan!.price).toLocaleString('fr-FR')} FCFA</div>
                          </div>
                        ))}
                      </div>
                      {headcountSet.length > 0 && (
                        <p className="mt-2 text-xs text-gray-400">
                          De {headcountSet[0]} à {headcountSet[headcountSet.length - 1]} collaborateurs
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mb-5 rounded-xl bg-white/10 p-4 text-center">
                      <p className="text-sm text-gray-400">Formules bientôt disponibles</p>
                    </div>
                  )}

                  {samplePlan && (
                    <ul className="mb-6 space-y-2">
                      {samplePlan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    title="Demander un devis"
                    onClick={() => handleSubscribe(samplePlan?.id || 'enterprise', 'enterprise')}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors ${colors.button} text-gray-900`}
                  >
                    Demander un devis <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              );
            })()}
          </div>
        </section>

        {/* Enterprise Quote Modal */}
        {showEnterpriseForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Demande de devis Entreprise</h2>
                  <p className="text-sm text-gray-500">Décrivez votre besoin, notre équipe vous recontacte rapidement</p>
                </div>
                <button onClick={() => setShowEnterpriseForm(false)} aria-label="Fermer" className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {quoteSubmitted ? (
                <div className="py-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-7 w-7 text-green-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">Demande envoyée</h3>
                  <p className="mb-6 text-sm text-gray-600">
                    Votre demande de cotation a bien été reçue. Notre équipe commerciale
                    vous recontactera dans les plus brefs délais avec une proposition adaptée.
                  </p>
                  <button
                    onClick={() => setShowEnterpriseForm(false)}
                    className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <>
                  {enterpriseFormError && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{enterpriseFormError}</div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Nom de l'entreprise <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={enterpriseForm.companyName}
                        onChange={e => setEnterpriseForm(f => ({ ...f, companyName: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
                        placeholder="Nom de votre entreprise"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Prénom <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={enterpriseForm.firstName}
                          onChange={e => setEnterpriseForm(f => ({ ...f, firstName: e.target.value }))}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
                          placeholder="Prénom du responsable"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Nom <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={enterpriseForm.lastName}
                          onChange={e => setEnterpriseForm(f => ({ ...f, lastName: e.target.value }))}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
                          placeholder="Nom du responsable"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          value={enterpriseForm.email}
                          onChange={e => setEnterpriseForm(f => ({ ...f, email: e.target.value }))}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
                          placeholder="email@entreprise.com"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Téléphone <span className="text-red-500">*</span></label>
                        <input
                          type="tel"
                          value={enterpriseForm.phone}
                          onChange={e => setEnterpriseForm(f => ({ ...f, phone: e.target.value }))}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
                          placeholder="+225 07 00 00 00"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Pays</label>
                        <input
                          type="text"
                          value={enterpriseForm.country}
                          onChange={e => setEnterpriseForm(f => ({ ...f, country: e.target.value }))}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
                          placeholder="Côte d'Ivoire"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Nombre d'accès souhaités</label>
                        <input
                          type="number"
                          min={1}
                          value={enterpriseForm.numberOfAccess}
                          onChange={e => setEnterpriseForm(f => ({ ...f, numberOfAccess: e.target.value }))}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
                          placeholder="Ex: 25"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Message (optionnel)</label>
                      <textarea
                        rows={3}
                        value={enterpriseForm.message}
                        onChange={e => setEnterpriseForm(f => ({ ...f, message: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
                        placeholder="Précisez votre besoin..."
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      title="Annuler"
                      onClick={() => setShowEnterpriseForm(false)}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      title="Envoyer ma demande"
                      onClick={handleEnterpriseSubmit}
                      disabled={processingPayment}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-3 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                    >
                      {processingPayment ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Envoi...</>
                      ) : (
                        <>Envoyer ma demande <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

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
                  Nous offrons 7 jours d'essai gratuit pour la formule Standard. 
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
