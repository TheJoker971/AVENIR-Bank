/**
 * Page de gestion de l'épargne (Client)
 */
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useAccounts } from '@/presentation/hooks/useAccounts';
import { useSavingsTotalValue } from '@/presentation/hooks/useSavingsTotalValue';
import { useRouter } from 'next/navigation';
import { formatAmount, formatIban } from '@/shared/utils';
import { formatDateShort } from '@/shared/utils/formatDate';

export default function SavingsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { savingsAccounts, createSavingsAccount, loading, refresh } = useAccounts(user?.id || null);
  const { getTotalValue, withdrawRewards, loading: totalValueLoading } = useSavingsTotalValue();
  const [totalValues, setTotalValues] = useState<Map<number, { totalValue: number; accumulatedInterest: number }>>(new Map());
  const [withdrawingRewards, setWithdrawingRewards] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Charger les valeurs totales avec gains temps réel pour chaque compte
  useEffect(() => {
    const loadTotalValues = async () => {
      const valuesMap = new Map<number, { totalValue: number; accumulatedInterest: number }>();
      
      for (const account of savingsAccounts) {
        const totalValue = await getTotalValue(account.id);
        if (totalValue) {
          valuesMap.set(account.id, {
            totalValue: totalValue.totalValue,
            accumulatedInterest: totalValue.accumulatedInterest,
          });
        }
      }
      
      setTotalValues(valuesMap);
    };

    if (savingsAccounts.length > 0) {
      loadTotalValues();
    }
  }, [savingsAccounts, getTotalValue]);

  if (authLoading) {
    return <div className="p-8 text-center text-pearl">Chargement...</div>;
  }

  if (!isAuthenticated || !user || user.role !== 'CLIENT') {
    return null;
  }

  const handleWithdrawRewards = async (savingsAccountId: number) => {
    setWithdrawingRewards(savingsAccountId);
    setSuccessMessage(null);
    setErrorMessage(null);

    const result = await withdrawRewards(savingsAccountId);
    
    if (result instanceof Error) {
      setErrorMessage(result.message);
    } else {
      setSuccessMessage(result.message);
      // Rafraîchir les données
      await refresh();
      // Recharger les valeurs totales
      const totalValue = await getTotalValue(savingsAccountId);
      if (totalValue) {
        setTotalValues(prev => {
          const newMap = new Map(prev);
          newMap.set(savingsAccountId, {
            totalValue: totalValue.totalValue,
            accumulatedInterest: totalValue.accumulatedInterest,
          });
          return newMap;
        });
      }
    }
    
    setWithdrawingRewards(null);
  };

  return (
    <div className="p-8 text-pearl">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="font-display text-4xl font-bold text-gold">Livrets A</h1>
        <button
          onClick={createSavingsAccount}
          disabled={loading}
          className="btn-premium"
        >
          + Ouvrir un Livret A
        </button>
      </div>

      {savingsAccounts.length === 0 ? (
        <div className="text-center py-12 glass rounded-lg border border-gold/20">
          <p className="text-pearl/60 mb-4">Vous n'avez pas encore de Livret A</p>
          <button
            onClick={createSavingsAccount}
            className="btn-premium"
          >
            Ouvrir mon premier Livret A
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savingsAccounts.map((savings) => (
            <div key={savings.id} className="luxury-card rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gold mb-4">Livret A #{savings.id}</h3>
              <div className="space-y-3">
                <p className="text-sm text-pearl/60">IBAN: {formatIban(savings.iban)}</p>
                
                {/* Solde actuel */}
                <div>
                  <p className="text-xs text-pearl/40 mb-1">Solde actuel</p>
                  <p className="text-3xl font-bold text-pearl">{formatAmount(savings.balance)}</p>
                </div>

                {/* Valeur totale avec gains temps réel */}
                {totalValues.has(savings.id) && (
                  <div className="glass border border-gold/30 rounded-lg p-4 mt-3">
                    <p className="text-xs text-gold mb-1">Valeur totale estimée (avec gains)</p>
                    <p className="text-2xl font-bold text-gold">
                      {formatAmount(totalValues.get(savings.id)!.totalValue)}
                    </p>
                    {totalValues.get(savings.id)!.accumulatedInterest > 0 && (
                      <>
                        <p className="text-xs text-green-400 mt-1">
                          + {formatAmount(totalValues.get(savings.id)!.accumulatedInterest)} d'intérêts accumulés
                        </p>
                        <button
                          onClick={() => handleWithdrawRewards(savings.id)}
                          disabled={withdrawingRewards === savings.id}
                          className="mt-3 w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {withdrawingRewards === savings.id ? 'Retrait en cours...' : '💰 Retirer les récompenses'}
                        </button>
                      </>
                    )}
                  </div>
                )}

                <div className="glass border border-gold/20 rounded-lg p-3 mt-3">
                  <p className="text-sm font-medium text-gold">
                    Taux d'intérêt: {typeof savings.interestRate === 'number' ? savings.interestRate.toFixed(2) : '0.00'}%
                  </p>
                  <p className="text-xs text-pearl/60 mt-1">
                    Les intérêts sont calculés quotidiennement
                  </p>
                </div>
                <p className="text-xs text-pearl/40 mt-2">
                  Créé le {formatDateShort(savings.createdAt)}
                </p>
                <p className="text-xs text-pearl/40">
                  Dernier calcul: {formatDateShort(savings.lastInterestCalculation)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 glass border border-gold/20 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-3 text-gold">💡 À propos du Livret A</h2>
        <ul className="text-sm text-pearl/70 space-y-2">
          <li>• Rémunération garantie par la banque</li>
          <li>• Intérêts calculés quotidiennement</li>
          <li>• Taux fixé par le directeur de la banque</li>
          <li>• Vous serez notifié en cas de modification du taux</li>
        </ul>
      </div>
    </div>
  );
}

