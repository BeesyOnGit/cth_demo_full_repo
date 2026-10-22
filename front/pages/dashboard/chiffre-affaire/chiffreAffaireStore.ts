import { create } from "zustand";
import { TurnoverStats } from "./types";
import { getData } from "@/services/api";

type ChiffreAffaireStore = {
    turnoverStats: TurnoverStats | null;
    isLoading: boolean;
    getTurnoverStats: (params?: string) => Promise<void>;
    clearStats: () => void;
};

export const useChiffreAffaireStore = create<ChiffreAffaireStore>((set) => ({
    turnoverStats: null,
    isLoading: false,

    getTurnoverStats: async (params?: string) => {
        set({ isLoading: true });
        try {
            const res = await getData({ path: "stats/turnover", query: params });
            const { data } = res;
            set({ turnoverStats: data, isLoading: false });
        } catch (error: any) {
            console.error("chiffreAffaireStore.getTurnoverStats error", error);
            return error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoading: false });
        }
    },

    clearStats: () => set({ turnoverStats: null }),
}));
