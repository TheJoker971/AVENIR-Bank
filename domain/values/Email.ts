import { EmailInvalidError } from "domain/errors/EmailInvalidError";

export class Email {

    public static isEmail(email:string): Email | EmailInvalidError {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
            return new Email(email);
        } else {
            return new EmailInvalidError("Invalid email");
        }
    }

    private constructor(public value:string) {
    }
}