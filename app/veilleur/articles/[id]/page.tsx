'use client';

import { useParams } from 'next/navigation';
import { ArticleView } from '@/components/organisms';

export default function VeilleurArticleViewPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <ArticleView
      articleId={id}
      backUrl="/veilleur/articles"
      backLabel="Retour à mes articles"
      editUrl={`/veilleur/articles/${id}/edit`}
      userRole="veilleur"
    />
  );
}
