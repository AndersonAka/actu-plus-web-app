'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, TextArea, Select, Card, CardHeader, CardTitle, CardContent, Alert } from '@/components/atoms';
import { RichTextEditor, ImageUpload } from '@/components/molecules';
import { Category, Country } from '@/types';
import { WORLD_COUNTRIES } from '@/lib/data/world-countries';
import { ArrowLeft, Save, Send, Wand2, Plus, Trash2, Link as LinkIcon, FileText, Newspaper, Radar, Globe2 } from 'lucide-react';
import Link from 'next/link';

type Template = 'standard' | 'summary' | 'veille-sectorielle' | 'international';

const sourceSchema = z.object({
  name: z.string().min(1, 'Le nom de la source est requis'),
  url: z.string().url('URL invalide').or(z.literal('')),
});

function buildArticleSchema(template: Template) {
  return z
    .object({
      title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
      excerpt: z.string().optional(),
      content: z.string().optional(),
      categoryId: z.string().min(1, 'Veuillez sélectionner une catégorie'),
      countryId: z.string().optional(),
      coverImage: z.string().optional().or(z.literal('')),
      sector: z.string().optional().or(z.literal('')),
      zone: z.string().optional().or(z.literal('')),
      internationalCountryCode: z.string().optional().or(z.literal('')),
      sources: z.array(sourceSchema).optional(),
    })
    .superRefine((data, ctx) => {
      if (template === 'standard' || template === 'veille-sectorielle') {
        if (!data.countryId) {
          ctx.addIssue({ code: 'custom', path: ['countryId'], message: 'Veuillez sélectionner un pays' });
        }
      }
      if (template === 'standard' || template === 'international') {
        if (!data.coverImage || !data.coverImage.trim()) {
          ctx.addIssue({ code: 'custom', path: ['coverImage'], message: "L'image de couverture est obligatoire" });
        }
      }
      if (template === 'standard' || template === 'veille-sectorielle' || template === 'international') {
        if (!data.content || data.content.length < 50) {
          ctx.addIssue({ code: 'custom', path: ['content'], message: 'Le contenu doit contenir au moins 50 caractères' });
        }
      }
      if (template === 'veille-sectorielle' && !data.sector) {
        ctx.addIssue({ code: 'custom', path: ['sector'], message: 'Veuillez sélectionner un secteur' });
      }
      if (template === 'international') {
        if (!data.zone) {
          ctx.addIssue({ code: 'custom', path: ['zone'], message: 'Veuillez indiquer la zone' });
        }
        if (!data.internationalCountryCode) {
          ctx.addIssue({ code: 'custom', path: ['internationalCountryCode'], message: 'Veuillez sélectionner un pays' });
        }
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
}

type ArticleFormData = z.infer<ReturnType<typeof buildArticleSchema>>;

const TEMPLATE_OPTIONS: { value: Template; label: string; description: string; icon: typeof Newspaper }[] = [
  { value: 'standard', label: 'Article standard', description: 'Image + texte complet', icon: Newspaper },
  { value: 'summary', label: "Résumé de l'actualité", description: 'Plusieurs entrées Titre/Résumé/Lien', icon: FileText },
  { value: 'veille-sectorielle', label: 'Veille Sectorielle', description: 'Pays, secteur, contenu', icon: Radar },
  { value: 'international', label: 'Article International', description: 'Zone, pays international', icon: Globe2 },
];

export default function CreateArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [summaryItems, setSummaryItems] = useState<SummaryItem[]>([]);
  const [template, setTemplate] = useState<Template>('standard');

  const schema = useMemo(() => buildArticleSchema(template), [template]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      categoryId: '',
      countryId: '',
      coverImage: '',
      sector: '',
      zone: '',
      internationalCountryCode: '',
      sources: [],
    },
  });

  const generateExcerptFromContent = () => {
    const content = watch('content');
    if (!content) return;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    const cleanText = textContent.replace(/\s+/g, ' ').trim();
    const excerpt = cleanText.length > 200 ? cleanText.substring(0, 200).trim() + '...' : cleanText;
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
          const cats = catsResponse.data || catsResponse;
          setCategories(Array.isArray(cats) ? cats : []);
        }
        if (countryRes.ok) {
          const ctrsResponse = await countryRes.json();
          const ctrs = ctrsResponse.data || ctrsResponse;
          setCountries(Array.isArray(ctrs) ? ctrs : []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleTemplateChange = (value: Template) => {
    setTemplate(value);
    setValue('countryId', '');
    setValue('coverImage', '');
    setValue('sector', '');
    setValue('zone', '');
    setValue('internationalCountryCode', '');
  };

  const onSubmit = async (data: ArticleFormData, submitForReview: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      if (template === 'summary') {
        const validItems = summaryItems.filter((it) => it.title.trim() && it.summary.trim());
        if (validItems.length === 0) {
          throw new Error('Ajoutez au moins une entrée (titre + résumé)');
        }
      }

      const internationalCountry = WORLD_COUNTRIES.find((c) => c.code === data.internationalCountryCode);

      const body: Record<string, unknown> = {
        title: data.title,
        excerpt: data.excerpt,
        categoryId: data.categoryId,
        contentType: template === 'summary' ? 'summary' : 'article',
        scope: template === 'international' ? 'international' : 'national',
        articleSection: template === 'veille-sectorielle' ? 'veille-sectorielle' : (template === 'summary' ? undefined : 'toute-actualite'),
        sources: (template === 'standard' || template === 'international')
          ? sources.filter((s) => s.name.trim() !== '')
          : undefined,
      };

      if (template === 'standard' || template === 'veille-sectorielle') {
        body.countryId = data.countryId;
      }
      if (template === 'standard' || template === 'international') {
        body.imageUrl = data.coverImage || undefined;
      }
      if (template === 'summary') {
        body.summaryItems = summaryItems
          .filter((it) => it.title.trim() && it.summary.trim())
          .map((it) => ({ title: it.title, summary: it.summary, link: it.link || undefined }));
      } else {
        body.content = data.content;
      }
      if (template === 'veille-sectorielle') {
        body.sector = data.sector;
      }
      if (template === 'international') {
        body.zone = data.zone;
        body.internationalCountryName = internationalCountry?.name;
        body.internationalCountryFlag = internationalCountry?.flag;
      }

      const response = await fetch('/api/proxy/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de la création");
      }

      const articleId = result.data?.id || result.id;

      if (submitForReview && articleId) {
        const submitResponse = await fetch(`/api/proxy/articles/${articleId}/submit`, { method: 'POST' });
        const submitResult = await submitResponse.json();

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
  ];
  const sampleExcerpts = [
    "Une analyse approfondie des dernières évolutions qui façonnent notre société et impactent le quotidien des citoyens.",
    "Découvrez les tendances émergentes et les acteurs clés qui redéfinissent les standards de l'industrie.",
  ];
  const sampleContents = [
    `<h2>Introduction</h2><p>Dans un contexte de transformation rapide, les acteurs du secteur redoublent d'efforts pour s'adapter aux nouvelles réalités du marché.</p><h2>Perspectives</h2><p>Les fondations sont posées pour une trajectoire de croissance durable et inclusive.</p>`,
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
    setSources([
      { name: 'Reuters', url: 'https://www.reuters.com' },
      { name: 'AFP', url: 'https://www.afp.com' },
    ]);
  };

  const addSource = () => setSources([...sources, { name: '', url: '' }]);
  const removeSource = (index: number) => setSources(sources.filter((_, i) => i !== index));
  const updateSource = (index: number, field: 'name' | 'url', value: string) => {
    const newSources = [...sources];
    newSources[index][field] = value;
    setSources(newSources);
  };

  const addSummaryItem = () => setSummaryItems([...summaryItems, { title: '', summary: '', link: '' }]);
  const removeSummaryItem = (index: number) => setSummaryItems(summaryItems.filter((_, i) => i !== index));
  const updateSummaryItem = (index: number, field: keyof SummaryItem, value: string) => {
    const newItems = [...summaryItems];
    newItems[index][field] = value;
    setSummaryItems(newItems);
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/veilleur/articles" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600">
          <ArrowLeft className="h-4 w-4" />
          Retour aux articles
        </Link>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvel article</h1>
          <p className="mt-1 text-gray-600">Créez un nouvel article</p>
        </div>
        {template !== 'summary' && (
          <Button type="button" variant="outline" onClick={handleAutoFill} leftIcon={<Wand2 className="h-4 w-4" />}>
            Remplissage auto
          </Button>
        )}
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
              {TEMPLATE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                      template === opt.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      checked={template === opt.value}
                      onChange={() => handleTemplateChange(opt.value)}
                      className="sr-only"
                    />
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                      template === opt.value ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{opt.label}</p>
                      <p className="text-sm text-gray-500">{opt.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Titre" placeholder="Titre de l'article" error={errors.title?.message} {...register('title')} />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Résumé (optionnel)</label>
                {template !== 'summary' && (
                  <button
                    type="button"
                    onClick={generateExcerptFromContent}
                    className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                    title="Générer à partir du contenu"
                  >
                    Générer auto
                  </button>
                )}
              </div>
              <TextArea placeholder="Bref résumé..." rows={3} error={errors.excerpt?.message} {...register('excerpt')} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Catégorie"
                options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
                placeholder="Sélectionner"
                error={errors.categoryId?.message}
                {...register('categoryId')}
              />

              {(template === 'standard' || template === 'veille-sectorielle') && (
                <Select
                  label="Pays *"
                  options={[{ value: '', label: 'Sélectionner un pays' }, ...countries.map((c) => ({ value: c.id, label: c.name }))]}
                  error={errors.countryId?.message}
                  {...register('countryId')}
                />
              )}
            </div>

            {template === 'veille-sectorielle' && (
              <Select
                label="Secteur *"
                options={[
                  { value: '', label: 'Sélectionner un secteur' },
                  { value: 'banque-assurance', label: 'Banque et assurance' },
                  { value: 'energie', label: 'Énergie' },
                  { value: 'agro-industrielle', label: 'Agro Industrielle' },
                ]}
                error={errors.sector?.message}
                {...register('sector')}
              />
            )}

            {template === 'international' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Zone *"
                  options={[
                    { value: '', label: 'Sélectionner la zone' },
                    { value: 'uemoa', label: 'Zone UEMOA' },
                    { value: 'hors-uemoa', label: 'Hors UEMOA' },
                  ]}
                  error={errors.zone?.message}
                  {...register('zone')}
                />
                <Select
                  label="Pays *"
                  options={[
                    { value: '', label: 'Sélectionner un pays' },
                    ...WORLD_COUNTRIES.map((c) => ({ value: c.code, label: `${c.flag} ${c.name}` })),
                  ]}
                  error={errors.internationalCountryCode?.message}
                  {...register('internationalCountryCode')}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Image de couverture */}
        {(template === 'standard' || template === 'international') && (
          <Card>
            <CardHeader>
              <CardTitle>Image de couverture *</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                name="coverImage"
                control={control}
                render={({ field }) => (
                  <ImageUpload value={field.value || ''} onChange={field.onChange} error={errors.coverImage?.message} />
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Contenu (standard / veille sectorielle / international) */}
        {template !== 'summary' && (
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

        {/* Entrées du résumé (Titre / Résumé / Lien) */}
        {template === 'summary' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Entrées du résumé</CardTitle>
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
                  <p className="text-sm">Cliquez sur "Ajouter une entrée" pour composer le résumé</p>
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

        {/* Sources (standard / international) */}
        {(template === 'standard' || template === 'international') && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sources</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addSource} leftIcon={<Plus className="h-4 w-4" />}>
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

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleSaveDraft} isLoading={isSaving} leftIcon={<Save className="h-4 w-4" />}>
            Enregistrer brouillon
          </Button>
          <Button type="button" variant="primary" onClick={handleSubmitForReview} isLoading={isLoading} leftIcon={<Send className="h-4 w-4" />}>
            Soumettre pour validation
          </Button>
        </div>
      </form>
    </div>
  );
}
