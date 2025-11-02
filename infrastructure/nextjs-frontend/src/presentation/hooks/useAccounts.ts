/**
 * Hook pour la gestion des comptes
 */
'use client';

import { useState, useEffect } from 'react';
import { AccountApiAdapter } from '@/infrastructure/api/AccountApiAdapter';
import { AccountDto, SavingsAccountDto, OperationDto } from '@/shared/dto';
import { AccountServiceInterface } from '@/application/services/AccountService';

const accountService: AccountServiceInterface = new AccountApiAdapter();

export const useAccounts = (userId: number | null) => {
  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccountDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    const accountsResult = await accountService.getAccounts(userId);
    if (accountsResult instanceof Error) {
      setError(accountsResult.message);
    } else {
      setAccounts(accountsResult);
    }

    const savingsResult = await accountService.getSavingsAccounts(userId);
    if (savingsResult instanceof Error) {
      setError(savingsResult.message);
    } else {
      setSavingsAccounts(savingsResult);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAccounts();
  }, [userId]);

  const createAccount = async (name: string) => {
    if (!userId) return null;
    
    const result = await accountService.createAccount({ name, userId });
    if (result instanceof Error) {
      setError(result.message);
      return null;
    }
    await loadAccounts();
    return result;
  };

  const deleteAccount = async (accountId: number) => {
    const result = await accountService.deleteAccount(accountId);
    if (result instanceof Error) {
      setError(result.message);
      return false;
    }
    await loadAccounts();
    return true;
  };

  const createSavingsAccount = async () => {
    if (!userId) return null;
    
    const result = await accountService.createSavingsAccount(userId);
    if (result instanceof Error) {
      setError(result.message);
      return null;
    }
    await loadAccounts();
    return result;
  };

  const getAccountsByOwner = async (ownerId: number): Promise<AccountDto[] | null> => {
    setLoading(true);
    setError(null);
    
    const result = await accountService.getAccountsByOwner(ownerId);
    if (result instanceof Error) {
      setError(result.message);
      setLoading(false);
      return null;
    }
    
    setLoading(false);
    return result;
  };

  return {
    accounts,
    savingsAccounts,
    loading,
    error,
    createAccount,
    deleteAccount,
    createSavingsAccount,
    getAccountsByOwner,
    refresh: loadAccounts,
  };
};

