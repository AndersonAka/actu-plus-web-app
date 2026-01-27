'use client';

import { useState, useEffect } from 'react';
import { Button, Card, EmptyState, Input, Alert } from '@/components/atoms';
import { Category } from '@/types';
import { Tag, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', description: '' });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/proxy/categories');
      if (response.ok) {
        const res = await response.json();
        const payload = res?.data ?? res;

        const nextCategories =
          Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.categories)
                ? payload.categories
                : [];

        setCategories(nextCategories);
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la récupération des catégories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    try {
      const response = await fetch('/api/proxy/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        setSuccess('Catégorie ajoutée avec succès');
        setNewCategory({ name: '', description: '' });
        setShowAddForm(false);
        fetchCategories();
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
      const response = await fetch(`/api/proxy/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        setSuccess('Catégorie modifiée avec succès');
        setEditingId(null);
        fetchCategories();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la modification');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (cat: Category) => {
    setCategoryToDelete(cat);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    if (isDeleting) return;
    setShowDeleteConfirm(false);
    setCategoryToDelete(null);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/proxy/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Catégorie supprimée avec succès');
        closeDeleteConfirm();
        fetchCategories();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la suppression');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditData({ name: cat.name, description: cat.description || '' });
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des catégories</h1>
          <p className="mt-1 text-gray-600">Gérez les catégories d'articles</p>
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
              placeholder="Nom de la catégorie"
              value={newCategory.name}
              onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
              className="flex-1"
            />
            <Input
              placeholder="Description (optionnel)"
              value={newCategory.description}
              onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
              className="flex-1"
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
      ) : categories.length === 0 ? (
        <EmptyState
          title="Aucune catégorie"
          description="Ajoutez votre première catégorie."
          icon={<Tag className="h-12 w-12 text-gray-400" />}
        />
      ) : (
        <Card padding="none">
          <div className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                {editingId === cat.id ? (
                  <div className="flex flex-1 items-center gap-4">
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      className="flex-1"
                    />
                    <Input
                      value={editData.description}
                      onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description"
                      className="flex-1"
                    />
                    <Button variant="success" size="sm" onClick={() => handleEdit(cat.id)}>
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
                        <Tag className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{cat.name}</p>
                        <p className="text-sm text-gray-500">{cat.description || 'Aucune description'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(cat)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(cat)}>
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
      {showDeleteConfirm && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Confirmer la suppression
              </h2>
              <button
                onClick={closeDeleteConfirm}
                className="text-gray-400 hover:text-gray-600"
                disabled={isDeleting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Voulez-vous vraiment supprimer la catégorie
              <span className="font-medium text-gray-900">{' '}
                {categoryToDelete.name}
              </span>
              {' '}?
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Cette action est irréversible.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={closeDeleteConfirm} disabled={isDeleting}>
                Annuler
              </Button>
              <Button variant="danger" onClick={confirmDelete} isLoading={isDeleting}>
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
