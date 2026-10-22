import { Document } from "mongoose";
import { AuditFields } from "../../utils/interface";

export type OuvrageTypeCode = "BARRAGE" | "TRANSFERT" | "AEP" | "STEP" | "CHATEAU_EAU" | "AUTRE";

export type IOuvrageType = Document & GeneralOuvrageType;

export type GeneralOuvrageType = AuditFields & {
    code: OuvrageTypeCode;
    label: string;
};
