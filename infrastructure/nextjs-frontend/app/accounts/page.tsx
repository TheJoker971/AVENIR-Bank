/**
 * Page de gestion des comptes
 */
'use client';

import { useState } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useAccounts } from '@/presentation/hooks/useAccounts';
import { useRouter } from 'next/navigation';
import { formatAmount, formatIban } from '@/shared/utils';
import { formatDateShort } from '@/shared/utils/formatDate';

export default function AccountsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { accounts, savingsAccounts, loading, error, createAccount, deleteAccount, createSavingsAccount } = useAccounts(user?.id || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [accountName, setAccountName] = useState('');
  const router = useRouter();

  if (authLoading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  if (!isAuthenticated || !user) {
    router.push('/login');
    return null;
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createAccount(accountName);
    if (result) {
      setShowCreateModal(false);
      setAccountName('');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Mes Comptes</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Créer un compte
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{account.accountNumber}</h3>
              <button
                onClick={() => deleteAccount(account.id)}
                className="text-red-600 hover:text-red-800"
              >
                Supprimer
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">IBAN: {formatIban(account.iban)}</p>
              <p className="text-2xl font-bold text-gray-900">{formatAmount(account.balance)}</p>
              <p className="text-xs text-gray-500">Créé le {formatDateShort(account.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Livrets A</h2>
          <button
            onClick={createSavingsAccount}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            + Ouvrir un Livret A
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savingsAccounts.map((savings) => (
            <div key={savings.id} className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
              <h3 className="text-xl font-semibold mb-4">Livret A #{savings.id}</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">IBAN: {formatIban(savings.iban)}</p>
                <p className="text-2xl font-bold text-gray-900">{formatAmount(savings.balance)}</p>
                <p className="text-sm text-green-700">Taux: {(savings.interestRate * 100).toFixed(2)}%</p>
                <p className="text-xs text-gray-500">Créé le {formatDateShort(savings.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Créer un compte</h2>
            <form onSubmit={handleCreateAccount}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du compte
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

