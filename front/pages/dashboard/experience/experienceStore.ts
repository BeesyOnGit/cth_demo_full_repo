import { create } from "zustand";
import { EmployeeExperienceStatus } from "./types";
import { getData } from "@/services/api";

type ExperienceStore = {
    experienceStats: EmployeeExperienceStatus | null;
    isLoading: boolean;
    getExperienceStats: (params?: string) => Promise<void>;
    clearStats: () => void;
};

export const useExperienceStore = create<ExperienceStore>((set) => ({
    experienceStats: null,
    isLoading: false,

    getExperienceStats: async (params?: string) => {
        set({ isLoading: true });
        try {
            const res = await getData({ path: "stats/experience", query: params });
            const { data } = res;
            set({ experienceStats: data, isLoading: false });
        } catch (error: any) {
            console.error("experienceStore.getExperienceStats error", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoading: false });
        }
    },

    clearStats: () => set({ experienceStats: null }),
}));
