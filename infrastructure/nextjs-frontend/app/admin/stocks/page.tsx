/**
 * Page de gestion des actions (Directeur uniquement)
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { StockApiAdapter } from '@/infrastructure/api/StockApiAdapter';
import { StockDto } from '@/shared/dto';
import { formatAmount } from '@/shared/utils';

const stockService = new StockApiAdapter();

export default function AdminStocksPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [stocks, setStocks] = useState<StockDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockDto | null>(null);
  
  // Form data
  const [editFormData, setEditFormData] = useState({
    name: '',
    symbol: '',
    totalShares: '',
  });
  
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'DIRECTOR')) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    setLoading(true);
    setError(null);
    
    const result = await stockService.getStocks();
    if (result instanceof Error) {
      setError(result.message);
    } else {
      setStocks(result);
    }
    
    setLoading(false);
  };

  const handleEditClick = (stock: StockDto) => {
    setSelectedStock(stock);
    setEditFormData({
      name: stock.name,
      symbol: stock.symbol,
      totalShares: stock.totalShares.toString(),
    });
    setShowEditModal(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleDeleteClick = (stock: StockDto) => {
    setSelectedStock(stock);
    setShowDeleteModal(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock) return;

    setProcessing(true);
    setError(null);
    setSuccessMessage(null);

    const updateData: any = {};
    
    // Ne mettre à jour que les champs modifiés
    if (editFormData.name !== selectedStock.name) {
      updateData.name = editFormData.name;
    }
    if (editFormData.symbol !== selectedStock.symbol) {
      updateData.symbol = editFormData.symbol;
    }
    if (parseInt(editFormData.totalShares) !== selectedStock.totalShares) {
      updateData.totalShares = parseInt(editFormData.totalShares);
    }

    if (Object.keys(updateData).length === 0) {
      setError('Aucune modification détectée');
      setProcessing(false);
      return;
    }

    const result = await stockService.updateStock(selectedStock.symbol, updateData);
    
    if (result instanceof Error) {
      setError(result.message);
    } else {
      setSuccessMessage(`L'action ${result.symbol} a été modifiée avec succès`);
      setShowEditModal(false);
      await loadStocks();
    }
    
    setProcessing(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStock) return;

    setProcessing(true);
    setError(null);
    setSuccessMessage(null);

    const result = await stockService.deleteStock(selectedStock.symbol);
    
    if (result instanceof Error) {
      setError(result.message);
    } else {
      setSuccessMessage(result.message);
      setShowDeleteModal(false);
      await loadStocks();
    }
    
    setProcessing(false);
  };

  if (authLoading) {
    return <div className="p-8 text-center text-pearl">Chargement...</div>;
  }

  if (!isAuthenticated || user?.role !== 'DIRECTOR') {
    return null;
  }

  return (
    <div className="p-8 text-pearl">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-gold">Gestion des Actions</h1>
        <p className="text-pearl/60 mt-2">Modifier ou supprimer les actions disponibles</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/20 border border-red-700 text-red-400 px-6 py-4 rounded-xl">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 bg-green-900/20 border border-green-700 text-green-400 px-6 py-4 rounded-xl">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-pearl/60">Chargement...</div>
      ) : stocks.length === 0 ? (
        <div className="text-center py-12 glass rounded-lg border border-gold/20">
          <p className="text-pearl/60">Aucune action disponible</p>
        </div>
      ) : (
        <div className="luxury-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gold/10 border-b border-gold/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gold">Symbole</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gold">Nom</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gold">Prix Actuel</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gold">Total Actions</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gold">Disponibles</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gold">Vendues</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {stocks.map((stock) => {
                  const soldShares = stock.totalShares - stock.availableShares;
                  const availability = ((stock.availableShares / stock.totalShares) * 100).toFixed(1);
                  
                  return (
                    <tr key={stock.id} className="hover:bg-gold/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-gold">{stock.symbol}</span>
                      </td>
                      <td className="px-6 py-4 text-pearl">{stock.name}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-pearl/60 text-xs mr-1">Prix:</span>
                        <span className="font-semibold text-pearl">{formatAmount(stock.currentPrice)}</span>
                        <div className="text-xs text-pearl/40 mt-1">(non modifiable)</div>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-pearl">
                        {stock.totalShares.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-green-400 font-semibold">
                          {stock.availableShares.toLocaleString()}
                        </span>
                        <div className="text-xs text-pearl/40 mt-1">({availability}%)</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-red-400 font-semibold">
                          {soldShares.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEditClick(stock)}
                            className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg text-sm transition-all duration-300"
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteClick(stock)}
                            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-lg text-sm transition-all duration-300"
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && selectedStock && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass border border-gold/30 rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="font-display text-3xl font-bold mb-6 text-gold text-center">
              Modifier l'action
            </h2>
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gold mb-2">Symbole</label>
                  <input
                    type="text"
                    value={editFormData.symbol}
                    onChange={(e) => setEditFormData({...editFormData, symbol: e.target.value.toUpperCase()})}
                    className="input-premium w-full"
                    placeholder="AAPL"
                    required
                    maxLength={10}
                  />
                  <p className="text-xs text-pearl/40 mt-1">Le symbole doit être unique</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold mb-2">Nom</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    className="input-premium w-full"
                    placeholder="Apple Inc."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold mb-2">Total d'actions</label>
                  <input
                    type="number"
                    value={editFormData.totalShares}
                    onChange={(e) => setEditFormData({...editFormData, totalShares: e.target.value})}
                    className="input-premium w-full"
                    min={selectedStock.totalShares - selectedStock.availableShares}
                    required
                  />
                  <p className="text-xs text-pearl/40 mt-1">
                    Minimum: {(selectedStock.totalShares - selectedStock.availableShares).toLocaleString()} 
                    {' '}(actions déjà vendues)
                  </p>
                </div>
                <div className="glass border border-gold/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-gold mb-1">Prix actuel</p>
                  <p className="text-2xl font-bold text-pearl">{formatAmount(selectedStock.currentPrice)}</p>
                  <p className="text-xs text-pearl/40 mt-1">
                    Le prix est calculé automatiquement selon l'offre et la demande
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 text-pearl/70 hover:text-pearl border border-pearl/20 hover:border-gold/40 rounded-lg transition-all duration-300 hover:bg-gold/5"
                  disabled={processing}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-premium"
                  disabled={processing}
                >
                  {processing ? 'Modification...' : 'Modifier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && selectedStock && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass border border-red-500/30 rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="font-display text-3xl font-bold mb-6 text-red-400 text-center">
              ⚠️ Supprimer l'action
            </h2>
            <div className="mb-6">
              <p className="text-pearl mb-4">
                Êtes-vous sûr de vouloir supprimer l'action <span className="font-bold text-gold">{selectedStock.symbol}</span> ?
              </p>
              <div className="glass border border-gold/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-pearl/80">
                  <strong className="text-gold">{selectedStock.name}</strong>
                </p>
                <p className="text-xs text-pearl/60 mt-1">
                  Prix: {formatAmount(selectedStock.currentPrice)}
                </p>
                <p className="text-xs text-pearl/60">
                  Actions disponibles: {selectedStock.availableShares.toLocaleString()} / {selectedStock.totalShares.toLocaleString()}
                </p>
              </div>
              <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
                <p className="text-sm text-red-400 font-semibold mb-2">⚠️ Conditions de suppression:</p>
                <ul className="text-xs text-red-300 space-y-1 list-disc list-inside">
                  <li>Aucun ordre en attente ne doit exister</li>
                  <li>Aucun client ne doit posséder d'actions</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2 text-pearl/70 hover:text-pearl border border-pearl/20 hover:border-gold/40 rounded-lg transition-all duration-300 hover:bg-gold/5"
                disabled={processing}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300"
                disabled={processing}
              >
                {processing ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
