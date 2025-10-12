import { Iban } from "domain/values/Iban";
import { TransferData } from "domain/values/TransferData";

export class OperationEntity {
    private constructor(
        public readonly id:number,
        public readonly data : TransferData,
        public readonly amount:number,
        public readonly status:"PENDING" | "COMPLETED" | "FAILED",
        public readonly date:Date=new Date(),
        ){
    }

}