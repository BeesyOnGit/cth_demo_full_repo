import { create } from "zustand";
import { CollectionStats } from "./types";
import { getData } from "@/services/api";

type EncaissementStore = {
    collectionStats: CollectionStats | null;
    isLoading: boolean;
    getCollectionStats: (params?: string) => Promise<void>;
    clearStats: () => void;
};

export const useEncaissementStore = create<EncaissementStore>((set) => ({
    collectionStats: null,
    isLoading: false,

    getCollectionStats: async (params?: string) => {
        set({ isLoading: true });
        try {
            const res = await getData({ path: "stats/invoice-collection", query: params });
            const { data } = res;
            set({ collectionStats: data, isLoading: false });
        } catch (error: any) {
            console.error("encaissementStore.getCollectionStats error", error);
            return error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoading: false });
        }
    },

    clearStats: () => set({ collectionStats: null }),
}));
