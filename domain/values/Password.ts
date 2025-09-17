import { PasswordInvalidError } from "../errors/PasswordInvalidError";

export class Password {
    public value:string;

    public static isPassword(value:string): Password | PasswordInvalidError {
        // return new Password(value) if regex and length are ok else return PasswordInvalidError
        if(value.length >= 8){
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if(passwordRegex.test(value)){
                return new Password(value);
            } else {
                return new PasswordInvalidError("Password must contain at least one uppercase letter, one lowercase letter, one number and one special character");
            }
        } else {
            return new PasswordInvalidError("Password must be at least 8 characters long");
        }

    }

    private constructor(value:string){
        
        this.value = value;
    }
}