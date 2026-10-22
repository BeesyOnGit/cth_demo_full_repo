import { Document, Types } from "mongoose";
import { AuditFields } from "../../utils/interface";

export type ICommune = Document & GeneralCommuneType;

export type GeneralCommuneType = AuditFields & {
    communeLt: string;
    communeAr: string;
    dairaLt: string;
    dairaAr: string;
    wilayaCode: string;
};
