/**
 * Page d'historique des opérations (Client)
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useAccounts } from '@/presentation/hooks/useAccounts';
import { useOperations } from '@/presentation/hooks/useOperations';
import { useRouter } from 'next/navigation';
import { formatAmount, formatIban } from '@/shared/utils';
import { formatDate } from '@/shared/utils/formatDate';
import { OperationDto } from '@/shared/dto';

export default function OperationsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { accounts } = useAccounts(user?.id || null);
  const { getAccountOperations, loading } = useOperations();
  const router = useRouter();
  
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [operations, setOperations] = useState<OperationDto[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (selectedAccountId) {
      loadOperations();
    }
  }, [selectedAccountId]);

  const loadOperations = async () => {
    if (!selectedAccountId) return;
    const ops = await getAccountOperations(parseInt(selectedAccountId));
    if (ops) {
      setOperations(ops);
    }
  };

  if (authLoading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const selectedAccount = accounts.find(a => a.id.toString() === selectedAccountId);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Historique des opérations</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionner un compte
        </label>
        <select
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
        >
          <option value="">Sélectionner un compte</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.accountNumber} - {formatIban(account.iban)}
            </option>
          ))}
        </select>
      </div>

      {selectedAccount && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Compte sélectionné</p>
          <p className="text-lg font-semibold">{selectedAccount.accountNumber}</p>
          <p className="text-sm text-gray-600">IBAN: {formatIban(selectedAccount.iban)}</p>
          <p className="text-2xl font-bold text-blue-600">Solde: {formatAmount(selectedAccount.balance)}</p>
        </div>
      )}

      {loading && <div className="text-center py-8">Chargement des opérations...</div>}

      {selectedAccountId && !loading && operations.length === 0 && (
        <div className="text-center py-8 text-gray-600">Aucune opération trouvée</div>
      )}

      {operations.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {operations.map((operation) => (
                <tr key={operation.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(operation.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${
                      operation.data.receiverIban === selectedAccount?.iban
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {operation.data.receiverIban === selectedAccount?.iban ? 'CRÉDIT' : 'DÉBIT'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                    operation.data.receiverIban === selectedAccount?.iban
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {operation.data.receiverIban === selectedAccount?.iban ? '+' : '-'}
                    {formatAmount(operation.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {operation.data.reason || 'Virement'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${
                      operation.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      operation.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {operation.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

