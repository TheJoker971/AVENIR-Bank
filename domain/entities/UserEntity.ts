import { Role } from "../values/Role";
import { Email } from "../values/Email";
import { Password } from "../values/Password";

export class UserEntity {

    public static createClient(id:number,firstname:string,lastname:string,email:string,password:string,address:string) :UserEntity | Error{
        const emailOrError = Email.isEmail(email);
        if(emailOrError instanceof Error) return emailOrError;
        const passwordOrError = Password.isPassword(password);
        if(passwordOrError instanceof Error) return passwordOrError;
        const roleOrError = Role.isRole("CLIENT");
        if(roleOrError instanceof Error) return roleOrError;
        return new UserEntity(id,firstname,lastname,emailOrError,passwordOrError,address,roleOrError);
    }

    public static createAdvise(id:number,firstname:string,lastname:string,email:string,password:string,address:string) :UserEntity | Error{
        const emailOrError = Email.isEmail(email);
        if(emailOrError instanceof Error) return emailOrError;
        const passwordOrError = Password.isPassword(password);
        if(passwordOrError instanceof Error) return passwordOrError;
        const roleOrError = Role.isRole("ADVISE");
        if(roleOrError instanceof Error) return roleOrError;
        return new UserEntity(id,firstname,lastname,emailOrError,passwordOrError,address,roleOrError);
    }

    public static createDirector(id:number,firstname:string,lastname:string,email:string,password:string,address:string){
        const emailOrError = Email.isEmail(email);
        if(emailOrError instanceof Error) return emailOrError;
        const passwordOrError = Password.isPassword(password);
        if(passwordOrError instanceof Error) return passwordOrError;
        const roleOrError = Role.isRole("DIRECTOR");
        if(roleOrError instanceof Error) return roleOrError;
        return new UserEntity(id,firstname,lastname,emailOrError,passwordOrError,address,roleOrError);
    }

    constructor(public id:number,
        public firstname:string,
        public lastname:string,
        public email:Email,
        public password:Password,
        public address:string,
        public role:Role,
        public banned:boolean=false){
    }

}