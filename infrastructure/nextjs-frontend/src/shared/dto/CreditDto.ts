/**
 * DTO Credit pour l'affichage
 */
export interface CreditDto {
  id: number;
  clientId: number;
  principalAmount: number;
  annualInterestRate: number;
  insuranceRate: number;
  termMonths: number;
  monthlyPayment: number;
  remainingBalance: number;
  status: 'ACTIVE' | 'PAID_OFF' | 'DEFAULTED';
  createdAt: string;
  nextPaymentDate: string;
}

