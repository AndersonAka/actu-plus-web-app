'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/atoms';
import { useAuth } from '@/lib/hooks/useAuth';
import { unwrapApiData } from '@/lib/api/unwrap';
import { UserRole } from '@/types';

interface CommentUser {
  id: string;
  firstName: string;
  lastName: string;
}

interface CommentItem {
  id: string;
  articleId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: CommentUser;
}

interface RatingSummary {
  average: number;
  count: number;
  myScore?: number | null;
}

interface ArticleEngagementProps {
  articleId: string;
}

export function ArticleEngagement({ articleId }: ArticleEngagementProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const [summary, setSummary] = useState<RatingSummary>({ average: 0, count: 0 });
  const [hoverScore, setHoverScore] = useState<number | null>(null);
  const [ratingBusy, setRatingBusy] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const returnUrl = pathname || `/articles/${articleId}`;

  const loadSummary = useCallback(async () => {
    try {
      const res = await fetch(`/api/proxy/articles/${articleId}/ratings/summary`);
      if (!res.ok) return;
      const json = await res.json();
      const data = unwrapApiData<RatingSummary>(json);
      setSummary({
        average: data.average ?? 0,
        count: data.count ?? 0,
        myScore: data.myScore ?? null,
      });
    } catch {
      // silencieux
    }
  }, [articleId]);

  const loadComments = useCallback(
    async (pageToLoad = 1, append = false) => {
      setCommentsLoading(true);
      try {
        const res = await fetch(
          `/api/proxy/articles/${articleId}/comments?page=${pageToLoad}&limit=10`
        );
        if (!res.ok) return;
        const json = await res.json();
        const data = unwrapApiData<{
          data: CommentItem[];
          totalPages: number;
          page: number;
        }>(json);

        const list = data.data || [];
        setComments((prev) => (append ? [...prev, ...list] : list));
        setPage(data.page || pageToLoad);
        setTotalPages(data.totalPages || 1);
      } catch {
        // silencieux
      } finally {
        setCommentsLoading(false);
      }
    },
    [articleId]
  );

  useEffect(() => {
    loadSummary();
    loadComments(1, false);
  }, [loadSummary, loadComments]);

  const submitRating = async (score: number) => {
    if (!isAuthenticated || ratingBusy) return;
    setRatingBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/articles/${articleId}/ratings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || 'Impossible d\'enregistrer la note');
        return;
      }
      const data = unwrapApiData<RatingSummary>(json);
      setSummary({
        average: data.average ?? 0,
        count: data.count ?? 0,
        myScore: data.myScore ?? score,
      });
      setSuccess('Votre note a été enregistrée');
      setTimeout(() => setSuccess(null), 2500);
    } catch {
      setError('Impossible d\'enregistrer la note');
    } finally {
      setRatingBusy(false);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || posting) return;
    const trimmed = content.trim();
    if (trimmed.length < 2) {
      setError('Le commentaire doit contenir au moins 2 caractères');
      return;
    }
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || 'Impossible de publier le commentaire');
        return;
      }
      const created = unwrapApiData<CommentItem>(json);
      setComments((prev) => [created, ...prev]);
      setContent('');
      setSuccess('Commentaire publié');
      setTimeout(() => setSuccess(null), 2500);
    } catch {
      setError('Impossible de publier le commentaire');
    } finally {
      setPosting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    setError(null);
    try {
      const res = await fetch(
        `/api/proxy/articles/${articleId}/comments/${commentId}`,
        { method: 'DELETE' }
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || 'Suppression impossible');
        return;
      }
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      setError('Suppression impossible');
    }
  };

  const displayScore = hoverScore ?? summary.myScore ?? 0;
  const canModerate = isAdmin() || user?.role === UserRole.ADMIN;

  return (
    <section className="mt-8 space-y-8 border border-[var(--public-border)] bg-white p-6">
      <div>
        <h2 className="mb-2 text-xl font-extrabold text-[#201e1d]">Notation</h2>
        <p className="mb-4 text-sm text-[#605d5d]">
          {summary.count === 0
            ? 'Aucune note pour le moment'
            : `${summary.average.toFixed(1)} / 5 · ${summary.count} note${summary.count > 1 ? 's' : ''}`}
        </p>

        {!authLoading && !isAuthenticated ? (
          <p className="text-sm text-[#605d5d]">
            <Link
              href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
              className="font-semibold text-[#ec3013] hover:text-[#ae1800]"
            >
              Connectez-vous pour noter
            </Link>
          </p>
        ) : (
          <div
            className="flex items-center gap-1"
            onMouseLeave={() => setHoverScore(null)}
          >
            {[1, 2, 3, 4, 5].map((score) => {
              const active = score <= displayScore;
              return (
                <button
                  key={score}
                  type="button"
                  disabled={ratingBusy || authLoading}
                  aria-label={`Noter ${score} étoile${score > 1 ? 's' : ''}`}
                  onMouseEnter={() => setHoverScore(score)}
                  onClick={() => submitRating(score)}
                  className="rounded p-1 transition-colors disabled:opacity-50"
                >
                  <Star
                    className={`h-7 w-7 ${
                      active
                        ? 'fill-[#ec3013] text-[#ec3013]'
                        : 'text-[#d7d3d3]'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-[var(--public-border)] pt-8">
        <h2 className="mb-4 text-xl font-extrabold text-[#201e1d]">
          Commentaires
        </h2>

        {!authLoading && !isAuthenticated ? (
          <p className="mb-6 text-sm text-[#605d5d]">
            <Link
              href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
              className="font-semibold text-[#ec3013] hover:text-[#ae1800]"
            >
              Connectez-vous pour commenter
            </Link>
          </p>
        ) : (
          <form onSubmit={submitComment} className="mb-6 space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Écrire un commentaire…"
              className="w-full border border-[var(--public-border)] bg-white px-3 py-2 text-sm text-[#201e1d] outline-none focus:border-[#ec3013]"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[#9b9797]">
                {content.trim().length}/2000
              </span>
              <Button
                type="submit"
                variant="modernist"
                size="sm"
                disabled={posting || content.trim().length < 2}
              >
                {posting ? 'Envoi…' : 'Envoyer'}
              </Button>
            </div>
          </form>
        )}

        {error && (
          <p className="mb-4 text-sm text-[#ae1800]" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-4 text-sm text-[#201e1d]" role="status">
            {success}
          </p>
        )}

        {commentsLoading && comments.length === 0 ? (
          <p className="text-sm text-[#9b9797]">Chargement des commentaires…</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-[#9b9797]">Aucun commentaire pour le moment.</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => {
              const authorName = comment.user
                ? `${comment.user.firstName} ${comment.user.lastName}`.trim()
                : 'Utilisateur';
              const canDelete =
                isAuthenticated &&
                (comment.userId === user?.id || canModerate);
              const dateLabel = comment.createdAt
                ? format(new Date(comment.createdAt), 'dd MMM yyyy à HH:mm', {
                    locale: fr,
                  })
                : '';

              return (
                <li
                  key={comment.id}
                  className="border-b border-[var(--public-border)] pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="mb-1 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#201e1d]">
                        {authorName}
                      </p>
                      <p className="text-xs text-[#9b9797]">{dateLabel}</p>
                    </div>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => deleteComment(comment.id)}
                        className="inline-flex items-center gap-1 text-xs text-[#9b9797] hover:text-[#ae1800]"
                        aria-label="Supprimer le commentaire"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Supprimer
                      </button>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-[#605d5d]">
                    {comment.content}
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        {page < totalPages && (
          <div className="mt-4">
            <Button
              type="button"
              variant="modernist-outline"
              size="sm"
              disabled={commentsLoading}
              onClick={() => loadComments(page + 1, true)}
            >
              Voir plus
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
