export type CollectionDrStats = GeneralCollectionContent & {
    byWilaya?: Array<{
        wilaya: string;
        amount: number;
        contibutionPercentage: number;
        cumulatedAmount: number;
        cumulatedPercentage: number;
    }>;
};

export type CollectionCompanyStats = GeneralCollectionContent & {
    byDr?: Array<{
        dr: string;
        drId: string;
        amount: number;
        contibutionPercentage: number;
        cumulatedAmount: number;
        cumulatedPercentage: number;
    }>;
    collectionByDr?: {
        dr: string;
        drId: string;
        objectiveRate: number;
        collectedRate: number;
    }[];
};

export type GeneralCollectionContent = {
    totalTurnoverMonth: number;
    totalTurnoverCumulated: number;
    period: {
        start: Date;
        end: Date;
    };
    byServiceType?: Array<{
        serviceType: string;
        amount: number;
        contibutionPercentage: number;
        cumulatedAmount: number;
        cumulatedPercentage: number;
    }>;
    byClientType?: Array<{
        clientType: string;
        amount: number;
        contibutionPercentage: number;
        cumulatedAmount: number;
        cumulatedPercentage: number;
    }>;
    turnoverEvolution?: {
        dr: string;
        yearlyData: {
            year: number;
            amount: number;
        }[];
    }[];
    DrTurnoverObjectivesRealisation?: {
        objective: number;
        turnover: number;
        realisationRate: number;
        month?: number;
    }[];
    DrCollectionObjectivesRealisation?: {
        objectiveRate: number;
        collectedRate: number;
        month?: number;
    }[];
};

export type CollectionStats = CollectionDrStats | CollectionCompanyStats;

export type DisplayMode = "table" | "pie" | "bar";

export type DataItem = {
    label: string;
    amount: number;
    contibutionPercentage: number;
    cumulatedAmount: number;
    cumulatedPercentage: number;
};
