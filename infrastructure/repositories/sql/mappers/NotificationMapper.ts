import { NotificationEntity } from "domain/entities/NotificationEntity";
import { NotificationEntitySQL } from "../entities/NotificationEntitySQL";
import { Email } from "domain/values/Email";

export class NotificationMapper {
  static toDomain(sqlEntity: NotificationEntitySQL): NotificationEntity | null {
    try {
      const email = Email.isEmail(sqlEntity.recipientEmail);
      if (email instanceof Error) return null;

      // Créer la notification selon son type
      switch (sqlEntity.type) {
        case "INTEREST_RATE_CHANGE":
          // On ne peut pas recréer avec les anciennes valeurs, on utilise un message générique
          return NotificationEntity.createInterestRateChangeNotification(
            sqlEntity.id,
            sqlEntity.recipientId,
            email,
            0, // oldRate - inconnu
            parseFloat(sqlEntity.message.match(/à (\d+(?:\.\d+)?)%/)?.at(1) || "0")
          );
        case "ACCOUNT_CREATED":
          return NotificationEntity.createAccountCreatedNotification(
            sqlEntity.id,
            sqlEntity.recipientId,
            email,
            "Compte", // accountType - à extraire du message si possible
            "" // iban - à extraire
          );
        case "TRANSACTION_COMPLETED":
          return NotificationEntity.createTransactionCompletedNotification(
            sqlEntity.id,
            sqlEntity.recipientId,
            email,
            "Transaction", // transactionType
            0, // amount - à extraire
            "" // accountIban
          );
        case "CREDIT_APPROVED":
          return NotificationEntity.createCreditApprovedNotification(
            sqlEntity.id,
            sqlEntity.recipientId,
            email,
            0, // creditAmount - à extraire
            0 // monthlyPayment - à extraire
          );
        case "PAYMENT_REMINDER":
          return NotificationEntity.createPaymentReminderNotification(
            sqlEntity.id,
            sqlEntity.recipientId,
            email,
            0, // creditId - à extraire
            sqlEntity.createdAt, // dueDate
            0 // amount - à extraire
          );
        default:
          // Notification générique
          const notification = NotificationEntity.createInterestRateChangeNotification(
            sqlEntity.id,
            sqlEntity.recipientId,
            email,
            0,
            0
          );
          // Note: On ne peut pas modifier le type après création, donc cette approche est limitée
          return notification;
      }
    } catch (error) {
      return null;
    }
  }

  static toSQL(domainEntity: NotificationEntity): NotificationEntitySQL {
    const sqlEntity = new NotificationEntitySQL();
    sqlEntity.id = domainEntity.id;
    sqlEntity.recipientId = domainEntity.getRecipientId();
    sqlEntity.recipientEmail = domainEntity.getRecipientEmail().getValue();
    sqlEntity.type = domainEntity.getType();
    sqlEntity.title = domainEntity.getTitle();
    sqlEntity.message = domainEntity.getMessage();
    sqlEntity.isRead = domainEntity.isRead();
    sqlEntity.createdAt = domainEntity.getCreatedAt();
    return sqlEntity;
  }
}

