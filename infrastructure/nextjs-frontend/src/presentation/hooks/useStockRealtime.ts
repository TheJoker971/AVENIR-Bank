import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';

interface StockUpdate {
  symbol: string;
  currentPrice: number;
  availableShares: number;
}

interface AccountUpdate {
  balance: number;
}

/**
 * Hook pour gérer les mises à jour en temps réel d'une action
 */
export const useStockRealtime = (userId: number | null, symbol: string) => {
  const socket = useWebSocket(userId);
  const [stockData, setStockData] = useState<StockUpdate | null>(null);
  const [accountBalance, setAccountBalance] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (socket) {
      // Écouter les mises à jour de l'action
      socket.on('stockUpdated', (data: StockUpdate) => {
        if (data.symbol === symbol) {
          console.log('⚡ [useStockRealtime] Stock mis à jour:', data);
          setStockData(data);
          setRefreshTrigger(prev => prev + 1);
        }
      });

      // Écouter les mises à jour du compte
      socket.on('accountUpdated', (data: AccountUpdate) => {
        console.log('⚡ [useStockRealtime] Compte mis à jour:', data);
        setAccountBalance(data.balance);
      });

      // Écouter les mises à jour des holdings
      socket.on('holdingsUpdated', (holdings: any[]) => {
        console.log('⚡ [useStockRealtime] Holdings mis à jour:', holdings);
        setRefreshTrigger(prev => prev + 1);
      });

      return () => {
        socket.off('stockUpdated');
        socket.off('accountUpdated');
        socket.off('holdingsUpdated');
      };
    }
  }, [socket, symbol]);

  return {
    stockData,
    accountBalance,
    refreshTrigger
  };
};

