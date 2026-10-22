export type TurnoverDrStats = GeneralTurnoverContent & {
    byWilaya?: Array<{
        wilaya: string;
        amount: number;
        contibutionPercentage: number;
        cumulatedAmount: number;
        cumulatedPercentage: number;
    }>;
};

export type TurnoverCompanyStats = GeneralTurnoverContent & {
    byDr?: Array<{
        dr: string;
        drId: string;
        amount: number;
        contibutionPercentage: number;
        cumulatedAmount: number;
        cumulatedPercentage: number;
    }>;
    realisationByDr?: {
        dr: string;
        drId: string;
        turnoverObjective: number;
        turnoverAchieved: number;
        realisationRate: number;
    }[];
};

export type GeneralTurnoverContent = {
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

export type TurnoverStats = TurnoverDrStats | TurnoverCompanyStats;

export type DisplayMode = "table" | "pie" | "bar";

export type DataItem = {
    label: string;
    amount: number;
    contibutionPercentage: number;
    cumulatedAmount: number;
    cumulatedPercentage: number;
};
