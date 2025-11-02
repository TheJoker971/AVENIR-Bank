import { MessageEntity } from "domain/entities/MessageEntity";
import { MessageEntitySQL } from "../entities/MessageEntitySQL";

export class MessageMapper {
  static toDomain(sqlEntity: MessageEntitySQL): MessageEntity {
    return MessageEntity.create(
      sqlEntity.id,
      sqlEntity.senderId,
      sqlEntity.receiverId || 0,
      sqlEntity.message
    );
  }

  static toSQL(domainEntity: MessageEntity): MessageEntitySQL {
    const sqlEntity = new MessageEntitySQL();
    sqlEntity.id = domainEntity.id;
    sqlEntity.senderId = domainEntity.senderId;
    sqlEntity.receiverId = domainEntity.receiverId;
    sqlEntity.message = domainEntity.message;
    sqlEntity.date = domainEntity.date;
    return sqlEntity;
  }
}

