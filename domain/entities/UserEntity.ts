import { Role } from "../values/Role";
import { Email } from "../values/Email";
import { Password } from "../values/Password";
import { AccountEntity } from "./AccountEntity";

export class UserEntity {

    public static createClient(id:number,firstname:string,lastname:string,email:string,password:string,address:string,advisorId?:number) :UserEntity | Error{
        const emailOrError = Email.isEmail(email);
        if(emailOrError instanceof Error) return emailOrError;
        const passwordOrError = Password.isPassword(password);
        if(passwordOrError instanceof Error) return passwordOrError;
        const roleOrError = Role.isRole("CLIENT");
        if(roleOrError instanceof Error) return roleOrError;
        return new UserEntity(id,firstname,lastname,emailOrError,passwordOrError,address,roleOrError,false,advisorId);
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

    public static create(id:number,firstname:string,lastname:string,email:string,password:string,address:string,role:string,banned:boolean,advisorId?:number) :UserEntity | Error{
        const emailOrError = Email.isEmail(email);
        if(emailOrError instanceof Error) return emailOrError;
        
        // Si le password ressemble à un hash bcrypt (commence par $2a$, $2b$ ou $2y$), 
        // on utilise createFromHash au lieu de isPassword
        const isHash = Password.isBcryptHash(password);
        const passwordOrError = isHash 
            ? Password.createFromHash(password)
            : Password.isPassword(password);
        if(passwordOrError instanceof Error) return passwordOrError;
        
        const roleOrError = Role.isRole(role);
        if(roleOrError instanceof Error) return roleOrError;
        
        // Vérifier que advisorId n'est défini que pour les clients
        if (advisorId !== undefined && role !== "CLIENT") {
            return new Error("Un conseiller ne peut être assigné qu'à un client");
        }
        
        return new UserEntity(id,firstname,lastname,emailOrError,passwordOrError,address,roleOrError,banned,advisorId);
    }

    public assignAdvisor(advisorId: number): UserEntity | Error {
        // Vérifier que c'est un client
        if (this.role.value !== "CLIENT") {
            return new Error("Un conseiller ne peut être assigné qu'à un client");
        }
        return new UserEntity(
            this.id,
            this.firstname,
            this.lastname,
            this.email,
            this.password,
            this.address,
            this.role,
            this.banned,
            advisorId
        );
    }

    public removeAdvisor(): UserEntity | Error {
        // Vérifier que c'est un client
        if (this.role.value !== "CLIENT") {
            return new Error("Seuls les clients peuvent avoir un conseiller");
        }
        return new UserEntity(
            this.id,
            this.firstname,
            this.lastname,
            this.email,
            this.password,
            this.address,
            this.role,
            this.banned,
            undefined
        );
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
        public readonly advisorId?:number, // ID du conseiller assigné (uniquement pour les clients)
        ){
    }

}