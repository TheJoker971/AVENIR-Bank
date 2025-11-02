/**
 * Page de gestion des actions (Directeur)
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useStocks } from '@/presentation/hooks/useStocks';
import { useRouter } from 'next/navigation';
import { formatAmount } from '@/shared/utils';
import Link from 'next/link';

export default function AdminStocksPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { stocks, loading, refresh, createStock, error: stocksError } = useStocks();
  const router = useRouter();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    initialPrice: '',
    totalShares: '',
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'DIRECTOR')) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleCreateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await createStock({
      symbol: formData.symbol,
      name: formData.name,
      initialPrice: parseFloat(formData.initialPrice),
      totalShares: parseInt(formData.totalShares),
    });

    if (result) {
      setShowCreateModal(false);
      setFormData({
        symbol: '',
        name: '',
        initialPrice: '',
        totalShares: '',
      });
    }
  };

  if (authLoading) {
    return <div className="p-8 text-center text-pearl">Chargement...</div>;
  }

  if (!isAuthenticated || user?.role !== 'DIRECTOR') {
    return null;
  }

  return (
    <div className="p-8 text-pearl">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="font-display text-4xl font-bold text-gold">Gestion des actions</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-premium"
          >
            + Créer une action
          </button>
          <Link href="/admin" className="px-6 py-2 text-pearl/70 hover:text-pearl border border-pearl/20 hover:border-gold/40 rounded-lg transition-all duration-300 hover:bg-gold/5">
            ← Retour
          </Link>
        </div>
      </div>

      {stocksError && (
        <div className="mb-6 bg-red-900/20 border border-red-700 text-red-400 px-6 py-4 rounded-xl">
          {stocksError}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-pearl/60">Chargement...</div>
      ) : (
        <div className="luxury-card rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gold/20">
            <thead className="glass">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Symbole</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Nom</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Prix actuel</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Actions disponibles</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {stocks.map((stock) => (
                <tr key={stock.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pearl">{stock.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gold">{stock.symbol}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-pearl">{stock.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-400">
                    {formatAmount(stock.currentPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-pearl/70">
                    {stock.availableShares} / {stock.totalShares}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {stock.available ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-900/30 text-green-400 border border-green-500/30">Disponible</span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-900/30 text-red-400 border border-red-500/30">Indisponible</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal création action */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass border border-gold/30 rounded-xl p-8 max-w-md w-full">
            <h2 className="font-display text-3xl font-bold mb-6 text-gold text-center">Créer une action</h2>
            <form onSubmit={handleCreateStock}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gold mb-2">Symbole</label>
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                    className="input-premium w-full"
                    placeholder="AAPL"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold mb-2">Nom</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-premium w-full"
                    placeholder="Apple Inc."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold mb-2">Prix initial (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.initialPrice}
                    onChange={(e) => setFormData({...formData, initialPrice: e.target.value})}
                    className="input-premium w-full"
                    placeholder="150.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold mb-2">Nombre total d'actions</label>
                  <input
                    type="number"
                    value={formData.totalShares}
                    onChange={(e) => setFormData({...formData, totalShares: e.target.value})}
                    className="input-premium w-full"
                    placeholder="10000"
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
    </div>
  );
}
