import { Document } from "mongoose";
import { AuditFields } from "../../utils/interface";

export type IWilaya = Document & GeneralWilayaType;

export type GeneralWilayaType = AuditFields & {
    code: string;
    name: string;
};

export const WilayaGeneralPopulateFields = "_id code name isActive";
