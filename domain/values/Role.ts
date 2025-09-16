import { RoleInvalidError } from "domain/errors/RoleInvalidError";

export type RoleType = "ADMIN" | "DIRECTOR" | "ADVISE" | "CLIENT";

export class Role {
    private role:RoleType;

    public static isRole(role:string): Role | Error {
        if (role as RoleType) {
            return new Role(role as RoleType);
        } else {
            return new RoleInvalidError("Invalid role");
        }
    }
    private constructor(role: RoleType) {
        this.role = role;
    }

    public getRole(): RoleType {
        return this.role;
    }
}

