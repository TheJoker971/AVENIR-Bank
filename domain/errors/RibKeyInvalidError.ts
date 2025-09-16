export class RibKeyInvalidError extends Error {
    constructor(message:string){
        super(message);
        this.name = "RibKeyInvalidError";
    }
}