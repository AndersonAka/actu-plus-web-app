import { Header, Footer } from '@/components/organisms';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Conditions d'utilisation
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Dernière mise à jour : 5 février 2026
                </p>
              </div>
            </div>

            <div className="prose prose-gray max-w-none">
              <h2>1. Acceptation des conditions</h2>
              <p>
                En accédant et en utilisant Actu Plus, vous acceptez d'être lié par ces
                conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez
                ne pas utiliser notre service.
              </p>

              <h2>2. Description du service</h2>
              <p>
                Actu Plus est une plateforme d'actualités qui fournit des informations sur
                l'Afrique de l'Ouest. Nous proposons des articles gratuits et premium
                accessibles via abonnement.
              </p>

              <h2>3. Inscription et compte utilisateur</h2>
              <h3>3.1 Création de compte</h3>
              <p>
                Pour accéder à certaines fonctionnalités, vous devez créer un compte.
                Vous êtes responsable de maintenir la confidentialité de vos identifiants
                et de toutes les activités effectuées sous votre compte.
              </p>
              <h3>3.2 Informations exactes</h3>
              <p>
                Vous vous engagez à fournir des informations exactes, complètes et à jour
                lors de votre inscription et à les maintenir à jour.
              </p>

              <h2>4. Abonnements et paiements</h2>
              <h3>4.1 Abonnements premium</h3>
              <p>
                Certains contenus sont réservés aux abonnés premium. Les détails des
                abonnements, tarifs et modalités de paiement sont disponibles sur notre
                page d'abonnements.
              </p>
              <h3>4.2 Renouvellement automatique</h3>
              <p>
                Les abonnements sont renouvelés automatiquement sauf annulation de votre
                part avant la date de renouvellement.
              </p>
              <h3>4.3 Remboursements</h3>
              <p>
                Les paiements sont généralement non remboursables, sauf disposition
                légale contraire ou cas particulier examiné par notre service client.
              </p>

              <h2>5. Utilisation du service</h2>
              <h3>5.1 Licence d'utilisation</h3>
              <p>
                Nous vous accordons une licence limitée, non exclusive, non transférable
                pour accéder et utiliser Actu Plus à des fins personnelles et non
                commerciales.
              </p>
              <h3>5.2 Restrictions</h3>
              <p>Vous vous engagez à ne pas :</p>
              <ul>
                <li>Copier, modifier ou distribuer le contenu sans autorisation</li>
                <li>Utiliser des robots, scrapers ou autres moyens automatisés</li>
                <li>Tenter d'accéder à des zones non autorisées du service</li>
                <li>Partager vos identifiants de compte avec des tiers</li>
                <li>Utiliser le service à des fins illégales ou frauduleuses</li>
              </ul>

              <h2>6. Contenu utilisateur</h2>
              <h3>6.1 Responsabilité</h3>
              <p>
                Si vous publiez du contenu (commentaires, avis), vous êtes seul
                responsable de ce contenu et garantissez qu'il ne viole aucun droit de
                tiers.
              </p>
              <h3>6.2 Modération</h3>
              <p>
                Nous nous réservons le droit de modérer, refuser ou supprimer tout
                contenu qui viole ces conditions ou que nous jugeons inapproprié.
              </p>

              <h2>7. Propriété intellectuelle</h2>
              <p>
                Tous les contenus présents sur Actu Plus (textes, images, logos, etc.)
                sont protégés par les droits de propriété intellectuelle et appartiennent
                à Actu Plus ou à ses concédants de licence.
              </p>

              <h2>8. Limitation de responsabilité</h2>
              <p>
                Actu Plus est fourni "tel quel" sans garantie d'aucune sorte. Nous ne
                garantissons pas l'exactitude, l'exhaustivité ou l'actualité des
                informations publiées.
              </p>
              <p>
                Dans les limites autorisées par la loi, nous ne serons pas responsables
                des dommages directs, indirects, accessoires ou consécutifs résultant de
                l'utilisation ou de l'impossibilité d'utiliser notre service.
              </p>

              <h2>9. Modifications du service</h2>
              <p>
                Nous nous réservons le droit de modifier, suspendre ou interrompre tout
                ou partie du service à tout moment, avec ou sans préavis.
              </p>

              <h2>10. Résiliation</h2>
              <p>
                Nous pouvons suspendre ou résilier votre compte en cas de violation de
                ces conditions. Vous pouvez également résilier votre compte à tout moment
                depuis vos paramètres.
              </p>

              <h2>11. Modifications des conditions</h2>
              <p>
                Nous pouvons modifier ces conditions à tout moment. Les modifications
                prendront effet dès leur publication sur le site. Votre utilisation
                continue du service après ces modifications constitue votre acceptation
                des nouvelles conditions.
              </p>

              <h2>12. Droit applicable</h2>
              <p>
                Ces conditions sont régies par les lois en vigueur dans les pays
                d'Afrique de l'Ouest où nous opérons. Tout litige sera soumis à la
                juridiction compétente.
              </p>

              <h2>13. Contact</h2>
              <p>
                Pour toute question concernant ces conditions d'utilisation, veuillez
                nous contacter à :{' '}
                <a href="mailto:legal@actuplus.com" className="text-primary-600 hover:text-primary-700">
                  legal@actuplus.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
