import { Iban } from "./Iban";
import { TransferDataError } from "../errors/TransferDataError";

export interface TransferDataInterface {
    senderLastName: string;
    senderFirstName: string;
    senderAccountIban: Iban;
    receiverLastName: string;
    receiverFirstName: string;
    receiverAccountIban: Iban;
    instantTransfer: boolean;
    reason?: string;
}

export class TransferData {
    
    private constructor(
        public readonly data: TransferDataInterface
    ) {}

    public static create(
        senderLastName: string,
        senderFirstName: string,
        senderAccountIban: Iban,
        receiverLastName: string,
        receiverFirstName: string,
        receiverAccountIban: Iban,
        instantTransfer: boolean = false,
        reason?: string
    ): TransferData | TransferDataError {
        // Validation des noms
        if (!senderLastName || senderLastName.trim().length === 0) {
            return new TransferDataError("Le nom de famille de l'expéditeur est requis");
        }
        if (!senderFirstName || senderFirstName.trim().length === 0) {
            return new TransferDataError("Le prénom de l'expéditeur est requis");
        }
        if (!receiverLastName || receiverLastName.trim().length === 0) {
            return new TransferDataError("Le nom de famille du destinataire est requis");
        }
        if (!receiverFirstName || receiverFirstName.trim().length === 0) {
            return new TransferDataError("Le prénom du destinataire est requis");
        }

        // Validation des IBANs
        if (senderAccountIban.value === receiverAccountIban.value) {
            return new TransferDataError("L'IBAN de l'expéditeur et du destinataire doivent être différents");
        }

        // Validation de la raison si fournie (optionnelle)
        if (reason !== undefined && reason !== null && reason.trim().length === 0) {
            return new TransferDataError("La raison ne peut pas être vide si elle est fournie");
        }

        const transferData: TransferDataInterface = {
            senderLastName: senderLastName.trim(),
            senderFirstName: senderFirstName.trim(),
            senderAccountIban,
            receiverLastName: receiverLastName.trim(),
            receiverFirstName: receiverFirstName.trim(),
            receiverAccountIban,
            instantTransfer,
            reason: reason !== undefined && reason !== null ? reason.trim() : undefined
        };
        
        return new TransferData(transferData);
    }

    public getSenderName(): string {
        return `${this.data.senderFirstName} ${this.data.senderLastName}`;
    }

    public getReceiverName(): string {
        return `${this.data.receiverFirstName} ${this.data.receiverLastName}`;
    }

    public getSenderIban(): Iban {
        return this.data.senderAccountIban;
    }

    public getReceiverIban(): Iban {
        return this.data.receiverAccountIban;
    }

    public isInstantTransfer(): boolean {
        return this.data.instantTransfer;
    }

    public getReason(): string | undefined {
        return this.data.reason;
    }

    public hasReason(): boolean {
        return this.data.reason !== undefined && this.data.reason !== null && this.data.reason.length > 0;
    }
}