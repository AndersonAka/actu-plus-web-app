'use client';

import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, TextArea, Alert } from '@/components/atoms';
import { Mail, Send } from 'lucide-react';

function extractApiPayload(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null;
  const o = data as { data?: unknown };
  if (o.data !== undefined && o.data !== null && typeof o.data === 'object') {
    return o.data as Record<string, unknown>;
  }
  return data as Record<string, unknown>;
}

export default function AdminEmailTestPage() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<Record<string, unknown> | null>(null);

  const handleSend = async () => {
    setIsSending(true);
    setSuccess(null);
    setError(null);
    setLastResponse(null);

    try {
      const defaultSubject = `Actu Plus — test Brevo (${new Date().toISOString()})`;
      const defaultHtml = `<p>Ceci est un <strong>e-mail de test</strong> envoyé depuis l’administration Actu Plus.</p>
<p>Horodatage (UTC) : <code>${new Date().toISOString()}</code></p>
<p>Si vous recevez ce message, l’API transactionnelle Brevo fonctionne correctement.</p>`;

      const payload = {
        includeEmailTokens: [to.trim()],
        subject: subject.trim() || defaultSubject,
        body: htmlBody.trim() || defaultHtml,
        includeUnsubscribed: true,
      };

      const response = await fetch('/api/proxy/onesignal/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg =
          typeof data.message === 'string'
            ? data.message
            : Array.isArray(data.message)
              ? data.message.join(', ')
              : data.error || `Erreur HTTP ${response.status}`;
        throw new Error(msg || 'Échec de l’envoi');
      }

      setLastResponse(data as Record<string, unknown>);

      const brevo = extractApiPayload(data);
      const messageId =
        (typeof brevo?.messageId === 'string' && brevo.messageId) ||
        (Array.isArray(brevo?.messageIds) && typeof brevo.messageIds[0] === 'string'
          ? brevo.messageIds[0]
          : undefined);

      setSuccess(
        messageId
          ? `Brevo a accepté l’e-mail (messageId : ${messageId}). Si rien n’arrive, suivez les vérifications ci-dessous.`
          : `Brevo a accepté l’e-mail. Si rien n’arrive, suivez les vérifications ci-dessous.`,
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Mail className="h-8 w-8 text-primary-600" />
          Test d’envoi e-mail (Brevo)
        </h1>
        <p className="mt-1 text-gray-600">
          Envoi ponctuel via l’API transactionnelle Brevo. Aucun enregistrement n’est conservé dans
          l’application.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres du message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {success && <Alert variant="success">{success}</Alert>}
          {error && <Alert variant="error">{error}</Alert>}

          <Alert variant="info" title="L’API réussit mais vous ne voyez pas le mail ?">
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
              <li>
                Dans Brevo : <strong>Paramètres</strong> → <strong>Expéditeurs</strong> — l’adresse
                d’envoi (ex. no-reply@…) doit être <strong>validée</strong> (e-mail de confirmation
                Brevo).
              </li>
              <li>
                Toujours dans Brevo : <strong>Logs</strong> / <strong>E-mails transactionnels</strong>{' '}
                — recherchez le <code className="rounded bg-gray-100 px-1">messageId</code> ci-dessous
                : statut délivré, reporté, bloqué ou rebond.
              </li>
              <li>
                Domaine : enregistrements <strong>SPF</strong> et <strong>DKIM</strong> pour le domaine
                de l’expéditeur (sinon filtres anti-spam des FAI).
              </li>
              <li>
                Côté destinataire : courrier indésirable, onglet « Promotions », délai de quelques
                minutes.
              </li>
            </ul>
          </Alert>

          <div>
            <label htmlFor="email-test-to" className="mb-1 block text-sm font-medium text-gray-700">
              Destinataire <span className="text-error-500">*</span>
            </label>
            <Input
              id="email-test-to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="vous@exemple.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="email-test-subject" className="mb-1 block text-sm font-medium text-gray-700">
              Sujet (optionnel)
            </label>
            <Input
              id="email-test-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Laisser vide pour un sujet de test automatique"
            />
          </div>

          <div>
            <label htmlFor="email-test-body" className="mb-1 block text-sm font-medium text-gray-700">
              Corps HTML (optionnel)
            </label>
            <TextArea
              id="email-test-body"
              value={htmlBody}
              onChange={(e) => setHtmlBody(e.target.value)}
              placeholder="Laisser vide pour un court message HTML de test par défaut"
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          {lastResponse && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
              <p className="mb-1 font-semibold text-gray-900">Réponse API</p>
              <pre className="overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(lastResponse, null, 2)}
              </pre>
            </div>
          )}

          <Button
            variant="primary"
            onClick={handleSend}
            disabled={isSending || !to.trim()}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isSending ? 'Envoi…' : 'Envoyer l’e-mail de test'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
