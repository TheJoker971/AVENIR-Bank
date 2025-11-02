import { PasswordInvalidError } from "../errors/PasswordInvalidError";
import * as bcrypt from "bcrypt";

export class Password {
    // Coût de hashage bcrypt (10 est un bon équilibre entre sécurité et performance)
    private static readonly BCRYPT_ROUNDS = 10;

    public value:string;

    /**
     * Valide et hash un mot de passe en clair avec bcrypt
     */
    public static isPassword(value:string): Password | PasswordInvalidError {
        // return new Password(value) if regex and length are ok else return PasswordInvalidError
        if(value.length >= 8){
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if(passwordRegex.test(value)){
                // Hash le mot de passe avec bcrypt
                const hashedPassword = Password.hashPassword(value);
                return new Password(hashedPassword);
            } else {
                return new PasswordInvalidError("Password must contain at least one uppercase letter, one lowercase letter, one number and one special character");
            }
        } else {
            return new PasswordInvalidError("Password must be at least 8 characters long");
        }
    }

    /**
     * Crée un Password à partir d'un hash déjà généré
     * Utilisé lors de la création depuis la base de données où le password est déjà hashé
     */
    public static createFromHash(hashedPassword: string): Password {
        return new Password(hashedPassword);
    }

    /**
     * Hash un mot de passe en utilisant bcrypt
     */
    public static hashPassword(password: string): string {
        return bcrypt.hashSync(password, Password.BCRYPT_ROUNDS);
    }

    /**
     * Vérifie si un mot de passe en clair correspond au hash stocké
     * Utilise bcrypt.compareSync() pour comparer de manière sécurisée
     */
    public compare(plainPassword: string): boolean {
        try {
            return bcrypt.compareSync(plainPassword, this.value);
        } catch (error) {
            // Si le hash n'est pas valide (format incorrect), retourner false
            return false;
        }
    }

    /**
     * Vérifie si une chaîne ressemble à un hash bcrypt
     * Les hashes bcrypt commencent toujours par $2a$, $2b$ ou $2y$
     */
    public static isBcryptHash(value: string): boolean {
        return /^\$2[ayb]\$.{56}$/.test(value);
    }

    private constructor(value:string){
        this.value = value;
    }
}