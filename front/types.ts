// Enums mirroring backend schema
export enum RoleCode {
    ADMIN = "ADMIN",
    PDG = "PDG",
    DGA = "DGA",
    DR = "DR",
    CHEF_ANTENNE = "CHEF_ANTENNE",
    CDT = "CDT",
    DT = "DT",
    DFC = "DFC",
}

export enum ContractMode {
    LC = "LC",
    ODS = "ODS",
}

export enum ServiceTypeCode {
    CONTROLE = "CONTROLE",
    CONTROLE_SUIVI = "CONTROLE_SUIVI",
    EXPERTISE = "EXPERTISE",
    ETUDES = "ETUDES",
    SURVEILLANCE_TRAVAUX = "SURVEILLANCE_TRAVAUX",
}

export enum OuvrageTypeCode {
    BARRAGE = "BARRAGE",
    TRANSFERT = "TRANSFERT",
    AEP = "AEP",
    STEP = "STEP",
    CHATEAU_EAU = "CHATEAU_EAU",
    AUTRE = "AUTRE",
}

// Interfaces

export type AuditFields = {
    _id: string;
    createdAt: string;
    createdBy: string; // ID
    updatedAt: string;
    updatedBy: string; // ID
    isActive: boolean;
};

export type User = AuditFields & {
    fullName: string;
    email: string;
    roleId: string;
    roleCode: RoleCode; // Hydrated for frontend ease
    drId?: string;
    antenneId?: string;
    wilayaId?: string;
    isAdmin: boolean;
};

export type Wilaya = AuditFields & {
    code: string;
    name: string;
};

// Client Schema Updates
export type ClientAddress = {
    label: string;
    address: string;
    wilayaCode?: string;
    communeCode?: string;
};

export type ClientContact = {
    name: string;
    phone: string;
    email: string;
    role: string;
};

export type ClientFinancial = {
    nif: string;
    nis: string;
    rc: string;
};

export type Client = AuditFields & {
    name: string;
    identifier?: string; // Legacy/Internal ID
    wilayaCodes: string[]; // Changed from ids to codes per request
    financial?: ClientFinancial;
    addresses?: ClientAddress[];
    contacts?: ClientContact[];
};

export type VatRate = AuditFields & {
    label: string;
    rate: number;
};

export type Project = AuditFields & {
    projectNumber: string;
    title: string;
    clientId: string;
    antenneId: string;
    drId: string;
    projectManagerIds: string[];

    // Referentials
    ouvrageTypeId: string;
    serviceTypeId: string;
    billingMode: "AVANCEMENT_TRAVAUX" | "FACTURATION_MO";
    billingType?: BillingTypeEnum;

    // Financials
    vatRates: {
        vatRateId: string;
        rateSnapshot: number;
        labelSnapshot?: string;
    }[];
    workAmountMT: number;
    serviceRate: number;
    amountHTSnapshot: number;

    // Contract Mode
    contractMode: ContractMode;
    // LC specific
    lcDate?: string;
    isConvertedToOds: boolean;
    convertedAt?: string;

    // ODS specific (or converted LC)
    odsStart?: string;
    odsEnd?: string;
    odsDurationDays?: number;

    // Guarantee
    guarantee: {
        hasPerformanceBond: boolean;
        date?: string;
        number?: string;
        amount?: number;
        bank?: string;
        cashed?: boolean;
    };
    // Additional project meta (from GeneralProjectType)
    isAvenant?: boolean;
    parentProjectId?: string;
    avenants?: number;
    signDate?: string;
    operationNumber?: string;
    conventionNumber?: string;
    stats?: any;
    editHistory?: any[];
    invoiced?: number;
    collected?: number;
    lastProgress?: number;
};

export enum BillingTypeEnum {
    FACTURE = "FACTURE",
    SITUATION = "SITUATION",
}

export type IVatRateRef = {
    vatRateId: string;
    rateSnapshot: number;
};

export type Invoice = AuditFields & {
    projectId: string;
    invoiceNumber: string;
    invoiceDate: string;

    drId: string;
    antenneId: string;

    invoiceType: BillingTypeEnum;

    amountHT: number;
    vatRateRef: IVatRateRef[];
    amountTTC: number;

    physicalProgress: number;

    isRecovered: boolean;
    recoveryDate?: string | null;

    notes?: string;
};

// Dropdown options helper
export type Option = {
    label: string;
    value: string;
    data?: any;
};

export type PaginationType = {
    total: number;
    page: number;
    limit: number;
};

export type ScopeType = "NATIONAL" | "DR" | "ANTENNE";

export type Objective = AuditFields & {
    scopeType: ScopeType;
    drId?: string;
    antenneId?: string;
    year: number;
    month?: number;
    targetCA: number;
    targetRecoveryRate: number;
};

export type AntenneOverviewStats = {
    period: {
        start: Date;
        end: Date;
    };
    turnover: number;
    collection: number;
    pendingInvoices: number;
};
