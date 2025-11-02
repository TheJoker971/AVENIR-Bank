/**
 * Page de messagerie (Client et Conseiller)
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useMessages, useUnassignedMessages } from '@/presentation/hooks/useMessages';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/shared/utils/formatDate';

export default function MessagesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { messages, sendMessage, loading, refresh } = useMessages(user?.id || null);
  const { messages: unassignedMessages, assignMessage, loading: unassignedLoading } = useUnassignedMessages(user?.role === 'ADVISE' ? user?.id || null : null);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [newMessage, setNewMessage] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Pour les clients, on envoie sans receiverId (sera assigné automatiquement)
    // Pour les conseillers, on envoie au client sélectionné
    const receiverId = isAdvisor && selectedUserId ? selectedUserId : undefined;
    await sendMessage(newMessage, receiverId);
    setNewMessage('');
  };

  const handleAssignMessage = async (messageId: number) => {
    if (!user || user.role !== 'ADVISE') return;
    await assignMessage(messageId, user.id);
  };

  if (authLoading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const isAdvisor = user.role === 'ADVISE';
  const displayMessages = isAdvisor && selectedUserId === null ? unassignedMessages : messages;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {isAdvisor ? 'Messagerie - Messages clients' : 'Messagerie'}
      </h1>

      {isAdvisor && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="font-semibold mb-2">Messages non assignés</h2>
          {unassignedLoading ? (
            <p className="text-sm text-gray-600">Chargement...</p>
          ) : unassignedMessages.length === 0 ? (
            <p className="text-sm text-gray-600">Aucun message en attente</p>
          ) : (
            <div className="space-y-2">
              {unassignedMessages.map((msg) => (
                <div key={msg.id} className="bg-white rounded p-3 border border-yellow-300">
                  <p className="text-sm font-medium">De: Utilisateur #{msg.senderId}</p>
                  <p className="text-sm text-gray-700">{msg.message}</p>
                  <button
                    onClick={() => handleAssignMessage(msg.id)}
                    className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Prendre en charge
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Conversation</h2>
        </div>

        <div className="p-6 h-96 overflow-y-auto bg-gray-50">
          {loading ? (
            <div className="text-center text-gray-600">Chargement...</div>
          ) : displayMessages.length === 0 ? (
            <div className="text-center text-gray-600">Aucun message</div>
          ) : (
            <div className="space-y-4">
              {displayMessages.map((message) => {
                const isFromMe = message.senderId === user.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isFromMe
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        isFromMe ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatDate(message.date)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200">
          <div className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

