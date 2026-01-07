/**
 * Page de trading pour une action spécifique (style Binance)
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useStocks, useOrders } from '@/presentation/hooks/useStocks';
import { useOrderBook } from '@/presentation/hooks/useOrderBook';
import { useActiveAccount } from '@/presentation/hooks/useActiveAccount';
import { useStockRealtime } from '@/presentation/hooks/useStockRealtime';
import { usePortfolio } from '@/presentation/hooks/usePortfolio';
import { useRouter, useParams } from 'next/navigation';
import { TradingHeader } from '@/presentation/components/TradingHeader';
import { SpotTradingPanel } from '@/presentation/components/SpotTradingPanel';
import { OrderBookPanel } from '@/presentation/components/OrderBookPanel';
import { MyOrdersPanel } from '@/presentation/components/MyOrdersPanel';
import { LimitOrderModal } from '@/presentation/components/LimitOrderModal';
import './binance.css';

export default function TradingPage() {
  const params = useParams();
  const symbol = params.symbol as string;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { stocks, refresh: fetchStocks } = useStocks();
  const { orders, createOrder, cancelOrder, error: ordersError, refresh: fetchOrders } = useOrders(user?.id || null);
  const { orderBook, loading: orderBookLoading } = useOrderBook(symbol);
  const { activeAccount, fetchActiveAccount } = useActiveAccount();
  const { holdings, refresh: refreshPortfolio } = usePortfolio(user?.id || null);
  const { stockData, accountBalance, refreshTrigger } = useStockRealtime(user?.id || null, symbol);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLimitOrderModalOpen, setIsLimitOrderModalOpen] = useState(false);
  const router = useRouter();

  // Charger le compte actif
  useEffect(() => {
    if (user && isAuthenticated) {
      fetchActiveAccount(user.id);
    }
  }, [user, isAuthenticated, fetchActiveAccount]);

  // Rafraîchir les données quand il y a des mises à jour WebSocket
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('🔄 [TradingPage] Rafraîchissement après mise à jour WebSocket');
      fetchStocks();
      if (user) {
        fetchActiveAccount(user.id);
        fetchOrders();
        refreshPortfolio();
      }
    }
  }, [refreshTrigger, fetchStocks, user, fetchActiveAccount, fetchOrders, refreshPortfolio]);

  const stock = stocks.find(s => s.symbol === symbol);
  const userOrdersForStock = orders.filter(o => o.stockSymbol === symbol);
  
  // Trouver le holding pour cette action
  const currentHolding = holdings.find(h => h.stockSymbol === symbol);
  const ownedQuantity = currentHolding?.quantity || 0;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fonction pour gérer le trading spot (achat/vente direct)
  const handleSpotTrade = useCallback(async (type: 'BUY' | 'SELL', quantity: number) => {
    if (!stock) return;

    // Réinitialiser les messages
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (type === 'SELL' && quantity > ownedQuantity) {
      setErrorMessage(`Quantité insuffisante. Vous possédez ${ownedQuantity} action(s).`);
      return;
    }

    if (type === 'BUY') {
      const totalCost = (stock.currentPrice * quantity) + 1; // +1 pour frais
      if (totalCost > (activeAccount?.balance || 0)) {
        setErrorMessage(`Solde insuffisant. Requis: ${totalCost.toFixed(2)}€`);
        return;
      }
    }

    // Créer ordre au prix du marché (price: null)
    const result = await createOrder({
      stockId: stock.id,
      type: type,
      quantity: quantity,
      price: null  // TOUJOURS null pour spot trading
    });

    if (result) {
      const action = type === 'BUY' ? 'Achat' : 'Vente';
      setSuccessMessage(`✅ ${action} de ${quantity} ${stock.symbol} réussi !`);
      
      // Cacher le message après 3 secondes
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Les données seront rafraîchies via WebSocket
    } else {
      setErrorMessage(ordersError || 'Erreur lors de la transaction');
    }
  }, [stock, ownedQuantity, activeAccount, createOrder, ordersError]);

  // Fonction pour annuler un ordre
  const handleCancelOrder = useCallback(async (orderId: number) => {
    const success = await cancelOrder(orderId);
    if (success) {
      setSuccessMessage('✅ Ordre annulé avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage('Erreur lors de l\'annulation de l\'ordre');
    }
  }, [cancelOrder]);

  // Fonction pour créer un ordre limite
  const handleCreateLimitOrder = useCallback(async (type: 'BUY' | 'SELL', quantity: number, price: number) => {
    if (!stock) return;

    // Réinitialiser les messages
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (type === 'SELL' && quantity > ownedQuantity) {
      setErrorMessage(`Quantité insuffisante. Vous possédez ${ownedQuantity} action(s).`);
      throw new Error('Quantité insuffisante');
    }

    if (type === 'BUY') {
      const totalCost = (price * quantity) + 1;
      if (totalCost > (activeAccount?.balance || 0)) {
        setErrorMessage(`Solde insuffisant. Requis: ${totalCost.toFixed(2)}€`);
        throw new Error('Solde insuffisant');
      }
    }

    // Créer ordre limite (price spécifique)
    const result = await createOrder({
      stockId: stock.id,
      type: type,
      quantity: quantity,
      price: price  // Prix spécifique pour ordre limite
    });

    if (result) {
      const action = type === 'BUY' ? 'Achat' : 'Vente';
      setSuccessMessage(`✅ Ordre limite ${action.toLowerCase()} de ${quantity} ${stock.symbol} à ${price.toFixed(2)}€ placé !`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage(ordersError || 'Erreur lors de la création de l\'ordre');
      throw new Error(ordersError || 'Erreur');
    }
  }, [stock, ownedQuantity, activeAccount, createOrder, ordersError]);

  if (authLoading) {
    return <div className="loading-page">Chargement...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (!stock) {
    return (
      <div className="error-page">
        <h2>Action non trouvée</h2>
        <button onClick={() => router.push('/stocks')} className="back-button">
          Retour aux actions
        </button>
      </div>
    );
  }

  return (
    <div className="trading-page-binance">
      {/* Header global avec prix, variation */}
      <TradingHeader stock={stock} />

      {/* Messages de succès/erreur globaux */}
      {successMessage && (
        <div className="toast-message success-toast">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="toast-message error-toast">
          {errorMessage}
        </div>
      )}

      <div className="trading-grid">
        {/* Colonne 1 : Carnet d'ordres */}
        <div className="col-orderbook">
          <OrderBookPanel 
            symbol={symbol} 
            orderBook={orderBook}
            currentPrice={stock.currentPrice}
            loading={orderBookLoading}
          />
        </div>
        
        {/* Colonne 2 : Spot Trading */}
        <div className="col-spot">
          <div className="spot-section-header">
            <h2>Trading Spot</h2>
            <span className="spot-subtitle">Achat/Vente immédiat au prix du marché</span>
          </div>
          <SpotTradingPanel
            stock={stock}
            userBalance={activeAccount?.balance || 0}
            ownedQuantity={ownedQuantity}
            onTrade={handleSpotTrade}
            loading={authLoading}
          />

          {/* Bouton pour ordre limite */}
          <button 
            className="open-limit-order-btn"
            onClick={() => setIsLimitOrderModalOpen(true)}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Placer un Ordre Limite</span>
          </button>
        </div>
        
        {/* Colonne 3 : Mes ordres */}
        <div className="col-orders">
          <MyOrdersPanel 
            orders={userOrdersForStock}
            onCancelOrder={handleCancelOrder}
          />
          
          {/* Section Holdings si l'utilisateur possède des actions */}
          {ownedQuantity > 0 && currentHolding && (
            <div className="holdings-summary">
              <h4>Ma Position</h4>
              <div className="holding-card">
                <div className="holding-row">
                  <span>Quantité</span>
                  <span className="holding-value">{ownedQuantity} {symbol}</span>
                </div>
                <div className="holding-row">
                  <span>Prix moyen</span>
                  <span className="holding-value">{currentHolding.averagePurchasePrice.toFixed(2)}€</span>
                </div>
                <div className="holding-row">
                  <span>Valeur</span>
                  <span className="holding-value">{currentHolding.currentValue?.toFixed(2) || '0.00'}€</span>
                </div>
                {currentHolding.gainLoss !== undefined && (
                  <div className="holding-row">
                    <span>Gain/Perte</span>
                    <span className={`holding-value ${currentHolding.gainLoss >= 0 ? 'positive' : 'negative'}`}>
                      {currentHolding.gainLoss >= 0 ? '+' : ''}{currentHolding.gainLoss.toFixed(2)}€
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Ordre Limite */}
      <LimitOrderModal
        isOpen={isLimitOrderModalOpen}
        onClose={() => setIsLimitOrderModalOpen(false)}
        stock={stock}
        userBalance={activeAccount?.balance || 0}
        ownedQuantity={ownedQuantity}
        onCreateOrder={handleCreateLimitOrder}
      />
    </div>
  );
}
