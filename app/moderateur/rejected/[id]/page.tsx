'use client';

import { useParams } from 'next/navigation';
import { ArticleView } from '@/components/organisms';

export default function ModerateurRejectedArticleViewPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <ArticleView
      articleId={id}
      backUrl="/moderateur/rejected"
      backLabel="Retour aux articles rejetés"
      editUrl={`/moderateur/articles/${id}`}
      userRole="manager"
      showEditButton={false}
    />
  );
}
