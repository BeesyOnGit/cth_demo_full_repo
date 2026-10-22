import { Document, Types } from "mongoose";
import { AuditFields, EditHistoryEntry } from "../../utils/interface";

export type BillingMode = "AVANCEMENT_TRAVAUX" | "FACTURATION_MO";
export type ContractMode = "LC" | "ODS";
export enum BillingTypeEnum {
    FACTURE = "FACTURE",
    SITUATION = "SITUATION",
}

export type IProjectManagerSnapshot = {
    employeeId: string;
    fullName: string;
};

export type IVatRateSnapshot = {
    vatRateId: string;
    rateSnapshot: number;
    labelSnapshot?: string;
};

export type IGuarantee = {
    hasPerformanceBond: boolean;
    date?: Date;
    number?: string;
    amount?: number;
    bank?: string;
    cashed?: boolean;
};

export type IProjectStats = {
    totalInvoicedHT?: number;
    totalInvoicedTTC?: number;
    totalRecoveredTTC?: number;
    lastPhysicalProgress?: number;
};

export type AvenantType = {
    amountHT: number;
    date: Date;
    projectId: Types.ObjectId;
};

export type IProject = Document & GeneralProjectType;

export type GeneralProjectType = AuditFields & {
    projectNumber: string;
    title: string;

    isAvenant: boolean;
    parentProjectId?: Types.ObjectId;
    // the avenant number that are attached to the project
    avenants: number;

    signDate: Date;
    operationNumber: string;
    conventionNumber: string;

    drId: Types.ObjectId;
    antenneId: Types.ObjectId;
    clientId: Types.ObjectId;

    projectManagerIds: string[];
    // projectManagersSnapshot?: IProjectManagerSnapshot[];

    ouvrageTypeId: Types.ObjectId;
    serviceTypeId: Types.ObjectId;

    billingMode: BillingMode;
    billingType: BillingTypeEnum;

    vatRates: IVatRateSnapshot[];

    contractMode: ContractMode;
    lcDate?: Date;

    isConvertedToOds: boolean;
    convertedAt?: Date;
    convertedBy?: Types.ObjectId;

    odsStart?: Date;
    odsEnd?: Date;
    odsDurationDays?: number;

    workAmountMT: number;
    serviceRate: number;
    amountHTSnapshot: number;

    guarantee?: IGuarantee;
    situationCounter?: number;

    stats?: IProjectStats;

    editHistory?: EditHistoryEntry[];
    invoiced?: number;
    collected?: number;
    lastProgress?: number;
};

// export type ProjectFilterOptions = {
//     drId?: string;
//     antenneId?: string;
//     clientId?: string;
// };

export const ProjectPopulatePublicFields = ["_id", "projectNumber", "title"];
