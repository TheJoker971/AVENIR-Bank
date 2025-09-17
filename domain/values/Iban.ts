import { AccountNumber } from "./AccountNumber";
import { BankCode } from "./BankCode";
import { BranchCode } from "./BranchCode";
import { CountryCode } from "./CountryCode";
import { RibKey } from "./RibKey";

export type IbanType = string;



export class Iban {

    public static create(countryCode:CountryCode,bankCode:BankCode,branchCode:BranchCode,accountNumber:AccountNumber,ribKey:RibKey): Iban | Error {
        const iban = this.generateIBAN(countryCode,bankCode,branchCode,accountNumber,ribKey);
        return new Iban(iban);
    }


    private constructor(public value:IbanType){}

    private static ibanChecksum(countryCode: string, bban: string): string {
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

    private static generateIBAN(countryCode:CountryCode,bank: BankCode, branchCode: BranchCode, accountNumber: AccountNumber, ribKey: RibKey): string  {
    const bban = bank.value + branchCode.value + accountNumber.value.padStart(11, "0") + ribKey.value;
    const checksum = this.ibanChecksum(countryCode, bban);
    return `${countryCode}${checksum}${bban}`;
    }
}