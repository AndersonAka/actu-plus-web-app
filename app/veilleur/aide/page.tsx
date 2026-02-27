'use client';

import HelpGuide, { HelpSection } from '@/components/organisms/HelpGuide';
import {
  LayoutDashboard,
  FileText,
  Send,
  Bell,
  Edit3,
  Image,
  List,
  Search,
  Eye,
  RotateCcw,
} from 'lucide-react';

const sections: HelpSection[] = [
  {
    id: 'tableau-de-bord',
    icon: <LayoutDashboard className="h-5 w-5" />,
    title: 'Tableau de bord',
    description: "Vue d'ensemble de votre activité et de vos statistiques.",
    content:
      "Le tableau de bord est la première page que vous voyez en accédant à l'espace Veilleur. Il regroupe vos indicateurs clés : nombre d'articles créés, en attente de validation, publiés, etc.",
    steps: [
      { text: "Accédez à votre espace via le menu latéral en cliquant sur « Tableau de bord »." },
      { text: "Consultez les compteurs pour voir l'état de vos articles en un coup d'œil." },
      { text: 'Les indicateurs se mettent à jour automatiquement.' },
    ],
    tips: [
      "Le tableau de bord vous permet de repérer rapidement les articles rejetés nécessitant votre attention.",
    ],
    images: [
      {
        src: '/images/help/veilleur/dashboard.png',
        alt: 'Tableau de bord du veilleur',
        caption: "Vue d'ensemble du tableau de bord",
        defaultSize: 'lg',
      },
    ],
  },
  {
    id: 'mes-articles',
    icon: <List className="h-5 w-5" />,
    title: 'Liste de mes articles',
    description: 'Consulter, filtrer et rechercher vos articles.',
    content:
      "La page « Mes articles » affiche l'ensemble de vos articles avec leur statut actuel (brouillon, en attente, validé, rejeté, publié). Vous pouvez filtrer par statut et rechercher par titre.",
    steps: [
      { text: 'Cliquez sur « Mes articles » dans le menu latéral.' },
      { title: 'Recherche', text: "Utilisez la barre de recherche pour trouver un article par son titre." },
      { title: 'Filtre par statut', text: "Sélectionnez un statut dans le menu déroulant pour n'afficher que les articles correspondants." },
      { title: 'Réinitialiser', text: 'Cliquez sur « Réinitialiser » pour effacer tous les filtres.' },
    ],
    tips: [
      'Les articles rejetés peuvent être modifiés puis re-soumis pour validation.',
      'Le compteur en bas de la barre de filtres indique le nombre total d\'articles correspondant à vos critères.',
    ],
    images: [
      {
        src: '/images/help/veilleur/articles-list.png',
        alt: 'Liste des articles du veilleur',
        caption: 'Liste des articles avec filtres et recherche',
        defaultSize: 'lg',
      },
      {
        src: '/images/help/veilleur/articles-filter.png',
        alt: 'Filtres de la liste des articles',
        caption: 'Barre de filtre par statut et recherche',
        defaultSize: 'md',
      },
    ],
  },
  {
    id: 'creer-article',
    icon: <Edit3 className="h-5 w-5" />,
    title: 'Créer un nouvel article',
    description: 'Rédiger et structurer un article complet.',
    content:
      "La création d'un article se fait via un formulaire complet comportant le titre, le résumé, le contenu riche, la catégorie, le pays, l'image de couverture et les sources.",
    steps: [
      { text: 'Cliquez sur « Nouvel article » depuis le menu latéral ou depuis la liste d\'articles.' },
      { title: 'Titre', text: 'Saisissez un titre descriptif d\'au moins 5 caractères.' },
      { title: 'Résumé', text: 'Ajoutez un résumé court (optionnel) pour donner un aperçu de l\'article.' },
      { title: 'Catégorie et Pays', text: 'Sélectionnez la catégorie et le pays concerné (si applicable).' },
      { title: 'Image de couverture', text: 'Téléversez une image de couverture pour illustrer votre article.' },
      { title: 'Contenu', text: 'Rédigez le corps de l\'article dans l\'éditeur de texte riche. Vous pouvez mettre en forme le texte, ajouter des liens, des listes, etc.' },
      { title: 'Sources', text: 'Ajoutez vos sources en cliquant sur « Ajouter une source ». Renseignez le nom et l\'URL.' },
    ],
    tips: [
      'Vous pouvez enregistrer l\'article en brouillon à tout moment sans le soumettre.',
      'Le contenu doit contenir au moins 50 caractères pour être validé.',
      'Les sources ajoutent de la crédibilité à votre article.',
    ],
    images: [
      {
        src: '/images/help/veilleur/create-article-form.png',
        alt: "Formulaire de création d'article",
        caption: 'Formulaire de création avec tous les champs',
        defaultSize: 'lg',
      },
      {
        src: '/images/help/veilleur/rich-text-editor.png',
        alt: 'Éditeur de texte riche',
        caption: "L'éditeur de texte riche pour le contenu de l'article",
        defaultSize: 'md',
      },
      {
        src: '/images/help/veilleur/sources-section.png',
        alt: 'Section des sources',
        caption: 'Ajout de sources avec nom et URL',
        defaultSize: 'sm',
      },
    ],
  },
  {
    id: 'image-couverture',
    icon: <Image className="h-5 w-5" />,
    title: 'Image de couverture',
    description: "Gérer l'image principale de l'article.",
    content:
      "L'image de couverture est l'élément visuel principal de votre article. Elle apparaît en haut de l'article et dans les listes.",
    steps: [
      { text: "Dans le formulaire de l'article, cliquez sur la zone d'upload d'image." },
      { text: 'Sélectionnez une image depuis votre ordinateur ou glissez-déposez-la.' },
      { text: "L'image est automatiquement téléversée et un aperçu s'affiche." },
      { text: 'Pour changer l\'image, cliquez à nouveau sur la zone ou supprimez l\'image actuelle.' },
    ],
    tips: [
      'Utilisez des images de bonne qualité (minimum 800×450 pixels recommandé).',
      'Les formats acceptés sont JPG, PNG et WebP.',
    ],
    images: [
      {
        src: '/images/help/veilleur/image-upload.png',
        alt: "Zone d'upload d'image",
        caption: "Zone de téléversement de l'image de couverture",
        defaultSize: 'md',
      },
    ],
  },
  {
    id: 'soumettre-article',
    icon: <Send className="h-5 w-5" />,
    title: 'Soumettre un article pour validation',
    description: 'Envoyer votre article pour examen par un modérateur.',
    content:
      "Lorsque votre article est prêt, vous pouvez le soumettre pour validation. Un modérateur examinera le contenu et décidera de le valider ou de le rejeter.",
    steps: [
      { text: "Ouvrez l'article en mode édition." },
      { text: "Vérifiez que tous les champs obligatoires sont remplis (titre, contenu, catégorie)." },
      { text: 'Cliquez sur le bouton « Soumettre pour validation ».' },
      { text: 'Confirmez la soumission dans la fenêtre de confirmation.' },
      { text: "L'article passe en statut « En attente » et n'est plus modifiable jusqu'à la décision du modérateur." },
    ],
    tips: [
      'Relisez votre article avant de le soumettre pour éviter les rejets.',
      'Une fois soumis, vous recevrez une notification quand le modérateur aura examiné votre article.',
    ],
    images: [
      {
        src: '/images/help/veilleur/submit-modal.png',
        alt: 'Modal de confirmation de soumission',
        caption: 'Fenêtre de confirmation avant soumission',
        defaultSize: 'md',
      },
    ],
  },
  {
    id: 'modifier-article-rejete',
    icon: <RotateCcw className="h-5 w-5" />,
    title: 'Modifier un article rejeté',
    description: 'Corriger et re-soumettre un article après un rejet.',
    content:
      "Si votre article est rejeté par un modérateur, vous recevez une notification avec la raison du rejet. Vous pouvez alors modifier l'article et le re-soumettre.",
    steps: [
      { text: 'Consultez la notification ou filtrez vos articles par statut « Rejeté ».' },
      { text: "Cliquez sur « Modifier » pour ouvrir l'article en mode édition." },
      { text: 'Apportez les corrections nécessaires selon la raison du rejet.' },
      { text: "Enregistrez les modifications, puis soumettez à nouveau l'article." },
    ],
    tips: [
      'La raison du rejet est visible dans la notification et sur la page de détail de l\'article.',
      'Vous pouvez soumettre un article autant de fois que nécessaire.',
    ],
    images: [
      {
        src: '/images/help/veilleur/rejected-article.png',
        alt: 'Article rejeté avec raison',
        caption: 'Indication de rejet avec la raison du modérateur',
        defaultSize: 'md',
      },
    ],
  },
  {
    id: 'consulter-article',
    icon: <Eye className="h-5 w-5" />,
    title: 'Consulter un article',
    description: 'Voir le détail et le statut de vos articles.',
    content:
      "Pour les articles en attente, validés ou publiés, cliquez sur « Voir » pour accéder à la page de détail en lecture seule.",
    steps: [
      { text: 'Depuis la liste de vos articles, cliquez sur le titre ou le bouton « Voir ».' },
      { text: 'La page affiche le contenu complet, les métadonnées et le statut actuel.' },
    ],
    images: [
      {
        src: '/images/help/veilleur/article-view.png',
        alt: "Vue détaillée d'un article",
        caption: "Page de consultation d'un article",
        defaultSize: 'lg',
      },
    ],
  },
  {
    id: 'notifications',
    icon: <Bell className="h-5 w-5" />,
    title: 'Notifications',
    description: 'Suivre les événements liés à vos articles.',
    content:
      "Vous recevez des notifications lorsqu'un modérateur valide, rejette ou publie l'un de vos articles. Les notifications sont accessibles depuis le menu latéral.",
    steps: [
      { text: 'Cliquez sur « Notifications » dans le menu latéral.' },
      { text: "Le badge rouge sur l'icône indique le nombre de notifications non lues." },
      { text: 'Cliquez sur une notification pour voir les détails.' },
    ],
    tips: [
      'Les notifications sont rafraîchies automatiquement toutes les 30 secondes.',
      'Vous pouvez marquer les notifications comme lues.',
    ],
    images: [
      {
        src: '/images/help/veilleur/notifications.png',
        alt: 'Page des notifications',
        caption: 'Liste des notifications du veilleur',
        defaultSize: 'md',
      },
    ],
  },
  {
    id: 'recherche-filtres',
    icon: <Search className="h-5 w-5" />,
    title: 'Recherche et filtres',
    description: 'Retrouver rapidement vos articles.',
    content:
      "La barre de recherche et le filtre par statut vous permettent de retrouver rapidement un article parmi tous les vôtres.",
    steps: [
      { title: 'Recherche par titre', text: "Tapez quelques mots du titre dans la barre de recherche. Les résultats se mettent à jour automatiquement après une courte pause." },
      { title: 'Filtre par statut', text: 'Utilisez le menu déroulant pour filtrer par : Brouillons, En attente, Validés, Rejetés, Publiés.' },
      { title: 'Combinaison', text: 'Vous pouvez combiner recherche et filtre pour affiner les résultats.' },
      { title: 'Réinitialisation', text: 'Cliquez sur « Réinitialiser » pour remettre tous les filtres à zéro.' },
    ],
    images: [
      {
        src: '/images/help/veilleur/search-filters.png',
        alt: 'Barre de recherche et filtres',
        caption: 'Recherche par titre et filtre par statut combinés',
        defaultSize: 'md',
      },
    ],
  },
];

export default function VeilleurAidePage() {
  return (
    <HelpGuide
      title="Guide du Veilleur"
      subtitle="Découvrez comment utiliser l'espace Veilleur pour créer, gérer et suivre vos articles."
      sections={sections}
    />
  );
}
