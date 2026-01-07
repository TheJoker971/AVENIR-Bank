import { SavingsAccountTotalValueDto } from '@/shared/dto';

export interface WithdrawRewardsResponse {
  success: boolean;
  withdrawnAmount: number;
  message: string;
}

export interface SavingsAccountServiceInterface {
  getTotalValue(savingsAccountId: number): Promise<SavingsAccountTotalValueDto | Error>;
  withdrawRewards(savingsAccountId: number): Promise<WithdrawRewardsResponse | Error>;
}

