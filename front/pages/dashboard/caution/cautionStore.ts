import { create } from "zustand";
import { PerformanceBondStats } from "./types";
import { getData } from "@/services/api";

type CautionStore = {
    bondStats: PerformanceBondStats | null;
    isLoading: boolean;
    getBondStats: (params?: string) => Promise<void>;
    clearStats: () => void;
};

export const useCautionStore = create<CautionStore>((set) => ({
    bondStats: null,
    isLoading: false,

    getBondStats: async (params?: string) => {
        set({ isLoading: true });
        try {
            const res = await getData({ path: "stats/performance-bonds", query: params });
            const { data } = res;
            set({ bondStats: data, isLoading: false });
        } catch (error: any) {
            console.error("cautionStore.getBondStats error", error);
            return error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoading: false });
        }
    },

    clearStats: () => set({ bondStats: null }),
}));
