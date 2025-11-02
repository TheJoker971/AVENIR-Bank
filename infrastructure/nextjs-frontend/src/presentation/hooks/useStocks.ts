/**
 * Hook pour la gestion des actions
 */
'use client';

import { useState, useEffect } from 'react';
import { StockApiAdapter } from '@/infrastructure/api/StockApiAdapter';
import { StockDto, OrderDto } from '@/shared/dto';
import { StockServiceInterface } from '@/application/services/StockService';

const stockService: StockServiceInterface = new StockApiAdapter();

export const useStocks = () => {
  const [stocks, setStocks] = useState<StockDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    setLoading(true);
    const result = await stockService.getStocks();
    if (result instanceof Error) {
      setError(result.message);
    } else {
      setStocks(result);
    }
    setLoading(false);
  };

  return { stocks, loading, error, refresh: loadStocks };
};

export const useOrders = (userId: number | null) => {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadOrders();
    }
  }, [userId]);

  const loadOrders = async () => {
    if (!userId) return;
    
    setLoading(true);
    const result = await stockService.getUserOrders(userId);
    if (result instanceof Error) {
      setError(result.message);
    } else {
      setOrders(result);
    }
    setLoading(false);
  };

  const createOrder = async (data: {
    stockId: number;
    type: 'BUY' | 'SELL';
    quantity: number;
    price: number;
  }) => {
    if (!userId) return null;
    
    const result = await stockService.createOrder({
      userId,
      ...data,
    });
    if (result instanceof Error) {
      setError(result.message);
      return null;
    }
    await loadOrders();
    return result;
  };

  const cancelOrder = async (orderId: number) => {
    const result = await stockService.cancelOrder(orderId);
    if (result instanceof Error) {
      setError(result.message);
      return false;
    }
    await loadOrders();
    return true;
  };

  return {
    orders,
    loading,
    error,
    createOrder,
    cancelOrder,
    refresh: loadOrders,
  };
};

