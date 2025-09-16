import { RoleInvalidError } from "domain/errors/RoleInvalidError";

export type RoleType = "ADMIN" | "DIRECTOR" | "ADVISE" | "CLIENT";

export class Role {
  private role: RoleType;

  private static readonly validRoles: RoleType[] = [
    "ADMIN",
    "DIRECTOR",
    "ADVISE",
    "CLIENT"
  ];

  public static isRole(role: string): Role | Error {
    if (Role.validRoles.includes(role as RoleType)) {
      return new Role(role as RoleType);
    } else {
      return new RoleInvalidError(`Invalid role: ${role}`);
    }
  }

  private constructor(role: RoleType) {
    this.role = role;
  }

  public getRole(): RoleType {
    return this.role;
  }
}


