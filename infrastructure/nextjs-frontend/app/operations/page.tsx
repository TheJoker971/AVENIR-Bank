/**
 * Page d'historique des opérations (Client)
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useActiveAccount } from '@/presentation/hooks/useActiveAccount';
import { useOperations } from '@/presentation/hooks/useOperations';
import { useRouter } from 'next/navigation';
import { formatAmount, formatIban } from '@/shared/utils';
import { formatDate } from '@/shared/utils/formatDate';
import { OperationDto } from '@/shared/dto';
import Link from 'next/link';

export default function OperationsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { activeAccount, fetchActiveAccount, refreshTrigger } = useActiveAccount();
  const { getAccountOperations, loading } = useOperations();
  const router = useRouter();
  
  const [operations, setOperations] = useState<OperationDto[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Charger le compte actif au montage
  useEffect(() => {
    if (user && isAuthenticated) {
      fetchActiveAccount(user.id);
    }
  }, [user, isAuthenticated]);

  // Charger les opérations quand le compte actif change ou quand un rafraîchissement est demandé
  useEffect(() => {
    if (activeAccount) {
      console.log('🔄 [Operations] Chargement des opérations pour compte actif:', activeAccount.id, activeAccount.iban);
      loadOperations();
    } else {
      setOperations([]);
    }
  }, [activeAccount, refreshTrigger]);

  const loadOperations = async () => {
    if (!activeAccount) return;
    console.log('📡 [Operations] Appel API pour compte:', activeAccount.id);
    const ops = await getAccountOperations(activeAccount.id);
    console.log('📊 [Operations] Opérations reçues:', ops?.length || 0);
    if (ops) {
      // Trier par date décroissante (les plus récentes en premier)
      const sortedOps = [...ops].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Décroissant
      });
      setOperations(sortedOps);
    } else {
      setOperations([]);
    }
  };

  if (authLoading) {
    return <div className="p-8 text-center text-slate-700">Chargement...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent mb-8">
        Historique des opérations
      </h1>

      {/* Affichage du compte actif */}
      {activeAccount ? (
        <div className="mb-8 p-6 bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 border border-sky-200/60 rounded-2xl shadow-md shadow-sky-200/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md shadow-sky-400/40">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 font-medium">Compte Actif</p>
                <p className="font-mono text-sm text-slate-700 font-semibold">{formatIban(activeAccount.iban)}</p>
                <p className="text-xs text-slate-500 mt-1">N° {activeAccount.accountNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-1">Solde disponible</p>
              <p className="text-3xl font-bold text-sky-600">{formatAmount(activeAccount.balance)}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-amber-800 font-semibold">Aucun compte actif sélectionné</p>
          </div>
          <p className="text-sm text-amber-700 mb-4">
            Veuillez sélectionner un compte actif pour consulter vos opérations.
          </p>
          <Link href="/select-account" className="btn-premium py-2 px-4 inline-block">
            Sélectionner un compte
          </Link>
        </div>
      )}

      {loading && <div className="text-center py-8 text-slate-600">Chargement des opérations...</div>}

      {activeAccount && !loading && operations.length === 0 && (
        <div className="text-center py-12 luxury-card rounded-2xl border border-sky-200">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-600 font-semibold mb-2">Aucune opération</p>
          <p className="text-sm text-slate-500">Aucune transaction trouvée sur ce compte</p>
        </div>
      )}

      {operations.length > 0 && (
        <div className="luxury-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-sky-100">
              <thead className="bg-sky-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-sky-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-sky-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-sky-700 uppercase tracking-wider">Montant</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-sky-700 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-sky-700 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50">
                {operations.map((operation) => {
                  // Normaliser les IBANs (retirer les espaces pour la comparaison)
                  const normalizeIban = (iban: string) => iban.replace(/\s/g, '').toUpperCase();
                  const senderIban = normalizeIban(operation.transferData.senderIban);
                  const receiverIban = normalizeIban(operation.transferData.receiverIban);
                  const activeIban = activeAccount?.iban ? normalizeIban(activeAccount.iban) : '';
                  
                  // Déterminer si c'est un crédit (on reçoit) ou un débit (on envoie)
                  const isCredit = receiverIban === activeIban;
                  const isDebit = senderIban === activeIban;
                  
                  console.log('🔍 [Operations] Comparaison IBAN:', {
                    operationId: operation.id,
                    senderIban,
                    receiverIban,
                    activeIban,
                    isCredit,
                    isDebit,
                    senderName: `${operation.transferData.senderFirstName} ${operation.transferData.senderLastName}`,
                    receiverName: `${operation.transferData.receiverFirstName} ${operation.transferData.receiverLastName}`
                  });
                  
                  // Si on est le receiver → crédit, sinon débit
                  const otherParty = isCredit 
                    ? `${operation.transferData.senderFirstName} ${operation.transferData.senderLastName}`
                    : `${operation.transferData.receiverFirstName} ${operation.transferData.receiverLastName}`;
                  
                  return (
                    <tr key={operation.id} className="hover:bg-sky-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {formatDate(operation.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isCredit
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {isCredit ? 'CRÉDIT' : 'DÉBIT'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap font-bold text-lg ${
                        isCredit ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {isCredit ? '+' : '-'}
                        {formatAmount(operation.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <div>
                          {operation.transferData.reason && (
                            <p className="font-medium">{operation.transferData.reason}</p>
                          )}
                          <p className="text-xs text-slate-500 mt-0.5">
                            {isCredit ? 'De : ' : 'Vers : '}{otherParty}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          operation.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          operation.status === 'FAILED' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                          'bg-orange-100 text-orange-700 border border-orange-200'
                        }`}>
                          {operation.status === 'COMPLETED' ? 'Complétée' : 
                           operation.status === 'FAILED' ? 'Échouée' :
                           operation.status === 'PENDING' ? 'En attente' :
                           operation.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
