'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header, Footer } from '@/components/organisms';
import { Button, Input, Alert } from '@/components/atoms';
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

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  subject: z.string().min(5, 'Le sujet doit contenir au moins 5 caractères'),
  message: z.string().min(20, 'Le message doit contenir au moins 20 caractères'),
  type: z.enum(['general', 'support', 'partnership', 'press']),
});

type ContactFormData = z.infer<typeof contactSchema>;

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
      // Simuler l'envoi (à remplacer par un vrai endpoint)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // TODO: Envoyer au backend
      // const response = await fetch('/api/proxy/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });

      setIsSubmitted(true);
      reset();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'contact@actuplus.com',
      href: 'mailto:contact@actuplus.com',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Phone,
      label: 'Téléphone',
      value: '+225 07 00 00 00 00',
      href: 'tel:+2250700000000',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: MapPin,
      label: 'Adresse',
      value: 'Abidjan, Côte d\'Ivoire',
      href: '#',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      icon: Clock,
      label: 'Horaires',
      value: 'Lun - Ven: 8h - 18h',
      href: '#',
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:bg-blue-600' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:bg-sky-500' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:bg-blue-700' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:bg-pink-600' },
  ];

  const contactTypes = [
    { value: 'general', label: 'Question générale', icon: HelpCircle },
    { value: 'support', label: 'Support technique', icon: MessageSquare },
    { value: 'partnership', label: 'Partenariat', icon: Users },
    { value: 'press', label: 'Presse', icon: FileText },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 py-16 text-white">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
                <MessageSquare className="h-4 w-4" />
                Contactez-nous
              </div>
              <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
                Nous sommes à votre écoute
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-primary-100">
                Une question, une suggestion ou besoin d'aide ? Notre équipe est là pour vous accompagner.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="relative -mt-8 pb-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {contactInfo.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="group flex items-center gap-4 rounded-xl bg-white p-5 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color} transition-transform group-hover:scale-110`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <p className="font-semibold text-gray-900">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Contact Form */}
              <div className="rounded-2xl bg-white p-8 shadow-lg">
                <h2 className="mb-6 text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Send className="h-6 w-6 text-primary-600" />
                  Envoyez-nous un message
                </h2>

                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                      Message envoyé !
                    </h3>
                    <p className="mb-6 text-gray-600">
                      Nous vous répondrons dans les plus brefs délais.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsSubmitted(false)}
                    >
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
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Type de demande
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {contactTypes.map((type) => (
                          <label
                            key={type.value}
                            className="relative flex cursor-pointer items-center gap-2 rounded-lg border-2 border-gray-200 p-3 transition-all hover:border-primary-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50"
                          >
                            <input
                              type="radio"
                              value={type.value}
                              {...register('type')}
                              className="sr-only"
                            />
                            <type.icon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                              {type.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Name & Email */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                          Nom complet
                        </label>
                        <input
                          type="text"
                          id="name"
                          {...register('name')}
                          className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                            errors.name 
                              ? 'border-red-300 focus:border-red-500' 
                              : 'border-gray-300 focus:border-primary-500'
                          }`}
                          placeholder="Votre nom"
                        />
                        {errors.name && (
                          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          {...register('email')}
                          className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                            errors.email 
                              ? 'border-red-300 focus:border-red-500' 
                              : 'border-gray-300 focus:border-primary-500'
                          }`}
                          placeholder="votre@email.com"
                        />
                        {errors.email && (
                          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Sujet
                      </label>
                      <input
                        type="text"
                        id="subject"
                        {...register('subject')}
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                          errors.subject 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-primary-500'
                        }`}
                        placeholder="Objet de votre message"
                      />
                      {errors.subject && (
                        <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        {...register('message')}
                        className={`w-full resize-none rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                          errors.message 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-primary-500'
                        }`}
                        placeholder="Décrivez votre demande en détail..."
                      />
                      {errors.message && (
                        <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
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
                <div className="rounded-2xl bg-white p-8 shadow-lg">
                  <h3 className="mb-4 text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Globe2 className="h-5 w-5 text-primary-600" />
                    À propos d'Actu Plus
                  </h3>
                  <p className="mb-4 text-gray-600 leading-relaxed">
                    Actu Plus est votre source d'information privilégiée sur l'actualité africaine. 
                    Notre équipe de journalistes et d'analystes travaille chaque jour pour vous offrir 
                    une information fiable, pertinente et accessible.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Basée à Abidjan, notre rédaction couvre l'ensemble du continent africain avec 
                    un regard local et une expertise reconnue.
                  </p>
                </div>

                {/* Social Links */}
                <div className="rounded-2xl bg-white p-8 shadow-lg">
                  <h3 className="mb-4 text-xl font-bold text-gray-900">
                    Suivez-nous
                  </h3>
                  <p className="mb-4 text-gray-600">
                    Restez connecté avec nous sur les réseaux sociaux
                  </p>
                  <div className="flex gap-3">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.href}
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-all hover:text-white ${social.color}`}
                        aria-label={social.label}
                      >
                        <social.icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* FAQ Link */}
                <div className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 p-8 text-white shadow-lg">
                  <h3 className="mb-2 text-xl font-bold">
                    Questions fréquentes ?
                  </h3>
                  <p className="mb-4 text-primary-100">
                    Consultez notre FAQ pour trouver rapidement des réponses à vos questions.
                  </p>
                  <Link href="/faq">
                    <Button variant="secondary" className="bg-white text-primary-700 hover:bg-primary-50">
                      Voir la FAQ
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section (placeholder) */}
        <section className="h-64 bg-gray-200 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500">Carte interactive</p>
              <p className="text-sm text-gray-400">Abidjan, Côte d'Ivoire</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
