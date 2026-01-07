/**
 * Panneau de trading Spot (achat/vente direct au prix du marché)
 * Style Binance
 */
'use client';

import { useState } from 'react';
import { formatAmount } from '@/shared/utils';

interface StockDto {
  id: number;
  symbol: string;
  name: string;
  currentPrice: number;
  availableShares: number;
}

interface SpotTradingPanelProps {
  stock: StockDto;
  userBalance: number;
  ownedQuantity: number;
  onTrade: (type: 'BUY' | 'SELL', quantity: number) => Promise<void>;
  loading?: boolean;
}

export const SpotTradingPanel: React.FC<SpotTradingPanelProps> = ({
  stock,
  userBalance,
  ownedQuantity,
  onTrade,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPrice = stock.currentPrice;
  const fees = 1;
  const quantityNum = parseFloat(quantity || '0');
  const subtotal = currentPrice * quantityNum;
  const total = activeTab === 'BUY' 
    ? subtotal + fees 
    : subtotal - fees;

  const maxBuyQuantity = Math.floor((userBalance - fees) / currentPrice);
  const canBuy = quantityNum > 0 && total <= userBalance && quantityNum <= stock.availableShares;
  const canSell = quantityNum > 0 && quantityNum <= ownedQuantity;

  const handleMaxClick = () => {
    if (activeTab === 'BUY') {
      setQuantity(maxBuyQuantity > 0 ? maxBuyQuantity.toString() : '0');
    } else {
      setQuantity(ownedQuantity.toString());
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    const qty = parseFloat(quantity);
    if (qty <= 0 || isNaN(qty)) return;

    setIsSubmitting(true);
    try {
      await onTrade(activeTab, qty);
      setQuantity(''); // Reset après succès
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="spot-trading-panel">
      {/* Onglets Acheter / Vendre */}
      <div className="tabs-container">
        <button 
          onClick={() => setActiveTab('BUY')} 
          className={`tab-button ${activeTab === 'BUY' ? 'active-buy' : ''}`}
          disabled={loading}
        >
          Acheter
        </button>
        <button 
          onClick={() => setActiveTab('SELL')} 
          className={`tab-button ${activeTab === 'SELL' ? 'active-sell' : ''}`}
          disabled={loading}
        >
          Vendre
        </button>
      </div>

      {/* Infos utilisateur */}
      <div className="user-info">
        <div className="info-row">
          <span className="label">Solde disponible</span>
          <span className="value">{formatAmount(userBalance)}</span>
        </div>
        <div className="info-row">
          <span className="label">Possédé</span>
          <span className="value">{ownedQuantity} {stock.symbol}</span>
        </div>
      </div>

      {/* Prix du marché */}
      <div className="market-price-box">
        <span className="label">Prix du marché</span>
        <span className="price">{formatAmount(currentPrice)}</span>
      </div>

      {/* Quantité */}
      <div className="input-group">
        <div className="input-header">
          <label>Quantité</label>
          <button 
            onClick={handleMaxClick}
            className="max-button"
            type="button"
            disabled={loading}
          >
            MAX
          </button>
        </div>
        <input 
          type="number" 
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="0"
          min="0"
          step="1"
          className="quantity-input"
          disabled={loading}
        />
        <div className="input-helper">
          {activeTab === 'BUY' ? (
            <span>Disponible: {stock.availableShares.toLocaleString()}</span>
          ) : (
            <span>Maximum: {ownedQuantity}</span>
          )}
        </div>
      </div>

      {/* Calcul du total */}
      <div className="calculation-box">
        <div className="calc-row">
          <span>Sous-total</span>
          <span>{formatAmount(subtotal)}</span>
        </div>
        <div className="calc-row">
          <span>Frais</span>
          <span>{formatAmount(fees)}</span>
        </div>
        <div className="calc-row total-row">
          <span>Total</span>
          <span className="total-amount">{formatAmount(Math.abs(total))}</span>
        </div>
      </div>

      {/* Avertissements */}
      {activeTab === 'BUY' && quantityNum > 0 && !canBuy && (
        <div className="warning-box">
          {total > userBalance ? (
            <span>⚠️ Solde insuffisant</span>
          ) : quantityNum > stock.availableShares ? (
            <span>⚠️ Quantité non disponible</span>
          ) : null}
        </div>
      )}

      {activeTab === 'SELL' && quantityNum > 0 && !canSell && (
        <div className="warning-box">
          <span>⚠️ Vous ne possédez pas assez d'actions</span>
        </div>
      )}

      {/* Bouton principal */}
      <button 
        className={`cta-button ${activeTab === 'BUY' ? 'buy' : 'sell'}`}
        onClick={handleSubmit}
        disabled={
          loading || 
          isSubmitting || 
          !quantity || 
          parseFloat(quantity) <= 0 ||
          (activeTab === 'BUY' && !canBuy) ||
          (activeTab === 'SELL' && !canSell)
        }
      >
        {isSubmitting ? (
          <span>Traitement...</span>
        ) : (
          <span>{activeTab === 'BUY' ? 'Acheter' : 'Vendre'} {stock.symbol}</span>
        )}
      </button>

      {/* Info exécution immédiate */}
      <div className="execution-info">
        <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Exécution immédiate au prix du marché</span>
      </div>
    </div>
  );
};

