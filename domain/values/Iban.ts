import { IbanInvalidError } from "../errors/IbanInvalidError";
import { CountryCode } from "./CountryCode";

export type IbanType = string;
export type BranchCode = string;
export type AccountNumber = string;


export class Iban {

    public static create(bankCode:string,branchCode:string,accountNumber:string,ribKey:string): Iban | Error {
        
    }

    private constructor(public iban:IbanType){}

    private ibanChecksum(countryCode: string, bban: string): string {
    // étape 1 : FR00 + BBAN
    const temp = bban + countryCode.toUpperCase() + "00";

    // étape 2 : conversion lettres → chiffres
    const converted = temp.replace(/[A-Z]/g, ch => (ch.charCodeAt(0) - 55).toString());

    // étape 3 : mod 97
    const mod = BigInt(converted) % 97n;

    // étape 4 : clé
    const checkDigits = 98n - mod;
    return checkDigits.toString().padStart(2, "0");
    }

    private generateFrenchIBAN(countryCode:CountryCode,bank: BankCode, branch: BranchCode, account: AccountNumber, ribKey: RibKey): string {
    const bban = bank + branch + account.padStart(11, "0") + ribKey;
    const checksum = this.ibanChecksum("FR", bban);
    return `${countryCode}${checksum}${bban}`;
    }
}