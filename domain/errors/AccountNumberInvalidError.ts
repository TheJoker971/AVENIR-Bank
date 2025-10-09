export class AccountNumberInvalidError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AccountNumberInvalidError";
    }
}