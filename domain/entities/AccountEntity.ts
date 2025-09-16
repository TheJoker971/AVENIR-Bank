export class AccountEntity {
    iban:string;
    balance:number;
    userId:number;

    constructor(iban:string,balance:number,userId:number){
        this.iban = iban;
        this.balance = balance;
        this.userId = userId;
    }
}