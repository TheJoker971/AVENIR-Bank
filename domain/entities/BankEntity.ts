import { BankCode } from "domain/values/BankCode";
import { BranchCode } from "domain/values/BranchCode";
import { UserEntity } from "./UserEntity";

export class BankEntity {


    private constructor(public name:string,
        public bankCode:BankCode,
        public branches:Array<BranchCode> = [],
        public users:Array<UserEntity> = [],
    ){
    }

    public static create(name:string, bankCode:BankCode, branches:Array<BranchCode> = []):BankEntity{
        return new BankEntity(name, bankCode, branches);
    }

    public addBranch(branch:BranchCode):void{
        this.branches.push(branch);
    }

    public removeBranch(branch:BranchCode):void{
        this.branches = this.branches.filter(b => b.value !== branch.value);
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

    public removeUser(user:UserEntity):void{
        this.users = this.users.filter(u => u.id !== user.id);
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