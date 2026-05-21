'use client';

import { useParams } from 'next/navigation';
import { ArticleView } from '@/components/organisms';

export default function ModerateurPublishedArticleViewPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <ArticleView
      articleId={id}
      backUrl="/moderateur/published"
      backLabel="Retour aux articles publiés"
      editUrl={`/moderateur/articles/${id}/edit`}
      userRole="moderateur"
      showEditButton={true}
      showUnpublishButton={true}
    />
  );
}
