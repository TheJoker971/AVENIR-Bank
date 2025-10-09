import { BankCode } from "domain/values/BankCode";
import { BranchCode } from "domain/values/BranchCode";
import { UserEntity } from "./UserEntity";
import { InterestRate } from "domain/values/InterestRate";

export class BankEntity {


    private constructor(
        public readonly name:string,
        public readonly bankCode:BankCode,
        public readonly branche: BranchCode,
        public readonly interestRate : InterestRate,
    ){
    }

    public static create(name:string, bankCode:string, branch:string):BankEntity | Error{
        const bankCodeOrError = BankCode.create(bankCode);
        if(bankCodeOrError instanceof Error) return bankCodeOrError;
        const branchOrError = BranchCode.create(branch);
        if(branchOrError instanceof Error) return branchOrError;
        const interestRateOrError = InterestRate.create(0);
        if(interestRateOrError instanceof Error) return interestRateOrError;
        return new BankEntity(name, bankCodeOrError, branchOrError, interestRateOrError);
    }

}