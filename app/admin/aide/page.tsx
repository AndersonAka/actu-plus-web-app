'use client';

import HelpGuide, { HelpSection } from '@/components/organisms/HelpGuide';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Eye,
  Tag,
  Globe,
  CreditCard,
  Building2,
  MessageSquare,
  Bell,
  Settings,
  UserPlus,
  UserCog,
  Shield,
  Trash2,
  PlusCircle,
  Edit3,
  Search,
} from 'lucide-react';

const sections: HelpSection[] = [
  {
    id: 'tableau-de-bord',
    icon: <LayoutDashboard className="h-5 w-5" />,
    title: 'Tableau de bord',
    description: "Vue d'ensemble globale de la plateforme.",
    content:
      "Le tableau de bord de l'administration offre une vue complète sur l'activité de la plateforme : nombre d'utilisateurs, d'articles, d'abonnements actifs et de revenus.",
    steps: [
      { text: "Accédez au tableau de bord via « Tableau de bord » dans le menu latéral." },
      { text: "Consultez les indicateurs clés pour comprendre l'état de la plateforme." },
    ],
    images: [
      {
        src: '/images/help/admin/dashboard.png',
        alt: "Tableau de bord de l'administration",
        caption: "Vue d'ensemble du tableau de bord administrateur",
        defaultSize: 'lg',
      },
    ],
  },
  {
    id: 'gestion-articles',
    icon: <FileText className="h-5 w-5" />,
    title: 'Gestion des articles',
    description: 'Superviser tous les articles de la plateforme.',
    content:
      "La page « Articles » permet de voir et gérer l'ensemble des articles de tous les veilleurs. Vous pouvez filtrer par statut, rechercher par titre, et accéder au détail de chaque article.",
    steps: [
      { text: 'Cliquez sur « Articles » dans le menu latéral.' },
      { text: 'Utilisez les filtres pour trouver un article spécifique.' },
      { text: "Cliquez sur un article pour accéder à son détail et effectuer des actions (valider, rejeter, publier, dépublier)." },
    ],
    tips: [
      'En tant qu\'administrateur, vous avez accès à toutes les actions disponibles pour les modérateurs.',
    ],
    images: [
      {
        src: '/images/help/admin/articles-list.png',
        alt: 'Liste des articles',
        caption: 'Gestion complète des articles avec filtres avancés',
        defaultSize: 'lg',
      },
    ],
  },
  {
    id: 'gestion-utilisateurs',
    icon: <Users className="h-5 w-5" />,
    title: 'Gestion des utilisateurs',
    description: 'Créer, modifier et gérer les comptes utilisateurs.',
    content:
      "La page « Utilisateurs » centralise la gestion de tous les comptes de la plateforme. Vous pouvez créer de nouveaux utilisateurs, modifier leurs informations, changer leur rôle, et activer ou désactiver des comptes.",
    steps: [
      { text: 'Cliquez sur « Utilisateurs » dans le menu latéral.' },
      { text: 'La liste affiche tous les utilisateurs avec leur rôle, email et statut.' },
      { text: 'Utilisez les filtres par rôle et la recherche pour trouver un utilisateur.' },
    ],
    images: [
      {
        src: '/images/help/admin/users-list.png',
        alt: 'Liste des utilisateurs',
        caption: 'Liste des utilisateurs avec filtres par rôle',
        defaultSize: 'lg',
      },
    ],
  },
  {
    id: 'creer-utilisateur',
    icon: <UserPlus className="h-5 w-5" />,
    title: 'Créer un utilisateur',
    description: 'Ajouter un nouveau compte à la plateforme.',
    content:
      "Vous pouvez créer directement un compte utilisateur avec un rôle spécifique. L'utilisateur recevra ses identifiants.",
    steps: [
      { text: 'Depuis la page « Utilisateurs », cliquez sur « Nouvel utilisateur ».' },
      { text: 'Remplissez le formulaire : prénom, nom, email, mot de passe, rôle.' },
      { text: 'Cliquez sur « Créer » pour enregistrer le compte.' },
    ],
    tips: [
      'Les rôles disponibles sont : Utilisateur, Veilleur, Modérateur, Manager, Admin.',
      'Chaque rôle a des permissions différentes sur la plateforme.',
    ],
    images: [
      {
        src: '/images/help/admin/create-user.png',
        alt: "Formulaire de création d'utilisateur",
        caption: "Formulaire de création d'un nouveau compte",
        defaultSize: 'md',
      },
    ],
  },
  {
    id: 'modifier-utilisateur',
    icon: <UserCog className="h-5 w-5" />,
    title: 'Modifier un utilisateur',
    description: 'Éditer les informations et le rôle.',
    content:
      "Vous pouvez modifier les informations d'un utilisateur existant, changer son rôle ou activer/désactiver son compte.",
    steps: [
      { text: "Cliquez sur l'utilisateur dans la liste pour voir ses détails." },
      { text: 'Cliquez sur « Modifier » pour ouvrir le formulaire d\'édition.' },
      { text: 'Modifiez les champs souhaités et enregistrez.' },
    ],
    tips: [
      'La désactivation d\'un compte empêche l\'utilisateur de se connecter sans supprimer ses données.',
    ],
    images: [
      {
        src: '/images/help/admin/edit-user.png',
        alt: "Édition d'un utilisateur",
        caption: "Modal d'édition d'un utilisateur",
        defaultSize: 'md',
      },
    ],
  },
  {
    id: 'donnees-statistiques',
    icon: <BarChart3 className="h-5 w-5" />,
    title: 'Données statistiques',
    description: 'Analyser les indicateurs clés de la plateforme.',
    content:
      "La page « Données statistiques » affiche des graphiques et indicateurs détaillés sur l'utilisation de la plateforme : nombre d'inscriptions, activité des utilisateurs, articles publiés, etc.",
    images: [
      {
        src: '/images/help/admin/analytics.png',
        alt: 'Données statistiques',
        caption: 'Graphiques et indicateurs de la plateforme',
        defaultSize: 'lg',
      },
    ],
  },
  {
    id: 'suivi-veilleurs',
    icon: <Eye className="h-5 w-5" />,
    title: 'Suivi des veilleurs',
    description: "Suivre l'activité et la productivité des veilleurs.",
    content:
      "La page « Suivi veilleurs » permet de visualiser l'activité de chaque veilleur : nombre d'articles soumis, publiés, rejetés, etc. C'est un outil de suivi de productivité.",
    images: [
      {
        src: '/images/help/admin/veilleur-analytics.png',
        alt: 'Suivi des veilleurs',
        caption: 'Tableau de suivi de l\'activité des veilleurs',
        defaultSize: 'lg',
      },
    ],
  },
  {
    id: 'gestion-categories',
    icon: <Tag className="h-5 w-5" />,
    title: 'Gestion des catégories',
    description: 'Créer, modifier et organiser les catégories.',
    content:
      "Les catégories servent à classer les articles. Vous pouvez créer de nouvelles catégories, modifier celles existantes ou les désactiver.",
    steps: [
      { text: 'Cliquez sur « Catégories » dans le menu latéral.' },
      { text: 'Pour créer une catégorie, cliquez sur « Nouvelle catégorie ».' },
      { text: 'Saisissez le nom et la description, puis enregistrez.' },
      { text: 'Pour modifier ou supprimer, utilisez les boutons d\'action à droite de chaque catégorie.' },
    ],
    images: [
      {
        src: '/images/help/admin/categories.png',
        alt: 'Gestion des catégories',
        caption: 'Liste des catégories avec actions',
        defaultSize: 'lg',
      },
    ],
  },
  {
    id: 'gestion-pays',
    icon: <Globe className="h-5 w-5" />,
    title: 'Gestion des pays',
    description: 'Gérer la liste des pays disponibles.',
    content:
      "Les pays permettent de localiser les articles. Vous pouvez ajouter, modifier ou supprimer des pays.",
    steps: [
      { text: 'Cliquez sur « Pays » dans le menu latéral.' },
      { text: 'Ajoutez un nouveau pays avec son nom, code et drapeau.' },
      { text: 'Modifiez ou supprimez les pays existants.' },
    ],
    images: [
      {
        src: '/images/help/admin/countries.png',
        alt: 'Gestion des pays',
        caption: 'Liste des pays avec drapeaux',
        defaultSize: 'lg',
      },
    ],
  },
  {
    id: 'gestion-abonnements',
    icon: <CreditCard className="h-5 w-5" />,
    title: 'Gestion des abonnements',
    description: 'Plans, abonnements individuels et paiements.',
    content:
      "La page « Abonnements » permet de gérer les plans d'abonnement (création, modification, activation/désactivation) et de consulter les abonnements individuels des utilisateurs.",
    steps: [
      { text: 'Cliquez sur « Abonnements » dans le menu latéral.' },
      { title: 'Plans', text: 'Créez et gérez les plans (nom, prix, durée, fonctionnalités).' },
      { title: 'Abonnements', text: 'Consultez les abonnements actifs, expirés ou annulés.' },
    ],
    tips: [
      'Les plans de catégorie « enterprise » sont gérés dans la section « Comptes Entreprise ».',
    ],
    images: [
      {
        src: '/images/help/admin/subscriptions.png',
        alt: 'Gestion des abonnements',
        caption: 'Plans d\'abonnement et liste des abonnés',
        defaultSize: 'lg',
      },
    ],
  },
  {
    id: 'comptes-entreprise',
    icon: <Building2 className="h-5 w-5" />,
    title: 'Comptes Entreprise',
    description: 'Gérer les abonnements entreprise et leurs employés.',
    content:
      "La section « Comptes Entreprise » permet de créer et gérer des abonnements multi-utilisateurs pour les entreprises. Chaque abonnement a un code de référence, un nombre maximum de sièges, et une liste d'employés.",
    steps: [
      { text: 'Cliquez sur « Comptes Entreprise » dans le menu latéral.' },
      { title: 'Créer', text: 'Cliquez sur « Nouvel abonnement » et renseignez les informations de l\'entreprise.' },
      { title: 'Détails', text: 'Cliquez sur un abonnement pour voir les employés inscrits.' },
      { title: 'Modifier', text: 'Modifiez les informations de l\'entreprise ou le nombre de sièges.' },
      { title: 'Annuler', text: 'Annulez un abonnement si nécessaire (action irréversible).' },
      { title: 'Retirer un employé', text: 'Depuis le détail, retirez un employé de l\'abonnement.' },
    ],
    tips: [
      'Le code de référence est utilisé par les employés pour rejoindre l\'abonnement entreprise.',
      'Utilisez les filtres par statut et la barre de recherche pour retrouver rapidement un abonnement.',
    ],
    images: [
      {
        src: '/images/help/admin/enterprise-list.png',
        alt: 'Liste des abonnements entreprise',
        caption: 'Tableau des abonnements entreprise avec filtres',
        defaultSize: 'lg',
      },
      {
        src: '/images/help/admin/enterprise-detail.png',
        alt: 'Détail abonnement entreprise',
        caption: 'Détail d\'un abonnement avec la liste des employés',
        defaultSize: 'md',
      },
      {
        src: '/images/help/admin/enterprise-create.png',
        alt: 'Création abonnement entreprise',
        caption: 'Formulaire de création d\'un abonnement entreprise',
        defaultSize: 'md',
      },
    ],
  },
  {
    id: 'messages-contact',
    icon: <MessageSquare className="h-5 w-5" />,
    title: 'Messages de contact',
    description: 'Consulter les messages envoyés via le formulaire de contact.',
    content:
      "La page « Messages » affiche les messages envoyés par les visiteurs et utilisateurs via le formulaire de contact du site.",
    steps: [
      { text: 'Cliquez sur « Messages » dans le menu latéral.' },
      { text: 'Consultez la liste des messages avec l\'expéditeur, le sujet et la date.' },
      { text: 'Cliquez sur un message pour lire le contenu complet.' },
    ],
    images: [
      {
        src: '/images/help/admin/messages.png',
        alt: 'Messages de contact',
        caption: 'Liste des messages de contact',
        defaultSize: 'lg',
      },
    ],
  },
  {
    id: 'notifications',
    icon: <Bell className="h-5 w-5" />,
    title: 'Notifications',
    description: 'Suivre tous les événements de la plateforme.',
    content:
      "L'administrateur reçoit des notifications pour tous les événements importants : nouveaux utilisateurs, articles soumis, abonnements créés, paiements réussis ou échoués, messages de contact, etc.",
    steps: [
      { text: 'Cliquez sur « Notifications » dans le menu latéral.' },
      { text: 'Le badge rouge indique le nombre de notifications non lues.' },
      { text: 'Cliquez sur une notification pour voir les détails.' },
    ],
    images: [
      {
        src: '/images/help/admin/notifications.png',
        alt: 'Notifications administrateur',
        caption: 'Liste des notifications de la plateforme',
        defaultSize: 'md',
      },
    ],
  },
  {
    id: 'parametres',
    icon: <Settings className="h-5 w-5" />,
    title: 'Paramètres',
    description: 'Configurer les paramètres globaux de la plateforme.',
    content:
      "La page « Paramètres » permet de configurer les paramètres globaux de la plateforme, notamment l'heure de cut-off éditorial.",
    steps: [
      { text: 'Cliquez sur « Paramètres » dans le menu latéral.' },
      { title: 'Heure de cut-off', text: "Définissez l'heure à laquelle les articles « du jour » sont recalculés. Par défaut : 00:00." },
      { text: 'Cliquez sur « Enregistrer » pour sauvegarder les modifications.' },
    ],
    tips: [
      'L\'heure de cut-off affecte la section « Articles du jour » sur la page d\'accueil.',
    ],
    images: [
      {
        src: '/images/help/admin/settings.png',
        alt: 'Paramètres',
        caption: 'Page de configuration des paramètres',
        defaultSize: 'md',
      },
    ],
  },
];

export default function AdminAidePage() {
  return (
    <HelpGuide
      title="Guide de l'Administration"
      subtitle="Découvrez comment gérer la plateforme : utilisateurs, articles, abonnements, catégories, pays et paramètres."
      sections={sections}
    />
  );
}
