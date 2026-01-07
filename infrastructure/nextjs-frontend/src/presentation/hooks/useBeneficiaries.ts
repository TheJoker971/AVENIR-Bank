/**
 * Hook pour la gestion des bénéficiaires
 */
'use client';

import { useState, useEffect } from 'react';
import { BeneficiaryApiAdapter } from '@/infrastructure/api/BeneficiaryApiAdapter';
import { BeneficiaryDto } from '@/shared/dto';
import { BeneficiaryServiceInterface, CreateBeneficiaryData } from '@/application/services/BeneficiaryService';

const beneficiaryService: BeneficiaryServiceInterface = new BeneficiaryApiAdapter();

export const useBeneficiaries = (userId: number | null) => {
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBeneficiaries = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    const result = await beneficiaryService.getBeneficiaries(userId);
    if (result instanceof Error) {
      setError(result.message);
    } else {
      setBeneficiaries(result);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadBeneficiaries();
  }, [userId]);

  const createBeneficiary = async (data: CreateBeneficiaryData) => {
    if (!userId) return null;
    
    setLoading(true);
    setError(null);
    
    const result = await beneficiaryService.createBeneficiary(data);
    if (result instanceof Error) {
      setError(result.message);
      setLoading(false);
      return null;
    }
    
    await loadBeneficiaries();
    return result;
  };

  const deleteBeneficiary = async (beneficiaryId: number) => {
    setLoading(true);
    setError(null);
    
    const result = await beneficiaryService.deleteBeneficiary(beneficiaryId);
    if (result instanceof Error) {
      setError(result.message);
      setLoading(false);
      return false;
    }
    
    await loadBeneficiaries();
    return true;
  };

  return {
    beneficiaries,
    loading,
    error,
    createBeneficiary,
    deleteBeneficiary,
    refresh: loadBeneficiaries,
  };
};

