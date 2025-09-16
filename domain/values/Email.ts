import { EmailInvalidError } from "domain/errors/EmailInvalidError";

export class Email {
    private email:string;

    public static isEmail(email:string): Email | EmailInvalidError {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
            return new Email(email);
        } else {
            return new EmailInvalidError("Invalid email");
        }
    }

    private constructor(email:string) {
        this.email = email;
    }

    public getEmail(): string {
        return this.email;
    }
}