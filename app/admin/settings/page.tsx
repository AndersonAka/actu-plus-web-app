'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, TextArea, Alert } from '@/components/atoms';
import { Save, Globe, Mail, Shield, Loader2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    supportEmail: '',
    enableNotifications: true,
    enablePremiumContent: true,
    maintenanceMode: false,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/proxy/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings({
            siteName: data.siteName || '',
            siteDescription: data.siteDescription || '',
            contactEmail: data.contactEmail || '',
            supportEmail: data.supportEmail || '',
            enableNotifications: data.enableNotifications ?? true,
            enablePremiumContent: data.enablePremiumContent ?? true,
            maintenanceMode: data.maintenanceMode ?? false,
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('/api/proxy/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSuccess('Paramètres enregistrés avec succès');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la sauvegarde');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="mt-1 text-gray-600">Configurez les paramètres de la plateforme</p>
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="mt-1 text-gray-600">Configurez les paramètres de la plateforme</p>
      </div>

      {error && <Alert variant="error" className="mb-6" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>{success}</Alert>}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary-600" />
              <CardTitle>Informations générales</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nom du site"
              value={settings.siteName}
              onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
            />
            <TextArea
              label="Description du site"
              value={settings.siteDescription}
              onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
              rows={3}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary-600" />
              <CardTitle>Emails</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Email de contact"
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
            />
            <Input
              label="Email de support"
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary-600" />
              <CardTitle>Fonctionnalités</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => setSettings(prev => ({ ...prev, enableNotifications: e.target.checked }))}
                className="h-5 w-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <div>
                <span className="font-medium text-gray-900">Activer les notifications</span>
                <p className="text-sm text-gray-500">Permet d'envoyer des notifications aux utilisateurs</p>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={settings.enablePremiumContent}
                onChange={(e) => setSettings(prev => ({ ...prev, enablePremiumContent: e.target.checked }))}
                className="h-5 w-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <div>
                <span className="font-medium text-gray-900">Contenu premium</span>
                <p className="text-sm text-gray-500">Activer le système de contenu réservé aux abonnés</p>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-lg border border-warning-200 bg-warning-50 p-4 cursor-pointer hover:bg-warning-100">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                className="h-5 w-5 rounded border-gray-300 text-warning-500 focus:ring-warning-500"
              />
              <div>
                <span className="font-medium text-warning-900">Mode maintenance</span>
                <p className="text-sm text-warning-700">Affiche une page de maintenance aux visiteurs</p>
              </div>
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={isLoading}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Enregistrer les paramètres
          </Button>
        </div>
      </div>
    </div>
  );
}
