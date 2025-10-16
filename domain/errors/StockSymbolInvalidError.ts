export class StockSymbolInvalidError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "StockSymbolInvalidError";
    }
}
