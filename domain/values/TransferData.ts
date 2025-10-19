import { TransferDataError } from "domain/errors/TransferDataError";
import { Iban } from "./Iban";

export interface TransferDataInterface {
    senderLastName:string,
    senderFirstName:string,
    senderAccountIban:Iban,
    receiverLastName:string,
    receiverFirstName:string,
    receiverAccountIban:Iban,
    instantTransfer:boolean,
    reason?:string,
}

export class TransferData {
    
    private constructor(
        public readonly data : TransferDataInterface
    ){}

    public static create (
        senderLastName:string,
        senderFirstName:string,
        senderAccountIban:Iban,
        receiverLastName:string,
        receiverFirstName:string,
        receiverAccountIban:Iban,
        instantTransfer:boolean=false,
        reason?:string
    ) : TransferData | TransferDataError {
        if (!senderLastName || !senderFirstName || !receiverLastName || !receiverFirstName) {
            return new TransferDataError("Sender and receiver names must be provided");
        }
        if (senderAccountIban.value === receiverAccountIban.value) {
            return new TransferDataError("Sender and receiver IBANs must be different");
        }
        const transferData:TransferDataInterface = {
            senderLastName,
            senderFirstName,
            senderAccountIban,
            receiverLastName,
            receiverFirstName,
            receiverAccountIban,
            instantTransfer,
            reason
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
        return !!this.data.reason;
    }   
    

}