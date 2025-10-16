import { TransferData } from "domain/values/TransferData";
import { Amount } from "domain/values/Amount";

export type OperationStatus = "PENDING" | "COMPLETED" | "FAILED";

export class OperationEntity {
    private constructor(
        public readonly id: number,
        public readonly data: TransferData,
        public readonly amount: Amount,
        public readonly status: OperationStatus,
        public readonly date: Date = new Date(),
        public readonly completedAt?: Date
    ) {}

    public static create(
        id: number,
        data: TransferData,
        amount: Amount,
        status: OperationStatus = "PENDING"
    ): OperationEntity | Error {
        // Validation de l'ID
        if (id <= 0) {
            return new Error("L'ID de l'opération doit être positif");
        }

        // Validation du montant
        if (amount.value <= 0) {
            return new Error("Le montant de l'opération doit être positif");
        }

        return new OperationEntity(id, data, amount, status);
    }

    public complete(): OperationEntity {
        if (this.status === "COMPLETED") {
            return this; // Déjà complétée
        }
        
        if (this.status === "FAILED") {
            throw new Error("Impossible de compléter une opération échouée");
        }

        return new OperationEntity(
            this.id,
            this.data,
            this.amount,
            "COMPLETED",
            this.date,
            new Date()
        );
    }

    public fail(): OperationEntity {
        if (this.status === "FAILED") {
            return this; // Déjà échouée
        }

        if (this.status === "COMPLETED") {
            throw new Error("Impossible d'échouer une opération complétée");
        }

        return new OperationEntity(
            this.id,
            this.data,
            this.amount,
            "FAILED",
            this.date,
            this.completedAt
        );
    }

    public getId(): number {
        return this.id;
    }

    public getAmount(): Amount {
        return this.amount;
    }

    public getStatus(): OperationStatus {
        return this.status;
    }

    public getDate(): Date {
        return this.date;
    }

    public getCompletedAt(): Date | undefined {
        return this.completedAt;
    }

    public isCompleted(): boolean {
        return this.status === "COMPLETED";
    }

    public isPending(): boolean {
        return this.status === "PENDING";
    }

    public isFailed(): boolean {
        return this.status === "FAILED";
    }

    public getTransferData(): TransferData {
        return this.data;
    }

    public getSenderName(): string {
        return this.data.getSenderName();
    }

    public getReceiverName(): string {
        return this.data.getReceiverName();
    }

    public getSenderIban(): string {
        return this.data.getSenderIban().value;
    }

    public getReceiverIban(): string {
        return this.data.getReceiverIban().value;
    }

    public isInstantTransfer(): boolean {
        return this.data.isInstantTransfer();
    }

    public getReason(): string | undefined {
        return this.data.getReason();
    }

    public hasReason(): boolean {
        return this.data.hasReason();
    }

    public getDuration(): number | undefined {
        if (!this.completedAt) {
            return undefined;
        }
        return this.completedAt.getTime() - this.date.getTime();
    }

    public isIntrabankTransfer(): boolean {
        // Vérifier si c'est un virement intrabancaire
        // En supposant que les IBANs de la même banque ont le même code banque
        const senderIban = this.data.getSenderIban().value;
        const receiverIban = this.data.getReceiverIban().value;
        
        // Les codes banque sont aux positions 4-7 dans l'IBAN français
        const senderBankCode = senderIban.substring(4, 8);
        const receiverBankCode = receiverIban.substring(4, 8);
        
        return senderBankCode === receiverBankCode;
    }
}