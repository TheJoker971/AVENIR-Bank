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

    public addBranch(branch:BranchCode):void{
        this.branches.push(branch);
    }

    public hasBranch(branch:BranchCode):boolean{
        return this.branches.some(b => b.value === branch.value);
    }

    public addBranches(branches:Array<BranchCode>):void{
        branches.forEach(branch => {
            if(!this.hasBranch(branch)){
                this.branches.push(branch);
            }
        });
    }

    public addUser(user:UserEntity):void{
        this.users.push(user);
    }

    public hasUser(user:UserEntity):boolean{
        return this.users.some(u => u.id === user.id);
    }

    public addUsers(users:Array<UserEntity>):void{
        users.forEach(user => {
            if(!this.hasUser(user)){
                this.users.push(user);
            }
        });
    }
}