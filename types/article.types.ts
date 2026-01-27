// Types pour les articles

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

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  imageUrl?: string;         // URL de l'image de couverture
  category: Category;
  country: Country;
  author: ArticleAuthor;
  status: ArticleStatus;
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
