/**
 * Hook pour la gestion de la banque (Directeur)
 */
'use client';

import { useState, useEffect } from 'react';
import { BankApiAdapter } from '@/infrastructure/api/BankApiAdapter';
import { BankDto } from '@/application/services/BankService';
import { BankServiceInterface } from '@/application/services/BankService';

const bankService: BankServiceInterface = new BankApiAdapter();

export const useBank = () => {
  const [bankInfo, setBankInfo] = useState<BankDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBankInfo = async () => {
    setLoading(true);
    setError(null);
    
    const result = await bankService.getBankInfo();
    if (result instanceof Error) {
      setError(result.message);
    } else {
      setBankInfo(result);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadBankInfo();
  }, []);

  const updateInterestRate = async (newRate: number) => {
    setLoading(true);
    setError(null);
    
    const result = await bankService.updateInterestRate(newRate);
    if (result instanceof Error) {
      setError(result.message);
      setLoading(false);
      return false;
    }
    
    setBankInfo(result);
    setLoading(false);
    return true;
  };

  return {
    bankInfo,
    loading,
    error,
    updateInterestRate,
    refresh: loadBankInfo,
  };
};

