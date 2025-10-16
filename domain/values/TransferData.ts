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
    ) : TransferData | Error {
        if (!senderLastName || !senderFirstName || !receiverLastName || !receiverFirstName) {
            return new Error("Sender and receiver names must be provided");
        }
        if (senderAccountIban.value === receiverAccountIban.value) {
            return new Error("Sender and receiver IBANs must be different");
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
    

}