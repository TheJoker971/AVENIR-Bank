import { RibKeyInvalidError } from "domain/errors/RibKeyInvalidError";

export type RibKeyType = string;

export class RibKey {
    ribKey:RibKeyType;

    public static isRibKey(ribKey:string):RibKey | RibKeyInvalidError{
        const ribKeyRegex = /^[0-9]{2}$/;
        if(!ribKeyRegex.test(ribKey)){
            return new RibKeyInvalidError("RibKeyInvalidError: Le clé RIB doit contenir exactement 2 chiffres.");
        }
        return new RibKey(ribKey);
    }

    constructor(ribKey:RibKeyType){
        this.ribKey = ribKey;
    }
}