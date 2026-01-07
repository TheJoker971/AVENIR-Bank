/**
 * Page de messagerie (Client et Conseiller)
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useMessages, useUnassignedMessages } from '@/presentation/hooks/useMessages';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/shared/utils/formatDate';
import { MessageApiAdapter } from '@/infrastructure/api/MessageApiAdapter';
import { UserApiAdapter } from '@/infrastructure/api/UserApiAdapter';
import { UserDto } from '@/shared/dto';

const messageService = new MessageApiAdapter();
const userService = new UserApiAdapter();

interface Conversation {
  clientId: number;
  clientName: string;
  lastMessage: string;
  lastMessageDate: Date;
  unreadCount: number;
}

export default function MessagesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { messages, sendMessage, loading, refresh } = useMessages(user?.id || null);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [newMessage, setNewMessage] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [clients, setClients] = useState<UserDto[]>([]);
  
  // Transfer conversation state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [advisors, setAdvisors] = useState<UserDto[]>([]);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>('');
  const [clientIdToTransfer, setClientIdToTransfer] = useState<number | null>(null);
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Rafraîchir les messages toutes les 10 secondes (polling léger)
  useEffect(() => {
    if (!user?.id) return;
    
    const interval = setInterval(() => {
      refresh();
    }, 10000); // 10 secondes
    
    return () => clearInterval(interval);
  }, [user?.id, refresh]);

  // Charger les clients pour les conseillers
  useEffect(() => {
    if (user?.role === 'ADVISE') {
      loadClients();
    }
  }, [user]);

  // Construire la liste des conversations depuis les messages
  useEffect(() => {
    if (user?.role === 'ADVISE') {
      console.log('🔨 [Conversations] Construction avec', messages.length, 'messages');
      const conversationMap = new Map<number, Conversation>();
      
      messages.forEach(msg => {
        const clientId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
        console.log(`  Message ${msg.id}: sender=${msg.senderId}, receiver=${msg.receiverId}, clientId=${clientId}`);
        
        if (clientId === 0 || clientId === user.id) {
          console.log(`    ❌ Ignoré (clientId=${clientId})`);
          return;
        }
        
        const existing = conversationMap.get(clientId);
        const msgDate = new Date(msg.date);
        
        if (!existing || msgDate > existing.lastMessageDate) {
          const client = clients.find(c => c.id === clientId);
          conversationMap.set(clientId, {
            clientId,
            clientName: client ? `${client.firstname} ${client.lastname}` : `Client #${clientId}`,
            lastMessage: msg.message,
            lastMessageDate: msgDate,
            unreadCount: 0
          });
          console.log(`    ✅ Conversation ajoutée/mise à jour pour client ${clientId}`);
        }
      });
      
      const convList = Array.from(conversationMap.values())
        .sort((a, b) => b.lastMessageDate.getTime() - a.lastMessageDate.getTime());
      console.log('📋 [Conversations] Liste finale:', convList.length, 'conversations', convList);
      setConversations(convList);
    }
  }, [messages, clients, user, refreshKey]);

  const loadClients = async () => {
    const usersResult = await userService.getAllUsers();
    if (!(usersResult instanceof Error)) {
      const clientsList = usersResult.filter(u => u.role === 'CLIENT');
      setClients(clientsList);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Pour les clients, on envoie sans receiverId (sera assigné automatiquement)
    // Pour les conseillers, on envoie au client sélectionné
    const receiverId = user?.role === 'ADVISE' && selectedClientId ? selectedClientId : undefined;
    await sendMessage(newMessage, receiverId);
    setNewMessage('');
    
    // Rafraîchir les messages après l'envoi
    setTimeout(() => {
      refresh();
      setRefreshKey(prev => prev + 1);
    }, 500);
  };


  const handleTransferClick = async (clientId: number) => {
    setClientIdToTransfer(clientId);
    setTransferError(null);
    setTransferSuccess(null);
    
    // Charger la liste des conseillers
    const usersResult = await userService.getAllUsers();
    if (usersResult instanceof Error) {
      setTransferError('Erreur lors du chargement des conseillers');
      return;
    }
    
    // Filtrer pour ne garder que les conseillers (sauf l'utilisateur actuel)
    const advisorsList = usersResult.filter(u => u.role === 'ADVISE' && u.id !== user?.id);
    setAdvisors(advisorsList);
    setShowTransferModal(true);
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientIdToTransfer || !selectedAdvisorId) return;

    setTransferring(true);
    setTransferError(null);
    setTransferSuccess(null);

    const result = await messageService.transferConversation({
      clientId: clientIdToTransfer,
      toAdviserId: parseInt(selectedAdvisorId),
    });

    if (result instanceof Error) {
      setTransferError(result.message);
    } else {
      setTransferSuccess(result.message);
      setTimeout(() => {
        setShowTransferModal(false);
        refresh();
      }, 2000);
    }

    setTransferring(false);
  };

  if (authLoading) {
    return <div className="p-8 text-center text-pearl">Chargement...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const isAdvisor = user.role === 'ADVISE';
  
  // Debug: afficher les informations dans la console
  console.log('🔍 [Messages Page] User:', user?.id, 'Role:', user?.role);
  console.log('📨 [Messages Page] Tous les messages:', messages.length, messages);
  console.log('🎯 [Messages Page] Client sélectionné:', selectedClientId);
  
  // Filtrer les messages pour la conversation sélectionnée
  const displayMessages = isAdvisor && selectedClientId 
    ? messages.filter(m => {
        const match = (m.senderId === selectedClientId && (m.receiverId === user.id || m.receiverId === 0)) ||
                      (m.receiverId === selectedClientId && m.senderId === user.id);
        console.log(`  Message ${m.id}: sender=${m.senderId}, receiver=${m.receiverId}, match=${match}`);
        return match;
      })
    : messages;
  
  console.log('📋 [Messages Page] Messages affichés:', displayMessages.length, displayMessages);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {isAdvisor ? '💬 Messagerie Conseiller' : '💬 Votre Conseiller'}
          </h1>
          <p className="text-slate-600">
            {isAdvisor ? 'Gérez vos conversations avec vos clients' : 'Contactez votre conseiller privé pour toute question'}
          </p>
        </div>

        {transferSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl">
            {transferSuccess}
          </div>
        )}

        {/* Interface Conseiller avec liste de conversations */}
        {isAdvisor ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des conversations */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-8">
                <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-5">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Conversations
                  </h2>
                </div>
                {/* Liste des conversations */}
                <div className="max-h-[500px] overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="p-6 text-center">
                      <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-sm text-slate-500">Aucune conversation</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {conversations.map((conv) => (
                        <div
                          key={conv.clientId}
                          onClick={() => setSelectedClientId(conv.clientId)}
                          className={`p-4 cursor-pointer transition-all hover:bg-slate-50 ${
                            selectedClientId === conv.clientId ? 'bg-sky-50 border-l-4 border-sky-500' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-semibold text-slate-900 text-sm">{conv.clientName}</p>
                            <span className="text-xs text-slate-500">
                              {formatDate(conv.lastMessageDate.toISOString())}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 truncate">{conv.lastMessage}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Zone de conversation */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {selectedClientId ? (
                  <>
                    <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-semibold text-white">
                          {conversations.find(c => c.clientId === selectedClientId)?.clientName || `Client #${selectedClientId}`}
                        </h2>
                        <p className="text-sm text-sky-100 mt-1">Conversation active</p>
                      </div>
                      <button
                        onClick={() => handleTransferClick(selectedClientId)}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 text-sm font-medium backdrop-blur-sm border border-white/20"
                      >
                        🔄 Transférer
                      </button>
                    </div>

                    <div className="p-6 h-[500px] overflow-y-auto bg-slate-50">
                      {loading ? (
                        <div className="text-center text-slate-500">Chargement...</div>
                      ) : displayMessages.length === 0 ? (
                        <div className="text-center py-12">
                          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <p className="text-slate-600 mb-2">Aucun message</p>
                          <p className="text-sm text-slate-400">Démarrez la conversation !</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {displayMessages.map((message) => {
                            const isFromMe = message.senderId === user.id;
                            const clientName = conversations.find(c => c.clientId === selectedClientId)?.clientName || `Client #${selectedClientId}`;
                            return (
                              <div
                                key={message.id}
                                className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl shadow-sm ${
                                    isFromMe
                                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white'
                                      : 'bg-white border border-slate-200 text-slate-900'
                                  }`}
                                >
                                  {!isFromMe && (
                                    <p className="text-xs font-semibold mb-1 text-sky-600">{clientName}</p>
                                  )}
                                  <p className="text-sm">{message.message}</p>
                                  <p className={`text-xs mt-2 ${
                                    isFromMe ? 'text-sky-100' : 'text-slate-500'
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

                    <form onSubmit={handleSendMessage} className="p-6 border-t border-slate-200 bg-white">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Tapez votre message..."
                          className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                          disabled={loading}
                        />
                        <button
                          type="submit"
                          disabled={loading || !newMessage.trim()}
                          className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-medium hover:from-sky-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                          Envoyer
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="p-12 text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Sélectionnez une conversation</h3>
                    <p className="text-slate-600">Choisissez un client dans la liste pour commencer à échanger</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Interface Client simple */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Votre Conseiller
              </h2>
              <p className="text-sm text-sky-100 mt-1">
                Contactez votre conseiller privé pour toute question
              </p>
            </div>

            <div className="p-6 h-[500px] overflow-y-auto bg-slate-50">
              {loading ? (
                <div className="text-center text-slate-500">Chargement...</div>
              ) : displayMessages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👋</div>
                  <p className="text-slate-600 mb-2 font-medium">Bienvenue !</p>
                  <p className="text-sm text-slate-500">Envoyez votre premier message à votre conseiller</p>
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
                          className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl shadow-sm ${
                            isFromMe
                              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-900'
                          }`}
                        >
                          {!isFromMe && (
                            <p className="text-xs font-semibold mb-1 text-sky-600">Votre Conseiller</p>
                          )}
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-2 ${
                            isFromMe ? 'text-sky-100' : 'text-slate-500'
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

            <form onSubmit={handleSendMessage} className="p-6 border-t border-slate-200 bg-white">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-medium hover:from-sky-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal de transfert de conversation */}
        {showTransferModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 text-center">
                🔄 Transférer la conversation
              </h2>
              
              {transferError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {transferError}
                </div>
              )}

              {transferSuccess && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
                  {transferSuccess}
                </div>
              )}

              <form onSubmit={handleTransferSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Transférer à :
                  </label>
                  <select
                    value={selectedAdvisorId}
                    onChange={(e) => setSelectedAdvisorId(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    required
                    disabled={transferring}
                  >
                    <option value="">Sélectionner un conseiller</option>
                    {advisors.map((advisor) => (
                      <option key={advisor.id} value={advisor.id}>
                        {advisor.firstname} {advisor.lastname}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-2">
                    La conversation avec ce client sera transférée au conseiller sélectionné.
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="px-6 py-2.5 text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded-xl transition-all duration-200 font-medium"
                    disabled={transferring}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-medium hover:from-sky-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    disabled={transferring || !selectedAdvisorId}
                  >
                    {transferring ? 'Transfert...' : 'Transférer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
