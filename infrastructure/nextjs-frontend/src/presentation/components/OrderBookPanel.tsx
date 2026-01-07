/**
 * Panneau du carnet d'ordres (Order Book)
 * Style Binance
 */
'use client';

import { formatAmount } from '@/shared/utils';

interface Order {
  price: number;
  quantity: number;
}

interface OrderBookData {
  buyOrders: Order[];
  sellOrders: Order[];
  equilibriumPrice: number | null;
}

interface OrderBookPanelProps {
  symbol: string;
  orderBook: OrderBookData | null;
  currentPrice: number;
  loading?: boolean;
}

export const OrderBookPanel: React.FC<OrderBookPanelProps> = ({
  symbol,
  orderBook,
  currentPrice,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="orderbook-panel">
        <div className="panel-header">
          <h3>Carnet d'Ordres</h3>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  const sellOrders = orderBook?.sellOrders || [];
  const buyOrders = orderBook?.buyOrders || [];
  const equilibriumPrice = orderBook?.equilibriumPrice;

  // Calculer le max pour les barres de progression
  const maxSellQty = sellOrders.length > 0 ? Math.max(...sellOrders.map(o => o.quantity)) : 1;
  const maxBuyQty = buyOrders.length > 0 ? Math.max(...buyOrders.map(o => o.quantity)) : 1;

  return (
    <div className="orderbook-panel">
      <div className="panel-header">
        <h3>Carnet d'Ordres</h3>
        <span className="symbol-badge">{symbol}</span>
      </div>

      {/* En-tête colonnes */}
      <div className="orderbook-header">
        <span>Prix (€)</span>
        <span className="text-right">Quantité</span>
      </div>

      {/* Ordres de VENTE (rouge) */}
      <div className="orders-section sell-orders">
        {sellOrders.length > 0 ? (
          // Afficher en ordre inverse (du plus élevé au plus bas)
          [...sellOrders].reverse().map((order, index) => {
            const widthPercentage = (order.quantity / maxSellQty) * 100;
            return (
              <div key={`sell-${index}`} className="order-row">
                <div 
                  className="order-background sell-bg" 
                  style={{ width: `${widthPercentage}%` }}
                ></div>
                <span className="price sell-price">{formatAmount(order.price)}</span>
                <span className="quantity">{order.quantity}</span>
              </div>
            );
          })
        ) : (
          <div className="empty-orders">
            <p>Aucun ordre de vente</p>
          </div>
        )}
      </div>

      {/* Prix actuel / Équilibre */}
      <div className="current-price-section">
        <div className="price-display">
          <span className="current-label">Prix actuel</span>
          <span className="current-value">{formatAmount(currentPrice)}</span>
        </div>
        {equilibriumPrice && equilibriumPrice !== currentPrice && (
          <div className="equilibrium-info">
            <span className="eq-label">Équilibre:</span>
            <span className="eq-value">{formatAmount(equilibriumPrice)}</span>
          </div>
        )}
      </div>

      {/* Ordres d'ACHAT (vert) */}
      <div className="orders-section buy-orders">
        {buyOrders.length > 0 ? (
          buyOrders.map((order, index) => {
            const widthPercentage = (order.quantity / maxBuyQty) * 100;
            return (
              <div key={`buy-${index}`} className="order-row">
                <div 
                  className="order-background buy-bg" 
                  style={{ width: `${widthPercentage}%` }}
                ></div>
                <span className="price buy-price">{formatAmount(order.price)}</span>
                <span className="quantity">{order.quantity}</span>
              </div>
            );
          })
        ) : (
          <div className="empty-orders">
            <p>Aucun ordre d'achat</p>
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="orderbook-legend">
        <div className="legend-item">
          <div className="legend-dot sell-dot"></div>
          <span>Vente</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot buy-dot"></div>
          <span>Achat</span>
        </div>
      </div>
    </div>
  );
};

