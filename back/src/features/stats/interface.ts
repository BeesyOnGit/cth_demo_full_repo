import { number } from "zod";

export type TurnoverDrStats = GeneralTurnoverContent & {
    byWilaya?: Array<{
        wilaya: string;
        amount: number;
        contibutionPercentage: number;
        cumulatedAmount: number; // here we take all the amount from the first to the current
        cumulatedPercentage: number; // here we take the contibutionPercentage from the first to the current
    }>;
};
export type TurnoverCompanyStats = GeneralTurnoverContent & {
    byDr?: Array<{
        dr: string;
        drId: string;
        amount: number;
        contibutionPercentage: number;
        cumulatedAmount: number; // here we take all the amount from the first to the current
        cumulatedPercentage: number; // here we take the contibutionPercentage from the first to the current
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
        cumulatedAmount: number; // here we take all the amount from the first to the current
        cumulatedPercentage: number; // here we take the contibutionPercentage from the first to the current
    }>;
    byClientType?: Array<{
        clientType: string;
        amount: number;
        contibutionPercentage: number;
        cumulatedAmount: number; // here we take all the amount from the first to the current
        cumulatedPercentage: number; // here we take the contibutionPercentage from the first to the current
    }>;
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
    turnoverEvolution?: {
        dr: string; // dr name, or "entreprise" for combined total when multiple DRs exist
        yearlyData: {
            year: number;
            amount: number; // combined total across all DRs when dr is "entreprise"
        }[];
    }[];
};

export type CollectionDrStats = GeneralTurnoverContent & {
    byWilaya?: Array<{
        wilaya: string;
        amount: number;
        contibutionPercentage: number;
        cumulatedAmount: number;
        cumulatedPercentage: number;
    }>;
};

export type CollectionCompanyStats = GeneralTurnoverContent & {
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

export interface InvoiceCollectionStats {
    totalCollected: number;
    totalPending: number;
    collectionRate: number;
    period: {
        start: Date;
        end: Date;
    };
    byStatus?: Array<{
        status: string;
        count: number;
        amount: number;
    }>;
}

export interface DashboardSummary {
    totalClients: number;
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalRevenue: number;
    pendingInvoicesAmount: number;
    totalInvoices: number;
    revenueGrowth: number; // percentage growth compared to previous period
    topPerformingDr?: {
        name: string;
        revenue: number;
    };
    recentActivity: {
        newClientsThisMonth: number;
        newProjectsThisMonth: number;
        invoicesThisMonth: number;
    };
    invoicesByStatus: Array<{
        status: string;
        count: number;
        amount: number;
        percentage: number;
    }>;
    recoveryDetails: {
        oldestUnrecovered: Array<{
            invoiceNumber: string;
            invoiceDate: Date;
            amountHT: number;
            projectTitle?: string;
            clientName?: string;
            daysOverdue: number;
        }>;
        recentRecovered: Array<{
            invoiceNumber: string;
            invoiceDate: Date;
            recoveryDate: Date;
            amountHT: number;
            projectTitle?: string;
            clientName?: string;
        }>;
    };
}

export interface InvoiceStats {
    totalInvoices: number;
    totalAmount: number;
    averageAmount: number;
    period: {
        start: Date;
        end: Date;
    };
    byMonth?: Array<{
        month: string;
        count: number;
        amount: number;
    }>;
}

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
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};

export type EmployeeExperienceStatus = {
    generalStats: {
        byOuvrageType: {
            ouvrageType: string;
            stats: {
                employeeName: string;
                employeeId: string;
                projectCount: number;
            }[];
        }[];
        byServiceType: {
            serviceType: string;
            stats: {
                employeeName: string;
                employeeId: string;
                projectCount: number;
            }[];
        }[];
    };
    employeeDetails?: {
        employeeId: string;
        employeeName: string;
        totalProjects: number;
        experiences: {
            dr: string;
            antenne: string;
            ouvrageType: string;
            serviceType: string;
            projectNumber: string;
        }[];
    };
    period?: {
        start: Date;
        end: Date;
    };
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
export type RankingDrAntennesStats = {
    period: {
        start: Date;
        end: Date;
    };
    rankings: Array<{
        dr: string;
        antenne: string;
        turnover: number;
        collection: number;
    }>;
};
