import { Document } from "mongoose";
import { AuditFields } from "../../utils/interface";

// export type ServiceTypeCode = "CONTROLE" | "CONTROLE_SUIVI" | "EXPERTISE" | "ETUDES" | "SURVEILLANCE_TRAVAUX";

export type IServiceType = Document & GeneralServiceType;

export type GeneralServiceType = AuditFields & {
    code: string;
    label: string;
};
