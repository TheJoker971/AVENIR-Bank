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
  const { savingsAccounts, createSavingsAccount, loading } = useAccounts(user?.id || null);
  const { getTotalValue, loading: totalValueLoading } = useSavingsTotalValue();
  const [totalValues, setTotalValues] = useState<Map<number, { totalValue: number; accumulatedInterest: number }>>(new Map());
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
    return <div className="p-8 text-center">Chargement...</div>;
  }

  if (!isAuthenticated || !user || user.role !== 'CLIENT') {
    return null;
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Livrets A</h1>
        <button
          onClick={createSavingsAccount}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          + Ouvrir un Livret A
        </button>
      </div>

      {savingsAccounts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">Vous n'avez pas encore de Livret A</p>
          <button
            onClick={createSavingsAccount}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Ouvrir mon premier Livret A
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savingsAccounts.map((savings) => (
            <div key={savings.id} className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
              <h3 className="text-xl font-semibold mb-4">Livret A #{savings.id}</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">IBAN: {formatIban(savings.iban)}</p>
                
                {/* Solde actuel */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Solde actuel</p>
                  <p className="text-2xl font-bold text-gray-900">{formatAmount(savings.balance)}</p>
                </div>

                {/* Valeur totale avec gains temps réel */}
                {totalValues.has(savings.id) && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                    <p className="text-xs text-blue-600 mb-1">Valeur totale estimée (avec gains)</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {formatAmount(totalValues.get(savings.id)!.totalValue)}
                    </p>
                    {totalValues.get(savings.id)!.accumulatedInterest > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        + {formatAmount(totalValues.get(savings.id)!.accumulatedInterest)} d'intérêts accumulés
                      </p>
                    )}
                  </div>
                )}

                <div className="bg-green-100 rounded p-2 mt-3">
                  <p className="text-sm font-medium text-green-800">
                    Taux d'intérêt: {typeof savings.interestRate === 'number' ? (savings.interestRate * 100).toFixed(2) : '0.00'}%
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Les intérêts sont calculés quotidiennement
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Créé le {formatDateShort(savings.createdAt)}
                </p>
                <p className="text-xs text-gray-500">
                  Dernier calcul: {formatDateShort(savings.lastInterestCalculation)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2">💡 À propos du Livret A</h2>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Rémunération garantie par la banque</li>
          <li>• Intérêts calculés quotidiennement</li>
          <li>• Taux fixé par le directeur de la banque</li>
          <li>• Vous serez notifié en cas de modification du taux</li>
        </ul>
      </div>
    </div>
  );
}

