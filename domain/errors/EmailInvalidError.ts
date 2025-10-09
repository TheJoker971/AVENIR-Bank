export class EmailInvalidError extends Error {
    constructor(message:string){
        super(message);
        this.name = "EmailInvalidError";
    }
}