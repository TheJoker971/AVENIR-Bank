import { BankCodeInvalidError } from "domain/errors/BankCodeInvalidError";

export type BankCodeType = string;

export class BankCode {

    private constructor(public value:string){
    }

    public static create(value:string) :BankCode | Error{
        const regex = /^[0-9]{5}$/;
        if(!regex.test(value)){
            return new BankCodeInvalidError("Bank code must be 5 digits");
        }
        return new BankCode(value);
    }
}