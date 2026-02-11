'use client';

import { useState, useEffect } from 'react';
import { Card, EmptyState } from '@/components/atoms';
import { Category } from '@/types';
import { Tag } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
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
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
        <p className="mt-1 text-gray-600">Liste des catégories d'articles</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          title="Aucune catégorie"
          description="Aucune catégorie disponible."
          icon={<Tag className="h-12 w-12 text-gray-400" />}
        />
      ) : (
        <Card padding="none">
          <div className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 p-4 hover:bg-gray-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                  <Tag className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{cat.name}</p>
                  <p className="text-sm text-gray-500">{cat.description || 'Aucune description'}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
