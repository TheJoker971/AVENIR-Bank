export class OrderTypeInvalidError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "OrderTypeInvalidError";
    }
}
