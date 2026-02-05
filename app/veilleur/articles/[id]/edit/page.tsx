'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, TextArea, Select, Card, CardHeader, CardTitle, CardContent, Alert } from '@/components/atoms';
import { RichTextEditor, ImageUpload } from '@/components/molecules';
import { Category, Country } from '@/types';
import { ArrowLeft, Save, Send, Plus, Trash2, Link as LinkIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';

const sourceSchema = z.object({
  name: z.string().min(1, 'Le nom de la source est requis'),
  url: z.string().url('URL invalide').or(z.literal('')),
});

const articleSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  excerpt: z.string().optional(),
  content: z.string().min(50, 'Le contenu doit contenir au moins 50 caractères'),
  categoryId: z.string().min(1, 'Veuillez sélectionner une catégorie'),
  countryId: z.string().optional(),
  coverImage: z.string().optional().or(z.literal('')),
  sources: z.array(sourceSchema).optional(),
});

interface Source {
  name: string;
  url: string;
}

type ArticleFormData = z.infer<typeof articleSchema>;

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingArticle, setIsLoadingArticle] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [articleData, setArticleData] = useState<any>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<ArticleFormData | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      categoryId: '',
      countryId: '',
      coverImage: '',
      sources: [],
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, countryRes] = await Promise.all([
          fetch('/api/proxy/categories'),
          fetch('/api/proxy/countries'),
        ]);

        if (catRes.ok) {
          const catsResponse = await catRes.json();
          const cats = catsResponse.data || catsResponse;
          setCategories(Array.isArray(cats) ? cats : []);
        }
        if (countryRes.ok) {
          const ctrsResponse = await countryRes.json();
          const ctrs = ctrsResponse.data || ctrsResponse;
          setCountries(Array.isArray(ctrs) ? ctrs : []);
        }
        setIsDataLoaded(true);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoadingArticle(true);
      try {
        const response = await fetch(`/api/proxy/articles/${id}`);
        if (response.ok) {
          const result = await response.json();
          const article = result.data || result;
          
          console.log('Article loaded:', article);
          console.log('Sources:', article.sources);
          
          // Vérifier si l'article est modifiable (seulement brouillon ou rejeté)
          const status = article.status || 'draft';
          if (status !== 'draft' && status !== 'rejected') {
            setError('Cet article ne peut plus être modifié car il est en attente de validation ou déjà publié.');
            router.push('/veilleur/articles');
            return;
          }
          
          setArticleData(article);
        } else {
          setError('Article non trouvé');
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        setError('Erreur lors du chargement de l\'article');
      } finally {
        setIsLoadingArticle(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id, router]);

  // Initialiser le formulaire une fois que les données et les catégories/pays sont chargés
  useEffect(() => {
    if (articleData && isDataLoaded) {
      reset({
        title: articleData.title || '',
        excerpt: articleData.excerpt || '',
        content: articleData.content || '',
        categoryId: articleData.categoryId || '',
        countryId: articleData.countryId || '',
        coverImage: articleData.imageUrl || '',
      });
      
      if (articleData.sources) {
        let sourcesData = articleData.sources;
        if (typeof sourcesData === 'string') {
          try {
            sourcesData = JSON.parse(sourcesData);
          } catch (e) {
            sourcesData = [];
          }
        }
        setSources(Array.isArray(sourcesData) ? sourcesData : []);
      }
    }
  }, [articleData, isDataLoaded, reset]);

  const onSubmit = async (data: ArticleFormData, submitForReview: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const { coverImage, ...formData } = data;
      
      const payload = {
        title: formData.title,
        excerpt: formData.excerpt || undefined,
        content: formData.content,
        categoryId: formData.categoryId,
        countryId: formData.countryId || undefined,
        imageUrl: coverImage || undefined,
        sources: sources.filter(s => s && s.name && s.name.trim() !== ''),
      };
      
      console.log('Submitting article update:', payload);
      console.log('Form data received:', data);
      
      const response = await fetch(`/api/proxy/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de la modification");
      }

      if (submitForReview) {
        const submitResponse = await fetch(`/api/proxy/articles/${id}/submit`, { method: 'POST' });
        const submitResult = await submitResponse.json();
        console.log('Submit response:', submitResult);
        
        if (!submitResponse.ok) {
          throw new Error(submitResult.message || "Erreur lors de la soumission pour validation");
        }
      }

      router.push('/veilleur/articles');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = handleSubmit((data) => onSubmit(data, false));
  
  const handleSubmitForReview = handleSubmit((data) => {
    setPendingFormData(data);
    setShowSubmitModal(true);
  });

  const confirmSubmitForReview = async () => {
    if (pendingFormData) {
      setShowSubmitModal(false);
      await onSubmit(pendingFormData, true);
      setPendingFormData(null);
    }
  };

  const cancelSubmitForReview = () => {
    setShowSubmitModal(false);
    setPendingFormData(null);
  };

  const addSource = () => {
    setSources([...sources, { name: '', url: '' }]);
  };

  const removeSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
  };

  const updateSource = (index: number, field: 'name' | 'url', value: string) => {
    const newSources = [...sources];
    newSources[index][field] = value;
    setSources(newSources);
  };

  if (isLoadingArticle) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/veilleur/articles"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux articles
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Modifier l'article</h1>
        <p className="mt-1 text-gray-600">Modifiez les informations de votre article</p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Titre"
              placeholder="Titre de l'article"
              error={errors.title?.message}
              {...register('title')}
            />

            <TextArea
              label="Résumé (optionnel)"
              placeholder="Bref résumé..."
              rows={3}
              error={errors.excerpt?.message}
              {...register('excerpt')}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Catégorie"
                    options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
                    placeholder="Sélectionner"
                    error={errors.categoryId?.message}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                )}
              />

              <Controller
                name="countryId"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Pays (optionnel)"
                    options={[
                      { value: '', label: 'Aucun' },
                      ...countries.map((c) => ({ value: c.id, label: c.name })),
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Image de couverture</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              name="coverImage"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.coverImage?.message}
                />
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contenu</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                  label="Contenu de l'article"
                  placeholder="Rédigez votre article..."
                  error={errors.content?.message}
                  minHeight="400px"
                />
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sources</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSource}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Ajouter une source
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {sources.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <LinkIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>Aucune source ajoutée</p>
                <p className="text-sm">Cliquez sur "Ajouter une source" pour référencer vos sources</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sources.map((source, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid gap-3 sm:grid-cols-2">
                      <Input
                        placeholder="Nom de la source (ex: Reuters)"
                        value={source.name}
                        onChange={(e) => updateSource(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="URL (ex: https://...)"
                        value={source.url}
                        onChange={(e) => updateSource(index, 'url', e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSource(index)}
                      className="text-error-500 hover:text-error-700 hover:bg-error-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            isLoading={isSaving}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Enregistrer
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmitForReview}
            isLoading={isLoading}
            leftIcon={<Send className="h-4 w-4" />}
          >
            Soumettre pour validation
          </Button>
        </div>
      </form>

      {/* Modal de confirmation pour soumission */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Soumettre pour validation ?
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir soumettre cet article pour validation ? 
              Une fois soumis, l'article ne sera plus modifiable jusqu'à ce qu'un modérateur le valide ou le rejette.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={cancelSubmitForReview}
              >
                Annuler
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={confirmSubmitForReview}
                isLoading={isLoading}
              >
                Confirmer la soumission
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
