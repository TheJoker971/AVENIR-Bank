import { InterestRateError } from "domain/errors/InterestRateError";

export type interestRateType = number;

export class InterestRate {

    private constructor(public value:interestRateType){
    }

    public static create(value:interestRateType) :InterestRate | Error{
        if(value < 0 || value > 100){
            return new InterestRateError("Interest rate must be between 0 and 100");
        }
        return new InterestRate(value);
    }

}