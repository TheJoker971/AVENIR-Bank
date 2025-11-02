/**
 * Hook pour la gestion du carnet d'ordres
 */
'use client';

import { useState, useEffect } from 'react';
import { OrderBookApiAdapter } from '@/infrastructure/api/OrderBookApiAdapter';
import { OrderBookDto } from '@/shared/dto';
import { OrderBookServiceInterface } from '@/application/services/OrderBookService';

const orderBookService: OrderBookServiceInterface = new OrderBookApiAdapter();

export const useOrderBook = (stockSymbol: string | null) => {
  const [orderBook, setOrderBook] = useState<OrderBookDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrderBook = async () => {
      if (!stockSymbol) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const result = await orderBookService.getOrderBook(stockSymbol);
      if (result instanceof Error) {
        setError(result.message);
        setOrderBook(null);
      } else {
        setOrderBook(result);
      }
      setLoading(false);
    };

    loadOrderBook();
    // Rafraîchir toutes les 5 secondes
    const interval = setInterval(loadOrderBook, 5000);
    return () => clearInterval(interval);
  }, [stockSymbol]);

  const triggerMatch = async (): Promise<{ message: string; totalMatches: number; successCount: number; errorCount: number } | null> => {
    if (!stockSymbol) return null;

    setLoading(true);
    setError(null);

    const result = await orderBookService.triggerMatch(stockSymbol);
    if (result instanceof Error) {
      setError(result.message);
      setLoading(false);
      return null;
    }

    // Recharger le carnet après le matching
    const refreshed = await orderBookService.getOrderBook(stockSymbol);
    if (!(refreshed instanceof Error)) {
      setOrderBook(refreshed);
    }

    setLoading(false);
    return result;
  };

  return {
    orderBook,
    loading,
    error,
    triggerMatch,
  };
};

