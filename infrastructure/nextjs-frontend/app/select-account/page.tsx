/**
 * Page de sélection du compte actif
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useAccounts } from '@/presentation/hooks/useAccounts';
import { useActiveAccount } from '@/presentation/hooks/useActiveAccount';
import { formatAmount } from '@/shared/utils';
import Link from 'next/link';

export default function SelectAccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { accounts, loading: accountsLoading, refreshAccounts } = useAccounts(user?.id || null);
  const { setActiveAccount, fetchActiveAccount } = useActiveAccount();
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Debug: afficher l'état au chargement
  useEffect(() => {
    console.log('🔍 DEBUG - État de la page select-account:');
    console.log('  - User:', user);
    console.log('  - Accounts:', accounts);
    console.log('  - Accounts length:', accounts.length);
    console.log('  - Accounts IDs et types:');
    accounts.forEach(acc => {
      console.log(`    Account ${acc.id} (type: ${typeof acc.id}) - ${acc.iban}`);
    });
    console.log('  - Selected Account ID:', selectedAccountId, `(type: ${typeof selectedAccountId})`);
    console.log('  - Saving:', saving);
  }, [user, accounts, selectedAccountId, saving]);

  const handleSelectAccount = async (accountId: number) => {
    if (!user) {
      console.error('❌ Pas d\'utilisateur connecté');
      return;
    }

    console.log('🔵 Sélection du compte:', accountId);
    console.log('👤 User ID:', user.id);
    
    setSaving(true);
    try {
      // Appeler l'API pour définir le compte actif
      console.log('📡 Appel API pour définir le compte actif...');
      const response = await fetch(`http://localhost:3000/api/users/${user.id}/active-account`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString(),
        },
        body: JSON.stringify({ accountId }),
      });

      console.log('📡 Réponse API:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erreur API:', errorData);
        throw new Error('Erreur lors de la définition du compte actif');
      }

      const responseData = await response.json();
      console.log('✅ Compte actif défini:', responseData);

      // Recharger le compte actif depuis l'API pour avoir les bonnes données
      console.log('🔄 Rechargement du compte actif depuis l\'API...');
      await fetchActiveAccount(user.id);

      // Rediriger vers le dashboard
      console.log('🔄 Redirection vers /dashboard...');
      router.push('/dashboard');
    } catch (error) {
      console.error('❌ Erreur lors de la sélection du compte:', error);
      alert('Erreur lors de la sélection du compte: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || accountsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-sky-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Sélectionnez votre compte
          </h1>
          <p className="text-slate-600">
            Choisissez le compte que vous souhaitez utiliser par défaut
          </p>
        </div>

        {accounts.length === 0 ? (
          <div className="luxury-card p-12 text-center">
            <svg className="w-20 h-20 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">Aucun compte disponible</h2>
            <p className="text-slate-600 mb-6">Vous devez créer un compte pour continuer</p>
            <Link
              href="/accounts"
              className="inline-block btn-premium px-8 py-3"
            >
              Créer mon premier compte
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => {
              const isSelected = selectedAccountId === account.id;
              console.log(`🔄 Render compte ${account.id}: isSelected=${isSelected}, selectedAccountId=${selectedAccountId}, account.id=${account.id}, types: ${typeof selectedAccountId} vs ${typeof account.id}`);
              
              return (
              <button
                key={account.id}
                onClick={() => {
                  console.log('🎯 Compte cliqué:', account.id, `(type: ${typeof account.id})`, account.iban);
                  console.log('🎯 Avant setSelectedAccountId, selectedAccountId =', selectedAccountId);
                  setSelectedAccountId(account.id);
                  console.log('🎯 Après setSelectedAccountId, account.id =', account.id);
                }}
                className={`w-full luxury-card p-6 text-left transition-all duration-200 hover:shadow-xl hover:shadow-sky-200/40 ${
                  isSelected
                    ? 'ring-2 ring-sky-500 shadow-lg shadow-sky-200/40'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-gradient-to-br from-sky-500 to-blue-600'
                          : 'bg-gradient-to-br from-slate-100 to-slate-200'
                      }`}>
                        <svg className={`w-6 h-6 ${
                          isSelected ? 'text-white' : 'text-slate-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-lg">Compte Bancaire</h3>
                        <p className="text-sm text-slate-500 font-mono">{account.iban}</p>
                      </div>
                    </div>
                    <div className="pl-15">
                      <p className="text-xs text-slate-500 mb-1">Numéro de compte</p>
                      <p className="text-sm font-mono text-slate-700 mb-3">{account.accountNumber}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-slate-600">Solde disponible:</span>
                        <span className="text-2xl font-bold text-sky-600">{formatAmount(account.balance)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="flex-shrink-0 ml-4">
                      <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </button>
              );
            })}

            {/* Bouton de confirmation toujours visible pour debug */}
            <div className="mt-6">
              {selectedAccountId ? (
                <button
                  onClick={() => {
                    console.log('🖱️ Clic sur "Continuer avec ce compte"', selectedAccountId);
                    handleSelectAccount(selectedAccountId);
                  }}
                  disabled={saving}
                  className="w-full btn-premium py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Activation en cours...
                    </span>
                  ) : (
                    'Continuer avec ce compte'
                  )}
                </button>
              ) : (
                <div className="w-full py-4 text-center text-slate-400 border-2 border-dashed border-slate-300 rounded-lg">
                  Veuillez sélectionner un compte ci-dessus
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

