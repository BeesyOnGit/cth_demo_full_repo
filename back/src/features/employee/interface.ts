import { Document, Types } from "mongoose";
import { AuditFields, EditHistoryEntry } from "../../utils/interface";
import { IRole } from "../role/interface";
import { IDr } from "../dr/interface";
import { IAntenne } from "../antenne/interface";

export type IEmployee = Document & GeneralEmployeeType;

export type GeneralEmployeeType = AuditFields & {
    fullName: string;
    email: string;
    passwordHash: string;
    roleId: Types.ObjectId;
    drId?: Types.ObjectId;
    antenneId?: Types.ObjectId;
    wilayaCode?: string;
    isAdmin?: boolean;
    // editHistory?: EditHistoryEntry[];
};
export type CreateEmployeeInput = {
    fullName: string;
    email: string;
    passwordHash: string;
    roleId: string;
    drId?: string;
    antenneId?: string;
    wilayaCode?: string;
    createdBy?: string;
    updatedBy?: string;
    isAdmin?: boolean;
};
export type UpdateEmployeeInput = {
    id: string;
    fullName?: string;
    drId?: string;
    antenneId?: string;
    wilayaCode?: string;
    isActive?: boolean;
    updatedBy: string;
    passwordHash?: string;
    isAdmin?: boolean;
};

export type IEmployeePublic = Document &
    AuditFields & {
        fullName: string;
        email: string;
        roleId: Partial<IRole>;
        drId?: Partial<IDr>;
        antenneId?: Partial<IAntenne>;
        wilayaCode?: string;
        isAdmin?: boolean;
    };

export type IEmployeePublicDetails = IEmployeePublic & { editHistory?: EditHistoryEntry[] };

export const EmployeePopulatePublicFields = "fullName isActive";
