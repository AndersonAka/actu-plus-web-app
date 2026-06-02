import {
  Bell,
  FileText,
  FileCheck,
  FileClock,
  XCircle,
  CheckCircle,
  Archive,
  CreditCard,
  Crown,
  AlertCircle,
  AlertTriangle,
  UserPlus,
  UserMinus,
  Building2,
  LogOut,
  MessageSquare,
  FileSpreadsheet,
  Star,
  type LucideIcon,
} from 'lucide-react';

export type NotificationBadgeVariant =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'default';

export interface NotificationVisual {
  label: string;
  Icon: LucideIcon;
  /** Classe couleur du texte/icône, ex: text-success-600 */
  iconColorClass: string;
  /** Classe fond du cercle, ex: bg-success-100 */
  bgClass: string;
  /** Combinaison fond + texte (cercle d'icône) */
  circleClass: string;
  badgeVariant: NotificationBadgeVariant;
}

interface VisualConfig {
  label: string;
  Icon: LucideIcon;
  iconColorClass: string;
  bgClass: string;
  badgeVariant: NotificationBadgeVariant;
}

/**
 * Mapping centralisé des types de notification backend → rendu UI.
 * Doit rester aligné avec NotificationType (actu-plus-backend).
 */
const NOTIFICATION_VISUALS: Record<string, VisualConfig> = {
  // Articles
  article: { label: 'Article', Icon: FileText, iconColorClass: 'text-primary-600', bgClass: 'bg-primary-100', badgeVariant: 'info' },
  article_submitted: { label: 'Article soumis', Icon: FileText, iconColorClass: 'text-primary-600', bgClass: 'bg-primary-100', badgeVariant: 'info' },
  article_approved: { label: 'Article validé', Icon: FileCheck, iconColorClass: 'text-success-600', bgClass: 'bg-success-100', badgeVariant: 'success' },
  article_rejected: { label: 'Article rejeté', Icon: XCircle, iconColorClass: 'text-error-600', bgClass: 'bg-error-100', badgeVariant: 'error' },
  article_published: { label: 'Article publié', Icon: CheckCircle, iconColorClass: 'text-success-600', bgClass: 'bg-success-100', badgeVariant: 'success' },
  article_scheduled_published: { label: 'Publication programmée', Icon: FileClock, iconColorClass: 'text-primary-600', bgClass: 'bg-primary-100', badgeVariant: 'info' },
  article_pending_review: { label: 'Article à valider', Icon: FileClock, iconColorClass: 'text-warning-600', bgClass: 'bg-warning-100', badgeVariant: 'warning' },
  article_auto_archived: { label: 'Article archivé', Icon: Archive, iconColorClass: 'text-gray-600', bgClass: 'bg-gray-100', badgeVariant: 'default' },

  // Abonnements
  subscription: { label: 'Abonnement', Icon: Crown, iconColorClass: 'text-primary-600', bgClass: 'bg-primary-100', badgeVariant: 'info' },
  subscription_created: { label: 'Abonnement créé', Icon: CreditCard, iconColorClass: 'text-primary-600', bgClass: 'bg-primary-100', badgeVariant: 'info' },
  subscription_activated: { label: 'Abonnement activé', Icon: Crown, iconColorClass: 'text-success-600', bgClass: 'bg-success-100', badgeVariant: 'success' },
  subscription_expiring: { label: 'Abonnement bientôt expiré', Icon: AlertTriangle, iconColorClass: 'text-warning-600', bgClass: 'bg-warning-100', badgeVariant: 'warning' },
  subscription_expired: { label: 'Abonnement expiré', Icon: AlertCircle, iconColorClass: 'text-warning-600', bgClass: 'bg-warning-100', badgeVariant: 'warning' },
  subscription_cancelled: { label: 'Abonnement annulé', Icon: XCircle, iconColorClass: 'text-error-600', bgClass: 'bg-error-100', badgeVariant: 'error' },

  // Paiements
  payment: { label: 'Paiement', Icon: CreditCard, iconColorClass: 'text-primary-600', bgClass: 'bg-primary-100', badgeVariant: 'info' },
  payment_success: { label: 'Paiement réussi', Icon: CreditCard, iconColorClass: 'text-success-600', bgClass: 'bg-success-100', badgeVariant: 'success' },
  payment_failed: { label: 'Paiement échoué', Icon: AlertCircle, iconColorClass: 'text-error-600', bgClass: 'bg-error-100', badgeVariant: 'error' },

  // Utilisateurs
  user_registered: { label: 'Inscription', Icon: UserPlus, iconColorClass: 'text-primary-600', bgClass: 'bg-primary-100', badgeVariant: 'info' },
  user_deactivated: { label: 'Compte désactivé', Icon: UserMinus, iconColorClass: 'text-warning-600', bgClass: 'bg-warning-100', badgeVariant: 'warning' },

  // À la une & publication
  featured_home_expiring: { label: '« À la une » bientôt vide', Icon: Star, iconColorClass: 'text-warning-600', bgClass: 'bg-warning-100', badgeVariant: 'warning' },
  featured_home_empty: { label: '« À la une » vide', Icon: AlertTriangle, iconColorClass: 'text-error-600', bgClass: 'bg-error-100', badgeVariant: 'error' },

  // Enterprise
  enterprise_user_created: { label: 'Collaborateur ajouté', Icon: Building2, iconColorClass: 'text-primary-600', bgClass: 'bg-primary-100', badgeVariant: 'info' },
  session_forced_logout: { label: 'Déconnexion forcée', Icon: LogOut, iconColorClass: 'text-warning-600', bgClass: 'bg-warning-100', badgeVariant: 'warning' },

  // Messages & devis
  contact_message_received: { label: 'Nouveau message', Icon: MessageSquare, iconColorClass: 'text-primary-600', bgClass: 'bg-primary-100', badgeVariant: 'info' },
  quote_received: { label: 'Demande de devis', Icon: FileSpreadsheet, iconColorClass: 'text-primary-600', bgClass: 'bg-primary-100', badgeVariant: 'info' },

  // Système
  alert: { label: 'Alerte', Icon: AlertTriangle, iconColorClass: 'text-warning-600', bgClass: 'bg-warning-100', badgeVariant: 'warning' },
  system: { label: 'Système', Icon: Bell, iconColorClass: 'text-gray-600', bgClass: 'bg-gray-100', badgeVariant: 'default' },
};

const FALLBACK: VisualConfig = {
  label: 'Notification',
  Icon: Bell,
  iconColorClass: 'text-gray-600',
  bgClass: 'bg-gray-100',
  badgeVariant: 'default',
};

export function getNotificationVisual(type: string | undefined | null): NotificationVisual {
  const config = (type && NOTIFICATION_VISUALS[type]) || FALLBACK;
  return {
    label: config.label,
    Icon: config.Icon,
    iconColorClass: config.iconColorClass,
    bgClass: config.bgClass,
    circleClass: `${config.bgClass} ${config.iconColorClass}`,
    badgeVariant: config.badgeVariant,
  };
}

/** Libellé lisible d'un type (fallback = type brut si inconnu). */
export function getNotificationLabel(type: string): string {
  return NOTIFICATION_VISUALS[type]?.label ?? type;
}

/** Liste des types connus (pour les filtres admin). */
export function getNotificationTypeOptions(): { value: string; label: string }[] {
  return Object.entries(NOTIFICATION_VISUALS).map(([value, cfg]) => ({
    value,
    label: cfg.label,
  }));
}
