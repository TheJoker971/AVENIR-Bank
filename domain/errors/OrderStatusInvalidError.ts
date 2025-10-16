export class OrderStatusInvalidError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "OrderStatusInvalidError";
    }
}
