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
    return <div className="p-8 text-center text-pearl">Chargement...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const isAdvisor = user.role === 'ADVISE';
  const displayMessages = isAdvisor && selectedUserId === null ? unassignedMessages : messages;

  return (
    <div className="p-8 max-w-5xl mx-auto text-pearl">
      <h1 className="font-display text-4xl font-bold text-gold mb-8">
        {isAdvisor ? 'Messagerie - Messages clients' : 'Messagerie Privée'}
      </h1>

      {isAdvisor && (
        <div className="mb-8 glass border border-gold/30 rounded-xl p-6">
          <h2 className="font-semibold text-xl text-gold mb-4">📬 Messages non assignés</h2>
          {unassignedLoading ? (
            <p className="text-sm text-pearl/60">Chargement...</p>
          ) : unassignedMessages.length === 0 ? (
            <p className="text-sm text-pearl/60">Aucun message en attente</p>
          ) : (
            <div className="space-y-3">
              {unassignedMessages.map((msg) => (
                <div key={msg.id} className="luxury-card rounded-xl p-4 border border-gold/20">
                  <p className="text-sm font-medium text-gold mb-1">De: Utilisateur #{msg.senderId}</p>
                  <p className="text-sm text-pearl mb-3">{msg.message}</p>
                  <button
                    onClick={() => handleAssignMessage(msg.id)}
                    className="btn-premium text-sm px-4 py-2"
                  >
                    Prendre en charge
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="luxury-card rounded-xl overflow-hidden">
        <div className="glass p-6 border-b border-gold/20">
          <h2 className="text-xl font-semibold text-gold">💬 Conversation</h2>
          <p className="text-sm text-pearl/60 mt-1">
            {isAdvisor ? 'Échangez avec vos clients' : 'Contactez votre conseiller privé'}
          </p>
        </div>

        <div className="p-6 h-96 overflow-y-auto" style={{ background: 'rgba(10, 10, 10, 0.3)' }}>
          {loading ? (
            <div className="text-center text-pearl/60">Chargement...</div>
          ) : displayMessages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-pearl/60 mb-2">Aucun message</p>
              <p className="text-sm text-pearl/40">Démarrez la conversation !</p>
            </div>
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
                      className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl ${
                        isFromMe
                          ? 'bg-gradient-to-r from-gold to-yellow-500 text-black'
                          : 'glass border border-gold/20 text-pearl'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-2 ${
                        isFromMe ? 'text-black/60' : 'text-pearl/50'
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

        <form onSubmit={handleSendMessage} className="p-6 border-t border-gold/20">
          <div className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="input-premium flex-1"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="btn-premium px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
