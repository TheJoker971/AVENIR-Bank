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
    return <div className="p-8 text-center text-pearl">Chargement...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const selectedAccount = accounts.find(a => a.id.toString() === selectedAccountId);

  return (
    <div className="p-8 text-pearl">
      <h1 className="font-display text-4xl font-bold text-gold mb-8">Historique des opérations</h1>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gold mb-3">
          Sélectionner un compte
        </label>
        <select
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          className="input-premium"
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
        <div className="mb-8 luxury-card rounded-xl p-6">
          <p className="text-sm text-pearl/60 mb-1">Compte sélectionné</p>
          <p className="text-2xl font-bold text-gold mb-2">{selectedAccount.accountNumber}</p>
          <p className="text-sm text-pearl/60 mb-3">IBAN: {formatIban(selectedAccount.iban)}</p>
          <p className="text-3xl font-bold text-pearl">Solde: {formatAmount(selectedAccount.balance)}</p>
        </div>
      )}

      {loading && <div className="text-center py-8 text-pearl/60">Chargement des opérations...</div>}

      {selectedAccountId && !loading && operations.length === 0 && (
        <div className="text-center py-12 glass rounded-lg border border-gold/20">
          <p className="text-pearl/60">Aucune opération trouvée</p>
        </div>
      )}

      {operations.length > 0 && (
        <div className="luxury-card rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gold/20">
            <thead className="glass">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Montant</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {operations.map((operation) => (
                <tr key={operation.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-pearl/70">
                    {formatDate(operation.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      operation.data.receiverIban === selectedAccount?.iban
                        ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                        : 'bg-red-900/30 text-red-400 border border-red-500/30'
                    }`}>
                      {operation.data.receiverIban === selectedAccount?.iban ? 'CRÉDIT' : 'DÉBIT'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap font-bold text-lg ${
                    operation.data.receiverIban === selectedAccount?.iban
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}>
                    {operation.data.receiverIban === selectedAccount?.iban ? '+' : '-'}
                    {formatAmount(operation.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-pearl">
                    {operation.data.reason || 'Virement'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      operation.status === 'COMPLETED' ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                      operation.status === 'FAILED' ? 'bg-red-900/30 text-red-400 border border-red-500/30' :
                      'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
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
