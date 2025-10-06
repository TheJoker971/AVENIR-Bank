import { BankCode } from "domain/values/BankCode";
import { BranchCode } from "domain/values/BranchCode";
import { UserEntity } from "./UserEntity";

export class BankEntity {


    private constructor(public name:string,
        public readonly bankCode:BankCode,
        public readonly branches:Array<BranchCode> = [],
        public readonly users:Array<UserEntity> = [],
    ){
    }

    public static create(name:string, bankCode:string, branch:string):BankEntity | Error{
        const bankCodeOrError = BankCode.create(bankCode);
        if(bankCodeOrError instanceof Error) return bankCodeOrError;
        const branchOrError = BranchCode.create(branch);
        if(branchOrError instanceof Error) return branchOrError;
        return new BankEntity(name, bankCodeOrError, [...[],branchOrError]);
    }

}