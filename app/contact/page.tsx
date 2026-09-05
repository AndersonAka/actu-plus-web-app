'use client';

import { useState } from 'react';
import { PublicShell } from '../PublicShell';
import { Button, Alert } from '@/components/atoms';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  Globe2,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  CheckCircle2,
  Loader2,
  HelpCircle,
  FileText,
  Users,
} from 'lucide-react';
import { CONTACT_INFO, SOCIAL_LINKS } from '@/lib/constants/contact';

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Le sujet doit contenir au moins 5 caractères'),
  message: z.string().min(20, 'Le message doit contenir au moins 20 caractères'),
  type: z.enum(['general', 'support', 'partnership', 'press']),
});

type ContactFormData = z.infer<typeof contactSchema>;

const inputClass = (hasError: boolean) =>
  `w-full rounded-none border px-4 py-2.5 text-sm text-[#201e1d] transition-colors focus:outline-none focus:ring-2 focus:ring-[#ec3013]/20 ${
    hasError ? 'border-[#ae1800] focus:border-[#ae1800]' : 'border-[#d7d3d3] focus:border-[#ec3013]'
  }`;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      type: 'general',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/proxy/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'envoi du message");
      }

      setIsSubmitted(true);
      reset();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialIconMap = {
    facebook: Facebook,
    twitter: Twitter,
    linkedin: Linkedin,
    instagram: Instagram,
  } as const;

  const contactInfo = [
    { icon: Mail, label: 'Email', value: CONTACT_INFO.email, href: `mailto:${CONTACT_INFO.email}` },
    { icon: Phone, label: 'Téléphone', value: CONTACT_INFO.phoneDisplay, href: `tel:${CONTACT_INFO.phoneTel}` },
    { icon: MapPin, label: 'Adresse', value: CONTACT_INFO.address, href: '#' },
    { icon: Clock, label: 'Horaires', value: CONTACT_INFO.hours, href: '#' },
  ];

  const socialLinks = SOCIAL_LINKS.map((link) => ({
    icon: socialIconMap[link.id],
    href: link.href,
    label: link.label,
  }));

  const contactTypes = [
    { value: 'general', label: 'Question générale', icon: HelpCircle },
    { value: 'support', label: 'Support technique', icon: MessageSquare },
    { value: 'partnership', label: 'Partenariat', icon: Users },
    { value: 'press', label: 'Presse', icon: FileText },
  ];

  return (
    <PublicShell>
      {/* Hero */}
      <section className="bg-[#201e1d] py-14 text-white">
        <div className="mx-auto max-w-[1440px] px-5 text-center sm:px-9">
          <div className="mb-4 inline-flex items-center gap-2 border border-white/30 px-4 py-2 text-sm">
            <MessageSquare className="h-4 w-4" />
            Contactez-nous
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-[-0.02em] sm:text-5xl">
            Nous sommes à votre écoute
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#bab6b6]">
            Une question, une suggestion ou besoin d'aide ? Notre équipe est là pour vous accompagner.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="border-b-2 border-[#201e1d]/40 py-10">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-9">
          <div className="grid gap-0 border border-[#d7d3d3] sm:grid-cols-2 lg:grid-cols-4">
            {contactInfo.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={`group flex items-center gap-4 p-5 transition-colors hover:bg-[#eae9e9] ${
                  index > 0 ? 'border-t border-[#d7d3d3] sm:border-t-0 sm:border-l' : ''
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#ffe0d9] text-[#ae1800]">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#605d5d]">{item.label}</p>
                  <p className="font-semibold text-[#201e1d]">{item.value}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-9">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Contact Form */}
            <div className="border border-[#d7d3d3] bg-white p-8">
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-extrabold text-[#201e1d]">
                <Send className="h-6 w-6 text-[#ec3013]" />
                Envoyez-nous un message
              </h2>

              {isSubmitted ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-[#ffe0d9]">
                    <CheckCircle2 className="h-8 w-8 text-[#ae1800]" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-[#201e1d]">
                    Message envoyé !
                  </h3>
                  <p className="mb-6 text-[#605d5d]">
                    Nous vous répondrons dans les plus brefs délais.
                  </p>
                  <Button variant="modernist-outline" onClick={() => setIsSubmitted(false)}>
                    Envoyer un autre message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {error && (
                    <Alert variant="error" onClose={() => setError(null)}>
                      {error}
                    </Alert>
                  )}

                  {/* Contact Type */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#201e1d]">
                      Type de demande
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {contactTypes.map((type) => (
                        <label
                          key={type.value}
                          className="relative flex cursor-pointer items-center gap-2 border border-[#d7d3d3] p-3 transition-colors hover:border-[#201e1d] has-[:checked]:border-[#ec3013] has-[:checked]:bg-[#fff2ef]"
                        >
                          <input
                            type="radio"
                            value={type.value}
                            {...register('type')}
                            className="sr-only"
                          />
                          <type.icon className="h-4 w-4 text-[#605d5d]" />
                          <span className="text-sm font-medium text-[#201e1d]">
                            {type.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-[#201e1d]">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        id="name"
                        {...register('name')}
                        className={inputClass(!!errors.name)}
                        placeholder="Votre nom"
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-[#ae1800]">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-[#201e1d]">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        {...register('email')}
                        className={inputClass(!!errors.email)}
                        placeholder="votre@email.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-[#ae1800]">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-[#201e1d]">
                      Téléphone <span className="font-normal text-[#9b9797]">(optionnel)</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      {...register('phone')}
                      className={inputClass(false)}
                      placeholder={CONTACT_INFO.phoneDisplay}
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="mb-1.5 block text-sm font-semibold text-[#201e1d]">
                      Sujet
                    </label>
                    <input
                      type="text"
                      id="subject"
                      {...register('subject')}
                      className={inputClass(!!errors.subject)}
                      placeholder="Objet de votre message"
                    />
                    {errors.subject && (
                      <p className="mt-1 text-xs text-[#ae1800]">{errors.subject.message}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-[#201e1d]">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      {...register('message')}
                      className={`resize-none ${inputClass(!!errors.message)}`}
                      placeholder="Décrivez votre demande en détail..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-[#ae1800]">{errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="modernist"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Info Section */}
            <div className="space-y-8">
              {/* About */}
              <div className="border border-[#d7d3d3] bg-white p-8">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-[#201e1d]">
                  <Globe2 className="h-5 w-5 text-[#ec3013]" />
                  À propos d'Actu Plus
                </h3>
                <p className="mb-4 leading-relaxed text-[#605d5d]">
                  Actu Plus est votre source d'information privilégiée sur l'actualité africaine.
                  Notre équipe de journalistes et d'analystes travaille chaque jour pour vous offrir
                  une information fiable, pertinente et accessible.
                </p>
                <p className="leading-relaxed text-[#605d5d]">
                  Basée à Abidjan, notre rédaction couvre l'ensemble du continent africain avec
                  un regard local et une expertise reconnue.
                </p>
              </div>

              {/* Social Links */}
              <div className="border border-[#d7d3d3] bg-white p-8">
                <h3 className="mb-4 text-xl font-extrabold text-[#201e1d]">
                  Suivez-nous
                </h3>
                <p className="mb-4 text-[#605d5d]">
                  Restez connecté avec nous sur les réseaux sociaux
                </p>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className="flex h-11 w-11 items-center justify-center border border-[#d7d3d3] text-[#605d5d] transition-colors hover:border-[#ec3013] hover:bg-[#ec3013] hover:text-white"
                      aria-label={social.label}
                    >
                      <social.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (placeholder) */}
      <section className="relative h-64 border-t-2 border-[#201e1d]/40 bg-[#eae9e9]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="mx-auto mb-2 h-12 w-12 text-[#9b9797]" />
            <p className="text-[#605d5d]">Carte interactive</p>
            <p className="text-sm text-[#9b9797]">Abidjan, Côte d'Ivoire</p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
