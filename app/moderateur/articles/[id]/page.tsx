'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Alert, TextArea } from '@/components/atoms';
import { StatusBadge } from '@/components/molecules';
import { Article, ArticleStatus } from '@/types';
import { ArrowLeft, CheckCircle, XCircle, Send, Calendar, User, MapPin, Tag, Link as LinkIcon, Crown, Star, Archive, Clock, Layers, Save, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ModerateurArticleDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [articleId, setArticleId] = useState<string>('');
  const [isPremium, setIsPremium] = useState(false);
  const [isFeaturedHome, setIsFeaturedHome] = useState(false);
  const [isArchive, setIsArchive] = useState(false);
  const [isEssentiel, setIsEssentiel] = useState(false);
  const [articleSection, setArticleSection] = useState<string>('');
  const [scheduledPublishAt, setScheduledPublishAt] = useState<string>('');
  const [isScheduled, setIsScheduled] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { id } = await params;
      setArticleId(id);
      
      try {
        const response = await fetch(`/api/proxy/articles/${id}`);
        if (response.ok) {
          const data = await response.json();
          const articleData = data.data || data;
          setArticle(articleData);
          // Pour les articles de type "Résumé", forcer isPremium et désactiver les sections
          const isSummaryType = articleData.contentType === 'summary';
          setIsPremium(isSummaryType ? true : (articleData.isPremium || false));
          setIsFeaturedHome(isSummaryType ? false : (articleData.isFeaturedHome || false));
          setIsArchive(articleData.isArchive || false);
          setIsEssentiel(isSummaryType ? false : (articleData.articleSection === 'essentiel'));
          setArticleSection(isSummaryType ? '' : (articleData.articleSection === 'essentiel' ? '' : (articleData.articleSection || '')));
        }
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [params]);

  const handleApprove = async () => {
    setActionLoading('approve');
    setError(null);
    try {
      const response = await fetch(`/api/proxy/articles/${articleId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la validation');
      }

      setSuccess('Article validé avec succès');
      setArticle(prev => prev ? { ...prev, status: ArticleStatus.APPROVED } : null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Veuillez indiquer la raison du rejet');
      return;
    }

    setActionLoading('reject');
    setError(null);
    try {
      const response = await fetch(`/api/proxy/articles/${articleId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', rejectionReason }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors du rejet');
      }

      setSuccess('Article rejeté');
      setArticle(prev => prev ? { ...prev, status: ArticleStatus.REJECTED, rejectionReason } : null);
      setShowRejectModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdatePublishedOptions = async () => {
    setActionLoading('update-options');
    setError(null);
    try {
      const response = await fetch(`/api/proxy/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPremium,
          isFeaturedHome,
          isArchive,
          articleSection: isEssentiel ? 'essentiel' : (articleSection || undefined),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la mise à jour');
      }

      setSuccess('Options mises à jour avec succès');
      // Mettre à jour l'article local
      setArticle(prev => prev ? {
        ...prev,
        isPremium,
        isFeaturedHome,
        isArchive,
        articleSection: articleSection as any,
      } : null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublish = async () => {
    // Pour les résumés, pas de section requise (ils sont filtrés par contentType)
    const finalSection = isSummary ? (articleSection || undefined) : (isEssentiel ? 'essentiel' : articleSection);
    if (!isSummary && !finalSection) {
      setError('Veuillez sélectionner une section de destination avant de publier.');
      return;
    }

    setActionLoading('publish');
    setError(null);
    try {
      // Étape 1 : Mettre à jour les options de l'article (section, premium, etc.) via PATCH
      // Cela garantit que articleSection est persisté même si le backend /publish ne le gère pas
      const patchResponse = await fetch(`/api/proxy/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPremium,
          isFeaturedHome,
          isArchive,
          articleSection: finalSection,
        }),
      });

      if (!patchResponse.ok) {
        const patchData = await patchResponse.json();
        console.error('[Publish] PATCH failed:', patchData);
        throw new Error(patchData.message || 'Erreur lors de la mise à jour des options');
      }

      console.log('[Publish] Options updated via PATCH:', { articleSection, isPremium, isFeaturedHome, isArchive });

      // Étape 2 : Publier l'article
      const response = await fetch(`/api/proxy/articles/${articleId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isPremium,
          isFeaturedHome,
          isArchive,
          articleSection: finalSection,
          scheduledPublishAt: isScheduled && scheduledPublishAt ? new Date(scheduledPublishAt).toISOString() : undefined,
          isScheduled,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la publication');
      }

      const sectionLabel = isSummary ? 'Résumé de l\'actualité'
        : finalSection === 'focus' ? 'Focus' 
        : finalSection === 'chronique' ? 'Chronique'
        : finalSection === 'essentiel' ? "L'Essentiel"
        : "Toute l'actualité";

      setSuccess(`Article publié avec succès dans la section "${sectionLabel}" (${isPremium ? 'Contenu Abonné' : 'Public'})`);
      setArticle(prev => prev ? { ...prev, status: ArticleStatus.PUBLISHED, isPremium, articleSection: finalSection as any } : null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublish = async () => {
    setActionLoading('unpublish');
    setError(null);
    try {
      const response = await fetch(`/api/proxy/articles/${articleId}/unpublish`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la dépublication');
      }

      setSuccess('Article dépublié avec succès');
      setArticle(prev => prev ? { ...prev, status: ArticleStatus.APPROVED, isPublished: false } : null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Article non trouvé</p>
        <Link href="/moderateur/pending">
          <Button variant="primary" className="mt-4">Retour</Button>
        </Link>
      </div>
    );
  }

  const canApprove = article.status === ArticleStatus.PENDING;
  const canPublish = article.status === ArticleStatus.APPROVED;
  const isPublished = article.status === ArticleStatus.PUBLISHED;
  const isSummary = article.contentType === 'summary';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Titre de la page */}
      <div className="mb-6">
        <Link
          href="/moderateur/pending"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux articles en attente
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Examen de l'article</h1>
        <p className="mt-1 text-gray-600">Vérifiez le contenu</p>
      </div>

      {error && <Alert variant="error" className="mb-6" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>{success}</Alert>}

      {/* Image de couverture */}
      {(article.imageUrl || article.coverImage) && (
        <div className="relative mb-6 h-64 md:h-80 w-full overflow-hidden rounded-lg">
          <Image
            src={article.imageUrl || article.coverImage || ''}
            alt={article.title}
            fill
            className="object-cover"
            unoptimized={true}
          />
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Informations</CardTitle>
            <StatusBadge status={article.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Auteur</p>
              <p className="font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                {article.author?.firstName} {article.author?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Catégorie</p>
              <p className="font-medium flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                {article.category?.name}
              </p>
            </div>
            {article.country && (
              <div>
                <p className="text-sm text-gray-500">Pays</p>
                <p className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {article.country.name}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Date de création</p>
              <p className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                {format(new Date(article.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Contenu de l'article</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">{article.title}</h2>
          {article.excerpt && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-primary-500">
              <p className="text-gray-700 italic">{article.excerpt}</p>
            </div>
          )}
          <div 
            className="article-content prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }} 
          />
        </CardContent>
      </Card>

      {/* Sources */}
      {article.sources && Array.isArray(article.sources) && article.sources.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {article.sources.map((source: any, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-gray-400" />
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
          </CardContent>
        </Card>
      )}

      {/* Options de modération - visible pour tous les statuts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary-500" />
            {isPublished ? 'Modifier les options' : 'Options de publication'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info pour les articles Résumé */}
          {isSummary && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm text-blue-800">
                <strong>Article de type « Résumé de l'actualité »</strong> — Cet article sera automatiquement publié en tant que <strong>Contenu Abonné</strong> et sera visible dans la section « Résumé de l'actualité » de la page pays. Les options de section et de mise à la une ne sont pas disponibles pour ce type d'article.
              </p>
            </div>
          )}

          {/* Section de l'article — masquée pour les résumés */}
          {!isSummary && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section de destination
              </label>
              <select
                value={articleSection}
                onChange={(e) => setArticleSection(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Sélectionner une section</option>
                <option value="toute-actualite">Toute l'actualité</option>
                <option value="focus">Focus (Premium)</option>
                <option value="chronique">Chronique (Premium)</option>
              </select>
            </div>
          )}

          {/* Options checkboxes */}
          <div className="space-y-3">
            {!isSummary && (
              <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={isEssentiel}
                  onChange={(e) => setIsEssentiel(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
                />
                <Layers className="h-5 w-5 text-green-500" />
                <div>
                  <span className="font-medium text-gray-900">L'Essentiel de l'actualité</span>
                  <p className="text-sm text-gray-500">Afficher dans la section "L'Essentiel"</p>
                </div>
              </label>
            )}

            <label className={`flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 ${isSummary ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'} transition-colors`}>
              <input
                type="checkbox"
                checked={isPremium}
                onChange={(e) => !isSummary && setIsPremium(e.target.checked)}
                disabled={isSummary}
                className="h-5 w-5 rounded border-gray-300 text-warning-500 focus:ring-warning-500"
              />
              <Crown className="h-5 w-5 text-warning-500" />
              <div>
                <span className="font-medium text-gray-900">Contenu Abonné</span>
                <p className="text-sm text-gray-500">{isSummary ? 'Automatique pour les résumés' : 'Réservé aux abonnés payants'}</p>
              </div>
            </label>

            {!isSummary && (
              <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={isFeaturedHome}
                  onChange={(e) => setIsFeaturedHome(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <Star className="h-5 w-5 text-primary-500" />
                <div>
                  <span className="font-medium text-gray-900">À la une</span>
                  <p className="text-sm text-gray-500">Afficher dans le carrousel d'accueil (24h)</p>
                </div>
              </label>
            )}

            <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={isArchive}
                onChange={(e) => setIsArchive(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-gray-500 focus:ring-gray-500"
              />
              <Archive className="h-5 w-5 text-gray-500" />
              <div>
                <span className="font-medium text-gray-900">Archive</span>
                <p className="text-sm text-gray-500">Déplacer dans la section Archives</p>
              </div>
            </label>
          </div>

          {/* Publication programmée - seulement pour les articles non publiés */}
          {!isPublished && (
            <div className="border-t border-gray-200 pt-4">
              <label className="flex items-center gap-3 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <Clock className="h-5 w-5 text-primary-500" />
                <span className="font-medium text-gray-900">Programmer la publication</span>
              </label>
              {isScheduled && (
                <div className="ml-8">
                  <input
                    type="datetime-local"
                    value={scheduledPublishAt}
                    onChange={(e) => setScheduledPublishAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    L'article sera publié automatiquement à cette date.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bouton de sauvegarde pour les articles déjà publiés */}
          {isPublished && (
            <div className="border-t border-gray-200 pt-4">
              <Button
                variant="primary"
                onClick={handleUpdatePublishedOptions}
                isLoading={actionLoading === 'update-options'}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Enregistrer les modifications
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {canApprove && (
              <>
                <Button variant="success" onClick={handleApprove} isLoading={actionLoading === 'approve'} leftIcon={<CheckCircle className="h-4 w-4" />}>
                  Valider {isPremium ? '(Contenu Abonné)' : ''}
                </Button>
                <Button variant="danger" onClick={() => setShowRejectModal(true)} leftIcon={<XCircle className="h-4 w-4" />}>
                  Rejeter
                </Button>
              </>
            )}
            {canPublish && (
              <Button variant="primary" onClick={handlePublish} isLoading={actionLoading === 'publish'} leftIcon={<Send className="h-4 w-4" />}>
                Publier {isPremium ? '(Contenu Abonné)' : '(Public)'}
              </Button>
            )}
            {article.status === ArticleStatus.REJECTED && (
              <div className="w-full rounded-lg bg-error-50 p-4">
                <p className="font-medium text-error-700">Article rejeté</p>
                <p className="text-sm text-error-600">Raison : {article.rejectionReason || 'Non spécifiée'}</p>
              </div>
            )}
            {article.status === ArticleStatus.PUBLISHED && (
              <div className="w-full space-y-3">
                <div className="rounded-lg bg-success-50 p-4">
                  <p className="font-medium text-success-700">Article publié</p>
                  <Link href={`/articles/${article.id}`} className="text-sm text-success-600 hover:underline">
                    Voir l'article →
                  </Link>
                </div>
                <Button
                  variant="danger"
                  onClick={handleUnpublish}
                  isLoading={actionLoading === 'unpublish'}
                  leftIcon={<EyeOff className="h-4 w-4" />}
                >
                  Dépublier l'article
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Rejeter l'article</h3>
            <TextArea
              label="Raison du rejet"
              placeholder="Expliquez pourquoi..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowRejectModal(false)}>Annuler</Button>
              <Button variant="danger" onClick={handleReject} isLoading={actionLoading === 'reject'}>
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
