/**
 * DTO SavingsAccount pour l'affichage
 */
export interface SavingsAccountDto {
  id: number;
  iban: string;
  balance: number;
  ownerId: number;
  interestRate: number;
  lastInterestCalculation: string;
  createdAt: string;
}

