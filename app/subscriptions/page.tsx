'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PublicShell } from '../PublicShell';
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
          bg: 'bg-[#f8f4f4]',
          border: 'border-[#201e1d]',
          icon: 'text-[#ec3013]',
          button: 'bg-[#ec3013] hover:bg-[#dd2b0f]',
        };
      case 'enterprise':
        return {
          bg: 'bg-[#201e1d]',
          border: 'border-[#201e1d]',
          icon: 'text-white',
          button: 'bg-white text-[#201e1d] hover:bg-[#eae9e9]',
        };
      default:
        return {
          bg: 'bg-[#f8f4f4]',
          border: 'border-[#d7d3d3]',
          icon: 'text-[#605d5d]',
          button: 'bg-[#201e1d] hover:bg-[#2d2b2b]',
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

    // Flux simplifié : créer le paiement et rediriger vers la page de checkout GeniusPay
    setSelectedPlan(planId);
    setProcessingPayment(true);

    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan non trouvé');
      }

      // Créer le paiement via le backend
      // GeniusPay gère tous les moyens de paiement sur sa page de checkout
      const payment = await paymentService.createPayment({
        subscriptionPlanId: plan.id,
        amount: plan.price,
        currency: plan.currency,
        paymentMethod: 'mobile_money', // GeniusPay gère le choix sur sa page
      });

      // Récupérer l'URL de paiement GeniusPay et rediriger
      const paymentUrl = await paymentService.getPaymentUrl(payment.id);

      // Rediriger vers la page de paiement GeniusPay
      window.location.href = paymentUrl;
    } catch (err: any) {
      console.error('Erreur lors du paiement:', err);
      setError(err.message || 'Une erreur est survenue lors du paiement. Veuillez réessayer.');
      setProcessingPayment(false);
      setSelectedPlan(null);
    }
  };

  if (loading) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="mx-auto h-12 w-64 bg-[#eae9e9]" />
            <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
              {[1, 2].map((i) => (
                <div key={i} className="h-96 bg-[#eae9e9]" />
              ))}
            </div>
          </div>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      {/* Hero Section */}
      <section className="border-b-2 border-[#201e1d] bg-[#201e1d] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-extrabold sm:text-5xl">
            Choisissez votre formule
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#bab6b6]">
            Accédez à l'information de qualité avec nos différentes formules
            d'abonnement adaptées à vos besoins.
          </p>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 border border-[#ffc4b8] bg-[#fff2ef] p-4 mt-8 text-center">
            <p className="text-[#ae1800]">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-[#ae1800] underline hover:text-[#7c1405]"
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
              <div className={`relative border-2 p-8 ${colors.bg} ${colors.border}`}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-[#ec3013] px-4 py-1 text-sm font-extrabold text-white">
                    <Star className="h-4 w-4 fill-current" />
                    Populaire
                  </span>
                </div>

                <div className={`mb-6 ${colors.icon}`}>
                  <Zap className="h-8 w-8" />
                </div>

                <h3 className="mb-2 text-2xl font-extrabold text-[#201e1d]">
                  Particuliers Standard
                </h3>

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-semibold text-[#201e1d]">Durée</label>
                  <select
                    title="Durée"
                    value={standardDuration}
                    onChange={(e) => setStandardDuration(Number(e.target.value))}
                    className="w-full border border-[#d7d3d3] bg-white px-3 py-2 text-xl font-medium focus:border-[#ec3013] focus:outline-none focus:ring-1 focus:ring-[#ec3013]/20"
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
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#166534]" />
                      <span className="text-sm text-[#605d5d]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  title="Souscrire"
                  onClick={() => handleSubscribe(selectedStandardPlan.id, 'standard')}
                  disabled={processingPayment}
                  className={`flex w-full items-center justify-center gap-2 px-6 py-3 font-semibold transition-colors ${colors.button} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
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
              <div className={`relative border-2 p-8 ${colors.bg} ${colors.border}`}>
                <div className={`mb-4 ${colors.icon}`}>
                  <Building2 className="h-8 w-8" />
                </div>

                <h3 className="mb-2 text-2xl font-extrabold text-white">Entreprises</h3>
                <p className="mb-4 text-sm text-[#9b9797]">Tarification selon le nombre de collaborateurs</p>

                {/* Pricing grid summary — dynamic from saved plans */}
                {cheapestByDuration.length > 0 ? (
                  <div className="mb-5 border border-white/20 bg-white/10 p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#bab6b6] uppercase tracking-wide">
                      <Users className="h-3.5 w-3.5" /> Tarifs à partir de
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {cheapestByDuration.map(plan => (
                        <div key={plan!.id} className="contents">
                          <div className="text-[#bab6b6]">{(plan as any).headcount} pers. / {plan!.duration} mois</div>
                          <div className="text-right font-semibold text-white">{Number(plan!.price).toLocaleString('fr-FR')} FCFA</div>
                        </div>
                      ))}
                    </div>
                    {headcountSet.length > 0 && (
                      <p className="mt-2 text-xs text-[#9b9797]">
                        De {headcountSet[0]} à {headcountSet[headcountSet.length - 1]} collaborateurs
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mb-5 border border-white/20 bg-white/10 p-4 text-center">
                    <p className="text-sm text-[#9b9797]">Formules bientôt disponibles</p>
                  </div>
                )}

                {samplePlan && (
                  <ul className="mb-6 space-y-2">
                    {samplePlan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#4ade80]" />
                        <span className="text-sm text-[#bab6b6]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  title="Demander un devis"
                  onClick={() => handleSubscribe(samplePlan?.id || 'enterprise', 'enterprise')}
                  className={`flex w-full items-center justify-center gap-2 px-6 py-3 font-semibold transition-colors ${colors.button}`}
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
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto border border-[#201e1d]/40 bg-white p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-[#201e1d]">Demande de devis Entreprise</h2>
                <p className="text-sm text-[#605d5d]">Décrivez votre besoin, notre équipe vous recontacte rapidement</p>
              </div>
              <button onClick={() => setShowEnterpriseForm(false)} aria-label="Fermer" className="text-[#9b9797] hover:text-[#201e1d]">
                <X className="h-6 w-6" />
              </button>
            </div>

            {quoteSubmitted ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center bg-[#f0fdf4]">
                  <Check className="h-7 w-7 text-[#166534]" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#201e1d]">Demande envoyée</h3>
                <p className="mb-6 text-sm text-[#605d5d]">
                  Votre demande de cotation a bien été reçue. Notre équipe commerciale
                  vous recontactera dans les plus brefs délais avec une proposition adaptée.
                </p>
                <Button variant="modernist" onClick={() => setShowEnterpriseForm(false)}>
                  Fermer
                </Button>
              </div>
            ) : (
              <>
                {enterpriseFormError && (
                  <div className="mb-4 border border-[#ffc4b8] bg-[#fff2ef] p-3 text-sm text-[#ae1800]">{enterpriseFormError}</div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#201e1d]">Nom de l'entreprise <span className="text-[#ec3013]">*</span></label>
                    <input
                      type="text"
                      value={enterpriseForm.companyName}
                      onChange={e => setEnterpriseForm(f => ({ ...f, companyName: e.target.value }))}
                      className="w-full border border-[#d7d3d3] px-3 py-2.5 text-sm focus:border-[#ec3013] focus:outline-none"
                      placeholder="Nom de votre entreprise"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-[#201e1d]">Prénom <span className="text-[#ec3013]">*</span></label>
                      <input
                        type="text"
                        value={enterpriseForm.firstName}
                        onChange={e => setEnterpriseForm(f => ({ ...f, firstName: e.target.value }))}
                        className="w-full border border-[#d7d3d3] px-3 py-2.5 text-sm focus:border-[#ec3013] focus:outline-none"
                        placeholder="Prénom du responsable"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-[#201e1d]">Nom <span className="text-[#ec3013]">*</span></label>
                      <input
                        type="text"
                        value={enterpriseForm.lastName}
                        onChange={e => setEnterpriseForm(f => ({ ...f, lastName: e.target.value }))}
                        className="w-full border border-[#d7d3d3] px-3 py-2.5 text-sm focus:border-[#ec3013] focus:outline-none"
                        placeholder="Nom du responsable"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-[#201e1d]">Email <span className="text-[#ec3013]">*</span></label>
                      <input
                        type="email"
                        value={enterpriseForm.email}
                        onChange={e => setEnterpriseForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full border border-[#d7d3d3] px-3 py-2.5 text-sm focus:border-[#ec3013] focus:outline-none"
                        placeholder="email@entreprise.com"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-[#201e1d]">Téléphone <span className="text-[#ec3013]">*</span></label>
                      <input
                        type="tel"
                        value={enterpriseForm.phone}
                        onChange={e => setEnterpriseForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full border border-[#d7d3d3] px-3 py-2.5 text-sm focus:border-[#ec3013] focus:outline-none"
                        placeholder="+225 07 00 00 00"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-[#201e1d]">Pays</label>
                      <input
                        type="text"
                        value={enterpriseForm.country}
                        onChange={e => setEnterpriseForm(f => ({ ...f, country: e.target.value }))}
                        className="w-full border border-[#d7d3d3] px-3 py-2.5 text-sm focus:border-[#ec3013] focus:outline-none"
                        placeholder="Côte d'Ivoire"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-[#201e1d]">Nombre d'accès souhaités</label>
                      <input
                        type="number"
                        min={1}
                        value={enterpriseForm.numberOfAccess}
                        onChange={e => setEnterpriseForm(f => ({ ...f, numberOfAccess: e.target.value }))}
                        className="w-full border border-[#d7d3d3] px-3 py-2.5 text-sm focus:border-[#ec3013] focus:outline-none"
                        placeholder="Ex: 25"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#201e1d]">Message (optionnel)</label>
                    <textarea
                      rows={3}
                      value={enterpriseForm.message}
                      onChange={e => setEnterpriseForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full border border-[#d7d3d3] px-3 py-2.5 text-sm focus:border-[#ec3013] focus:outline-none"
                      placeholder="Précisez votre besoin..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    title="Annuler"
                    onClick={() => setShowEnterpriseForm(false)}
                    className="flex-1 border border-[#d7d3d3] px-4 py-3 text-sm font-semibold text-[#201e1d] hover:bg-[#f8f4f4]"
                  >
                    Annuler
                  </button>
                  <button
                    title="Envoyer ma demande"
                    onClick={handleEnterpriseSubmit}
                    disabled={processingPayment}
                    className="flex flex-1 items-center justify-center gap-2 bg-[#ec3013] px-4 py-3 text-sm font-semibold text-white hover:bg-[#dd2b0f] disabled:opacity-50"
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
      <section className="border-t-2 border-[#201e1d]/40 bg-[#f8f4f4] py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-2xl font-extrabold text-[#201e1d]">
            Questions fréquentes
          </h2>

          <div className="space-y-4">
            <details className="group border border-[#d7d3d3] bg-white p-4">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-[#201e1d]">
                Quels moyens de paiement acceptez-vous ?
                <span className="ml-2 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-3 text-[#605d5d]">
                Nous acceptons Wave, Orange Money, MTN Money, Moov Money,
                ainsi que les cartes bancaires Visa et Mastercard.
              </p>
            </details>

            <details className="group border border-[#d7d3d3] bg-white p-4">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-[#201e1d]">
                Puis-je changer de formule à tout moment ?
                <span className="ml-2 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-3 text-[#605d5d]">
                Oui, vous pouvez passer à une formule supérieure à tout moment.
                Le montant sera calculé au prorata de votre période restante.
              </p>
            </details>

            <details className="group border border-[#d7d3d3] bg-white p-4">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-[#201e1d]">
                Comment fonctionne la formule Enterprise ?
                <span className="ml-2 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-3 text-[#605d5d]">
                La formule Enterprise est personnalisée selon vos besoins.
                Contactez-nous pour un devis adapté à votre organisation.
                Les comptes Enterprise bénéficient d'une gestion centralisée des utilisateurs.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#201e1d] py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-2xl font-extrabold text-white">
            Besoin d'aide pour choisir ?
          </h2>
          <p className="mb-6 text-[#bab6b6]">
            Notre équipe est disponible pour vous accompagner dans votre choix.
          </p>
          <Link href="/contact">
            <Button variant="modernist-outline" size="lg" className="border-white text-white hover:bg-white hover:text-[#201e1d]">
              Nous contacter
            </Button>
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={
      <PublicShell>
        <div className="flex flex-1 items-center justify-center py-24">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#ec3013]" />
            <p className="mt-4 text-[#605d5d]">Chargement...</p>
          </div>
        </div>
      </PublicShell>
    }>
      <SubscriptionsContent />
    </Suspense>
  );
}
