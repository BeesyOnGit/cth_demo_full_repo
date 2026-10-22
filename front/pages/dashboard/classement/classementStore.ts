import { create } from "zustand";
import { RankingDrAntennesStats } from "./types";
import { getData } from "@/services/api";

type ClassementStore = {
    rankingStats: RankingDrAntennesStats | null;
    isLoading: boolean;
    getRankingStats: (params?: string) => Promise<void>;
    clearStats: () => void;
};

export const useClassementStore = create<ClassementStore>((set) => ({
    rankingStats: null,
    isLoading: false,

    getRankingStats: async (params?: string) => {
        set({ isLoading: true });
        try {
            const res = await getData({ path: "stats/ranking", query: params });
            const { data } = res;
            set({ rankingStats: data, isLoading: false });
        } catch (error: any) {
            console.error("classementStore.getRankingStats error", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoading: false });
        }
    },

    clearStats: () => set({ rankingStats: null }),
}));
