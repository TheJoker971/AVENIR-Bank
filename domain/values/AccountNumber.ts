import { AccountNumberInvalidError } from "domain/errors/AccountNumberInvalidError";


export type AccountNumberType = string;

export class AccountNumber {

    private constructor(public value: AccountNumberType) {
    }

    public static create(accountNumber: string): AccountNumber | AccountNumberInvalidError {
        const regex = /^[0-9]{1,11}$/; // Example: 1 to 11 digits
        if (!regex.test(accountNumber)) {
            return new AccountNumberInvalidError("Account number must be between 1 and 11 digits");
        }
        return new AccountNumber(accountNumber);
    }

    public static generateAccountNumber(): AccountNumber {
        const randomNumber = Math.floor(Math.random() * 1_000_000_000_00); // Generate a number between 0 and 99999999999
        const accountNumber = randomNumber.toString().padStart(11, '0'); // Pad with leading zeros to ensure 11 digits
        return new AccountNumber(accountNumber);
    }
}