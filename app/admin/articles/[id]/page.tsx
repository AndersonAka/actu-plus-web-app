'use client';

import { useParams } from 'next/navigation';
import { ArticleView } from '@/components/organisms';

export default function AdminArticleViewPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <ArticleView
      articleId={id}
      backUrl="/admin/articles"
      backLabel="Retour aux articles"
      editUrl={`/admin/articles/${id}/edit`}
      userRole="admin"
    />
  );
}
