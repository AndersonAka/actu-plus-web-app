'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/atoms';
import { StatusBadge } from '@/components/molecules';
import { Article, ArticleStatus } from '@/types';
import { ArrowLeft, Calendar, MapPin, Tag, User, Edit } from 'lucide-react';

const getArticleStatus = (article: any): ArticleStatus => {
  if (article.status) return article.status;
  if (article.isPublished) return ArticleStatus.PUBLISHED;
  return ArticleStatus.DRAFT;
};

export interface ArticleViewProps {
  articleId: string;
  backUrl: string;
  backLabel: string;
  editUrl?: string;
  showEditButton?: boolean;
  userRole?: 'admin' | 'manager' | 'veilleur';
}

export function ArticleView({ 
  articleId, 
  backUrl, 
  backLabel, 
  editUrl,
  showEditButton = true,
  userRole = 'veilleur'
}: ArticleViewProps) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/proxy/articles/${articleId}`);
        if (!response.ok) {
          throw new Error('Article non trouvé');
        }
        const result = await response.json();
        const articleData = result.data || result;
        setArticle(articleData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setIsLoading(false);
      }
    };

    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600 mb-4">{error || 'Article non trouvé'}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Retour
        </Button>
      </div>
    );
  }

  const status = getArticleStatus(article);
  
  // Déterminer si l'utilisateur peut modifier l'article
  // Un article validé, rejeté ou publié ne peut plus être modifié
  const canEdit = (() => {
    // Seuls les brouillons et articles en attente peuvent être modifiés
    if (status === ArticleStatus.APPROVED || status === ArticleStatus.REJECTED || status === ArticleStatus.PUBLISHED) {
      return false;
    }
    // Pour les brouillons : tout le monde peut modifier
    if (status === ArticleStatus.DRAFT) {
      return true;
    }
    // Pour les articles en attente : seuls admin et manager peuvent modifier
    if (status === ArticleStatus.PENDING) {
      return userRole === 'admin' || userRole === 'manager';
    }
    return false;
  })();

  const finalEditUrl = editUrl || `${backUrl}/${articleId}/edit`;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link href={backUrl} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          {showEditButton && canEdit && (
            <Link href={finalEditUrl}>
              <Button variant="primary" size="sm" leftIcon={<Edit className="h-4 w-4" />}>
                Modifier
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Image de couverture */}
      {article.imageUrl && (
        <div className="relative mb-6 h-64 md:h-80 w-full overflow-hidden rounded-lg">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      {/* Contenu principal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{article.title}</CardTitle>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(article.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}</span>
            </div>
            {article.category && (
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                <span>{article.category.name}</span>
              </div>
            )}
            {article.country && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{article.country.name}</span>
              </div>
            )}
            {article.author && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{article.author.firstName} {article.author.lastName}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Extrait */}
          {article.excerpt && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-primary-500">
              <p className="text-gray-700 italic">{article.excerpt}</p>
            </div>
          )}

          {/* Contenu */}
          <div 
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Sources */}
          {article.sources && Array.isArray(article.sources) && article.sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-3">Sources</h3>
              <ul className="space-y-2">
                {article.sources.map((source, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="font-medium">{source.name}:</span>
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      {source.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Messages contextuels selon le statut */}
          {status === ArticleStatus.PENDING && (
            <div className="mt-8 p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <p className="text-warning-800">
                <strong>En attente de validation</strong> - Cet article est en cours de révision par un modérateur.
                {userRole === 'veilleur' && ' Vous ne pouvez plus le modifier.'}
              </p>
            </div>
          )}

          {status === ArticleStatus.REJECTED && (
            <div className="mt-8 p-4 bg-error-50 border border-error-200 rounded-lg">
              <p className="text-error-800">
                <strong>Article rejeté</strong> - Cet article a été rejeté par un modérateur.
                {userRole === 'veilleur' && ' Vous ne pouvez plus le modifier.'}
              </p>
              {article.rejectionReason && (
                <p className="mt-2 text-error-700">
                  <strong>Raison:</strong> {article.rejectionReason}
                </p>
              )}
            </div>
          )}

          {status === ArticleStatus.APPROVED && (
            <div className="mt-8 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-primary-800">
                <strong>Article validé</strong> - Cet article a été approuvé et est prêt à être publié.
              </p>
            </div>
          )}

          {status === ArticleStatus.PUBLISHED && (
            <div className="mt-8 p-4 bg-success-50 border border-success-200 rounded-lg">
              <p className="text-success-800">
                <strong>Article publié</strong> - Cet article est visible publiquement.
                {article.publishedAt && (
                  <span className="ml-1">
                    Publié le {new Date(article.publishedAt).toLocaleDateString('fr-FR')}.
                  </span>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ArticleView;
