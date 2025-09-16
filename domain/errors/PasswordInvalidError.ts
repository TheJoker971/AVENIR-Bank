export class PasswordInvalidError extends Error {
    constructor(message:string){
        super(message);
        this.name = "PasswordInvalideError";
    }
}