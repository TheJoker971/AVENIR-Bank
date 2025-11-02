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
    return <div className="p-8 text-center">Chargement...</div>;
  }

  if (!isAuthenticated || user?.role !== 'DIRECTOR') {
    return null;
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des actions</h1>
        <div className="space-x-4">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800">
            ← Retour
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            + Créer une action
          </button>
        </div>
      </div>

      {stocksError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {stocksError}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbole</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions disponibles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stocks.map((stock) => (
                <tr key={stock.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{stock.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{stock.symbol}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{stock.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {formatAmount(stock.currentPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stock.availableShares} / {stock.totalShares}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {stock.available ? (
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">Disponible</span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">Indisponible</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Créer une action</h2>
            <form onSubmit={handleCreateStock}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Symbole</label>
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="AAPL"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prix initial (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.initialPrice}
                    onChange={(e) => setFormData({...formData, initialPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre total d'actions</label>
                  <input
                    type="number"
                    value={formData.totalShares}
                    onChange={(e) => setFormData({...formData, totalShares: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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

