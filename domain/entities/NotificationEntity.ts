import { Email } from "../values/Email";

export class NotificationEntity {
  private constructor(
    public readonly id: number,
    public readonly recipientId: number,
    public readonly recipientEmail: Email,
    public readonly type: "INTEREST_RATE_CHANGE" | "ACCOUNT_CREATED" | "TRANSACTION_COMPLETED" | "CREDIT_APPROVED" | "PAYMENT_REMINDER",
    public readonly title: string,
    public readonly message: string,
    public readonly isRead: boolean = false,
    public readonly createdAt: Date = new Date()
  ) {}

  public static createInterestRateChangeNotification(
    id: number,
    recipientId: number,
    recipientEmail: Email,
    oldRate: number,
    newRate: number
  ): NotificationEntity {
    const title = "Modification du taux d'épargne";
    const message = `Le taux d'épargne de votre Livret A a été modifié de ${oldRate}% à ${newRate}%.`;
    
    return new NotificationEntity(
      id,
      recipientId,
      recipientEmail,
      "INTEREST_RATE_CHANGE",
      title,
      message
    );
  }

  public static createAccountCreatedNotification(
    id: number,
    recipientId: number,
    recipientEmail: Email,
    accountType: string,
    iban: string
  ): NotificationEntity {
    const title = "Nouveau compte créé";
    const message = `Votre ${accountType} a été créé avec succès. IBAN: ${iban}`;
    
    return new NotificationEntity(
      id,
      recipientId,
      recipientEmail,
      "ACCOUNT_CREATED",
      title,
      message
    );
  }

  public static createTransactionCompletedNotification(
    id: number,
    recipientId: number,
    recipientEmail: Email,
    transactionType: string,
    amount: number,
    accountIban: string
  ): NotificationEntity {
    const title = "Transaction effectuée";
    const message = `Votre ${transactionType} de ${amount}€ a été effectué sur le compte ${accountIban}.`;
    
    return new NotificationEntity(
      id,
      recipientId,
      recipientEmail,
      "TRANSACTION_COMPLETED",
      title,
      message
    );
  }

  public static createCreditApprovedNotification(
    id: number,
    recipientId: number,
    recipientEmail: Email,
    creditAmount: number,
    monthlyPayment: number
  ): NotificationEntity {
    const title = "Crédit approuvé";
    const message = `Votre demande de crédit de ${creditAmount}€ a été approuvée. Mensualité: ${monthlyPayment}€`;
    
    return new NotificationEntity(
      id,
      recipientId,
      recipientEmail,
      "CREDIT_APPROVED",
      title,
      message
    );
  }

  public static createPaymentReminderNotification(
    id: number,
    recipientId: number,
    recipientEmail: Email,
    creditId: number,
    dueDate: Date,
    amount: number
  ): NotificationEntity {
    const title = "Rappel de paiement";
    const message = `Votre mensualité de ${amount}€ pour le crédit #${creditId} est due le ${dueDate.toLocaleDateString()}.`;
    
    return new NotificationEntity(
      id,
      recipientId,
      recipientEmail,
      "PAYMENT_REMINDER",
      title,
      message
    );
  }

  public markAsRead(): NotificationEntity {
    return new NotificationEntity(
      this.id,
      this.recipientId,
      this.recipientEmail,
      this.type,
      this.title,
      this.message,
      true,
      this.createdAt
    );
  }

  public getRecipientId(): number {
    return this.recipientId;
  }

  public getType(): string {
    return this.type;
  }

  public getTitle(): string {
    return this.title;
  }

  public getMessage(): string {
    return this.message;
  }

  public isRead(): boolean {
    return this.isRead;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getRecipientEmail(): Email {
    return this.recipientEmail;
  }
}
