import { Document, Types } from "mongoose";
import { AuditFields } from "../../utils/interface";

export type AntenneType = "AC" | "DT_DR";

export type IAntenne = Document & GeneralAntenneType;

export type GeneralAntenneType = AuditFields & {
    _id?: string;
    code: string;
    label: string;
    // type: AntenneType;
    drId: Types.ObjectId;
    wilayaCode: string[];
};

export const AntenneGeneralPopulateFields = "_id code label isActive";
