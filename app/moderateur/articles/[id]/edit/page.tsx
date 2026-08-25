'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, TextArea, Select, Card, CardHeader, CardTitle, CardContent, Alert } from '@/components/atoms';
import { RichTextEditor, ImageUpload } from '@/components/molecules';
import { ArticleStatus, Category, Country } from '@/types';
import { canModeratorUseEditPage } from '@/lib/articles/edit-permissions';
import { ArrowLeft, Save, Plus, Trash2, Link as LinkIcon, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';

const sourceSchema = z.object({
  name: z.string().min(1, 'Le nom de la source est requis'),
  url: z.string().url('URL invalide').or(z.literal('')),
});

function buildArticleSchema(isContainer: boolean) {
  return z
    .object({
      title: z.string().optional().or(z.literal('')),
      excerpt: z.string().optional(),
      content: z.string().optional(),
      categoryId: z.string().optional().or(z.literal('')),
      countryId: z.string().optional(),
      scope: z.enum(['national', 'international'], { message: 'Veuillez indiquer la portée de l\'article' }),
      coverImage: z.string().optional().or(z.literal('')),
      sources: z.array(sourceSchema).optional(),
    })
    .superRefine((data, ctx) => {
      if (!isContainer) {
        if (!data.title || data.title.length < 5) {
          ctx.addIssue({ code: 'custom', path: ['title'], message: 'Le titre doit contenir au moins 5 caractères' });
        }
        if (!data.content || data.content.length < 50) {
          ctx.addIssue({ code: 'custom', path: ['content'], message: 'Le contenu doit contenir au moins 50 caractères' });
        }
      } else if (!data.countryId) {
        ctx.addIssue({ code: 'custom', path: ['countryId'], message: 'Veuillez sélectionner un pays' });
      }
    });
}

interface Source {
  name: string;
  url: string;
}

interface SummaryItem {
  title: string;
  summary: string;
  link: string;
  sector: string;
  categoryId: string;
}

type ArticleFormData = z.infer<ReturnType<typeof buildArticleSchema>>;

export default function ModerateurEditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingArticle, setIsLoadingArticle] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [summaryItems, setSummaryItems] = useState<SummaryItem[]>([]);
  const [articleData, setArticleData] = useState<any>(null);

  const isContainer = articleData?.contentType === 'summary';
  const isVeilleSectorielle = articleData?.articleSection === 'veille-sectorielle';

  const schema = useMemo(() => buildArticleSchema(isContainer), [isContainer]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      categoryId: '',
      countryId: '',
      scope: '' as any,
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

          const status = (article.status || ArticleStatus.DRAFT) as ArticleStatus;
          if (!canModeratorUseEditPage(status)) {
            setError(
              'Cet article ne peut pas être modifié ici. Les articles publiés doivent être dépubliés avant modification du contenu.',
            );
            router.push(`/moderateur/articles/${id}`);
            return;
          }

          setArticleData(article);
        } else {
          setError('Article non trouvé');
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        setError("Erreur lors du chargement de l'article");
      } finally {
        setIsLoadingArticle(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id, router]);

  useEffect(() => {
    if (articleData && isDataLoaded) {
      reset({
        title: articleData.title || '',
        excerpt: articleData.excerpt || '',
        content: articleData.content || '',
        categoryId: articleData.categoryId || '',
        countryId: articleData.countryId || '',
        scope: articleData.scope || ('' as any),
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

      if (Array.isArray(articleData.summaryItems)) {
        setSummaryItems(
          articleData.summaryItems.map((it: any) => ({
            title: it.title || '',
            summary: it.summary || '',
            link: it.link || '',
            sector: it.sector || '',
            categoryId: it.categoryId || '',
          })),
        );
      }
    }
  }, [articleData, isDataLoaded, reset]);

  const onSubmit = async (data: ArticleFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      let validItems: SummaryItem[] = [];
      if (isContainer) {
        validItems = summaryItems.filter((it) => it.title.trim() && it.summary.trim());
        if (validItems.length === 0) {
          throw new Error('Ajoutez au moins une entrée (titre + résumé)');
        }
        if (isVeilleSectorielle && validItems.some((it) => !it.sector)) {
          throw new Error('Sélectionnez un secteur pour chaque entrée');
        }
        if (!isVeilleSectorielle && validItems.some((it) => !it.categoryId)) {
          throw new Error('Sélectionnez une catégorie pour chaque entrée');
        }
      }

      const { coverImage, ...formData } = data;

      const payload: Record<string, unknown> = {
        title: isContainer ? undefined : formData.title,
        excerpt: isContainer ? undefined : (formData.excerpt || undefined),
        content: isContainer ? undefined : formData.content,
        categoryId: isContainer ? undefined : (formData.categoryId || undefined),
        countryId: formData.countryId || undefined,
        scope: formData.scope,
        imageUrl: isContainer ? undefined : (coverImage || undefined),
        sources: !isContainer ? sources.filter((s) => s && s.name && s.name.trim() !== '') : undefined,
      };

      if (isContainer) {
        payload.summaryItems = validItems.map((it) => {
          if (isVeilleSectorielle) {
            return { title: it.title, summary: it.summary, link: it.link || undefined, sector: it.sector || undefined };
          }
          const category = categories.find((c) => c.id === it.categoryId);
          return {
            title: it.title,
            summary: it.summary,
            link: it.link || undefined,
            categoryId: it.categoryId || undefined,
            categoryName: category?.name,
          };
        });
      }

      const response = await fetch(`/api/proxy/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de la modification');
      }

      setSuccess('Article modifié avec succès. Retour à la page d\'examen...');
      setTimeout(() => {
        router.push(`/moderateur/articles/${id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = handleSubmit((data) => onSubmit(data));

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

  const addSummaryItem = () => setSummaryItems([...summaryItems, { title: '', summary: '', link: '', sector: '', categoryId: '' }]);
  const removeSummaryItem = (index: number) => setSummaryItems(summaryItems.filter((_, i) => i !== index));
  const updateSummaryItem = (index: number, field: keyof SummaryItem, value: string) => {
    const newItems = [...summaryItems];
    newItems[index][field] = value;
    setSummaryItems(newItems);
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
          href={`/moderateur/articles/${id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'examen de l'article
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Modifier l'article</h1>
        <p className="mt-1 text-gray-600">Apportez vos corrections avant la validation</p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-6">
          {success}
        </Alert>
      )}

      <form className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isContainer && (
              <>
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
              </>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {!isContainer && (
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
              )}

              <Controller
                name="countryId"
                control={control}
                render={({ field }) => (
                  <Select
                    label={isContainer ? 'Pays *' : 'Pays (optionnel)'}
                    options={[
                      { value: '', label: isContainer ? 'Sélectionner un pays' : 'Aucun' },
                      ...countries.map((c) => ({ value: c.id, label: c.name })),
                    ]}
                    error={errors.countryId?.message}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                )}
              />
            </div>

            <Select
              label="Portée de l'article *"
              options={[
                { value: '', label: 'Sélectionner la portée' },
                { value: 'national', label: 'National' },
                { value: 'international', label: 'International' },
              ]}
              error={errors.scope?.message}
              {...register('scope')}
            />
          </CardContent>
        </Card>

        {!isContainer && (
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
        )}

        {!isContainer && (
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
        )}

        {isContainer && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{isVeilleSectorielle ? "Entrées d'article" : 'Entrées du résumé'}</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addSummaryItem} leftIcon={<Plus className="h-4 w-4" />}>
                  Ajouter une entrée
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {summaryItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Aucune entrée ajoutée</p>
                  <p className="text-sm">
                    Cliquez sur "Ajouter une entrée" pour composer {isVeilleSectorielle ? 'la veille' : 'le résumé'}
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {summaryItems.map((item, index) => (
                    <div key={index} className="rounded-lg border border-gray-200 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <Input
                          placeholder="Titre de l'entrée"
                          value={item.title}
                          onChange={(e) => updateSummaryItem(index, 'title', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSummaryItem(index)}
                          className="text-error-500 hover:text-error-700 hover:bg-error-50 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {isVeilleSectorielle ? (
                        <Select
                          label="Secteur"
                          options={[
                            { value: '', label: 'Sélectionner un secteur' },
                            { value: 'banque-assurance', label: 'Banque et assurance' },
                            { value: 'energie', label: 'Énergie' },
                            { value: 'agro-industrielle', label: 'Agro Industrielle' },
                          ]}
                          value={item.sector}
                          onChange={(e) => updateSummaryItem(index, 'sector', e.target.value)}
                        />
                      ) : (
                        <Select
                          label="Catégorie"
                          options={[
                            { value: '', label: 'Sélectionner une catégorie' },
                            ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
                          ]}
                          value={item.categoryId}
                          onChange={(e) => updateSummaryItem(index, 'categoryId', e.target.value)}
                        />
                      )}
                      <RichTextEditor
                        value={item.summary}
                        onChange={(value) => updateSummaryItem(index, 'summary', value)}
                        placeholder="Résumé de cette entrée..."
                        minHeight="150px"
                      />
                      <Input
                        placeholder="Lien (optionnel)"
                        value={item.link}
                        onChange={(e) => updateSummaryItem(index, 'link', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!isContainer && (
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
        )}

        <div className="flex items-center justify-between">
          <Link href={`/moderateur/articles/${id}`}>
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            isLoading={isLoading}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  );
}
