import { UserEntity } from "domain/entities/UserEntity";
import { UserEntitySQL } from "../entities/UserEntitySQL";

export class UserMapper {
  static toDomain(sqlEntity: UserEntitySQL): UserEntity {
    return UserEntity.create(
      sqlEntity.id,
      sqlEntity.firstname,
      sqlEntity.lastname,
      sqlEntity.email,
      sqlEntity.password,
      sqlEntity.address,
      sqlEntity.role,
      sqlEntity.banned
    ) as UserEntity;
  }

  static toSQL(domainEntity: UserEntity): UserEntitySQL {
    const sqlEntity = new UserEntitySQL();
    sqlEntity.id = domainEntity.id;
    sqlEntity.firstname = domainEntity.firstname;
    sqlEntity.lastname = domainEntity.lastname;
    sqlEntity.email = domainEntity.email.getValue();
    sqlEntity.password = domainEntity.password.getValue();
    sqlEntity.address = domainEntity.address;
    sqlEntity.role = domainEntity.role.getValue();
    sqlEntity.banned = domainEntity.banned;
    return sqlEntity;
  }
}

