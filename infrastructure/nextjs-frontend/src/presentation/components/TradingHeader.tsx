/**
 * En-tête de la page de trading
 * Affiche le nom de l'action, prix, variation
 */
'use client';

import { formatAmount } from '@/shared/utils';
import Link from 'next/link';

interface StockDto {
  id: number;
  symbol: string;
  name: string;
  currentPrice: number;
  availableShares: number;
}

interface TradingHeaderProps {
  stock: StockDto;
}

export const TradingHeader: React.FC<TradingHeaderProps> = ({ stock }) => {
  // TODO: Calculer la variation réelle une fois qu'on aura l'historique des prix
  // Pour l'instant, variation fictive basée sur un prix de référence
  const referencePrice = 150;
  const priceChange = stock.currentPrice - referencePrice;
  const priceChangePercent = (priceChange / referencePrice) * 100;
  const isPositive = priceChange >= 0;

  return (
    <div className="trading-header">
      <div className="header-content">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/stocks" className="breadcrumb-link">
            Actions
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{stock.symbol}</span>
        </div>

        {/* Informations principales */}
        <div className="main-info">
          <div className="stock-identity">
            <h1 className="stock-symbol">{stock.symbol}</h1>
            <span className="stock-name">{stock.name}</span>
          </div>

          <div className="price-info">
            <div className="current-price-large">
              {formatAmount(stock.currentPrice)}
            </div>
            <div className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
              <span className="change-amount">
                {isPositive ? '+' : ''}{formatAmount(priceChange)}
              </span>
              <span className="change-percent">
                ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="stock-stats">
            <div className="stat-item">
              <span className="stat-label">Disponible</span>
              <span className="stat-value">{stock.availableShares.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

