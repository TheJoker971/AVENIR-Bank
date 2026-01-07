/**
 * Hook pour la gestion des opérations (virements)
 */
'use client';

import { useState } from 'react';
import { AccountApiAdapter } from '@/infrastructure/api/AccountApiAdapter';
import { OperationDto } from '@/shared/dto';
import { AccountServiceInterface, TransferData } from '@/application/services/AccountService';

const accountService: AccountServiceInterface = new AccountApiAdapter();

export const useOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transfer = async (data: TransferData) => {
    setLoading(true);
    setError(null);
    
    const result = await accountService.transfer(data);
    setLoading(false);
    
    if (result instanceof Error) {
      setError(result.message);
      return false;
    }
    
    return true;
  };

  const getAccountOperations = async (accountId: number): Promise<OperationDto[] | null> => {
    setLoading(true);
    setError(null);
    
    const result = await accountService.getAccountOperations(accountId);
    if (result instanceof Error) {
      setError(result.message);
      setLoading(false);
      return null;
    }
    
    setLoading(false);
    return result;
  };

  return {
    transfer,
    getAccountOperations,
    loading,
    error,
  };
};

