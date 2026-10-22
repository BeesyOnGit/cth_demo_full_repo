import { getData, postData, putData, deleteData } from "@/services/api";
import { AuditFields, PaginationType } from "@/types";
import { create } from "zustand";

export type Commune = AuditFields & {
    communeLt: string;
    communeAr: string;
    dairaLt: string;
    dairaAr: string;
    wilayaCode: string;
};

type CommuneStore = {
    communes: Commune[] | null;
    isLoadingCommune: boolean;
    isCommuneCUD: boolean;
    communePagination: PaginationType | null;
    getAllCommunes: (params?: string) => Promise<void>;
    addCommune: (commune: Commune) => Promise<string>;
    updateCommune: (commune: Commune) => Promise<string>;
    deleteCommune: (id: string) => Promise<string>;
};

export const useCommuneStore = create<CommuneStore>((set) => ({
    communes: null,
    isLoadingCommune: false,
    isCommuneCUD: false,
    communePagination: null,
    getAllCommunes: async (params?: string) => {
        set({ isLoadingCommune: true });
        try {
            const res = await getData({ path: "communes", query: params });
            set({ communes: res.data, communePagination: res.pagination || null });
        } catch (error) {
            console.log("🚀 ~ file: communeStore.ts ~ getAllCommunes: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoadingCommune: false });
        }
    },
    addCommune: async (commune: Commune) => {
        set({ isCommuneCUD: true });
        try {
            const res = await postData({ path: "communes", data: commune });
            set((state) => ({ communes: state.communes ? [...state.communes, res.data] : [res.data] }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: communeStore.ts ~ addCommune: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isCommuneCUD: false });
        }
    },
    updateCommune: async (commune: Commune) => {
        set({ isCommuneCUD: true });
        try {
            const res = await putData({ path: `communes/${commune._id}`, data: commune });
            set((state) => ({
                communes: state.communes ? state.communes.map((c) => (c._id === commune._id ? res.data : c)) : [res.data],
            }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: communeStore.ts ~ updateCommune: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isCommuneCUD: false });
        }
    },
    deleteCommune: async (id: string) => {
        set({ isCommuneCUD: true });
        try {
            const res = await deleteData({ path: `communes/${id}` });
            set((state) => ({ communes: state.communes ? state.communes.filter((c) => c._id !== id) : null }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: communeStore.ts ~ deleteCommune: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isCommuneCUD: false });
        }
    },
}));