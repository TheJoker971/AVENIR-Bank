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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-sky-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADVISE') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">💳 Gestion des crédits</h1>
            <p className="text-slate-600">Attribuez et gérez les crédits de vos clients</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-medium hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Attribuer un crédit
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            {error}
          </div>
        )}

        {loading && credits.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-sky-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-600">Chargement...</p>
          </div>
        ) : credits.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <p className="text-slate-600 mb-4">Aucun crédit attribué</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-medium hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-sm inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Attribuer le premier crédit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {credits.map((credit) => (
              <div key={credit.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-slate-900">Crédit #{credit.id}</h3>
                  <p className="text-sm text-slate-500">Client ID: {credit.clientId}</p>
                </div>
                <div className="space-y-2 mb-6">
                  <p className="text-sm text-slate-700">
                    <span className="text-slate-500">Montant:</span> <span className="font-semibold">{formatAmount(credit.principalAmount)}</span>
                  </p>
                  <p className="text-sm text-slate-700">
                    <span className="text-slate-500">Taux annuel:</span> <span className="font-semibold">{(credit.annualInterestRate * 100).toFixed(2)}%</span>
                  </p>
                  <p className="text-sm text-slate-700">
                    <span className="text-slate-500">Assurance:</span> <span className="font-semibold">{(credit.insuranceRate * 100).toFixed(2)}%</span>
                  </p>
                  <p className="text-sm text-slate-700">
                    <span className="text-slate-500">Mensualité:</span> <span className="font-semibold text-sky-600">{formatAmount(credit.monthlyPayment)}</span>
                  </p>
                  <p className="text-sm text-slate-700">
                    <span className="text-slate-500">Restant:</span> <span className="font-semibold text-sky-600">{formatAmount(credit.remainingBalance)}</span>
                  </p>
                  <p className="text-sm text-slate-700 flex items-center gap-2">
                    <span className="text-slate-500">Statut:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      credit.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      credit.status === 'PAID_OFF' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {credit.status}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Prochain paiement: {formatDate(credit.nextPaymentDate)}
                  </p>
                </div>
                {credit.status === 'ACTIVE' && (
                  <button
                    onClick={() => {
                      setSelectedCredit(credit.id);
                      setShowPaymentModal(true);
                    }}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-medium hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
                  >
                    Traiter un paiement
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal création crédit */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 text-center">💰 Attribuer un crédit</h2>
              <form onSubmit={handleCreateCredit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">ID Client</label>
                    <input
                      type="number"
                      value={formData.userId}
                      onChange={(e) => setFormData({...formData, userId: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                      placeholder="ID du client"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Montant (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Taux annuel (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.annualRate}
                      onChange={(e) => setFormData({...formData, annualRate: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Assurance (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.insurance}
                      onChange={(e) => setFormData({...formData, insurance: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Durée (mois)</label>
                    <input
                      type="number"
                      value={formData.durationMonths}
                      onChange={(e) => setFormData({...formData, durationMonths: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2.5 text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded-xl transition-all duration-200 font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-medium hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 text-center">💳 Traiter un paiement</h2>
              <form onSubmit={handleProcessPayment}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Compte à débiter</label>
                  <select
                    value={paymentAccountId}
                    onChange={(e) => setPaymentAccountId(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
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
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedCredit(null);
                    }}
                    className="px-6 py-2.5 text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded-xl transition-all duration-200 font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-medium hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
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
