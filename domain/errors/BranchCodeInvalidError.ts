export class BranchCodeInvalidError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BranchCodeInvalidError";
    }
}