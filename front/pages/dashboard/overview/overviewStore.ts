import { create } from "zustand";
import { getData } from "../../../services/api";

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

interface OverviewState {
    summary: DashboardSummary | null;
    isLoading: boolean;
    error: string | null;
    fetchDashboardSummary: (drId?: string) => Promise<void>;
}

export const useOverviewStore = create<OverviewState>((set) => ({
    summary: null,
    isLoading: false,
    error: null,
    fetchDashboardSummary: async (drId?: string) => {
        set({ isLoading: true, error: null });
        try {
            const queryString = drId ? `?drId=${drId}` : "";
            const data = await getData({ path: `/stats/dashboard${queryString}` });
            set({ summary: data.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || "Failed to fetch dashboard summary", isLoading: false });
        }
    },
}));
