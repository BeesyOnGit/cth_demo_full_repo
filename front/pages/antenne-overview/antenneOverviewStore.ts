import { create } from "zustand";
import { getData } from "../../services/api";

export interface AntenneOverviewStats {
    period: {
        start: Date;
        end: Date;
    };
    turnover: number;
    collection: number;
    pendingInvoices: number;
}

interface AntenneOverviewState {
    stats: AntenneOverviewStats | null;
    isLoading: boolean;
    error: string | null;
    fetchAntenneOverview: (queryString?: string) => Promise<void>;
}

export const useAntenneOverviewStore = create<AntenneOverviewState>((set) => ({
    stats: null,
    isLoading: false,
    error: null,
    fetchAntenneOverview: async (queryString?: string) => {
        set({ isLoading: true, error: null });
        try {
            const path = queryString ? `/stats/antenne-overview?${queryString}` : "/stats/antenne-overview";
            const response = await getData({ path });
            set({ stats: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || "Failed to fetch antenne overview", isLoading: false });
        }
    },
}));
