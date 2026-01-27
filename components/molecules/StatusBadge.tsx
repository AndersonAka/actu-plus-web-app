'use client';

import { Badge } from '@/components/atoms';
import { ArticleStatus } from '@/types';

export interface StatusBadgeProps {
  status: ArticleStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<
  ArticleStatus,
  { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'error' }
> = {
  [ArticleStatus.DRAFT]: { label: 'Brouillon', variant: 'default' },
  [ArticleStatus.PENDING]: { label: 'En attente', variant: 'warning' },
  [ArticleStatus.APPROVED]: { label: 'Validé', variant: 'primary' },
  [ArticleStatus.REJECTED]: { label: 'Rejeté', variant: 'error' },
  [ArticleStatus.PUBLISHED]: { label: 'Publié', variant: 'success' },
  [ArticleStatus.ARCHIVED]: { label: 'Archivé', variant: 'default' },
};

const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig[ArticleStatus.DRAFT];

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
};

export { StatusBadge };
