'use client';

import HelpGuide, { HelpSection } from '@/components/organisms/HelpGuide';
import {
  LayoutDashboard,
  Clock,
  CheckSquare,
  XCircle,
  FileText,
  Bell,
  Pencil,
  Send,
  Star,
  Crown,
  Eye,
  EyeOff,
  Layers,
  CalendarClock,
} from 'lucide-react';

const sections: HelpSection[] = [
  {
    id: 'tableau-de-bord',
    icon: <LayoutDashboard className="h-5 w-5" />,
    title: 'Tableau de bord',
    description: "Vue d'ensemble des articles à traiter et de l'activité.",
    content:
      "Le tableau de bord du modérateur offre une vue synthétique de l'activité : nombre d'articles en attente de validation, validés, rejetés et publiés. Il vous permet de prioriser votre travail.",
    steps: [
      { text: 'Accédez à votre espace via « Tableau de bord » dans le menu latéral.' },
      { text: 'Les compteurs vous montrent immédiatement combien d\'articles requièrent votre attention.' },
    ],
    tips: [
      'Concentrez-vous d\'abord sur les articles « En attente » pour ne pas bloquer les veilleurs.',
    ],
    images: [
      {
        src: '/images/help/moderateur/dashboard.png',
        alt: 'Tableau de bord du modérateur',
        caption: "Vue d'ensemble du tableau de bord modérateur",
        defaultSize: 'lg',
      },
    ],
  },
  {
    id: 'articles-en-attente',
    icon: <Clock className="h-5 w-5" />,
    title: 'Articles en attente',
    description: 'Examiner les articles soumis par les veilleurs.',
    content:
      "La page « En attente » liste tous les articles soumis pour validation. C'est ici que vous examinez le contenu, décidez de valider ou rejeter, et éventuellement modifiez l'article.",
    steps: [
      { text: 'Cliquez sur « En attente » dans le menu latéral.' },
      { text: 'La liste affiche les articles en attente de votre examen, triés par date de soumission.' },
      { text: 'Cliquez sur un article pour accéder à la page d\'examen détaillée.' },
    ],
    images: [
      {
        src: '/images/help/moderateur/pending-list.png',
        alt: 'Liste des articles en attente',
        caption: 'Liste des articles en attente de validation',
        defaultSize: 'lg',
      },
    ],
  },
  {
    id: 'examiner-article',
    icon: <Eye className="h-5 w-5" />,
    title: "Examiner un article",
    description: "Lire le contenu, vérifier les informations et les sources.",
    content:
      "La page d'examen affiche l'article complet : image de couverture, titre, résumé, contenu, sources, métadonnées (auteur, catégorie, pays, date de création). Vous pouvez tout vérifier avant de prendre votre décision.",
    steps: [
      { text: "Depuis la liste « En attente », cliquez sur l'article à examiner." },
      { text: 'Lisez attentivement le contenu, vérifiez les sources et la catégorisation.' },
      { text: "Vérifiez que l'image de couverture est appropriée." },
      { text: 'Décidez ensuite de valider, rejeter ou modifier l\'article.' },
    ],
    images: [
      {
        src: '/images/help/moderateur/article-review.png',
        alt: "Page d'examen d'un article",
        caption: 'Page d\'examen avec le contenu complet de l\'article',
        defaultSize: 'lg',
      },
      {
        src: '/images/help/moderateur/article-info.png',
        alt: 'Informations de l\'article',
        caption: 'Bloc d\'informations : auteur, catégorie, pays, date',
        defaultSize: 'md',
      },
    ],
  },
  {
    id: 'valider-article',
    icon: <CheckSquare className="h-5 w-5" />,
    title: 'Valider un article',
    description: "Approuver un article pour publication.",
    content:
      "La validation confirme que l'article est conforme et prêt à être publié. Vous pouvez définir les options de publication (contenu abonné, section, à la une) avant ou après la validation.",
    steps: [
      { text: "Depuis la page d'examen, cliquez sur le bouton « Valider »." },
      { text: 'Si l\'option « Contenu Abonné » n\'est pas cochée, une confirmation vous demandera si l\'article doit être public.' },
      { text: "L'article passe en statut « Validé » et le veilleur est notifié." },
    ],
    tips: [
      'Pensez à définir la section de destination (Toute l\'actualité, Focus, Chronique) avant de publier.',
      'Un article validé n\'est pas encore visible publiquement — il doit être publié ensuite.',
    ],
    images: [
      {
        src: '/images/help/moderateur/approve-button.png',
        alt: 'Bouton de validation',
        caption: 'Boutons d\'action : Valider, Rejeter, Modifier',
        defaultSize: 'md',
      },
      {
        src: '/images/help/moderateur/approve-confirm.png',
        alt: 'Confirmation de validation en contenu public',
        caption: 'Confirmation pour un article en contenu public',
        defaultSize: 'sm',
      },
    ],
  },
  {
    id: 'rejeter-article',
    icon: <XCircle className="h-5 w-5" />,
    title: 'Rejeter un article',
    description: 'Renvoyer un article au veilleur avec une raison.',
    content:
      "Le rejet permet de renvoyer l'article au veilleur pour correction. Vous devez fournir une raison pour que le veilleur comprenne ce qu'il doit corriger.",
    steps: [
      { text: 'Cliquez sur le bouton « Rejeter ».' },
      { text: 'Saisissez la raison du rejet dans la fenêtre modale.' },
      { text: 'Cliquez sur « Confirmer » pour valider le rejet.' },
      { text: "Le veilleur reçoit une notification avec la raison et peut modifier puis re-soumettre l'article." },
    ],
    tips: [
      'Soyez précis dans la raison du rejet pour faciliter la correction par le veilleur.',
      'Le rejet n\'est pas définitif — le veilleur peut corriger et re-soumettre.',
    ],
    images: [
      {
        src: '/images/help/moderateur/reject-modal.png',
        alt: 'Modal de rejet',
        caption: 'Fenêtre de saisie de la raison du rejet',
        defaultSize: 'md',
      },
    ],
  },
  {
    id: 'modifier-article',
    icon: <Pencil className="h-5 w-5" />,
    title: "Modifier un article lors de l'examen",
    description: "Corriger directement un article sans le rejeter.",
    content:
      "En tant que modérateur, vous pouvez modifier directement le contenu d'un article en attente de validation, sans avoir à le rejeter. Cela permet de corriger de petites erreurs (fautes, reformulations) directement.",
    steps: [
      { text: "Depuis la page d'examen de l'article, cliquez sur « Modifier l'article »." },
      { text: 'Le formulaire d\'édition s\'ouvre avec le contenu de l\'article.' },
      { text: 'Apportez vos corrections (titre, résumé, contenu, catégorie, image, sources).' },
      { text: 'Cliquez sur « Enregistrer les modifications ».' },
      { text: "Vous êtes automatiquement redirigé vers la page d'examen pour valider ou publier." },
    ],
    tips: [
      'L\'article reste en statut « En attente » après modification — vous pouvez le valider immédiatement après.',
      'Cette fonctionnalité est pratique pour corriger les fautes mineures sans bloquer le veilleur.',
    ],
    images: [
      {
        src: '/images/help/moderateur/edit-article.png',
        alt: "Formulaire de modification d'article",
        caption: 'Formulaire d\'édition accessible depuis la page d\'examen',
        defaultSize: 'lg',
      },
    ],
  },
  {
    id: 'options-publication',
    icon: <Layers className="h-5 w-5" />,
    title: 'Options de publication',
    description: 'Configurer la section, le mode premium et la mise en avant.',
    content:
      "Avant de publier un article, vous pouvez configurer plusieurs options : la section de destination, le mode contenu abonné, la mise à la une et la section « L'Essentiel ».",
    steps: [
      { title: 'Section de destination', text: "Sélectionnez la section dans laquelle l'article apparaîtra : Toute l'actualité, Focus (Premium), Chronique (Premium)." },
      { title: "L'Essentiel", text: "Cochez cette option pour afficher l'article dans la section « L'Essentiel de l'actualité »." },
      { title: 'Contenu Abonné', text: "Cochez pour réserver l'article aux abonnés payants." },
      { title: 'À la une', text: "Cochez pour afficher l'article dans le carrousel d'accueil (pendant 24 heures)." },
    ],
    tips: [
      'Les articles de type « Résumé » sont automatiquement configurés en Contenu Abonné.',
      'Vous pouvez modifier ces options même après publication.',
    ],
    images: [
      {
        src: '/images/help/moderateur/publish-options.png',
        alt: 'Options de publication',
        caption: 'Section, premium, à la une et L\'Essentiel',
        defaultSize: 'lg',
      },
    ],
  },
  {
    id: 'publier-article',
    icon: <Send className="h-5 w-5" />,
    title: 'Publier un article',
    description: "Rendre un article validé visible au public.",
    content:
      "La publication rend l'article visible sur le site. Seuls les articles validés peuvent être publiés. Vous pouvez aussi programmer la publication.",
    steps: [
      { text: 'Assurez-vous que l\'article est en statut « Validé ».' },
      { text: 'Configurez les options de publication (section, premium, à la une).' },
      { text: 'Cliquez sur « Publier ».' },
      { text: "L'article est immédiatement visible sur le site et les abonnés sont notifiés par email." },
    ],
    images: [
      {
        src: '/images/help/moderateur/publish-button.png',
        alt: 'Bouton de publication',
        caption: 'Bouton de publication avec indication du mode (public/abonné)',
        defaultSize: 'md',
      },
    ],
  },
  {
    id: 'publication-programmee',
    icon: <CalendarClock className="h-5 w-5" />,
    title: 'Publication programmée',
    description: 'Planifier la publication à une date et heure précises.',
    content:
      "Vous pouvez programmer la publication d'un article pour une date et heure ultérieures. L'article sera publié automatiquement à l'heure prévue.",
    steps: [
      { text: 'Dans les options de publication, cochez « Programmer la publication ».' },
      { text: 'Sélectionnez la date et l\'heure souhaitées.' },
      { text: 'Cliquez sur « Publier ». L\'article sera programmé et publié automatiquement.' },
    ],
    images: [
      {
        src: '/images/help/moderateur/scheduled-publish.png',
        alt: 'Publication programmée',
        caption: 'Sélecteur de date/heure pour la publication programmée',
        defaultSize: 'md',
      },
    ],
  },
  {
    id: 'depublier-article',
    icon: <EyeOff className="h-5 w-5" />,
    title: 'Dépublier un article',
    description: 'Retirer un article publié de la visibilité publique.',
    content:
      "Si nécessaire, vous pouvez dépublier un article pour le retirer du site tout en conservant son contenu. L'article repasse en statut « Validé ».",
    steps: [
      { text: 'Accédez à l\'article publié depuis la liste « Publiés ».' },
      { text: 'Cliquez sur « Dépublier l\'article ».' },
      { text: 'L\'article n\'est plus visible publiquement mais reste dans le système.' },
    ],
    images: [
      {
        src: '/images/help/moderateur/unpublish.png',
        alt: 'Bouton de dépublication',
        caption: 'Bouton de dépublication d\'un article',
        defaultSize: 'sm',
      },
    ],
  },
  {
    id: 'articles-valides',
    icon: <CheckSquare className="h-5 w-5" />,
    title: 'Articles validés',
    description: 'Liste des articles approuvés prêts à être publiés.',
    content:
      "La page « Validés » regroupe les articles qui ont été approuvés et qui attendent d'être publiés.",
    steps: [
      { text: 'Cliquez sur « Validés » dans le menu latéral.' },
      { text: 'Cliquez sur un article pour accéder aux options de publication.' },
    ],
    images: [
      {
        src: '/images/help/moderateur/approved-list.png',
        alt: 'Liste des articles validés',
        caption: 'Liste des articles en attente de publication',
        defaultSize: 'lg',
      },
    ],
  },
  {
    id: 'articles-rejetes',
    icon: <XCircle className="h-5 w-5" />,
    title: 'Articles rejetés',
    description: 'Historique des articles renvoyés aux veilleurs.',
    content:
      "La page « Rejetés » affiche les articles que vous avez rejetés. Vous pouvez voir la raison du rejet et suivre si le veilleur a re-soumis l'article.",
    images: [
      {
        src: '/images/help/moderateur/rejected-list.png',
        alt: 'Liste des articles rejetés',
        caption: 'Liste des articles rejetés avec raison',
        defaultSize: 'lg',
      },
    ],
  },
  {
    id: 'articles-publies',
    icon: <FileText className="h-5 w-5" />,
    title: 'Articles publiés',
    description: 'Consulter et gérer les articles en ligne.',
    content:
      "La page « Publiés » affiche tous les articles actuellement visibles sur le site. Vous pouvez modifier les options de publication ou dépublier un article.",
    images: [
      {
        src: '/images/help/moderateur/published-list.png',
        alt: 'Liste des articles publiés',
        caption: 'Liste des articles publiés avec lien vers le site',
        defaultSize: 'lg',
      },
    ],
  },
  {
    id: 'notifications',
    icon: <Bell className="h-5 w-5" />,
    title: 'Notifications',
    description: "Suivre les soumissions d'articles et les événements.",
    content:
      "Vous recevez des notifications lorsqu'un veilleur soumet un article pour validation. Les notifications vous permettent de rester informé de l'activité.",
    steps: [
      { text: 'Cliquez sur « Notifications » dans le menu latéral.' },
      { text: 'Le badge rouge indique le nombre de notifications non lues.' },
      { text: 'Cliquez sur une notification pour voir les détails.' },
    ],
    images: [
      {
        src: '/images/help/moderateur/notifications.png',
        alt: 'Notifications du modérateur',
        caption: 'Liste des notifications',
        defaultSize: 'md',
      },
    ],
  },
];

export default function ModerateurAidePage() {
  return (
    <HelpGuide
      title="Guide du Modérateur"
      subtitle="Découvrez comment examiner, valider, modifier et publier les articles soumis par les veilleurs."
      sections={sections}
    />
  );
}
