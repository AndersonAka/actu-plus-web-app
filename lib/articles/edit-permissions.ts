import { ArticleStatus } from '@/types';

export type ArticleEditorRole = 'admin' | 'manager' | 'moderateur' | 'veilleur';

function isPrivilegedRole(role: ArticleEditorRole): boolean {
  return role === 'admin' || role === 'manager' || role === 'moderateur';
}

/** Contenu éditable (titre, texte, sources…) */
export function canEditArticleContent(
  status: ArticleStatus,
  role: ArticleEditorRole,
): boolean {
  if (status === ArticleStatus.DRAFT) {
    return true;
  }

  if (status === ArticleStatus.REJECTED) {
    return role === 'veilleur' || isPrivilegedRole(role);
  }

  if (status === ArticleStatus.PENDING) {
    return isPrivilegedRole(role);
  }

  /** Validé ou dépublié (isPublished=false) : modération / republication */
  if (status === ArticleStatus.APPROVED) {
    return isPrivilegedRole(role);
  }

  /** Encore publié : modifier le contenu après dépublication */
  if (status === ArticleStatus.PUBLISHED) {
    return false;
  }

  return false;
}

/** Page d’édition modérateur (/moderateur/articles/[id]/edit) */
export function canModeratorUseEditPage(status: ArticleStatus): boolean {
  return status === ArticleStatus.PENDING || status === ArticleStatus.APPROVED;
}
