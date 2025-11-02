import { OperationEntity, OperationStatus } from "domain/entities/OperationEntity";
import { OperationEntitySQL } from "../entities/OperationEntitySQL";
import { TransferData } from "domain/values/TransferData";
import { Iban } from "domain/values/Iban";
import { Amount } from "domain/values/Amount";

export class OperationMapper {
  static toDomain(sqlEntity: OperationEntitySQL): OperationEntity | null {
    try {
      // Créer les IBANs - pour l'instant on utilise une approche simplifiée
      // Note: Iban n'a pas de fromString, il faudrait parser l'IBAN manuellement
      // Pour l'instant, on crée un wrapper simple
      const senderIban = new (class extends Iban {
        constructor() { super(sqlEntity.senderIban as any); }
      })();
      
      const receiverIban = new (class extends Iban {
        constructor() { super(sqlEntity.receiverIban as any); }
      })();

      const transferData = TransferData.create(
        sqlEntity.senderLastName,
        sqlEntity.senderFirstName,
        senderIban,
        sqlEntity.receiverLastName,
        sqlEntity.receiverFirstName,
        receiverIban,
        sqlEntity.isInstant,
        sqlEntity.reason
      );
      if (transferData instanceof Error) return null;

      const amount = Amount.create(sqlEntity.amount);
      if (amount instanceof Error) return null;

      const status = sqlEntity.status as OperationStatus;

      const operation = OperationEntity.create(
        sqlEntity.id,
        transferData,
        amount,
        status
      );
      if (operation instanceof Error) return null;

      return operation;
    } catch (error) {
      return null;
    }
  }

  static toSQL(domainEntity: OperationEntity): OperationEntitySQL {
    const sqlEntity = new OperationEntitySQL();
    sqlEntity.id = domainEntity.getId();
    sqlEntity.senderIban = domainEntity.getSenderIban();
    sqlEntity.senderFirstName = domainEntity.getTransferData().data.senderFirstName;
    sqlEntity.senderLastName = domainEntity.getTransferData().data.senderLastName;
    sqlEntity.receiverIban = domainEntity.getReceiverIban();
    sqlEntity.receiverFirstName = domainEntity.getTransferData().data.receiverFirstName;
    sqlEntity.receiverLastName = domainEntity.getTransferData().data.receiverLastName;
    sqlEntity.amount = domainEntity.getAmount().value;
    sqlEntity.status = domainEntity.getStatus();
    sqlEntity.isInstant = domainEntity.isInstantTransfer();
    sqlEntity.reason = domainEntity.getReason();
    sqlEntity.completedAt = domainEntity.getCompletedAt();
    return sqlEntity;
  }
}

