import Link from 'next/link';
import { Header, Footer } from '@/components/organisms';
import { CONTACT_INFO } from '@/lib/constants/contact';
import { Globe2, Mail, Phone } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                <Globe2 className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">À propos d&apos;Actu Plus</h1>
                <p className="mt-1 text-sm text-gray-500">
                  L&apos;actualité et plus encore
                </p>
              </div>
            </div>

            <div className="prose prose-gray max-w-none">
              <p>
                <strong>Actu Plus</strong> est une plateforme d&apos;information dédiée à l&apos;actualité
                en Afrique de l&apos;Ouest et au-delà. Nous proposons des articles, des analyses Focus,
                des résumés par pays et un accès premium pour les abonnés.
              </p>

              <h2>Notre mission</h2>
              <p>
                Informer avec rigueur, couvrir l&apos;actualité au plus près du terrain et offrir
                une expérience de lecture claire sur le web et le mobile.
              </p>

              <h2>Nos valeurs</h2>
              <ul>
                <li><strong>Fiabilité</strong> — sources vérifiées et contenus validés par notre équipe éditoriale</li>
                <li><strong>Proximité</strong> — une couverture par pays et par thématiques</li>
                <li><strong>Accessibilité</strong> — contenus gratuits et offres d&apos;abonnement adaptées</li>
              </ul>

              <h2>Nous contacter</h2>
              <ul className="list-none pl-0">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary-600" />
                  <a href={`mailto:${CONTACT_INFO.email}`} className="text-primary-600 hover:underline">
                    {CONTACT_INFO.email}
                  </a>
                </li>
                <li className="mt-2 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary-600" />
                  <a href={`tel:${CONTACT_INFO.phoneTel}`} className="text-primary-600 hover:underline">
                    {CONTACT_INFO.phoneDisplay}
                  </a>
                </li>
              </ul>
              <p className="mt-4">
                <Link href="/contact" className="font-medium text-primary-600 hover:text-primary-700">
                  Formulaire de contact →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
