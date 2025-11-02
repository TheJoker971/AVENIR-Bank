/**
 * Page de gestion des crédits (Conseiller)
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useCredits } from '@/presentation/hooks/useCredits';
import { useAccounts } from '@/presentation/hooks/useAccounts';
import { useRouter } from 'next/navigation';
import { formatAmount } from '@/shared/utils';
import { formatDate } from '@/shared/utils/formatDate';

export default function CreditsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { credits, loading, error, createCredit, processPayment } = useCredits(user?.id || null);
  const { accounts } = useAccounts(user?.id || null);
  const router = useRouter();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    annualRate: '',
    insurance: '',
    durationMonths: '',
  });
  const [paymentAccountId, setPaymentAccountId] = useState('');

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'ADVISE')) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleCreateCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createCredit({
      clientId: parseInt(formData.userId),
      amount: parseFloat(formData.amount),
      annualRate: parseFloat(formData.annualRate) / 100,
      insurance: parseFloat(formData.insurance) / 100,
      durationMonths: parseInt(formData.durationMonths),
    });

    if (result) {
      setShowCreateModal(false);
      setFormData({
        userId: '',
        amount: '',
        annualRate: '',
        insurance: '',
        durationMonths: '',
      });
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCredit || !paymentAccountId) return;
    
    const success = await processPayment(selectedCredit, parseInt(paymentAccountId));
    if (success) {
      setShowPaymentModal(false);
      setSelectedCredit(null);
      setPaymentAccountId('');
    }
  };

  if (authLoading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  if (!isAuthenticated || user?.role !== 'ADVISE') {
    return null;
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des crédits</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          + Attribuer un crédit
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading && credits.length === 0 ? (
        <div className="text-center py-8">Chargement...</div>
      ) : credits.length === 0 ? (
        <div className="text-center py-8 text-gray-600">Aucun crédit attribué</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credits.map((credit) => (
            <div key={credit.id} className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Crédit #{credit.id}</h3>
                <p className="text-sm text-gray-600">Client ID: {credit.clientId}</p>
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <span className="font-medium">Montant:</span> {formatAmount(credit.principalAmount)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Taux annuel:</span> {(credit.annualInterestRate * 100).toFixed(2)}%
                </p>
                <p className="text-sm">
                  <span className="font-medium">Assurance:</span> {(credit.insuranceRate * 100).toFixed(2)}%
                </p>
                <p className="text-sm">
                  <span className="font-medium">Mensualité:</span> {formatAmount(credit.monthlyPayment)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Restant:</span> {formatAmount(credit.remainingBalance)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Statut:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    credit.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    credit.status === 'PAID_OFF' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {credit.status}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  Prochain paiement: {formatDate(credit.nextPaymentDate)}
                </p>
              </div>
              {credit.status === 'ACTIVE' && (
                <button
                  onClick={() => {
                    setSelectedCredit(credit.id);
                    setShowPaymentModal(true);
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Traiter un paiement
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Attribuer un crédit</h2>
            <form onSubmit={handleCreateCredit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID Client</label>
                  <input
                    type="number"
                    value={formData.userId}
                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="ID du client"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Montant (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Taux annuel (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.annualRate}
                    onChange={(e) => setFormData({...formData, annualRate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assurance (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.insurance}
                    onChange={(e) => setFormData({...formData, insurance: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Durée (mois)</label>
                  <input
                    type="number"
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({...formData, durationMonths: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && selectedCredit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Traiter un paiement</h2>
            <form onSubmit={handleProcessPayment}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Compte à débiter</label>
                <select
                  value={paymentAccountId}
                  onChange={(e) => setPaymentAccountId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Sélectionner un compte</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountNumber} - {formatAmount(account.balance)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedCredit(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Traiter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

