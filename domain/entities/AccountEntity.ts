import { AccountNumber } from "domain/values/AccountNumber";
import { BankCode } from "domain/values/BankCode";
import { BranchCode } from "domain/values/BranchCode";
import { CountryCode } from "domain/values/CountryCode";
import { Iban } from "domain/values/Iban";
import { RibKey } from "domain/values/RibKey";

export class AccountEntity {

    public static create(countryCode:CountryCode,bankCode:BankCode,branchCode:BranchCode,ribKey:string,balance:number=0) : AccountEntity | Error {
        const accountNumberOrError = AccountNumber.generateAccountNumber();
        if (accountNumberOrError instanceof Error) {
            return accountNumberOrError;
        }
        const ribKeyOrError = RibKey.create(ribKey);
        if (ribKeyOrError instanceof Error) {
            return ribKeyOrError;
        }
        const ibanOrError = Iban.create(countryCode,bankCode,branchCode,accountNumberOrError,ribKeyOrError);
        if (ibanOrError instanceof Error) {
            return ibanOrError;
        }
        return new AccountEntity(accountNumberOrError,ibanOrError,balance);
    }

    private constructor(
        public readonly accountNumber:AccountNumber,
        public readonly iban:Iban,
        public readonly balance:number=0,
        public readonly createdAt:Date=new Date(),
        ){
    }

}