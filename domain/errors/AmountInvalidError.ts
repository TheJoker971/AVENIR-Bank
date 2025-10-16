export class AmountInvalidError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AmountInvalidError";
    }
}
