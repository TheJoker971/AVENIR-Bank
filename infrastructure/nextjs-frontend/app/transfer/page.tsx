/**
 * Page de virement intrabancaire (Client)
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useAccounts } from '@/presentation/hooks/useAccounts';
import { useBeneficiaries } from '@/presentation/hooks/useBeneficiaries';
import { useOperations } from '@/presentation/hooks/useOperations';
import { useRouter } from 'next/navigation';
import { formatAmount, formatIban } from '@/shared/utils';
import Link from 'next/link';

export default function TransferPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { accounts, refresh: refreshAccounts } = useAccounts(user?.id || null);
  const { beneficiaries } = useBeneficiaries(user?.id || null);
  const { transfer, loading, error } = useOperations();
  const router = useRouter();
  
  const [transferType, setTransferType] = useState<'own' | 'beneficiary'>('own');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [toBeneficiaryId, setToBeneficiaryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    
    const fromAccount = accounts.find(a => a.id.toString() === fromAccountId);
    if (!fromAccount) {
      return;
    }

    let receiverIban: string;
    let receiverName: string;

    if (transferType === 'own') {
      const toAccount = accounts.find(a => a.id.toString() === toAccountId);
      if (!toAccount) {
        return;
      }
      receiverIban = toAccount.iban;
      receiverName = `${user?.firstname} ${user?.lastname}`;
    } else {
      const beneficiary = beneficiaries.find(b => b.id.toString() === toBeneficiaryId);
      if (!beneficiary) {
        return;
      }
      receiverIban = beneficiary.iban;
      receiverName = beneficiary.name;
    }

    const result = await transfer({
      fromAccountId: parseInt(fromAccountId),
      receiverIban,
      receiverName,
      amount: parseFloat(amount),
      description,
    });

    if (result) {
      setSuccess(true);
      setAmount('');
      setDescription('');
      setToAccountId('');
      setToBeneficiaryId('');
      await refreshAccounts();
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  if (authLoading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  if (!isAuthenticated || !user || user.role !== 'CLIENT') {
    return null;
  }

  const fromAccount = accounts.find(a => a.id.toString() === fromAccountId);
  const toAccount = accounts.find(a => a.id.toString() === toAccountId);
  const selectedBeneficiary = beneficiaries.find(b => b.id.toString() === toBeneficiaryId);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Effectuer un virement</h1>
        <Link href="/beneficiaries" className="text-blue-600 hover:text-blue-800 text-sm">
          Gérer les bénéficiaires →
        </Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
          ✅ Virement effectué avec succès !
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Compte débiteur
          </label>
          <select
            value={fromAccountId}
            onChange={(e) => setFromAccountId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            required
          >
            <option value="">Sélectionner un compte</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.accountNumber} - {formatIban(account.iban)} - Solde: {formatAmount(account.balance)}
              </option>
            ))}
          </select>
          {fromAccount && (
            <p className="mt-1 text-sm text-gray-600">
              Solde disponible: {formatAmount(fromAccount.balance)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de virement
          </label>
          <div className="flex space-x-4 mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="transferType"
                value="own"
                checked={transferType === 'own'}
                onChange={(e) => {
                  setTransferType('own');
                  setToBeneficiaryId('');
                }}
                className="mr-2"
              />
              <span>Vers mes comptes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="transferType"
                value="beneficiary"
                checked={transferType === 'beneficiary'}
                onChange={(e) => {
                  setTransferType('beneficiary');
                  setToAccountId('');
                }}
                className="mr-2"
              />
              <span>Vers un bénéficiaire</span>
            </label>
          </div>
        </div>

        {transferType === 'own' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compte créditeur
            </label>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner un compte</option>
              {accounts.filter(a => a.id.toString() !== fromAccountId).map((account) => (
                <option key={account.id} value={account.id}>
                  {account.accountNumber} - {formatIban(account.iban)}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bénéficiaire
            </label>
            {beneficiaries.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="text-sm text-yellow-800 mb-2">
                  Vous n'avez pas encore de bénéficiaire.
                </p>
                <Link href="/beneficiaries" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Ajouter un bénéficiaire →
                </Link>
              </div>
            ) : (
              <>
                <select
                  value={toBeneficiaryId}
                  onChange={(e) => setToBeneficiaryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner un bénéficiaire</option>
                  {beneficiaries.map((beneficiary) => (
                    <option key={beneficiary.id} value={beneficiary.id}>
                      {beneficiary.name} - {formatIban(beneficiary.iban)}
                    </option>
                  ))}
                </select>
                {selectedBeneficiary && (
                  <p className="mt-1 text-sm text-gray-600">
                    Bénéficiaire: {selectedBeneficiary.name}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Montant (€)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={fromAccount?.balance || 0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Libellé / Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            placeholder="Description du virement"
            required
          />
        </div>

        <button
          type="submit"
          disabled={
            loading || 
            !fromAccountId || 
            !amount || 
            (transferType === 'own' && !toAccountId) ||
            (transferType === 'beneficiary' && (!toBeneficiaryId || beneficiaries.length === 0))
          }
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Traitement...' : 'Effectuer le virement'}
        </button>
      </form>
    </div>
  );
}

