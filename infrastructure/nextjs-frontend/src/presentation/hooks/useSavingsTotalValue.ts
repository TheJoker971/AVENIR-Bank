/**
 * Hook pour récupérer la valeur totale d'un compte d'épargne avec gains temps réel
 */
'use client';

import { useState } from 'react';
import { SavingsAccountApiAdapter } from '@/infrastructure/api/SavingsAccountApiAdapter';
import { SavingsAccountTotalValueDto } from '@/shared/dto';
import { SavingsAccountServiceInterface } from '@/application/services/SavingsAccountService';

const savingsAccountService: SavingsAccountServiceInterface = new SavingsAccountApiAdapter();

export const useSavingsTotalValue = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTotalValue = async (savingsAccountId: number): Promise<SavingsAccountTotalValueDto | null> => {
    setLoading(true);
    setError(null);

    const result = await savingsAccountService.getTotalValue(savingsAccountId);
    if (result instanceof Error) {
      setError(result.message);
      setLoading(false);
      return null;
    }

    setLoading(false);
    return result;
  };

  return {
    getTotalValue,
    loading,
    error,
  };
};

