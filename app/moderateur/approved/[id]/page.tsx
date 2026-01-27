'use client';

import { useParams } from 'next/navigation';
import { ArticleView } from '@/components/organisms';

export default function ModerateurApprovedArticleViewPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <ArticleView
      articleId={id}
      backUrl="/moderateur/approved"
      backLabel="Retour aux articles validés"
      editUrl={`/moderateur/articles/${id}`}
      userRole="manager"
      showEditButton={false}
    />
  );
}
