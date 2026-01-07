/**
 * Modal pour placer un ordre limite (à prix spécifique)
 */
'use client';

import { useState, useEffect } from 'react';
import { formatAmount } from '@/shared/utils';

interface StockDto {
  id: number;
  symbol: string;
  name: string;
  currentPrice: number;
  availableShares: number;
}

interface LimitOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: StockDto;
  userBalance: number;
  ownedQuantity: number;
  onCreateOrder: (type: 'BUY' | 'SELL', quantity: number, price: number) => Promise<void>;
}

export const LimitOrderModal: React.FC<LimitOrderModalProps> = ({
  isOpen,
  onClose,
  stock,
  userBalance,
  ownedQuantity,
  onCreateOrder
}) => {
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialiser le prix avec le prix actuel
  useEffect(() => {
    if (isOpen && !price) {
      setPrice(stock.currentPrice.toString());
    }
  }, [isOpen, stock.currentPrice, price]);

  // Reset au changement de type
  useEffect(() => {
    setQuantity('');
  }, [orderType]);

  if (!isOpen) return null;

  const fees = 1;
  const quantityNum = parseFloat(quantity || '0');
  const priceNum = parseFloat(price || '0');
  const total = (priceNum * quantityNum) + (orderType === 'BUY' ? fees : -fees);

  const canSubmit = quantityNum > 0 && priceNum > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await onCreateOrder(orderType, quantityNum, priceNum);
      // Reset et fermer
      setQuantity('');
      setPrice(stock.currentPrice.toString());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="limit-order-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <h3>Placer un Ordre Limite</h3>
            <span className="modal-subtitle">
              {stock.symbol} - {stock.name}
            </span>
          </div>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Type d'ordre */}
          <div className="tabs-container">
            <button 
              onClick={() => setOrderType('BUY')} 
              className={`tab-button ${orderType === 'BUY' ? 'active-buy' : ''}`}
            >
              Ordre d'Achat
            </button>
            <button 
              onClick={() => setOrderType('SELL')} 
              className={`tab-button ${orderType === 'SELL' ? 'active-sell' : ''}`}
            >
              Ordre de Vente
            </button>
          </div>

          {/* Infos */}
          <div className="modal-info-box">
            <div className="info-row-small">
              <span>Prix actuel</span>
              <span className="info-value">{formatAmount(stock.currentPrice)}</span>
            </div>
            {orderType === 'BUY' ? (
              <div className="info-row-small">
                <span>Solde disponible</span>
                <span className="info-value">{formatAmount(userBalance)}</span>
              </div>
            ) : (
              <div className="info-row-small">
                <span>Actions possédées</span>
                <span className="info-value">{ownedQuantity} {stock.symbol}</span>
              </div>
            )}
          </div>

          {/* Prix limite */}
          <div className="form-group">
            <label>Prix Limite (€)</label>
            <input 
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="150.50"
              min="0"
              step="0.01"
              className="modal-input"
            />
            <div className="input-hint">
              {priceNum > 0 && priceNum !== stock.currentPrice && (
                <span className={priceNum > stock.currentPrice ? 'hint-sell' : 'hint-buy'}>
                  {priceNum > stock.currentPrice ? '▲' : '▼'} 
                  {' '}
                  {Math.abs(((priceNum - stock.currentPrice) / stock.currentPrice) * 100).toFixed(2)}% 
                  {priceNum > stock.currentPrice ? ' au-dessus' : ' en dessous'} du prix actuel
                </span>
              )}
            </div>
          </div>

          {/* Quantité */}
          <div className="form-group">
            <div className="form-group-header">
              <label>Quantité</label>
              {orderType === 'SELL' && ownedQuantity > 0 && (
                <button 
                  type="button"
                  onClick={() => setQuantity(ownedQuantity.toString())}
                  className="max-button-small"
                >
                  MAX
                </button>
              )}
            </div>
            <input 
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              className="modal-input"
            />
          </div>

          {/* Récapitulatif */}
          <div className="order-summary">
            <div className="summary-row">
              <span>Montant</span>
              <span>{formatAmount(priceNum * quantityNum)}</span>
            </div>
            <div className="summary-row">
              <span>Frais</span>
              <span>{formatAmount(fees)}</span>
            </div>
            <div className="summary-row total-row">
              <span>Total {orderType === 'BUY' ? 'à débiter' : 'à recevoir'}</span>
              <span className="total-value">{formatAmount(Math.abs(total))}</span>
            </div>
          </div>

          {/* Avertissement */}
          {orderType === 'SELL' && quantityNum > ownedQuantity && (
            <div className="warning-box-small">
              ⚠️ Quantité insuffisante
            </div>
          )}

          {orderType === 'BUY' && total > userBalance && (
            <div className="warning-box-small">
              ⚠️ Solde insuffisant
            </div>
          )}

          {/* Info ordre limite */}
          <div className="info-box-blue">
            <svg className="icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Votre ordre sera placé en attente et exécuté lorsque le prix atteindra {formatAmount(priceNum)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button 
            className="btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button 
            className={`btn-primary ${orderType === 'BUY' ? 'btn-buy' : 'btn-sell'}`}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isSubmitting ? 'Placement...' : `Placer l'ordre ${orderType === 'BUY' ? 'ACHAT' : 'VENTE'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

