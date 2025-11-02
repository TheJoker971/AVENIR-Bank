/**
 * Page de gestion des comptes - Premium Design
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useAccounts } from '@/presentation/hooks/useAccounts';
import { useRouter } from 'next/navigation';
import { formatAmount, formatIban } from '@/shared/utils';
import { formatDateShort } from '@/shared/utils/formatDate';

export default function AccountsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { accounts, loading, error, createAccount, deleteAccount } = useAccounts(user?.id || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-gold rounded-full animate-pulse"></div>
          <span className="text-pearl/60">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'CLIENT') {
    return null;
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* En-tête */}
      <div className="mb-12">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-display text-4xl font-bold text-gold mb-2">
              Mes Comptes
            </h1>
            <p className="text-pearl/60">Gérez vos comptes courants</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-premium px-6 py-3"
          >
            + Nouveau Compte
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Solde total */}
      <div className="luxury-card p-8 rounded-2xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl"></div>
        <div className="relative">
          <p className="text-pearl/60 text-sm mb-2">Solde Total de Vos Comptes</p>
          <p className="font-display text-5xl font-bold text-gold">
            {formatAmount(totalBalance)}
          </p>
          <p className="text-pearl/60 text-sm mt-4">{accounts.length} compte(s) actif(s)</p>
        </div>
      </div>

      {/* Liste des comptes */}
      {accounts.length === 0 ? (
        <div className="text-center py-16 glass border border-gold/20 rounded-2xl">
          <div className="text-6xl mb-6">🏦</div>
          <h2 className="text-2xl font-bold text-pearl mb-4">Aucun compte pour le moment</h2>
          <p className="text-pearl/60 mb-8">Créez votre premier compte pour commencer</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-premium px-8 py-3"
          >
            Créer mon premier compte
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {accounts.map((account) => (
            <div key={account.id} className="luxury-card p-6 rounded-xl">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                    <span className="text-2xl">💳</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-pearl">
                      Compte #{account.accountNumber}
                    </h3>
                    <p className="text-pearl/60 text-sm">{formatIban(account.iban)}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
                      deleteAccount(account.id);
                    }
                  }}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Supprimer
                </button>
              </div>

              <div className="border-t border-gold/10 pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-pearl/60 text-sm mb-1">Solde disponible</p>
                    <p className="font-display text-3xl font-bold text-gold">
                      {formatAmount(account.balance || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-pearl/60 text-xs">Créé le</p>
                    <p className="text-pearl text-sm">{formatDateShort(account.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal création de compte */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="luxury-card p-8 rounded-2xl max-w-md w-full">
            <h2 className="font-display text-2xl font-bold text-gold mb-6">
              Créer un Nouveau Compte
            </h2>
            
            <div className="mb-6 glass p-4 rounded-lg border border-gold/20">
              <p className="text-pearl/60 text-sm">
                Un nouveau compte courant sera créé automatiquement avec un IBAN unique.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 border border-pearl/20 text-pearl rounded-lg hover:bg-pearl/5 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  await createAccount('');
                  setShowCreateModal(false);
                }}
                className="flex-1 btn-premium"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
