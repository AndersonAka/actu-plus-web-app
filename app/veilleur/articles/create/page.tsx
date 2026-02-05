'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, TextArea, Select, Card, CardHeader, CardTitle, CardContent, Alert } from '@/components/atoms';
import { RichTextEditor, ImageUpload } from '@/components/molecules';
import { Category, Country } from '@/types';
import { ArrowLeft, Save, Send, Wand2, Plus, Trash2, Link as LinkIcon, FileText, Newspaper, Sparkles } from 'lucide-react';
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
  countryId: z.string().min(1, 'Veuillez sélectionner un pays'),
  contentType: z.enum(['article', 'summary']),
  articleSection: z.string().optional(),
  coverImage: z.string().optional().or(z.literal('')),
  sources: z.array(sourceSchema).optional(),
});

interface Source {
  name: string;
  url: string;
}

type ArticleFormData = z.infer<typeof articleSchema>;

export default function CreateArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [contentType, setContentType] = useState<'article' | 'summary'>('article');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      categoryId: '',
      countryId: '',
      contentType: 'article',
      articleSection: '',
      coverImage: '',
      sources: [],
    },
  });

  // Fonction pour extraire le texte du HTML et générer le résumé
  const generateExcerptFromContent = () => {
    const content = watch('content');
    if (!content) return;
    
    // Supprimer les balises HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Nettoyer et tronquer à 200 caractères
    const cleanText = textContent.replace(/\s+/g, ' ').trim();
    const excerpt = cleanText.length > 200 
      ? cleanText.substring(0, 200).trim() + '...' 
      : cleanText;
    
    setValue('excerpt', excerpt);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, countryRes] = await Promise.all([
          fetch('/api/proxy/categories'),
          fetch('/api/proxy/countries'),
        ]);

        if (catRes.ok) {
          const catsResponse = await catRes.json();
          // Le backend enveloppe la réponse dans { success, data, timestamp }
          const cats = catsResponse.data || catsResponse;
          setCategories(Array.isArray(cats) ? cats : []);
        }
        if (countryRes.ok) {
          const ctrsResponse = await countryRes.json();
          // Le backend enveloppe la réponse dans { success, data, timestamp }
          const ctrs = ctrsResponse.data || ctrsResponse;
          setCountries(Array.isArray(ctrs) ? ctrs : []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: ArticleFormData, submitForReview: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const { coverImage, ...articleData } = data;
      const response = await fetch('/api/proxy/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...articleData,
          contentType: contentType,
          articleSection: contentType === 'article' ? articleData.articleSection : undefined,
          imageUrl: contentType === 'article' ? (coverImage || undefined) : undefined,
          sources: sources.filter(s => s.name.trim() !== ''),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de la création");
      }

      // L'ID peut être dans result.data.id ou result.id selon la structure de réponse
      const articleId = result.data?.id || result.id;
      console.log('Article created with ID:', articleId, 'Full result:', result);

      if (submitForReview && articleId) {
        const submitResponse = await fetch(`/api/proxy/articles/${articleId}/submit`, { method: 'POST' });
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
  const handleSubmitForReview = handleSubmit((data) => onSubmit(data, true));

  const sampleTitles = [
    "Les nouvelles tendances économiques en Afrique de l'Ouest",
    "Innovation technologique : l'essor des startups africaines",
    "Sport : les performances exceptionnelles des athlètes africains",
    "Culture : le renouveau artistique dans les grandes métropoles",
    "Environnement : initiatives vertes et développement durable",
    "Éducation : les réformes qui transforment le continent",
    "Santé publique : avancées médicales et défis à relever",
    "Politique : analyse des élections récentes",
  ];

  const sampleExcerpts = [
    "Une analyse approfondie des dernières évolutions qui façonnent notre société et impactent le quotidien des citoyens.",
    "Découvrez les tendances émergentes et les acteurs clés qui redéfinissent les standards de l'industrie.",
    "Un regard expert sur les enjeux majeurs et les perspectives d'avenir pour la région.",
    "Retour sur les événements marquants et leurs implications pour les années à venir.",
  ];

  const sampleContents = [
    `<h2>Introduction</h2><p>Dans un contexte de transformation rapide, les acteurs du secteur redoublent d'efforts pour s'adapter aux nouvelles réalités du marché. Cette dynamique, portée par une volonté d'innovation et de modernisation, ouvre de nouvelles perspectives prometteuses.</p><h2>Contexte et enjeux</h2><p>Les défis sont nombreux mais les opportunités le sont tout autant. Les experts s'accordent à dire que cette période charnière représente un tournant majeur pour l'ensemble de la région. Les investissements croissants dans les infrastructures et la formation témoignent d'une ambition claire de positionnement sur la scène internationale.</p><h2>Perspectives</h2><p>À l'horizon 2025, les projections indiquent une croissance soutenue portée par plusieurs facteurs clés. L'engagement des parties prenantes et la mise en place de politiques favorables créent un environnement propice au développement. Les observateurs restent optimistes quant aux résultats attendus dans les prochains mois.</p><h2>Conclusion</h2><p>Cette évolution témoigne d'une maturité croissante et d'une capacité d'adaptation remarquable. Les fondations sont posées pour une trajectoire de croissance durable et inclusive.</p>`,
    `<h2>Analyse du phénomène</h2><p>Le phénomène observé ces derniers mois illustre parfaitement les mutations profondes qui traversent notre société. Les données récentes confirment une tendance de fond qui ne cesse de s'accélérer, portée par des facteurs structurels et conjoncturels.</p><h2>Les acteurs clés</h2><p>Plusieurs acteurs se distinguent par leur capacité à anticiper et à s'adapter. Leurs stratégies innovantes et leur vision à long terme leur permettent de se positionner favorablement dans un environnement de plus en plus compétitif.</p><h2>Impact et conséquences</h2><p>Les répercussions de ces évolutions sont multiples et touchent l'ensemble des secteurs d'activité. Les entreprises comme les institutions doivent repenser leurs modèles pour rester pertinentes et efficaces.</p><h2>Recommandations</h2><p>Face à ces défis, plusieurs pistes d'action se dessinent. La collaboration, l'innovation et l'investissement dans le capital humain apparaissent comme des leviers essentiels pour réussir cette transition.</p>`,
  ];

  const handleAutoFill = () => {
    const randomTitle = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
    const randomExcerpt = sampleExcerpts[Math.floor(Math.random() * sampleExcerpts.length)];
    const randomContent = sampleContents[Math.floor(Math.random() * sampleContents.length)];
    const randomCategory = categories.length > 0 ? categories[Math.floor(Math.random() * categories.length)].id : '';
    const randomCountry = countries.length > 0 ? countries[Math.floor(Math.random() * countries.length)].id : '';

    setValue('title', randomTitle);
    setValue('excerpt', randomExcerpt);
    setValue('content', randomContent);
    setValue('categoryId', randomCategory);
    setValue('countryId', randomCountry);
    setValue('contentType', 'article');
    setValue('articleSection', 'toute-actualite');
    setSources([
      { name: 'Reuters', url: 'https://www.reuters.com' },
      { name: 'AFP', url: 'https://www.afp.com' },
    ]);
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

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvel article</h1>
          <p className="mt-1 text-gray-600">Créez un nouvel article</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAutoFill}
          leftIcon={<Wand2 className="h-4 w-4" />}
        >
          Remplissage auto
        </Button>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form className="space-y-6">
        {/* Type de contenu */}
        <Card>
          <CardHeader>
            <CardTitle>Type de contenu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <label
                className={`flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                  contentType === 'article'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  value="article"
                  checked={contentType === 'article'}
                  onChange={(e) => {
                    setContentType('article');
                    setValue('contentType', 'article');
                  }}
                  className="sr-only"
                />
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                  contentType === 'article' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Newspaper className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Article standard</p>
                  <p className="text-sm text-gray-500">Image + texte complet</p>
                </div>
              </label>

              <label
                className={`flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                  contentType === 'summary'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  value="summary"
                  checked={contentType === 'summary'}
                  onChange={(e) => {
                    setContentType('summary');
                    setValue('contentType', 'summary');
                    setValue('articleSection', '');
                  }}
                  className="sr-only"
                />
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                  contentType === 'summary' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Résumé de l'actualité</p>
                  <p className="text-sm text-gray-500">Texte uniquement (pas d'image)</p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Section d'article (seulement pour les articles) */}
        {contentType === 'article' && (
          <Card>
            <CardHeader>
              <CardTitle>Section de destination</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                label="Dans quelle section cet article doit-il apparaître ?"
                options={[
                  { value: '', label: 'Sélectionner une section' },
                  { value: 'essentiel', label: "L'Essentiel de l'actualité" },
                  { value: 'toute-actualite', label: "Toute l'actualité" },
                  { value: 'focus', label: 'Focus (Premium)' },
                  { value: 'chronique', label: 'Chronique (Premium)' },
                ]}
                error={errors.articleSection?.message}
                {...register('articleSection')}
              />
              <p className="mt-2 text-sm text-gray-500">
                Les sections Focus et Chronique sont réservées aux abonnés Premium.
              </p>
            </CardContent>
          </Card>
        )}

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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Résumé (optionnel)</label>
                <button
                  type="button"
                  onClick={generateExcerptFromContent}
                  className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                  title="Générer à partir du contenu"
                >
                  <Sparkles className="h-3 w-3" />
                  Générer auto
                </button>
              </div>
              <TextArea
                placeholder="Bref résumé... (cliquez sur 'Générer auto' pour extraire du contenu)"
                rows={3}
                error={errors.excerpt?.message}
                {...register('excerpt')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Catégorie"
                options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
                placeholder="Sélectionner"
                error={errors.categoryId?.message}
                {...register('categoryId')}
              />

              <Select
                label="Pays *"
                options={[
                  { value: '', label: 'Sélectionner un pays' },
                  ...countries.map((c) => ({ value: c.id, label: c.name })),
                ]}
                error={errors.countryId?.message}
                {...register('countryId')}
              />
            </div>

          </CardContent>
        </Card>

        {/* Image de couverture (seulement pour les articles) */}
        {contentType === 'article' && (
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
            Enregistrer brouillon
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
    </div>
  );
}
