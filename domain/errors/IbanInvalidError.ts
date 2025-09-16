export class IbanInvalidError extends Error {
    constructor(message:string){
        super(message);
        this.name = "IbanInvalidError";
    }
}