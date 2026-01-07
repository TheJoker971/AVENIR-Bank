/**
 * Page Dashboard - Version simplifiée
 */
'use client';

import { useAuth } from '@/presentation/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useActiveAccount } from '@/presentation/hooks/useActiveAccount';
import { useOperations } from '@/presentation/hooks/useOperations';
import { useAccounts } from '@/presentation/hooks/useAccounts';
import { useWebSocket } from '@/presentation/hooks/useWebSocket';
import { formatAmount } from '@/shared/utils';
import { OperationDto } from '@/shared/dto';

export default function DashboardPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { activeAccount, fetchActiveAccount, refreshTrigger } = useActiveAccount();
  const { getAccountOperations } = useOperations();
  const { savingsAccounts, loading: savingsLoading } = useAccounts(user?.id || null);
  const [operations, setOperations] = useState<OperationDto[]>([]);
  const [loadingOperations, setLoadingOperations] = useState(true);
  const router = useRouter();
  
  // Utiliser WebSocket pour les mises à jour en temps réel
  const socket = useWebSocket(user?.id || null);

  // Charger le compte actif (une seule fois)
  useEffect(() => {
    if (user && isAuthenticated && user.role === 'CLIENT') {
      fetchActiveAccount(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isAuthenticated]);

  // Charger les opérations du compte actif
  useEffect(() => {
    const loadOperations = async () => {
      if (activeAccount?.id) {
        setLoadingOperations(true);
        const ops = await getAccountOperations(activeAccount.id);
        if (ops) {
          const sortedOps = [...ops].sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          setOperations(sortedOps.slice(0, 10));
        } else {
          setOperations([]);
        }
        setLoadingOperations(false);
      }
    };

    loadOperations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount?.id, refreshTrigger]);

  // Écouter les événements WebSocket pour les mises à jour en temps réel
  useEffect(() => {
    if (!socket || !activeAccount?.id) return;

    // Écouter les nouvelles opérations
    socket.on('new-operation', (operation: OperationDto) => {
      console.log('📨 Nouvelle opération reçue via WebSocket:', operation);
      setOperations(prev => {
        const updated = [operation, ...prev];
        const sortedOps = updated.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        return sortedOps.slice(0, 10);
      });
    });

    // Écouter les mises à jour du compte
    socket.on('account-updated', () => {
      console.log('💰 Compte mis à jour via WebSocket');
      if (user?.id) {
        fetchActiveAccount(user.id);
      }
    });

    return () => {
      socket.off('new-operation');
      socket.off('account-updated');
    };
  }, [socket, activeAccount?.id, user?.id, fetchActiveAccount]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  // Fonction pour obtenir le statut en français
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Complétée';
      case 'PENDING': return 'En attente';
      case 'REJECTED': return 'Rejetée';
      default: return status;
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'PENDING': return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'REJECTED': return 'bg-rose-100 text-rose-700 border border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-sky-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Bienvenue, {user.firstname}
        </h1>
        <p className="text-slate-600">Voici un aperçu de votre compte</p>
      </div>

      {/* Dashboard Client */}
      {user.role === 'CLIENT' && (
        <>
          {/* Widget Compte Actif - Simplifié */}
          {activeAccount ? (
            <div className="mb-8 p-8 bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 border border-sky-200/60 rounded-2xl shadow-md shadow-sky-200/40">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-2">Votre solde disponible</p>
                  <p className="text-5xl font-bold text-sky-600 mb-1">{formatAmount(activeAccount.balance)}</p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <p className="text-xs text-slate-400">Compte ****{activeAccount.iban.slice(-4)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm text-amber-800 font-semibold mb-1">Aucun compte actif</p>
                  <p className="text-xs text-amber-700">
                    Veuillez sélectionner un compte actif pour accéder à votre dashboard.
                  </p>
                </div>
              </div>
              <Link href="/select-account" className="mt-4 inline-block btn-premium py-2 px-4 text-sm">
                Sélectionner un compte
              </Link>
            </div>
          )}

          {/* Section Dernières Opérations */}
          {activeAccount && (
            <div className="luxury-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Dernières opérations</h2>
                <Link
                  href="/operations"
                  className="text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors duration-200 flex items-center gap-1"
                >
                  Voir tout
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {loadingOperations ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-500 border-t-transparent mx-auto"></div>
                  <p className="text-slate-500 text-sm mt-4">Chargement des opérations...</p>
                </div>
              ) : operations.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-slate-500">Aucune opération pour le moment</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Statut</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {operations.map((operation) => {
                        // Normaliser les IBANs (retirer les espaces pour la comparaison)
                        const normalizeIban = (iban: string) => iban.replace(/\s/g, '').toUpperCase();
                        const senderIban = normalizeIban(operation.transferData.senderIban);
                        const receiverIban = normalizeIban(operation.transferData.receiverIban);
                        const activeIban = activeAccount?.iban ? normalizeIban(activeAccount.iban) : '';
                        
                        // Déterminer si c'est un crédit (on reçoit) ou un débit (on envoie)
                        const isCredit = receiverIban === activeIban;
                        const isDebit = senderIban === activeIban;
                        
                        console.log('🔍 [Dashboard] Comparaison IBAN:', {
                          operationId: operation.id,
                          senderIban,
                          receiverIban,
                          activeIban,
                          isCredit,
                          isDebit,
                          senderName: `${operation.transferData.senderFirstName} ${operation.transferData.senderLastName}`,
                          receiverName: `${operation.transferData.receiverFirstName} ${operation.transferData.receiverLastName}`
                        });
                        
                        // Si on est le receiver → crédit, sinon débit
                        const otherParty = isCredit 
                          ? `${operation.transferData.senderFirstName} ${operation.transferData.senderLastName}`
                          : `${operation.transferData.receiverFirstName} ${operation.transferData.receiverLastName}`;
                        
                        return (
                          <tr key={operation.id} className="hover:bg-slate-50 transition-colors duration-150">
                            <td className="py-4 px-4 text-sm text-slate-700">
                              {formatDate(operation.date)}
                            </td>
                            <td className="py-4 px-4 text-sm text-slate-900">
                              <div>
                                {operation.transferData.reason && (
                                  <p className="font-medium">{operation.transferData.reason}</p>
                                )}
                                <p className="text-xs text-slate-500">
                                  {isCredit ? 'De : ' : 'Vers : '}{otherParty}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(operation.status)}`}>
                                {getStatusLabel(operation.status)}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className={`text-sm font-semibold ${
                                isCredit ? 'text-emerald-600' : 'text-red-600'
                              }`}>
                                {isCredit ? '+' : '-'}{formatAmount(operation.amount)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Section Accès Rapide */}
          {activeAccount && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Accès rapide</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Carte Épargnes */}
                <Link href="/savings" className="luxury-card p-6 rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">Épargnes</h3>
                      <p className="text-sm text-slate-600">
                        {savingsLoading ? 'Chargement...' : `${savingsAccounts.length} compte${savingsAccounts.length > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm">Gérer vos comptes épargne</p>
                </Link>

                {/* Carte Messagerie */}
                <Link href="/messages" className="luxury-card p-6 rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">Messagerie</h3>
                      <p className="text-sm text-slate-600">Conseiller</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm">Contacter votre conseiller</p>
                </Link>

                {/* Carte Crédits */}
                <Link href="/credits" className="luxury-card p-6 rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">Crédits</h3>
                      <p className="text-sm text-slate-600">Mes crédits</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm">Consulter vos crédits</p>
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {/* Dashboard Conseiller */}
      {user.role === 'ADVISE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/credits" className="luxury-card p-8 rounded-xl hover:shadow-lg transition-shadow duration-200">
            <div className="text-5xl mb-4">💳</div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">Crédits</h3>
            <p className="text-slate-600">Gérer les demandes de crédit</p>
          </Link>

          <Link href="/messages" className="luxury-card p-8 rounded-xl hover:shadow-lg transition-shadow duration-200">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">Messagerie</h3>
            <p className="text-slate-600">Communiquer avec vos clients</p>
          </Link>

          <Link href="/notifications" className="luxury-card p-8 rounded-xl hover:shadow-lg transition-shadow duration-200">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">Notifications</h3>
            <p className="text-slate-600">Alertes importantes</p>
          </Link>
        </div>
      )}

      {/* Dashboard Directeur */}
      {user.role === 'DIRECTOR' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin" className="luxury-card p-8 rounded-xl hover:shadow-lg transition-shadow duration-200">
            <div className="text-5xl mb-4">⚙️</div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">Administration</h3>
            <p className="text-slate-600">Paramètres de la banque</p>
          </Link>

          <Link href="/admin/users" className="luxury-card p-8 rounded-xl hover:shadow-lg transition-shadow duration-200">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">Utilisateurs</h3>
            <p className="text-slate-600">Gestion des comptes</p>
          </Link>

          <Link href="/admin/stocks" className="luxury-card p-8 rounded-xl hover:shadow-lg transition-shadow duration-200">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">Actions</h3>
            <p className="text-slate-600">Gestion du marché</p>
          </Link>

          <Link href="/notifications" className="luxury-card p-8 rounded-xl hover:shadow-lg transition-shadow duration-200">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">Notifications</h3>
            <p className="text-slate-600">Centre de notifications</p>
          </Link>
        </div>
      )}
    </div>
  );
}
