export class BankCodeInvalidError extends Error {
    constructor(message:string){
        super(message);
        this.name = "BankCodeInvalidError";
    }
}