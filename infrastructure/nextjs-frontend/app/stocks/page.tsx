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
    return <div className="p-8 text-center">Chargement...</div>;
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
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Investissements - Actions</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Actions disponibles</h2>
        {stocksLoading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((stock) => (
              <div key={stock.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{stock.symbol}</h3>
                    <p className="text-sm text-gray-600">{stock.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedStock(stock.id);
                      setPrice(stock.currentPrice.toString());
                      setShowOrderModal(true);
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Acheter
                  </button>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-green-600">{formatAmount(stock.currentPrice)}</p>
                  <p className="text-sm text-gray-600">
                    Disponible: {stock.availableShares} / {stock.totalShares}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedStockSymbol(stock.symbol);
                      setShowOrderBookModal(true);
                    }}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Voir le carnet d'ordres
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Mes Ordres</h2>
        {orders.length === 0 ? (
          <p className="text-gray-600">Aucun ordre pour le moment</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{order.stockSymbol}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.orderType === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {order.orderType === 'BUY' ? 'ACHAT' : 'VENTE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatAmount(order.price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.status === 'EXECUTED' ? 'bg-green-100 text-green-800' :
                        order.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => cancelOrder(order.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
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

      {showOrderModal && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {orderType === 'BUY' ? 'Acheter' : 'Vendre'} des actions
            </h2>
            <form onSubmit={handleCreateOrder}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as 'BUY' | 'SELL')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="BUY">Achat</option>
                  <option value="SELL">Vente</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  min="1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix unitaire</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  min="0"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Carnet d'Ordres - {selectedStockSymbol}</h2>
              <button
                  onClick={() => {
                    setShowOrderBookModal(false);
                    setSelectedStockSymbol(null);
                  }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Prix d'équilibre</p>
              <p className="text-2xl font-bold text-blue-700">{formatAmount(orderBook.equilibriumPrice || 0)}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Ordres d'achat */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-700">Ordres d'Achat (BUY)</h3>
                {orderBookLoading ? (
                  <p className="text-gray-500">Chargement...</p>
                ) : orderBook.buyOrders && orderBook.buyOrders.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {orderBook.buyOrders.map((order: any, index: number) => (
                      <div key={index} className="bg-green-50 border border-green-200 rounded p-3">
                        <div className="flex justify-between">
                          <span className="font-medium">{formatAmount(order.price)}</span>
                          <span className="text-gray-600">{order.quantity} actions</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucun ordre d'achat</p>
                )}
              </div>

              {/* Ordres de vente */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-700">Ordres de Vente (SELL)</h3>
                {orderBookLoading ? (
                  <p className="text-gray-500">Chargement...</p>
                ) : orderBook.sellOrders && orderBook.sellOrders.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {orderBook.sellOrders.map((order: any, index: number) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded p-3">
                        <div className="flex justify-between">
                          <span className="font-medium">{formatAmount(order.price)}</span>
                          <span className="text-gray-600">{order.quantity} actions</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucun ordre de vente</p>
                )}
              </div>
            </div>

            {user?.role === 'DIRECTOR' && (
              <div className="mt-6">
                <button
                  onClick={async () => {
                    const result = await triggerMatch();
                    if (result) {
                      alert(`${result.message}\n${result.successCount} match(s) réussi(s), ${result.errorCount} erreur(s)`);
                    }
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Déclencher le Matching Manuellement
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

