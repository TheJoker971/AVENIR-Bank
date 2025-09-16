import { Role } from "../values/Role";
import { Email } from "../values/Email";
import { Password } from "../values/Password";

export class UserEntity {
    private firstname:string;
    private lastname:string;
    private email :Email;
    private password:Password;
    private address:string;
    private role:Role;
    private banned:boolean;

    public static createClient(firstname:string,lastname:string,email:string,password:string,address:string) :UserEntity | Error{
        const emailOrError = Email.isEmail(email);
        if(emailOrError instanceof Error) return emailOrError;
        const passwordOrError = Password.isPassword(password);
        if(passwordOrError instanceof Error) return passwordOrError;
        const roleOrError = Role.isRole("CLIENT");
        if(roleOrError instanceof Error) return roleOrError;
        return new UserEntity(firstname,lastname,emailOrError,passwordOrError,address,roleOrError);
    }

    public static createAdvise(){

    }

    public static createDirector(){}

    constructor(firstname:string,lastname:string,email:Email,password:Password,address:string,role:Role){
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
        this.address = address;
        this.role = role;
        this.banned = false;
    }
}