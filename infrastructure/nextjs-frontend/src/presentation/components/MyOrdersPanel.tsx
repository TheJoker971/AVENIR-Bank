/**
 * Panneau Mes Ordres (pending + historique)
 * Style Binance
 */
'use client';

import { useState } from 'react';
import { formatAmount } from '@/shared/utils';
import { formatDate } from '@/shared/utils/formatDate';

interface OrderDto {
  id: number;
  stockId: number;
  stockSymbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  createdAt: string;
}

interface MyOrdersPanelProps {
  orders: OrderDto[];
  onCancelOrder?: (orderId: number) => Promise<void>;
  loading?: boolean;
}

export const MyOrdersPanel: React.FC<MyOrdersPanelProps> = ({
  orders,
  onCancelOrder,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [cancelling, setCancelling] = useState<number | null>(null);

  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const historyOrders = orders.filter(o => o.status === 'EXECUTED' || o.status === 'CANCELLED');

  const handleCancel = async (orderId: number) => {
    if (!onCancelOrder || cancelling) return;
    
    setCancelling(orderId);
    try {
      await onCancelOrder(orderId);
    } finally {
      setCancelling(null);
    }
  };

  const displayOrders = activeTab === 'pending' ? pendingOrders : historyOrders;

  return (
    <div className="my-orders-panel">
      <div className="panel-header">
        <h3>Mes Ordres</h3>
      </div>

      {/* Onglets */}
      <div className="tabs-container-small">
        <button
          onClick={() => setActiveTab('pending')}
          className={`tab-small ${activeTab === 'pending' ? 'active' : ''}`}
        >
          En attente ({pendingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`tab-small ${activeTab === 'history' ? 'active' : ''}`}
        >
          Historique ({historyOrders.length})
        </button>
      </div>

      {/* Liste des ordres */}
      <div className="orders-list">
        {loading ? (
          <div className="loading-state-small">
            <div className="spinner-small"></div>
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="empty-state">
            <p>
              {activeTab === 'pending' 
                ? 'Aucun ordre en attente' 
                : 'Aucun historique'}
            </p>
          </div>
        ) : (
          displayOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-type-badge">
                  <span className={`badge ${order.type === 'BUY' ? 'buy-badge' : 'sell-badge'}`}>
                    {order.type === 'BUY' ? 'ACHAT' : 'VENTE'}
                  </span>
                  <span className="symbol">{order.stockSymbol}</span>
                </div>
                {order.status === 'PENDING' && onCancelOrder && (
                  <button
                    onClick={() => handleCancel(order.id)}
                    className="cancel-btn"
                    disabled={cancelling === order.id}
                  >
                    {cancelling === order.id ? '...' : '✕'}
                  </button>
                )}
              </div>

              <div className="order-details">
                <div className="detail-row">
                  <span className="label">Prix</span>
                  <span className="value">{formatAmount(order.price)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Quantité</span>
                  <span className="value">{order.quantity}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Total</span>
                  <span className="value bold">{formatAmount(order.price * order.quantity)}</span>
                </div>
                {order.status !== 'PENDING' && (
                  <div className="detail-row">
                    <span className="label">Statut</span>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status === 'EXECUTED' ? 'Exécuté' : 'Annulé'}
                    </span>
                  </div>
                )}
              </div>

              <div className="order-footer">
                <span className="date">{formatDate(order.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

