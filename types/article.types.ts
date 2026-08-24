// Types pour les articles

// Sections d'articles pour les pages pays
export enum ArticleSection {
  ESSENTIEL = 'essentiel',
  TOUTE_ACTUALITE = 'toute-actualite',
  ARCHIVE = 'archive',
  FOCUS = 'focus',
  CHRONIQUE = 'chronique',
  VEILLE_SECTORIELLE = 'veille-sectorielle',
}

export type Zone = 'uemoa' | 'hors-uemoa';

export type Sector = 'banque-assurance' | 'energie' | 'agro-industrielle';

export interface SummaryItem {
  title: string;
  summary: string;
  link?: string;
}

// Statuts du workflow de publication
export enum ArticleStatus {
  DRAFT = 'draft',           // Brouillon (créé par Veilleur)
  PENDING = 'pending',       // En attente de validation (soumis par Veilleur)
  APPROVED = 'approved',     // Validé par Modérateur (prêt à publier)
  REJECTED = 'rejected',     // Rejeté par Modérateur (ne sera pas publié)
  PUBLISHED = 'published',   // Publié (visible publiquement)
  ARCHIVED = 'archived',     // Archivé
}

export interface ArticleSource {
  name: string;
  url: string;
}

export type ContentType = 'article' | 'alert' | 'summary' | 'press-review';

export type ArticleScope = 'national' | 'international';

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string | null;     // Absent pour un Résumé de l'actualité (voir summaryItems)
  excerpt?: string;
  coverImage?: string;
  imageUrl?: string;         // URL de l'image de couverture
  category: Category | null;  // Absente pour la Veille Sectorielle
  country: Country;
  author: ArticleAuthor;
  status: ArticleStatus;
  contentType?: ContentType; // Type de contenu (article, alert, summary, press-review)
  scope?: ArticleScope;      // Portée de l'article (national ou international)
  zone?: Zone;               // Zone géographique (Article International uniquement)
  sector?: Sector;           // Secteur (Veille Sectorielle uniquement)
  internationalCountryName?: string; // Pays international (Article International uniquement)
  internationalCountryFlag?: string;
  summaryItems?: SummaryItem[]; // Résumé multi-entrées (Titre/Résumé/Lien)
  isFeatured: boolean;
  isPremium: boolean;        // Article premium (abonnement requis) ou public
  isPublished?: boolean;
  views: number;
  sources?: ArticleSource[]; // Sources de l'article
  rejectionReason?: string;  // Raison du rejet (si rejeté)
  validatedBy?: string;      // ID du modérateur qui a validé/rejeté
  validatedAt?: string;      // Date de validation/rejet
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Nouveaux champs pour pages pays
  articleSection?: ArticleSection;
  isArchive?: boolean;
  isFeaturedHome?: boolean;        // Article dans "À la une" page d'accueil
  featuredHomeExpiresAt?: string;  // Date d'expiration (24h)
  scheduledPublishAt?: string;     // Date de publication programmée
  isScheduled?: boolean;           // En attente de publication
}

export interface ArticleAuthor {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  flag?: string;
  isActive?: boolean;
}

export interface ArticleFilters {
  category?: string;
  country?: string;
  search?: string;
  status?: ArticleStatus;
  isFeatured?: boolean;
  authorId?: string;
  page?: number;
  limit?: number;
}

// Actions de modération
export interface ArticleValidationPayload {
  articleId: string;
  action: 'approve' | 'reject';
  rejectionReason?: string;  // Obligatoire si action = 'reject'
}

export interface ArticlePublishPayload {
  articleId: string;
}

export interface ArticleListResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Réponse des résumés par pays
export interface CountrySummary {
  countryCode: string;
  countryName: string;
  summary: Article | null;
}

// Payload pour ajouter à la une
export interface SetFeaturedHomePayload {
  isFeaturedHome: boolean;
}

// Payload pour programmer la publication
export interface SchedulePublishPayload {
  scheduledPublishAt: string;
}
