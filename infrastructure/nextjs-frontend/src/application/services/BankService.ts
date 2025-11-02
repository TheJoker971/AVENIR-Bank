/**
 * Service de gestion de la banque - Application Layer
 */
export interface BankDto {
  name: string;
  bankCode: string;
  branchCode: string;
  interestRate: number;
}

export interface BankServiceInterface {
  getBankInfo(): Promise<BankDto | Error>;
  updateInterestRate(newRate: number): Promise<BankDto | Error>;
}

