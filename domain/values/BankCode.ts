import { BankCodeInvalidError } from "domain/errors/BankCodeInvalidError";

export type BankCodeType = string;

export class BankCode {
    value:string;

    private constructor(value:string){
        this.value = value;
    }

    public static isBankCode(value:string) :BankCode | Error{
        const regex = /^[0-9]{5}$/;
        if(!regex.test(value)){
            return new BankCodeInvalidError("Bank code must be 5 digits");
        }
        return new BankCode(value);
    }
}