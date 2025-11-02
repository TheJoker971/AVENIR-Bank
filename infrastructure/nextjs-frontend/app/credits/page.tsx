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
    return <div className="p-8 text-center text-pearl">Chargement...</div>;
  }

  if (!isAuthenticated || user?.role !== 'ADVISE') {
    return null;
  }

  return (
    <div className="p-8 text-pearl">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="font-display text-4xl font-bold text-gold">Gestion des crédits</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-premium"
        >
          + Attribuer un crédit
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/20 border border-red-700 text-red-400 px-6 py-4 rounded-xl">
          {error}
        </div>
      )}

      {loading && credits.length === 0 ? (
        <div className="text-center py-8 text-pearl/60">Chargement...</div>
      ) : credits.length === 0 ? (
        <div className="text-center py-12 glass rounded-lg border border-gold/20">
          <p className="text-pearl/60">Aucun crédit attribué</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credits.map((credit) => (
            <div key={credit.id} className="luxury-card rounded-xl p-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gold">Crédit #{credit.id}</h3>
                <p className="text-sm text-pearl/60">Client ID: {credit.clientId}</p>
              </div>
              <div className="space-y-2 mb-6">
                <p className="text-sm text-pearl">
                  <span className="text-pearl/60">Montant:</span> <span className="font-semibold">{formatAmount(credit.principalAmount)}</span>
                </p>
                <p className="text-sm text-pearl">
                  <span className="text-pearl/60">Taux annuel:</span> <span className="font-semibold">{(credit.annualInterestRate * 100).toFixed(2)}%</span>
                </p>
                <p className="text-sm text-pearl">
                  <span className="text-pearl/60">Assurance:</span> <span className="font-semibold">{(credit.insuranceRate * 100).toFixed(2)}%</span>
                </p>
                <p className="text-sm text-pearl">
                  <span className="text-pearl/60">Mensualité:</span> <span className="font-semibold text-gold">{formatAmount(credit.monthlyPayment)}</span>
                </p>
                <p className="text-sm text-pearl">
                  <span className="text-pearl/60">Restant:</span> <span className="font-semibold text-gold">{formatAmount(credit.remainingBalance)}</span>
                </p>
                <p className="text-sm text-pearl">
                  <span className="text-pearl/60">Statut:</span>
                  <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    credit.status === 'ACTIVE' ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                    credit.status === 'PAID_OFF' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' :
                    'bg-red-900/30 text-red-400 border border-red-500/30'
                  }`}>
                    {credit.status}
                  </span>
                </p>
                <p className="text-xs text-pearl/40 mt-2">
                  Prochain paiement: {formatDate(credit.nextPaymentDate)}
                </p>
              </div>
              {credit.status === 'ACTIVE' && (
                <button
                  onClick={() => {
                    setSelectedCredit(credit.id);
                    setShowPaymentModal(true);
                  }}
                  className="btn-premium w-full"
                >
                  Traiter un paiement
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal création crédit */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass border border-gold/30 rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="font-display text-3xl font-bold mb-6 text-gold text-center">Attribuer un crédit</h2>
            <form onSubmit={handleCreateCredit}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gold mb-2">ID Client</label>
                  <input
                    type="number"
                    value={formData.userId}
                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                    className="input-premium w-full"
                    placeholder="ID du client"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold mb-2">Montant (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="input-premium w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold mb-2">Taux annuel (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.annualRate}
                    onChange={(e) => setFormData({...formData, annualRate: e.target.value})}
                    className="input-premium w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold mb-2">Assurance (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.insurance}
                    onChange={(e) => setFormData({...formData, insurance: e.target.value})}
                    className="input-premium w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold mb-2">Durée (mois)</label>
                  <input
                    type="number"
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({...formData, durationMonths: e.target.value})}
                    className="input-premium w-full"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 text-pearl/70 hover:text-pearl border border-pearl/20 hover:border-gold/40 rounded-lg transition-all duration-300 hover:bg-gold/5"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-premium"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal traitement paiement */}
      {showPaymentModal && selectedCredit && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass border border-gold/30 rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="font-display text-3xl font-bold mb-6 text-gold text-center">Traiter un paiement</h2>
            <form onSubmit={handleProcessPayment}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gold mb-2">Compte à débiter</label>
                <select
                  value={paymentAccountId}
                  onChange={(e) => setPaymentAccountId(e.target.value)}
                  className="input-premium w-full"
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
                  className="px-6 py-2 text-pearl/70 hover:text-pearl border border-pearl/20 hover:border-gold/40 rounded-lg transition-all duration-300 hover:bg-gold/5"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-premium"
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
