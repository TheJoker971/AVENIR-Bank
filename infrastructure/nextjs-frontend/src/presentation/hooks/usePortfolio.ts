/**
 * Hook pour la gestion du portefeuille
 */
'use client';

import { useState, useEffect } from 'react';
import { PortfolioApiAdapter } from '@/infrastructure/api/PortfolioApiAdapter';
import { PortfolioDto, StockHoldingDto } from '@/shared/dto';
import { PortfolioServiceInterface } from '@/application/services/PortfolioService';

const portfolioService: PortfolioServiceInterface = new PortfolioApiAdapter();

export const usePortfolio = (userId: number | null) => {
  const [portfolio, setPortfolio] = useState<PortfolioDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolio = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    const result = await portfolioService.getPortfolio(userId);
    if (result instanceof Error) {
      setError(result.message);
      setLoading(false);
      return;
    }

    setPortfolio(result);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      loadPortfolio();
    }
  }, [userId]);

  const getHoldingBySymbol = async (stockSymbol: string): Promise<StockHoldingDto | null> => {
    if (!userId) return null;

    setLoading(true);
    setError(null);

    const result = await portfolioService.getHoldingBySymbol(userId, stockSymbol);
    if (result instanceof Error) {
      setError(result.message);
      setLoading(false);
      return null;
    }

    setLoading(false);
    return result;
  };

  return {
    portfolio,
    holdings: portfolio?.holdings || [],
    totalValue: portfolio?.totalValue || 0,
    totalGainLoss: portfolio?.totalGainLoss || 0,
    loading,
    error,
    refresh: loadPortfolio,
    getHoldingBySymbol,
  };
};

