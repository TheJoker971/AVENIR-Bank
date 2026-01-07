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
    return <div className="p-8 text-center text-pearl">Chargement...</div>;
  }

  if (!isAuthenticated || !user || user.role !== 'CLIENT') {
    return null;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-pearl">
      <h1 className="font-display text-4xl font-bold text-gold mb-8">Mon Portefeuille</h1>

      {/* Résumé global */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="luxury-card rounded-xl p-6">
          <h2 className="text-sm font-medium text-gold mb-2">Valeur Totale du Portefeuille</h2>
          <p className="text-4xl font-bold text-pearl">{formatAmount(totalValue)}</p>
        </div>
        <div className={`luxury-card rounded-xl p-6 ${
          totalGainLoss >= 0 
            ? 'border-green-500/30' 
            : 'border-red-500/30'
        }`}>
          <h2 className={`text-sm font-medium mb-2 ${
            totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            Gains/Pertes Non Réalisés
          </h2>
          <p className={`text-4xl font-bold ${
            totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {totalGainLoss >= 0 ? '+' : ''}{formatAmount(totalGainLoss)}
          </p>
        </div>
        <div className="luxury-card rounded-xl p-6">
          <h2 className="text-sm font-medium text-gold mb-2">Nombre de Positions</h2>
          <p className="text-4xl font-bold text-pearl">{holdings.length}</p>
        </div>
      </div>

      {/* Détail des holdings */}
      {holdings.length === 0 ? (
        <div className="text-center py-12 glass rounded-lg border border-gold/20">
          <p className="text-pearl/60 mb-4">Vous n'avez pas encore d'actions dans votre portefeuille</p>
          <button
            onClick={() => router.push('/stocks')}
            className="btn-premium"
          >
            Investir en Actions
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gold">Détail de mes Positions</h2>
          <div className="luxury-card rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gold/20">
              <thead className="glass">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Quantité</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Prix d'achat moyen</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Prix actuel</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Valeur actuelle</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Gain/Perte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {holdings.map((holding) => (
                  <tr key={holding.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-pearl">{holding.stockSymbol}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-pearl">{holding.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-pearl">
                      {formatAmount(holding.averagePurchasePrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-pearl">
                      {formatAmount(holding.currentPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-pearl">
                      {formatAmount(holding.currentValue)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                      holding.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'
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

