'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Alert, Badge, EmptyState } from '@/components/atoms';
import {
  Mail,
  MailOpen,
  Trash2,
  Eye,
  X,
  Clock,
  User,
  MessageSquare,
  RefreshCw,
  Filter,
} from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  type: 'general' | 'support' | 'partnership' | 'press';
  isRead: boolean;
  createdAt: string;
}

const messageTypes = {
  general: { label: 'Général', color: 'bg-gray-100 text-gray-700' },
  support: { label: 'Support', color: 'bg-blue-100 text-blue-700' },
  partnership: { label: 'Partenariat', color: 'bg-green-100 text-green-700' },
  press: { label: 'Presse', color: 'bg-purple-100 text-purple-700' },
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/proxy/messages');
      if (response.ok) {
        const result = await response.json();
        const data = result?.data ?? result;
        setMessages(Array.isArray(data) ? data : data?.messages || data?.data || []);
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la récupération des messages');
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (msg: ContactMessage) => {
    try {
      const response = await fetch(`/api/proxy/messages/${msg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });

      if (response.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
        );
        if (selectedMessage?.id === msg.id) {
          setSelectedMessage({ ...msg, isRead: true });
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = (msg: ContactMessage) => {
    setMessageToDelete(msg);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/proxy/messages/${messageToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Message supprimé avec succès');
        setShowDeleteConfirm(false);
        setMessageToDelete(null);
        if (selectedMessage?.id === messageToDelete.id) {
          setSelectedMessage(null);
        }
        fetchMessages();
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

  const closeDeleteConfirm = () => {
    if (isDeleting) return;
    setShowDeleteConfirm(false);
    setMessageToDelete(null);
  };

  const openMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      handleMarkAsRead(msg);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !msg.isRead;
    return msg.type === filter;
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages de contact</h1>
          <p className="mt-1 text-gray-600">
            {unreadCount > 0 ? (
              <>
                <span className="font-medium text-primary-600">{unreadCount}</span> message(s) non
                lu(s)
              </>
            ) : (
              'Tous les messages sont lus'
            )}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchMessages}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Actualiser
        </Button>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Tous
        </Button>
        <Button
          variant={filter === 'unread' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('unread')}
          leftIcon={<Mail className="h-4 w-4" />}
        >
          Non lus ({unreadCount})
        </Button>
        {Object.entries(messageTypes).map(([key, value]) => (
          <Button
            key={key}
            variant={filter === key ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter(key)}
          >
            {value.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Messages List */}
        <Card padding="none" className="overflow-hidden">
          {isLoading ? (
            <div className="space-y-4 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <EmptyState
              title="Aucun message"
              description={
                filter === 'all'
                  ? 'Aucun message de contact reçu.'
                  : 'Aucun message correspondant au filtre.'
              }
              icon={<MessageSquare className="h-12 w-12 text-gray-400" />}
            />
          ) : (
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className={`cursor-pointer p-4 transition-colors hover:bg-gray-50 ${
                    selectedMessage?.id === msg.id ? 'bg-primary-50' : ''
                  } ${!msg.isRead ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          msg.isRead ? 'bg-gray-100' : 'bg-primary-100'
                        }`}
                      >
                        {msg.isRead ? (
                          <MailOpen className="h-5 w-5 text-gray-500" />
                        ) : (
                          <Mail className="h-5 w-5 text-primary-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p
                            className={`truncate text-sm ${
                              !msg.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'
                            }`}
                          >
                            {msg.name}
                          </p>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              messageTypes[msg.type]?.color || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {messageTypes[msg.type]?.label || msg.type}
                          </span>
                        </div>
                        <p
                          className={`mt-0.5 truncate text-sm ${
                            !msg.isRead ? 'font-medium text-gray-800' : 'text-gray-600'
                          }`}
                        >
                          {msg.subject}
                        </p>
                        <p className="mt-1 line-clamp-1 text-xs text-gray-400">{msg.message}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-gray-400">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Message Detail */}
        <Card padding="none" className="overflow-hidden">
          {selectedMessage ? (
            <div className="flex h-full flex-col">
              <div className="border-b border-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedMessage.subject}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {selectedMessage.name}
                      </span>
                      <span>{selectedMessage.email}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedMessage(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      messageTypes[selectedMessage.type]?.color || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {messageTypes[selectedMessage.type]?.label || selectedMessage.type}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {formatDate(selectedMessage.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex-1 p-4">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 p-4">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Mail className="h-4 w-4" />}
                  onClick={() => window.open(`mailto:${selectedMessage.email}`, '_blank')}
                >
                  Répondre par email
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  onClick={() => handleDelete(selectedMessage)}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[400px] items-center justify-center text-gray-400">
              <div className="text-center">
                <Eye className="mx-auto h-12 w-12 mb-3" />
                <p>Sélectionnez un message pour le lire</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Confirmer la suppression</h2>
              <button
                onClick={closeDeleteConfirm}
                className="text-gray-400 hover:text-gray-600"
                disabled={isDeleting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Voulez-vous vraiment supprimer le message de
              <span className="font-medium text-gray-900"> {messageToDelete.name}</span> ?
            </p>

            <p className="mt-2 text-sm text-gray-500">Cette action est irréversible.</p>

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
