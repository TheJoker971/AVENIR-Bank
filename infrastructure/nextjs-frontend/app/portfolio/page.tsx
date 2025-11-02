/**
 * Page de gestion du portefeuille (Client)
 */
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { usePortfolio } from '@/presentation/hooks/usePortfolio';
import { useRouter } from 'next/navigation';
import { formatAmount } from '@/shared/utils';

export default function PortfolioPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { portfolio, holdings, totalValue, totalGainLoss, loading, error } = usePortfolio(user?.id || null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  if (!isAuthenticated || !user || user.role !== 'CLIENT') {
    return null;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mon Portefeuille</h1>

      {/* Résumé global */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg shadow p-6 border border-blue-200">
          <h2 className="text-sm font-medium text-blue-600 mb-2">Valeur Totale du Portefeuille</h2>
          <p className="text-3xl font-bold text-blue-700">{formatAmount(totalValue)}</p>
        </div>
        <div className={`rounded-lg shadow p-6 border ${
          totalGainLoss >= 0 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <h2 className={`text-sm font-medium mb-2 ${
            totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            Gains/Pertes Non Réalisés
          </h2>
          <p className={`text-3xl font-bold ${
            totalGainLoss >= 0 ? 'text-green-700' : 'text-red-700'
          }`}>
            {totalGainLoss >= 0 ? '+' : ''}{formatAmount(totalGainLoss)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-sm font-medium text-gray-600 mb-2">Nombre de Positions</h2>
          <p className="text-3xl font-bold text-gray-900">{holdings.length}</p>
        </div>
      </div>

      {/* Détail des holdings */}
      {holdings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">Vous n'avez pas encore d'actions dans votre portefeuille</p>
          <button
            onClick={() => router.push('/stocks')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Investir en Actions
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Détail de mes Positions</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix d'achat moyen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix actuel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valeur actuelle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gain/Perte</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {holdings.map((holding) => (
                  <tr key={holding.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-900">{holding.stockSymbol}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{holding.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {formatAmount(holding.averagePurchasePrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {formatAmount(holding.currentPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {formatAmount(holding.currentValue)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                      holding.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {holding.gainLoss >= 0 ? '+' : ''}{formatAmount(holding.gainLoss)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

