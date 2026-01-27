'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Alert, TextArea } from '@/components/atoms';
import { StatusBadge } from '@/components/molecules';
import { Article, ArticleStatus } from '@/types';
import { ArrowLeft, CheckCircle, XCircle, Send, Calendar, User, MapPin, Tag, Link as LinkIcon, Crown } from 'lucide-react';
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
          setIsPremium(articleData.isPremium || false);
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

  const handlePublish = async () => {
    setActionLoading('publish');
    setError(null);
    try {
      const response = await fetch(`/api/proxy/articles/${articleId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPremium }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la publication');
      }

      setSuccess(`Article publié avec succès (${isPremium ? 'Premium' : 'Public'})`);
      setArticle(prev => prev ? { ...prev, status: ArticleStatus.PUBLISHED, isPremium } : null);
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
            unoptimized
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
            className="prose prose-gray prose-headings:font-bold prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:list-disc prose-ol:list-decimal max-w-none"
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

      {/* Option Premium - visible pour tous les statuts sauf publié */}
      {article.status !== ArticleStatus.PUBLISHED && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-warning-500" />
              Type d'article
            </CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-warning-500 focus:ring-warning-500"
              />
              <div>
                <span className="font-medium text-gray-900">Article Premium</span>
                <p className="text-sm text-gray-500">
                  {isPremium ? 'Réservé aux abonnés payants' : 'Accessible à tous les utilisateurs'}
                </p>
              </div>
            </label>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {canApprove && (
              <>
                <Button variant="success" onClick={handleApprove} isLoading={actionLoading === 'approve'} leftIcon={<CheckCircle className="h-4 w-4" />}>
                  Valider {isPremium ? '(Premium)' : ''}
                </Button>
                <Button variant="danger" onClick={() => setShowRejectModal(true)} leftIcon={<XCircle className="h-4 w-4" />}>
                  Rejeter
                </Button>
              </>
            )}
            {canPublish && (
              <Button variant="primary" onClick={handlePublish} isLoading={actionLoading === 'publish'} leftIcon={<Send className="h-4 w-4" />}>
                Publier {isPremium ? '(Premium)' : '(Public)'}
              </Button>
            )}
            {article.status === ArticleStatus.REJECTED && (
              <div className="w-full rounded-lg bg-error-50 p-4">
                <p className="font-medium text-error-700">Article rejeté</p>
                <p className="text-sm text-error-600">Raison : {article.rejectionReason || 'Non spécifiée'}</p>
              </div>
            )}
            {article.status === ArticleStatus.PUBLISHED && (
              <div className="w-full rounded-lg bg-success-50 p-4">
                <p className="font-medium text-success-700">Article publié</p>
                <Link href={`/articles/${article.id}`} className="text-sm text-success-600 hover:underline">
                  Voir l'article →
                </Link>
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
