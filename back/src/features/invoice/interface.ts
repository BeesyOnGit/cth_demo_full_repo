import { Document, Types } from "mongoose";
import { AuditFields, EditHistoryEntry } from "../../utils/interface";
import { BillingTypeEnum } from "../project/interface";

export type RecoveryStatus = "NON" | "OUI" | "PARTIEL";

export type IVatRateRef = {
    vatRateId: Types.ObjectId;
    rateSnapshot: number;
};

export type IInvoice = Document & GeneralInvoiceType;

export type GeneralInvoiceType = AuditFields & {
    projectId: Types.ObjectId;
    invoiceNumber: string;
    invoiceDate: Date;

    drId: Types.ObjectId;
    antenneId: Types.ObjectId;

    invoiceType: BillingTypeEnum;

    amountHT: number;
    vatRateRef: IVatRateRef[];
    amountTTC: number;

    physicalProgress: number;

    isRecovered: boolean;
    recoveryDate?: Date | null;

    notes?: string;

    editHistory?: EditHistoryEntry[];
};

export type InvoiceFilterOptions = {
    projectId?: string;
};
