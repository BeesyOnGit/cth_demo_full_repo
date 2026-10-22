import { Document } from "mongoose";
import { AuditFields } from "../../utils/interface";

export type IClientType = Document & GeneralClientTypeType;

export type GeneralClientTypeType = AuditFields & {
    code: string;
    label: string;
};
