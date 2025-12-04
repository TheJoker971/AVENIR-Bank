/**
 * Page de virement et gestion bancaire - Version avec onglets
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useAccounts } from '@/presentation/hooks/useAccounts';
import { useBeneficiaries } from '@/presentation/hooks/useBeneficiaries';
import { useOperations } from '@/presentation/hooks/useOperations';
import { useActiveAccount } from '@/presentation/hooks/useActiveAccount';
import { useRouter } from 'next/navigation';
import { formatAmount, formatIban } from '@/shared/utils';
import Link from 'next/link';

type Tab = 'transfer' | 'beneficiaries' | 'iban';

export default function TransferPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { accounts, refresh: refreshAccounts } = useAccounts(user?.id || null);
  const { beneficiaries, createBeneficiary, deleteBeneficiary } = useBeneficiaries(user?.id || null);
  const { transfer, loading, error } = useOperations();
  const { activeAccount, fetchActiveAccount, triggerRefresh } = useActiveAccount();
  const router = useRouter();
  
  // État pour les onglets
  const [activeTab, setActiveTab] = useState<Tab>('transfer');
  
  // États pour le virement
  const [transferType, setTransferType] = useState<'own' | 'beneficiary'>('own');
  const [toAccountId, setToAccountId] = useState('');
  const [toBeneficiaryId, setToBeneficiaryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);

  // États pour les bénéficiaires
  const [newBenefName, setNewBenefName] = useState('');
  const [newBenefIban, setNewBenefIban] = useState('');
  const [addingBenef, setAddingBenef] = useState(false);

  // État pour copie IBAN
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    
    if (!activeAccount) {
      alert('Aucun compte actif sélectionné. Veuillez sélectionner un compte.');
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
      fromAccountId: activeAccount.id,
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
      
      // Rafraîchir les comptes
      await refreshAccounts();
      
      // Rafraîchir le compte actif (pour mettre à jour le solde)
      if (user) {
        await fetchActiveAccount(user.id);
      }
      
      // Déclencher le rafraîchissement des opérations
      triggerRefresh();
      
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleAddBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newBenefName || !newBenefIban) return;
    
    setAddingBenef(true);
    await createBeneficiary({ name: newBenefName, iban: newBenefIban });
    setNewBenefName('');
    setNewBenefIban('');
    setAddingBenef(false);
  };

  const handleDeleteBeneficiary = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce bénéficiaire ?')) {
      await deleteBeneficiary(id);
    }
  };

  const copyToClipboard = () => {
    if (activeAccount) {
      navigator.clipboard.writeText(activeAccount.iban);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadRIB = () => {
    // TODO: Implémenter la génération de PDF du RIB
    alert('Fonctionnalité de téléchargement PDF à venir');
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

  if (!isAuthenticated || !user || user.role !== 'CLIENT') {
    return null;
  }

  const toAccount = accounts.find(a => a.id.toString() === toAccountId);
  const selectedBeneficiary = beneficiaries.find(b => b.id.toString() === toBeneficiaryId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Virements & Comptes</h1>
        <p className="text-slate-600">Gérez vos virements, bénéficiaires et informations bancaires</p>
      </div>

      {/* Système d'onglets */}
      <div className="mb-8">
        <div className="border-b border-slate-200">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('transfer')}
              className={`py-4 px-2 border-b-3 font-medium text-sm transition-all duration-200 ${
                activeTab === 'transfer'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Virement
              </div>
            </button>
            <button
              onClick={() => setActiveTab('beneficiaries')}
              className={`py-4 px-2 border-b-3 font-medium text-sm transition-all duration-200 ${
                activeTab === 'beneficiaries'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Bénéficiaires
              </div>
            </button>
            <button
              onClick={() => setActiveTab('iban')}
              className={`py-4 px-2 border-b-3 font-medium text-sm transition-all duration-200 ${
                activeTab === 'iban'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Mon IBAN
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-6">
        {/* Onglet Virement */}
        {activeTab === 'transfer' && (
          <div>
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
                <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold">Erreur lors du virement</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl flex items-center gap-3">
                <svg className="w-6 h-6 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold">Virement effectué avec succès</p>
                  <p className="text-sm text-emerald-600">Votre transaction a été traitée</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="luxury-card p-6 space-y-5">
              {/* Affichage du compte actif */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Depuis votre compte
                </label>
                {activeAccount ? (
                  <div className="p-4 bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 border border-sky-200/60 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md shadow-sky-400/40">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Compte Actif</p>
                          <p className="font-mono text-sm text-slate-700 font-semibold">{formatIban(activeAccount.iban)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-0.5">Solde disponible</p>
                        <p className="text-lg font-bold text-sky-600">{formatAmount(activeAccount.balance)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm text-amber-800 mb-3">
                      Aucun compte actif sélectionné. Veuillez sélectionner un compte pour continuer.
                    </p>
                    <Link href="/select-account" className="btn-premium py-2 px-4 inline-block text-sm">
                      Sélectionner un compte
                    </Link>
                  </div>
                )}
              </div>

              {/* Type de virement */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Type de virement
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="transferType"
                      value="own"
                      checked={transferType === 'own'}
                      onChange={() => {
                        setTransferType('own');
                        setToBeneficiaryId('');
                      }}
                      className="mr-3 w-4 h-4 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-slate-700 font-medium group-hover:text-sky-600 transition-colors">Vers mes comptes</span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="transferType"
                      value="beneficiary"
                      checked={transferType === 'beneficiary'}
                      onChange={() => {
                        setTransferType('beneficiary');
                        setToAccountId('');
                      }}
                      className="mr-3 w-4 h-4 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-slate-700 font-medium group-hover:text-sky-600 transition-colors">Vers un bénéficiaire</span>
                  </label>
                </div>
              </div>

              {/* Sélection du destinataire */}
              {transferType === 'own' ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Compte créditeur
                  </label>
                  {accounts.length <= 1 ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <p className="text-sm text-slate-600">
                        Vous devez avoir au moins deux comptes pour effectuer un virement entre vos comptes.
                      </p>
                    </div>
                  ) : (
                    <>
                      <select
                        value={toAccountId}
                        onChange={(e) => setToAccountId(e.target.value)}
                        className="input-premium w-full"
                        required
                      >
                        <option value="">Sélectionner un compte</option>
                        {accounts
                          .filter(a => activeAccount && a.id !== activeAccount.id)
                          .map((account) => (
                            <option key={account.id} value={account.id.toString()}>
                              {account.accountNumber} - {formatIban(account.iban)} - {formatAmount(account.balance)}
                            </option>
                          ))}
                      </select>
                      {toAccount && (
                        <p className="mt-2 text-sm text-slate-600">
                          Solde du compte: <span className="font-semibold text-sky-700">{formatAmount(toAccount.balance)}</span>
                        </p>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Bénéficiaire
                  </label>
                  {beneficiaries.length === 0 ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <p className="text-sm text-slate-600 mb-3">
                        Vous n'avez pas encore de bénéficiaire.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('beneficiaries')}
                        className="text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors"
                      >
                        Ajouter un bénéficiaire →
                      </button>
                    </div>
                  ) : (
                    <>
                      <select
                        value={toBeneficiaryId}
                        onChange={(e) => setToBeneficiaryId(e.target.value)}
                        className="input-premium w-full"
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
                        <p className="mt-2 text-sm text-slate-600">
                          Bénéficiaire: <span className="font-semibold text-sky-700">{selectedBeneficiary.name}</span>
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Montant */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Montant (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={activeAccount?.balance || 0}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-premium w-full text-lg"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Libellé / Description <span className="text-slate-500 font-normal">(facultatif)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-premium w-full"
                  placeholder="Description du virement (facultatif)"
                />
              </div>

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={
                  loading || 
                  !activeAccount || 
                  !amount || 
                  (transferType === 'own' && !toAccountId) ||
                  (transferType === 'beneficiary' && (!toBeneficiaryId || beneficiaries.length === 0))
                }
                className="btn-premium w-full py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Traitement en cours...
                  </span>
                ) : 'Effectuer le virement'}
              </button>
            </form>
          </div>
        )}

        {/* Onglet Bénéficiaires */}
        {activeTab === 'beneficiaries' && (
          <div className="space-y-6">
            {/* Liste des bénéficiaires */}
            <div className="luxury-card p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Mes bénéficiaires</h2>
              {beneficiaries.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-slate-500 mb-4">Aucun bénéficiaire enregistré</p>
                  <p className="text-sm text-slate-400">Ajoutez votre premier bénéficiaire ci-dessous</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {beneficiaries.map((beneficiary) => (
                    <div key={beneficiary.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {beneficiary.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{beneficiary.name}</p>
                          <p className="text-sm text-slate-500 font-mono">{formatIban(beneficiary.iban)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setTransferType('beneficiary');
                            setToBeneficiaryId(beneficiary.id.toString());
                            setActiveTab('transfer');
                          }}
                          className="px-4 py-2 text-sm font-medium text-sky-600 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors duration-200"
                        >
                          Virer
                        </button>
                        <button
                          onClick={() => handleDeleteBeneficiary(beneficiary.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Supprimer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulaire d'ajout */}
            <div className="luxury-card p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Ajouter un bénéficiaire</h2>
              <form onSubmit={handleAddBeneficiary} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Nom du bénéficiaire
                  </label>
                  <input
                    type="text"
                    value={newBenefName}
                    onChange={(e) => setNewBenefName(e.target.value)}
                    className="input-premium w-full"
                    placeholder="Jean Dupont"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    IBAN
                  </label>
                  <input
                    type="text"
                    value={newBenefIban}
                    onChange={(e) => setNewBenefIban(e.target.value)}
                    className="input-premium w-full font-mono"
                    placeholder="FR76 3000 1234 5678 9012 3456 78"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={addingBenef || !newBenefName || !newBenefIban}
                  className="btn-premium w-full py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingBenef ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Ajout en cours...
                    </span>
                  ) : 'Ajouter le bénéficiaire'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Onglet Mon IBAN */}
        {activeTab === 'iban' && (
          <div>
            {activeAccount ? (
              <div className="space-y-6">
                {/* Affichage de l'IBAN */}
                <div className="luxury-card p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Mon IBAN</h2>
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-3">Numéro IBAN de votre compte actif</p>
                    <div className="inline-block bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 border-2 border-sky-200 rounded-2xl p-6 mb-4">
                      <p className="text-3xl font-mono font-bold text-slate-900 tracking-wider">
                        {formatIban(activeAccount.iban)}
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={copyToClipboard}
                        className="btn-premium py-3 px-6 text-base font-semibold flex items-center gap-2"
                      >
                        {copied ? (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copié !
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            Copier l'IBAN
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="luxury-card p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">QR Code</h2>
                  <div className="text-center">
                    <div className="inline-block p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-lg">
                      {/* Placeholder pour le QR code - À remplacer par une vraie librairie */}
                      <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                        QR Code
                        <br />
                        (À implémenter)
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-600">Scannez ce code pour obtenir mon IBAN</p>
                  </div>
                </div>

                {/* Téléchargement RIB */}
                <div className="luxury-card p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-4 text-center">Relevé d'Identité Bancaire (RIB)</h2>
                  <p className="text-center text-slate-600 mb-6">
                    Téléchargez votre RIB au format PDF pour vos démarches administratives
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={downloadRIB}
                      className="btn-premium py-3 px-8 text-base font-semibold flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Télécharger mon RIB
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="luxury-card p-12 text-center">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-slate-600 mb-4">Aucun compte actif sélectionné</p>
                <Link href="/select-account" className="btn-premium py-2 px-6 inline-block text-sm">
                  Sélectionner un compte
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
