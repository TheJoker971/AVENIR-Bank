import { BankEntity } from "domain/entities/BankEntity";
import { BankCodeInvalidError } from "domain/errors/BankCodeInvalidError";

export interface BankRepositoryInterface {
    // Define methods for bank repository
    findByBankCode(bankCode: string): Promise<BankEntity | BankCodeInvalidError>;
    findByBranchCode(branchCode: string): Promise<BankEntity | BankCodeInvalidError>;
    update(bankCode: string, data:Partial<BankEntity>): Promise<void | BankCodeInvalidError>;
    delete(bankCode: string): Promise<void | BankCodeInvalidError>;
}