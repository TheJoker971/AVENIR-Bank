export class InterestRateError extends Error {
    constructor(message:string){
        super(message);
        this.name = "InterestRateError";
    }
}