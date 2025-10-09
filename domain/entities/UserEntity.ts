import { Role } from "../values/Role";
import { Email } from "../values/Email";
import { Password } from "../values/Password";
import { AccountEntity } from "./AccountEntity";

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

    public static create(id:number,firstname:string,lastname:string,email:string,password:string,address:string,role:string,banned:boolean) :UserEntity | Error{
        const emailOrError = Email.isEmail(email);
        if(emailOrError instanceof Error) return emailOrError;
        const passwordOrError = Password.isPassword(password);
        if(passwordOrError instanceof Error) return passwordOrError;
        const roleOrError = Role.isRole(role);
        if(roleOrError instanceof Error) return roleOrError;
        return new UserEntity(id,firstname,lastname,emailOrError,passwordOrError,address,roleOrError,banned);
    }

    private constructor(
        public readonly id:number,
        public readonly firstname:string,
        public readonly lastname:string,
        public readonly email:Email,
        public readonly password:Password,
        public readonly address:string,
        public readonly role:Role,
        public readonly banned:boolean=false,
        ){
    }

}