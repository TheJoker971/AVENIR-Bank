/**
 * DTO pour la valeur totale d'un compte d'épargne avec gains temps réel
 */
export interface SavingsAccountTotalValueDto {
  id: number;
  iban: string;
  balance: number;
  accumulatedInterest: number;
  totalValue: number;
  interestRate: number;
  lastInterestCalculation: string;
}

