import { RoleInvalidError } from "domain/errors/RoleInvalidError";

export type RoleType = "ADMIN" | "DIRECTOR" | "ADVISE" | "CLIENT";

export class Role {

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

  private constructor(public value: RoleType) {}
}


