import { Document } from "mongoose";
import { AuditFields } from "../../utils/interface";

// export type DrCode = "DRC" | "DRG" | "DRA" | "DRS" | "DRO" | "DRT";

export type IDr = Document & GeneralDrType;

export type DrBankAcountType = {
    bankName: string;
    accountNumber: string;
};

export type GeneralDrType = AuditFields &
    DrBankAcountType & {
        code: String;
        name: string;
    };

export const DrGeneralPopulateFields = "_id code name isActive";
