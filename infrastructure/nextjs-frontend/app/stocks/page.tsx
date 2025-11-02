/**
 * Page de gestion des investissements (Actions)
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useStocks, useOrders } from '@/presentation/hooks/useStocks';
import { useOrderBook } from '@/presentation/hooks/useOrderBook';
import { useRouter } from 'next/navigation';
import { formatAmount } from '@/shared/utils';
import { formatDate } from '@/shared/utils/formatDate';

export default function StocksPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { stocks, loading: stocksLoading } = useStocks();
  const { orders, createOrder, cancelOrder } = useOrders(user?.id || null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showOrderBookModal, setShowOrderBookModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<number | null>(null);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(null);
  const { orderBook, loading: orderBookLoading, triggerMatch } = useOrderBook(selectedStockSymbol);
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const router = useRouter();

  if (authLoading) {
    return <div className="p-8 text-center text-pearl">Chargement...</div>;
  }

  if (!isAuthenticated || !user) {
    router.push('/login');
    return null;
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock) return;

    const result = await createOrder({
      stockId: selectedStock,
      type: orderType,
      quantity: parseInt(quantity),
      price: parseFloat(price),
    });

    if (result) {
      setShowOrderModal(false);
      setQuantity('');
      setPrice('');
    }
  };

  return (
    <div className="p-8 text-pearl">
      <h1 className="font-display text-4xl font-bold text-gold mb-8">Investissements - Actions</h1>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-gold">Actions disponibles</h2>
        {stocksLoading ? (
          <div className="text-center py-8 text-pearl/60">Chargement...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((stock) => (
              <div key={stock.id} className="luxury-card rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-pearl">{stock.symbol}</h3>
                    <p className="text-sm text-pearl/60">{stock.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedStock(stock.id);
                      setPrice(stock.currentPrice.toString());
                      setShowOrderModal(true);
                    }}
                    className="btn-premium text-sm px-4 py-2"
                  >
                    Acheter
                  </button>
                </div>
                <div className="space-y-3">
                  <p className="text-3xl font-bold text-gold">{formatAmount(stock.currentPrice)}</p>
                  <p className="text-sm text-pearl/60">
                    Disponible: {stock.availableShares} / {stock.totalShares}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedStockSymbol(stock.symbol);
                      setShowOrderBookModal(true);
                    }}
                    className="mt-2 text-xs text-gold hover:text-yellow-400 transition-colors"
                  >
                    📊 Voir le carnet d'ordres
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6 text-gold">Mes Ordres</h2>
        {orders.length === 0 ? (
          <p className="text-pearl/60">Aucun ordre pour le moment</p>
        ) : (
          <div className="luxury-card rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gold/20">
              <thead className="glass">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Quantité</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Prix</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-pearl">{order.stockSymbol}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.orderType === 'BUY' 
                          ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                          : 'bg-red-900/30 text-red-400 border border-red-500/30'
                      }`}>
                        {order.orderType === 'BUY' ? 'ACHAT' : 'VENTE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-pearl">{order.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-pearl">{formatAmount(order.price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'EXECUTED' ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                        order.status === 'CANCELLED' ? 'bg-gray-900/30 text-gray-400 border border-gray-500/30' :
                        'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-pearl/60">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => cancelOrder(order.id)}
                          className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded-lg border border-red-500/30 hover:border-red-500/50 transition-all"
                        >
                          Annuler
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal création d'ordre */}
      {showOrderModal && selectedStock && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass border border-gold/30 rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="font-display text-3xl font-bold mb-6 text-gold text-center">
              {orderType === 'BUY' ? 'Acheter' : 'Vendre'} des actions
            </h2>
            <form onSubmit={handleCreateOrder} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-pearl/80 mb-2">Type d'ordre</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as 'BUY' | 'SELL')}
                  className="input-premium w-full"
                >
                  <option value="BUY">Achat</option>
                  <option value="SELL">Vente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-pearl/80 mb-2">Quantité</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="input-premium w-full"
                  required
                  min="1"
                  placeholder="Nombre d'actions"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pearl/80 mb-2">Prix unitaire</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input-premium w-full"
                  required
                  min="0"
                  placeholder="Prix par action"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-6 py-2 text-pearl/70 hover:text-pearl border border-pearl/20 hover:border-gold/40 rounded-lg transition-all duration-300 hover:bg-gold/5"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-premium"
                >
                  Créer l'ordre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal du carnet d'ordres */}
      {showOrderBookModal && selectedStockSymbol && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass border border-gold/30 rounded-xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-3xl font-bold text-gold">Carnet d'Ordres - {selectedStockSymbol}</h2>
              <button
                onClick={() => {
                  setShowOrderBookModal(false);
                  setSelectedStockSymbol(null);
                }}
                className="text-pearl/60 hover:text-pearl text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="mb-6 luxury-card p-6 rounded-xl text-center">
              <p className="text-sm text-pearl/60 mb-2">Prix d'équilibre</p>
              <p className="font-display text-5xl font-bold text-gold">{formatAmount(orderBook.equilibriumPrice || 0)}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ordres d'achat */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-green-400">📈 Ordres d'Achat (BUY)</h3>
                {orderBookLoading ? (
                  <p className="text-pearl/60">Chargement...</p>
                ) : orderBook.buyOrders && orderBook.buyOrders.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {orderBook.buyOrders.map((order: any, index: number) => (
                      <div key={index} className="glass border border-green-500/30 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-green-400">{formatAmount(order.price)}</span>
                          <span className="text-pearl/70">{order.quantity} actions</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-pearl/60">Aucun ordre d'achat</p>
                )}
              </div>

              {/* Ordres de vente */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-red-400">📉 Ordres de Vente (SELL)</h3>
                {orderBookLoading ? (
                  <p className="text-pearl/60">Chargement...</p>
                ) : orderBook.sellOrders && orderBook.sellOrders.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {orderBook.sellOrders.map((order: any, index: number) => (
                      <div key={index} className="glass border border-red-500/30 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-red-400">{formatAmount(order.price)}</span>
                          <span className="text-pearl/70">{order.quantity} actions</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-pearl/60">Aucun ordre de vente</p>
                )}
              </div>
            </div>

            {user?.role === 'DIRECTOR' && (
              <div className="mt-8">
                <button
                  onClick={async () => {
                    const result = await triggerMatch();
                    if (result) {
                      alert(`${result.message}\n${result.successCount} match(s) réussi(s), ${result.errorCount} erreur(s)`);
                    }
                  }}
                  className="btn-premium w-full py-3 text-lg"
                >
                  🔄 Déclencher le Matching Manuellement
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
