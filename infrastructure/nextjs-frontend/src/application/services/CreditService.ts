/**
 * Service de gestion des crédits - Application Layer
 */
import { CreditDto } from '@/shared/dto';

export interface CreateCreditData {
  userId: number;
  amount: number;
  annualRate: number;
  insurance: number;
  durationMonths: number;
}

export interface CreditServiceInterface {
  createCredit(data: CreateCreditData): Promise<CreditDto | Error>;
  getUserCredits(userId: number): Promise<CreditDto[] | Error>;
  processPayment(creditId: number, accountId: number): Promise<void | Error>;
}

