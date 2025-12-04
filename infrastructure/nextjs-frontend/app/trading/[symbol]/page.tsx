/**
 * Page de trading pour une action spécifique (style CEX)
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useStocks, useOrders } from '@/presentation/hooks/useStocks';
import { useOrderBook } from '@/presentation/hooks/useOrderBook';
import { useActiveAccount } from '@/presentation/hooks/useActiveAccount';
import { useRouter, useParams } from 'next/navigation';
import { formatAmount } from '@/shared/utils';
import { formatDate } from '@/shared/utils/formatDate';
import Link from 'next/link';

export default function TradingPage() {
  const params = useParams();
  const symbol = params.symbol as string;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { stocks } = useStocks();
  const { orders, createOrder, cancelOrder } = useOrders(user?.id || null);
  const { orderBook, loading: orderBookLoading, triggerMatch } = useOrderBook(symbol);
  const { activeAccount, fetchActiveAccount } = useActiveAccount();
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [showMatchResult, setShowMatchResult] = useState(false);
  const [matchMessage, setMatchMessage] = useState('');
  const router = useRouter();

  // Charger le compte actif
  useEffect(() => {
    if (user && isAuthenticated) {
      fetchActiveAccount(user.id);
    }
  }, [user, isAuthenticated]);

  const stock = stocks.find(s => s.symbol === symbol);
  const userOrdersForStock = orders.filter(o => o.stockId === stock?.id);
  const pendingOrdersForStock = userOrdersForStock.filter(o => o.status === 'PENDING');
  const executedOrdersForStock = userOrdersForStock.filter(o => o.status === 'EXECUTED');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (stock && !price) {
      setPrice(stock.currentPrice.toString());
    }
  }, [stock, price]);

  if (authLoading) {
    return <div className="p-8 text-center text-slate-700">Chargement...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (!stock) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600 mb-4">Action non trouvée</p>
        <Link href="/stocks" className="text-sky-600 hover:underline">Retour aux actions</Link>
      </div>
    );
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stock) return;

    const result = await createOrder({
      stockId: stock.id,
      type: orderType,
      quantity: parseInt(quantity),
      price: parseFloat(price),
    });

    if (result) {
      setQuantity('');
    }
  };

  const handleTriggerMatch = async () => {
    const result = await triggerMatch();
    if (result) {
      setMatchMessage(`${result.message}\n${result.successCount} match(s) réussi(s), ${result.errorCount} erreur(s)`);
      setShowMatchResult(true);
      setTimeout(() => setShowMatchResult(false), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1920px] mx-auto p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/stocks" className="text-slate-600 hover:text-sky-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-bold text-slate-800">{stock.symbol}</h1>
                <span className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded text-xs font-semibold">
                  {stock.name}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">{stock.totalShares.toLocaleString()} actions totales</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Solde du compte actif */}
            {activeAccount && user?.role === 'CLIENT' && (
              <div className="px-4 py-2 bg-sky-50/80 border border-sky-200/60 rounded-lg">
                <p className="text-xs text-slate-500 mb-0.5">Solde Disponible</p>
                <p className="text-sm font-bold text-sky-600">{formatAmount(activeAccount.balance)}</p>
              </div>
            )}
            
            {user?.role === 'DIRECTOR' && (
              <button
                onClick={handleTriggerMatch}
                className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-sky-400/40 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Déclencher le Matching
              </button>
            )}
          </div>
        </div>

        {/* Message de résultat du matching */}
        {showMatchResult && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-sm text-emerald-800 whitespace-pre-line">{matchMessage}</p>
          </div>
        )}

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Carnet d'ordres - Gauche */}
          <div className="lg:col-span-4">
            <div className="luxury-card p-5 h-full">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-sky-100">
                <h2 className="text-lg font-semibold text-slate-800">Carnet d'Ordres</h2>
                {orderBook?.equilibriumPrice && (
                  <span className="text-xs text-slate-500">Prix d'équilibre: <span className="font-bold text-sky-600">{formatAmount(orderBook.equilibriumPrice)}</span></span>
                )}
              </div>

              {orderBookLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-500 border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Ordres de vente (SELL) - en haut */}
                  <div>
                    <div className="flex justify-between items-center mb-2 px-2">
                      <span className="text-xs font-semibold text-rose-600 uppercase">Vente</span>
                      <div className="flex gap-8 text-xs text-slate-500">
                        <span>Prix</span>
                        <span>Quantité</span>
                      </div>
                    </div>
                    <div className="space-y-0.5 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {orderBook?.sellOrders && orderBook.sellOrders.length > 0 ? (
                        [...orderBook.sellOrders].reverse().map((order: any, index: number) => {
                          const maxQuantity = Math.max(...orderBook.sellOrders.map((o: any) => o.quantity));
                          const widthPercentage = (order.quantity / maxQuantity) * 100;
                          return (
                            <div key={index} className="relative group hover:bg-rose-50 rounded transition-colors">
                              <div 
                                className="absolute right-0 top-0 h-full bg-rose-100/50 transition-all duration-300"
                                style={{ width: `${widthPercentage}%` }}
                              />
                              <div className="relative flex justify-between items-center px-3 py-2 text-sm">
                                <span className="font-mono font-semibold text-rose-600">{formatAmount(order.price)}</span>
                                <span className="font-mono text-slate-700">{order.quantity}</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-4 text-slate-400 text-sm">Aucun ordre de vente</div>
                      )}
                    </div>
                  </div>

                  {/* Séparateur avec prix actuel */}
                  <div className="py-3 px-3 bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg border border-sky-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Prix actuel</span>
                      <span className="font-display text-xl font-bold text-sky-600">{formatAmount(stock.currentPrice)}</span>
                    </div>
                  </div>

                  {/* Ordres d'achat (BUY) - en bas */}
                  <div>
                    <div className="flex justify-between items-center mb-2 px-2">
                      <span className="text-xs font-semibold text-emerald-600 uppercase">Achat</span>
                      <div className="flex gap-8 text-xs text-slate-500">
                        <span>Prix</span>
                        <span>Quantité</span>
                      </div>
                    </div>
                    <div className="space-y-0.5 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {orderBook?.buyOrders && orderBook.buyOrders.length > 0 ? (
                        orderBook.buyOrders.map((order: any, index: number) => {
                          const maxQuantity = Math.max(...orderBook.buyOrders.map((o: any) => o.quantity));
                          const widthPercentage = (order.quantity / maxQuantity) * 100;
                          return (
                            <div key={index} className="relative group hover:bg-emerald-50 rounded transition-colors">
                              <div 
                                className="absolute right-0 top-0 h-full bg-emerald-100/50 transition-all duration-300"
                                style={{ width: `${widthPercentage}%` }}
                              />
                              <div className="relative flex justify-between items-center px-3 py-2 text-sm">
                                <span className="font-mono font-semibold text-emerald-600">{formatAmount(order.price)}</span>
                                <span className="font-mono text-slate-700">{order.quantity}</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-4 text-slate-400 text-sm">Aucun ordre d'achat</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Formulaire de trading - Centre */}
          <div className="lg:col-span-4">
            <div className="luxury-card p-5">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Passer un Ordre</h2>
              
              <form onSubmit={handleCreateOrder} className="space-y-4">
                {/* Type d'ordre */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderType('BUY')}
                    className={`py-3 rounded-lg font-semibold transition-all duration-200 ${
                      orderType === 'BUY'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Acheter
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('SELL')}
                    className={`py-3 rounded-lg font-semibold transition-all duration-200 ${
                      orderType === 'SELL'
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Vendre
                  </button>
                </div>

                {/* Prix */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Prix unitaire (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="input-premium w-full"
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Prix du marché: {formatAmount(stock.currentPrice)}</p>
                </div>

                {/* Quantité */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Quantité</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="input-premium w-full"
                    placeholder="0"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Disponibles: {stock.availableShares.toLocaleString()}</p>
                </div>

                {/* Total */}
                {price && quantity && (
                  <div className="p-4 bg-sky-50 rounded-lg border border-sky-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">Total</span>
                      <span className="text-xl font-bold text-sky-700">{formatAmount(parseFloat(price) * parseInt(quantity || '0'))}</span>
                    </div>
                  </div>
                )}

                {/* Bouton submit */}
                <button 
                  type="submit" 
                  className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                    orderType === 'BUY'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg hover:shadow-emerald-500/40'
                      : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 hover:shadow-lg hover:shadow-rose-500/40'
                  }`}
                >
                  {orderType === 'BUY' ? 'Acheter' : 'Vendre'} {stock.symbol}
                </button>
              </form>
            </div>
          </div>

          {/* Mes ordres pour cette action - Droite */}
          <div className="lg:col-span-4">
            <div className="luxury-card p-5 h-full">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Mes Ordres</h2>
              
              {/* Ordres en attente */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  En attente ({pendingOrdersForStock.length})
                </h3>
                {pendingOrdersForStock.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">Aucun ordre en attente</p>
                ) : (
                  <div className="space-y-2">
                    {pendingOrdersForStock.map((order) => (
                      <div key={order.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-sky-300 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                            order.type === 'BUY' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            {order.type === 'BUY' ? 'Achat' : 'Vente'}
                          </span>
                          <button
                            onClick={() => cancelOrder(order.id)}
                            className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                          >
                            Annuler
                          </button>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Prix:</span>
                            <span className="font-mono font-semibold text-slate-800">{formatAmount(order.price)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Quantité:</span>
                            <span className="font-mono text-slate-800">{order.quantity}</span>
                          </div>
                          <div className="flex justify-between text-sm pt-1 border-t border-slate-200">
                            <span className="text-slate-600">Total:</span>
                            <span className="font-mono font-bold text-sky-700">{formatAmount(order.price * order.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ordres exécutés */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Exécutés ({executedOrdersForStock.length})
                </h3>
                {executedOrdersForStock.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">Aucun ordre exécuté</p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {executedOrdersForStock.map((order) => (
                      <div key={order.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-semibold ${
                            order.type === 'BUY' ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {order.type === 'BUY' ? 'Achat' : 'Vente'}
                          </span>
                          <span className="text-xs text-slate-500">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-mono text-slate-700">{order.quantity} × {formatAmount(order.price)}</span>
                          <span className="font-mono font-semibold text-slate-800">{formatAmount(order.price * order.quantity)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(203, 213, 225, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.7);
        }
      `}</style>
    </div>
  );
}

