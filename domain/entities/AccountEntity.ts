import { AccountNumber } from "domain/values/AccountNumber";
import { BankCode } from "domain/values/BankCode";
import { BranchCode } from "domain/values/BranchCode";
import { CountryCode } from "domain/values/CountryCode";
import { Iban } from "domain/values/Iban";
import { RibKey } from "domain/values/RibKey";
import { Amount } from "domain/values/Amount";

export class AccountEntity {

    public static create(countryCode: CountryCode, bankCode: BankCode, branchCode: BranchCode, ribKey: string, balance: number = 0, ownerID: number): AccountEntity | Error {
        const accountNumberOrError = AccountNumber.generateAccountNumber();
        if (accountNumberOrError instanceof Error) {
            return accountNumberOrError;
        }
        const ribKeyOrError = RibKey.create(ribKey);
        if (ribKeyOrError instanceof Error) {
            return ribKeyOrError;
        }
        const ibanOrError = Iban.create(countryCode, bankCode, branchCode, accountNumberOrError, ribKeyOrError);
        if (ibanOrError instanceof Error) {
            return ibanOrError;
        }
        const balanceOrError = Amount.create(balance);
        if (balanceOrError instanceof Error) {
            return balanceOrError;
        }
        return new AccountEntity(accountNumberOrError, ibanOrError, balanceOrError, ownerID);
    }

    private constructor(
        public readonly accountNumber: AccountNumber,
        public readonly iban: Iban,
        public readonly balance: Amount,
        public readonly ownerId: number,
        public readonly createdAt: Date = new Date(),
    ) {}

    public deposit(amount: Amount): AccountEntity {
        const newBalance = this.balance.add(amount);
        return new AccountEntity(
            this.accountNumber,
            this.iban,
            newBalance,
            this.ownerId,
            this.createdAt
        );
    }

    public withdraw(amount: Amount): AccountEntity | Error {
        if (amount.isGreaterThan(this.balance)) {
            return new Error("Fonds insuffisants");
        }
        const newBalance = this.balance.subtract(amount);
        return new AccountEntity(
            this.accountNumber,
            this.iban,
            newBalance,
            this.ownerId,
            this.createdAt
        );
    }

    public getBalance(): Amount {
        return this.balance;
    }

    public getOwnerId(): number {
        return this.ownerId;
    }

    public getIban(): Iban {
        return this.iban;
    }
}