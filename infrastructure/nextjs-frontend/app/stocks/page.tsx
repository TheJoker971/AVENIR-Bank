/**
 * Page d'affichage des actions disponibles
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useStocks } from '@/presentation/hooks/useStocks';
import { useWebSocket } from '@/presentation/hooks/useWebSocket';
import { useRouter } from 'next/navigation';
import { formatAmount } from '@/shared/utils';
import Link from 'next/link';

export default function StocksPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { stocks, loading: stocksLoading, refresh: refreshStocks } = useStocks();
  const socket = useWebSocket(user?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'available'>('name');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Rafraîchir les stocks via WebSocket lorsqu'une action est mise à jour
  useEffect(() => {
    if (socket) {
      socket.on('stockUpdated', (data: { symbol: string; currentPrice: number; availableShares: number }) => {
        console.log('⚡ [StocksPage] Stock mis à jour via WebSocket:', data);
        refreshStocks();
      });

      return () => {
        socket.off('stockUpdated');
      };
    }
  }, [socket, refreshStocks]);

  if (authLoading) {
    return <div className="p-8 text-center text-slate-700">Chargement...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Filtrer et trier les actions
  const filteredStocks = stocks
    .filter(stock => 
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return b.currentPrice - a.currentPrice;
      if (sortBy === 'available') return b.availableShares - a.availableShares;
      return 0;
    });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">Actions Disponibles</h1>
            <p className="text-sm text-slate-600 mt-1">Découvrez les actions disponibles à l'investissement</p>
          </div>
          <Link
            href="/my-orders"
            className="btn-premium px-6 py-2 text-sm"
          >
            Mes Ordres
          </Link>
        </div>

        {/* Filtres et recherche */}
        <div className="luxury-card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher une action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-premium w-full pl-10"
              />
            </div>

            {/* Tri */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Trier par:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input-premium"
              >
                <option value="name">Nom</option>
                <option value="price">Prix</option>
                <option value="available">Disponibilité</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des actions */}
      {stocksLoading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-500 border-t-transparent"></div>
            <span className="text-slate-600">Chargement des actions...</span>
          </div>
        </div>
      ) : filteredStocks.length === 0 ? (
        <div className="luxury-card p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-slate-600 font-medium">Aucune action trouvée</p>
          <p className="text-sm text-slate-500 mt-1">Essayez de modifier vos critères de recherche</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStocks.map((stock) => (
            <div key={stock.id} className="luxury-card p-6 hover:shadow-xl hover:shadow-sky-200/30 transition-all duration-200 group">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 group-hover:text-sky-700 transition-colors">{stock.symbol}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{stock.name}</p>
                </div>
                <span className="px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg text-xs font-semibold">
                  Technologie
                </span>
              </div>

              {/* Prix */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-sky-600">{formatAmount(stock.currentPrice)}</span>
                  <span className="text-sm text-slate-500">/ action</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-sky-100">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Total d'actions</p>
                  <p className="text-sm font-semibold text-slate-800">{stock.totalShares.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Disponibles</p>
                  <p className="text-sm font-semibold text-emerald-600">{stock.availableShares.toLocaleString()}</p>
                </div>
              </div>

              {/* Barre de disponibilité */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-slate-600 font-medium">Disponibilité</span>
                  <span className="text-xs text-slate-800 font-semibold">
                    {((stock.availableShares / stock.totalShares) * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gradient-to-r from-red-100 to-red-200 rounded-full overflow-hidden relative">
                  {/* Partie disponible (gradient bleu par-dessus) */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full transition-all duration-500"
                    style={{ width: `${(stock.availableShares / stock.totalShares) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-emerald-600 font-medium">
                    {stock.availableShares.toLocaleString()} disponibles
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {(stock.totalShares - stock.availableShares).toLocaleString()} vendues
                  </span>
                </div>
              </div>

              {/* Bouton */}
              <Link
                href={`/trading/${stock.symbol}`}
                className="block w-full py-2.5 text-center bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-sky-400/40"
              >
                Passer un ordre
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Footer info */}
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-500">
          {filteredStocks.length} action{filteredStocks.length > 1 ? 's' : ''} {searchTerm && 'trouvée(s)'}
        </p>
      </div>
    </div>
  );
}
