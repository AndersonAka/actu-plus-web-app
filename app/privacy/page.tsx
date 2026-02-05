import { Header, Footer } from '@/components/organisms';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Politique de confidentialité
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Dernière mise à jour : 5 février 2026
                </p>
              </div>
            </div>

            <div className="prose prose-gray max-w-none">
              <h2>1. Introduction</h2>
              <p>
                Chez Actu Plus, nous accordons une grande importance à la protection de
                vos données personnelles. Cette politique de confidentialité explique
                comment nous collectons, utilisons, partageons et protégeons vos
                informations.
              </p>

              <h2>2. Données collectées</h2>
              <h3>2.1 Informations que vous nous fournissez</h3>
              <ul>
                <li>
                  <strong>Informations de compte :</strong> nom, prénom, adresse email,
                  mot de passe (chiffré)
                </li>
                <li>
                  <strong>Informations de paiement :</strong> traitées de manière
                  sécurisée par nos prestataires de paiement (CinetPay)
                </li>
                <li>
                  <strong>Préférences :</strong> articles favoris, préférences de
                  notification
                </li>
                <li>
                  <strong>Communications :</strong> messages envoyés via nos formulaires
                  de contact
                </li>
              </ul>

              <h3>2.2 Informations collectées automatiquement</h3>
              <ul>
                <li>
                  <strong>Données de navigation :</strong> pages visitées, durée de
                  visite, articles consultés
                </li>
                <li>
                  <strong>Données techniques :</strong> adresse IP, type de navigateur,
                  système d'exploitation, identifiant d'appareil
                </li>
                <li>
                  <strong>Cookies :</strong> voir notre section sur les cookies ci-dessous
                </li>
              </ul>

              <h2>3. Utilisation des données</h2>
              <p>Nous utilisons vos données pour :</p>
              <ul>
                <li>Fournir et améliorer nos services</li>
                <li>Gérer votre compte et vos abonnements</li>
                <li>Traiter vos paiements</li>
                <li>Personnaliser votre expérience (recommandations d'articles)</li>
                <li>Vous envoyer des notifications importantes</li>
                <li>Analyser l'utilisation du service et améliorer nos contenus</li>
                <li>Prévenir la fraude et assurer la sécurité</li>
                <li>Respecter nos obligations légales</li>
              </ul>

              <h2>4. Partage des données</h2>
              <h3>4.1 Nous ne vendons jamais vos données personnelles</h3>
              <p>
                Nous pouvons partager vos données uniquement dans les cas suivants :
              </p>
              <ul>
                <li>
                  <strong>Prestataires de services :</strong> hébergement (Vercel,
                  Render), paiement (CinetPay), analyse (si applicable)
                </li>
                <li>
                  <strong>Obligations légales :</strong> si requis par la loi ou pour
                  protéger nos droits
                </li>
                <li>
                  <strong>Transfert d'entreprise :</strong> en cas de fusion, acquisition
                  ou vente d'actifs
                </li>
              </ul>

              <h3>4.2 Transferts internationaux</h3>
              <p>
                Vos données peuvent être transférées et stockées sur des serveurs situés
                en dehors de votre pays. Nous prenons des mesures appropriées pour
                assurer la protection de vos données lors de ces transferts.
              </p>

              <h2>5. Cookies et technologies similaires</h2>
              <h3>5.1 Types de cookies utilisés</h3>
              <ul>
                <li>
                  <strong>Cookies essentiels :</strong> nécessaires au fonctionnement du
                  site (authentification, panier)
                </li>
                <li>
                  <strong>Cookies de performance :</strong> pour analyser l'utilisation
                  du site
                </li>
                <li>
                  <strong>Cookies de préférences :</strong> pour mémoriser vos choix
                  (langue, thème)
                </li>
              </ul>

              <h3>5.2 Gestion des cookies</h3>
              <p>
                Vous pouvez gérer vos préférences de cookies via les paramètres de votre
                navigateur. Notez que la désactivation de certains cookies peut affecter
                le fonctionnement du site.
              </p>

              <h2>6. Sécurité des données</h2>
              <p>Nous mettons en œuvre des mesures de sécurité appropriées :</p>
              <ul>
                <li>Chiffrement des données sensibles (HTTPS, SSL/TLS)</li>
                <li>Hachage sécurisé des mots de passe</li>
                <li>Contrôles d'accès stricts</li>
                <li>Surveillance et détection des intrusions</li>
                <li>Sauvegardes régulières</li>
              </ul>
              <p>
                Cependant, aucune méthode de transmission sur Internet n'est totalement
                sécurisée. Nous ne pouvons garantir une sécurité absolue.
              </p>

              <h2>7. Conservation des données</h2>
              <p>
                Nous conservons vos données personnelles aussi longtemps que nécessaire
                pour fournir nos services et respecter nos obligations légales :
              </p>
              <ul>
                <li>
                  <strong>Compte actif :</strong> pendant toute la durée d'utilisation
                </li>
                <li>
                  <strong>Compte supprimé :</strong> 30 jours (possibilité de
                  récupération)
                </li>
                <li>
                  <strong>Données de facturation :</strong> selon les obligations légales
                  (généralement 10 ans)
                </li>
                <li>
                  <strong>Données analytiques :</strong> 26 mois maximum
                </li>
              </ul>

              <h2>8. Vos droits</h2>
              <p>Conformément aux lois applicables, vous disposez des droits suivants :</p>
              <ul>
                <li>
                  <strong>Droit d'accès :</strong> obtenir une copie de vos données
                </li>
                <li>
                  <strong>Droit de rectification :</strong> corriger vos données
                  inexactes
                </li>
                <li>
                  <strong>Droit à l'effacement :</strong> supprimer vos données (sous
                  conditions)
                </li>
                <li>
                  <strong>Droit à la limitation :</strong> limiter le traitement de vos
                  données
                </li>
                <li>
                  <strong>Droit à la portabilité :</strong> recevoir vos données dans un
                  format structuré
                </li>
                <li>
                  <strong>Droit d'opposition :</strong> vous opposer au traitement de vos
                  données
                </li>
                <li>
                  <strong>Droit de retirer votre consentement :</strong> à tout moment
                </li>
              </ul>
              <p>
                Pour exercer ces droits, contactez-nous à :{' '}
                <a href="mailto:privacy@actuplus.com" className="text-primary-600 hover:text-primary-700">
                  privacy@actuplus.com
                </a>
              </p>

              <h2>9. Données des mineurs</h2>
              <p>
                Nos services ne sont pas destinés aux personnes de moins de 16 ans. Nous
                ne collectons pas sciemment de données personnelles auprès de mineurs. Si
                vous êtes parent et pensez que votre enfant nous a fourni des données,
                contactez-nous immédiatement.
              </p>

              <h2>10. Modifications de cette politique</h2>
              <p>
                Nous pouvons modifier cette politique de confidentialité. Les
                modifications importantes seront notifiées par email ou via une
                notification sur le site. La date de "dernière mise à jour" en haut de
                cette page indique quand la politique a été modifiée pour la dernière
                fois.
              </p>

              <h2>11. Contact</h2>
              <p>
                Pour toute question concernant cette politique de confidentialité ou le
                traitement de vos données personnelles :
              </p>
              <ul>
                <li>
                  <strong>Email :</strong>{' '}
                  <a href="mailto:privacy@actuplus.com" className="text-primary-600 hover:text-primary-700">
                    privacy@actuplus.com
                  </a>
                </li>
                <li>
                  <strong>Responsable de la protection des données :</strong> DPO Actu
                  Plus
                </li>
              </ul>

              <h2>12. Autorité de contrôle</h2>
              <p>
                Si vous estimez que vos droits ne sont pas respectés, vous avez le droit
                de déposer une plainte auprès de l'autorité de protection des données
                compétente dans votre pays.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
