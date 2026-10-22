import { Document } from "mongoose";
import { AuditFields } from "../../utils/interface";

export type IRole = Document & GeneralRoleType;

export type GeneralRoleType = AuditFields & {
    code: string;
    label: string;
    permissions?: string[];
};
