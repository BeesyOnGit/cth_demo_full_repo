export type PerformanceBondStats = {
    totalBonds: number;
    totalAmount: number;
    totalCashed: number;
    cashedAmount: number;
    uncashedAmount: number;
    cashedPercentage: number;
    period: {
        start: Date;
        end: Date;
    };
    byDr?: Array<{
        dr: string;
        drId: string;
        totalBonds: number;
        totalAmount: number;
        cashedCount: number;
        cashedAmount: number;
        uncashedAmount: number;
    }>;
    byBank?: Array<{
        bank: string;
        totalBonds: number;
        totalAmount: number;
        cashedCount: number;
        cashedAmount: number;
    }>;
    details?: Array<{
        dr: string;
        antenne: string;
        projectTitle: string;
        conventionNumber: string;
        bondNumber: string;
        date: Date;
        bank: string;
        amount: number;
        cashed: boolean;
    }>;
};

export type DisplayMode = "table" | "pie" | "bar";

export type DrDataItem = {
    label: string;
    totalBonds: number;
    totalAmount: number;
    cashedCount: number;
    cashedAmount: number;
    uncashedAmount: number;
};

export type BankDataItem = {
    label: string;
    totalBonds: number;
    totalAmount: number;
    cashedCount: number;
    cashedAmount: number;
};
