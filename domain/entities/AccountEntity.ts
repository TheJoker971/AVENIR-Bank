import { AccountNumber } from "domain/values/AccountNumber";
import { BankCode } from "domain/values/BankCode";
import { BranchCode } from "domain/values/BranchCode";
import { CountryCode } from "domain/values/CountryCode";
import { Iban } from "domain/values/Iban";
import { RibKey } from "domain/values/RibKey";

export class AccountEntity {

    public static create(countryCode:CountryCode,bankCode:string,branchCode:string,ribKey:string,balance:number=0) : AccountEntity | Error {
        const accountNumberOrError = AccountNumber.generateAccountNumber();
        if (accountNumberOrError instanceof Error) {
            return accountNumberOrError;
        }
        const branchCodeOrError = BranchCode.create(branchCode);
        if (branchCodeOrError instanceof Error) {
            return branchCodeOrError;
        }
        const bankCodeOrError = BankCode.create(bankCode);
        if (bankCodeOrError instanceof Error) {
            return bankCodeOrError;
        }
        const ribKeyOrError = RibKey.create(ribKey);
        if (ribKeyOrError instanceof Error) {
            return ribKeyOrError;
        }
        const ibanOrError = Iban.create(countryCode,bankCodeOrError,branchCodeOrError,accountNumberOrError,ribKeyOrError);
        if (ibanOrError instanceof Error) {
            return ibanOrError;
        }
        return new AccountEntity(accountNumberOrError,ibanOrError,balance);
    }

    private constructor(
        public accountNumber:AccountNumber,
        public iban:Iban,
        public balance:number=0,
        public createdAt:Date=new Date(),
        ){
    }

    public deposit(amount:number):void{
        if(amount>0){
            this.balance += amount;
        }
    }

    public withdraw(amount:number):boolean{
        if(amount>0 && this.balance>=amount){
            this.balance -= amount;
            return true;
        }
        return false;
    }
}