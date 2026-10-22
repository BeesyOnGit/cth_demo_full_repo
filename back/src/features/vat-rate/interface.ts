import { Document } from "mongoose";
import { AuditFields } from "../../utils/interface";

export type IVatRate = Document & GeneralVatRateType;

export type GeneralVatRateType = AuditFields & {
    label: string;
    rate: number;
    validFrom?: Date;
    validTo?: Date;
};
