import { Document, Types } from "mongoose";
import { AuditFields } from "../../utils/interface";

export type IClientAddress = {
    label: string;
    address: string;
    wilayaCode?: string;
    communeCode?: string;
};

export type IClientContact = {
    name: string;
    phone: string;
    email: string;
    role: string;
};
export type IClientFinancial = {
    nif: string;
    nis: string;
    rc: string;
};

export type IClient = Document & GeneralClientType;

export type GeneralClientType = AuditFields & {
    name: string;
    identifier?: string;
    wilayaCodes: string[];
    communeCodes: string[];
    financial?: IClientFinancial;
    addresses?: IClientAddress;
    contacts?: IClientContact;
    drId: Types.ObjectId[];
    antenneId: Types.ObjectId[];
    clientTypeId: Types.ObjectId;
};

export const ClientGeneralPopulateFields = "_id name identifier isActive";
