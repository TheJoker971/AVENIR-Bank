/**
 * Contexte pour gérer le compte actif de l'utilisateur
 */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AccountDto } from '@/shared/dto';

interface ActiveAccountContextType {
  activeAccount: AccountDto | null;
  setActiveAccount: (account: AccountDto | null) => void;
  loading: boolean;
  fetchActiveAccount: (userId: number) => Promise<void>;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const ActiveAccountContext = createContext<ActiveAccountContextType | undefined>(undefined);

interface ActiveAccountProviderProps {
  children: ReactNode;
}

export const ActiveAccountProvider: React.FC<ActiveAccountProviderProps> = ({ children }) => {
  const [activeAccount, setActiveAccountState] = useState<AccountDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Fonction pour déclencher un rafraîchissement
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Charger le compte actif depuis localStorage au montage
  useEffect(() => {
    const storedAccount = localStorage.getItem('activeAccount');
    if (storedAccount) {
      try {
        setActiveAccountState(JSON.parse(storedAccount));
      } catch (error) {
        console.error('Erreur lors du parsing du compte actif:', error);
        localStorage.removeItem('activeAccount');
      }
    }
  }, []);

  // Sauvegarder le compte actif dans localStorage
  const setActiveAccount = (account: AccountDto | null) => {
    setActiveAccountState(account);
    if (account) {
      localStorage.setItem('activeAccount', JSON.stringify(account));
    } else {
      localStorage.removeItem('activeAccount');
    }
  };

  // Récupérer le compte actif depuis l'API
  const fetchActiveAccount = useCallback(async (userId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/users/${userId}/active-account`, {
        headers: {
          'x-user-id': userId.toString(),
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du compte actif');
      }

      const data = await response.json();
      
      if (data.activeAccount) {
        setActiveAccount(data.activeAccount);
      } else {
        setActiveAccount(null);
      }
    } catch (error) {
      console.error('Erreur fetchActiveAccount:', error);
      setActiveAccount(null);
    } finally {
      setLoading(false);
    }
  }, []); // Pas de dépendances car setLoading et setActiveAccount sont stables

  return (
    <ActiveAccountContext.Provider
      value={{
        activeAccount,
        setActiveAccount,
        loading,
        fetchActiveAccount,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </ActiveAccountContext.Provider>
  );
};

export const useActiveAccount = (): ActiveAccountContextType => {
  const context = useContext(ActiveAccountContext);
  if (!context) {
    throw new Error('useActiveAccount must be used within ActiveAccountProvider');
  }
  return context;
};

