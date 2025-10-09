import { BranchCodeInvalidError } from "domain/errors/BranchCodeInvalidError";

export type BranchCodeType = string;

export class BranchCode {

    private constructor(public value:BranchCodeType){
    }

    public static create(value:string) :BranchCode | BranchCodeInvalidError{
        const regex = /^[0-9]{5}$/;
        if(!regex.test(value)){
            return new BranchCodeInvalidError("Branch code must be 5 digits");
        }
        return new BranchCode(value);
    }
}