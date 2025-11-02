import { SavingsAccountTotalValueDto } from '@/shared/dto';

export interface SavingsAccountServiceInterface {
  getTotalValue(savingsAccountId: number): Promise<SavingsAccountTotalValueDto | Error>;
}

