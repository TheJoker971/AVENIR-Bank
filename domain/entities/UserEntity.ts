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

    private constructor(public id:number,
        public firstname:string,
        public lastname:string,
        public email:Email,
        public password:Password,
        public address:string,
        public role:Role,
        public banned:boolean=false,
        public accounts:Array<AccountEntity>=[]){
    }

    public addAccount(account:AccountEntity):void{
        this.accounts.push(account);
    }

    public ban():void{
        this.banned = true;
    }

    public unban():void{
        this.banned = false;
    }

    public updateAddress(newAddress:string):void{
        this.address = newAddress;
    }

    public updatePassword(newPassword:string): Error | void {
        const passwordOrError = Password.isPassword(newPassword);
        if(passwordOrError instanceof Error) return passwordOrError;
        this.password = passwordOrError;
    }

    public updateEmail(newEmail:string): Error | void {
        const emailOrError = Email.isEmail(newEmail);
        if(emailOrError instanceof Error) return emailOrError;
        this.email = emailOrError;
    }

}