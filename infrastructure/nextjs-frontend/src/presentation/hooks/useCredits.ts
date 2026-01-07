/**
 * Hook pour la gestion des crédits (pour conseillers)
 */
'use client';

import { useState, useEffect } from 'react';
import { CreditApiAdapter } from '@/infrastructure/api/CreditApiAdapter';
import { CreditDto } from '@/shared/dto';
import { CreditServiceInterface, CreateCreditData } from '@/application/services/CreditService';

const creditService: CreditServiceInterface = new CreditApiAdapter();

export const useCredits = (userId: number | null, forClientId?: number | null) => {
  const [credits, setCredits] = useState<CreditDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCredits = async () => {
    // L'API retourne tous les crédits, on filtre côté client si nécessaire
    const targetUserId = forClientId || userId;
    
    setLoading(true);
    setError(null);
    
    const result = await creditService.getUserCredits(targetUserId || 0);
    if (result instanceof Error) {
      setError(result.message);
    } else {
      // Si on a un userId spécifique, filtrer les crédits pour ce client
      const filteredCredits = targetUserId 
        ? result.filter(c => c.clientId === targetUserId)
        : result;
      setCredits(filteredCredits);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadCredits();
  }, [userId, forClientId]);

  const createCredit = async (data: Omit<CreateCreditData, 'userId'> & { clientId: number }) => {
    const targetUserId = data.clientId || userId;
    if (!targetUserId) return null;
    
    setLoading(true);
    setError(null);
    
    const result = await creditService.createCredit({
      userId: data.clientId,
      amount: data.amount,
      annualRate: data.annualRate,
      insurance: data.insurance,
      durationMonths: data.durationMonths,
    });
    
    if (result instanceof Error) {
      setError(result.message);
      setLoading(false);
      return null;
    }
    
    await loadCredits();
    return result;
  };

  const processPayment = async (creditId: number, accountId: number) => {
    setLoading(true);
    setError(null);
    
    const result = await creditService.processPayment(creditId, accountId);
    if (result instanceof Error) {
      setError(result.message);
      setLoading(false);
      return false;
    }
    
    await loadCredits();
    return true;
  };

  return {
    credits,
    loading,
    error,
    createCredit,
    processPayment,
    refresh: loadCredits,
  };
};

