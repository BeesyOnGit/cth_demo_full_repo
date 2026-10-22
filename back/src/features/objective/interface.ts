import { Document, Types } from "mongoose";
import { AuditFields } from "../../utils/interface";

export type ScopeType = "NATIONAL" | "DR" | "ANTENNE";

export type IObjective = Document & GeneralObjectiveType;

export type GeneralObjectiveType = AuditFields & {
    scopeType: ScopeType;
    drId?: Types.ObjectId;
    antenneId?: Types.ObjectId;
    year: number;
    month?: number;
    targetCA: number;
    targetRecoveryRate: number;
};
