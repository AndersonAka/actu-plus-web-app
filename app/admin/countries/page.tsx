'use client';

import { useState, useEffect } from 'react';
import { Button, Card, EmptyState, Input, Alert } from '@/components/atoms';
import { Country } from '@/types';
import { Globe, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

export default function AdminCountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCountry, setNewCountry] = useState({ name: '', code: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', code: '' });

  const fetchCountries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/proxy/countries');
      if (response.ok) {
        const res = await response.json();
        const payload = res?.data ?? res;

        const nextCountries =
          Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.countries)
                ? payload.countries
                : [];

        setCountries(nextCountries);
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la récupération des pays');
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountry.name.trim() || !newCountry.code.trim()) return;

    try {
      const response = await fetch('/api/proxy/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCountry),
      });

      if (response.ok) {
        setSuccess('Pays ajouté avec succès');
        setNewCountry({ name: '', code: '' });
        setShowAddForm(false);
        fetchCountries();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de l\'ajout');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editData.name.trim()) return;

    try {
      const response = await fetch(`/api/proxy/countries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        setSuccess('Pays modifié avec succès');
        setEditingId(null);
        fetchCountries();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la modification');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce pays ?')) return;

    try {
      // Vérifier d'abord s'il y a des articles liés
      const checkResponse = await fetch(`/api/proxy/articles?countryId=${id}&limit=1`);
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        const articlesCount = checkData.data?.total || checkData.total || 0;
        
        if (articlesCount > 0) {
          setError(`Impossible de supprimer ce pays. ${articlesCount} article(s) y sont associés. Veuillez d'abord réassigner ou supprimer ces articles.`);
          return;
        }
      }

      const response = await fetch(`/api/proxy/countries/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Pays supprimé avec succès');
        fetchCountries();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la suppression');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEdit = (country: Country) => {
    setEditingId(country.id);
    setEditData({ name: country.name, code: country.code });
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des pays</h1>
          <p className="mt-1 text-gray-600">Gérez les pays disponibles</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddForm(!showAddForm)}
          leftIcon={showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        >
          {showAddForm ? 'Annuler' : 'Ajouter'}
        </Button>
      </div>

      {error && <Alert variant="error" className="mb-6" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>{success}</Alert>}

      {showAddForm && (
        <Card className="mb-6" padding="md">
          <form onSubmit={handleAdd} className="flex flex-col gap-4 sm:flex-row">
            <Input
              placeholder="Nom du pays"
              value={newCountry.name}
              onChange={(e) => setNewCountry(prev => ({ ...prev, name: e.target.value }))}
              className="flex-1"
            />
            <Input
              placeholder="Code (ex: SN)"
              value={newCountry.code}
              onChange={(e) => setNewCountry(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              className="w-full"
              maxLength={3}
            />
            <Button type="submit" variant="primary">Ajouter</Button>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : countries.length === 0 ? (
        <EmptyState
          title="Aucun pays"
          description="Ajoutez votre premier pays."
          icon={<Globe className="h-12 w-12 text-gray-400" />}
        />
      ) : (
        <Card padding="none">
          <div className="divide-y divide-gray-100">
            {countries.map((country) => (
              <div key={country.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                {editingId === country.id ? (
                  <div className="flex flex-1 items-center gap-4">
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      className="flex-1"
                    />
                    <Input
                      value={editData.code}
                      onChange={(e) => setEditData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className="w-24"
                      maxLength={3}
                    />
                    <Button variant="success" size="sm" onClick={() => handleEdit(country.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                        <Globe className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{country.name}</p>
                        <p className="text-sm text-gray-500">Code: {country.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(country)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(country.id)}>
                        <Trash2 className="h-4 w-4 text-error-500" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
