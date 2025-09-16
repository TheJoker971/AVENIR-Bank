export class RoleInvalidError extends Error {
    constructor(message:string){
        super(message);
        this.name = "RoleInvalidError";
    }
}