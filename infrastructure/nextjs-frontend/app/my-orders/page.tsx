/**
 * Page de gestion des ordres (Mes Ordres)
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useStocks, useOrders } from '@/presentation/hooks/useStocks';
import { useRouter } from 'next/navigation';
import { formatAmount } from '@/shared/utils';
import { formatDate } from '@/shared/utils/formatDate';
import Link from 'next/link';

export default function MyOrdersPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { stocks } = useStocks();
  const { orders, cancelOrder, error: ordersError } = useOrders(user?.id || null);
  const [cancelSuccess, setCancelSuccess] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return <div className="p-8 text-center text-slate-700">Chargement...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const executedOrders = orders.filter(o => o.status === 'EXECUTED');

  const handleCancelOrder = async (orderId: number) => {
    setCancelError(null);
    setCancelSuccess(null);
    
    const success = await cancelOrder(orderId);
    if (success) {
      setCancelSuccess(orderId);
      setTimeout(() => setCancelSuccess(null), 3000);
    } else {
      setCancelError(ordersError || 'Erreur lors de l\'annulation de l\'ordre');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">Mes Ordres</h1>
          <p className="text-sm text-slate-600 mt-1">Vue d'ensemble de tous vos ordres d'achat et de vente</p>
        </div>
        <Link
          href="/stocks"
          className="btn-premium px-6 py-2 text-sm"
        >
          Explorer les Actions
        </Link>
      </div>

      {/* Ordres en attente */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Ordres en attente
        </h2>
        <div className="luxury-card p-6">
          {pendingOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="font-medium">Aucun ordre en attente</p>
              <p className="text-sm mt-1">Créez votre premier ordre pour commencer</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sky-100">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Action</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Type</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Prix</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Quantité</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Total</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map((order) => {
                    const stock = stocks.find(s => s.id === order.stockId);
                    return (
                      <tr key={order.id} className="border-b border-sky-50 hover:bg-sky-50/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-800">{stock?.symbol}</div>
                          <div className="text-xs text-slate-500">{stock?.name}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            order.type === 'BUY' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {order.type === 'BUY' ? 'Achat' : 'Vente'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-semibold text-slate-800">{formatAmount(order.price)}</td>
                        <td className="py-4 px-4 text-right font-mono text-slate-700">{order.quantity}</td>
                        <td className="py-4 px-4 text-right font-mono font-semibold text-sky-700">{formatAmount(order.price * order.quantity)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/trading/${stock?.symbol}`}
                              className="px-3 py-1.5 text-xs font-medium text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
                            >
                              Voir
                            </Link>
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="px-3 py-1.5 text-xs font-medium text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                            >
                              Annuler
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Ordres exécutés */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Historique des ordres
        </h2>
        <div className="luxury-card p-6">
          {executedOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">Aucun ordre exécuté</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sky-100">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Action</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Type</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Prix</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Quantité</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {executedOrders.map((order) => {
                    const stock = stocks.find(s => s.id === order.stockId);
                    return (
                      <tr key={order.id} className="border-b border-sky-50 hover:bg-sky-50/30 transition-colors">
                        <td className="py-3 px-4 text-sm text-slate-600">{formatDate(order.createdAt)}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{stock?.symbol}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            order.type === 'BUY' ? 'text-emerald-700' : 'text-rose-700'
                          }`}>
                            {order.type === 'BUY' ? 'Achat' : 'Vente'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-sm text-slate-700">{formatAmount(order.price)}</td>
                        <td className="py-3 px-4 text-right font-mono text-sm text-slate-700">{order.quantity}</td>
                        <td className="py-3 px-4 text-right font-mono text-sm font-semibold text-slate-800">{formatAmount(order.price * order.quantity)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-500">
          {pendingOrders.length + executedOrders.length} ordre{(pendingOrders.length + executedOrders.length) > 1 ? 's' : ''} au total
        </p>
      </div>
    </div>
  );
}
