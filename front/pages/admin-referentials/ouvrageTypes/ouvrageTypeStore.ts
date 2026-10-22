import { getData, postData, putData, deleteData } from "@/services/api";
import { AuditFields, PaginationType, OuvrageTypeCode } from "@/types";
import { create } from "zustand";

export type OuvrageType = AuditFields & {
    code: string;
    label: string;
};

type OuvrageTypeStore = {
    ouvrageTypes: OuvrageType[] | null;
    isLoadingOuvrageType: boolean;
    isOuvrageTypeCUD: boolean;
    ouvrageTypePagination: PaginationType | null;
    getAllOuvrageTypes: (params?: string) => Promise<void>;
    addOuvrageType: (ouvrageType: OuvrageType) => Promise<string>;
    updateOuvrageType: (ouvrageType: OuvrageType) => Promise<string>;
    deleteOuvrageType: (id: string) => Promise<string>;
};

export const useOuvrageTypeStore = create<OuvrageTypeStore>((set) => ({
    ouvrageTypes: null,
    isLoadingOuvrageType: false,
    isOuvrageTypeCUD: false,
    ouvrageTypePagination: null,
    getAllOuvrageTypes: async (params?: string) => {
        set({ isLoadingOuvrageType: true });
        try {
            const res = await getData({ path: "ouvrage-types", query: params });
            set({ ouvrageTypes: res.data, ouvrageTypePagination: res.pagination || null });
        } catch (error) {
            console.log("🚀 ~ file: ouvrageTypeStore.ts ~ getAllOuvrageTypes: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoadingOuvrageType: false });
        }
    },
    addOuvrageType: async (ouvrageType: OuvrageType) => {
        set({ isOuvrageTypeCUD: true });
        try {
            const res = await postData({ path: "ouvrage-types", data: ouvrageType });
            set((state) => ({ ouvrageTypes: state.ouvrageTypes ? [...state.ouvrageTypes, res.data] : [res.data] }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: ouvrageTypeStore.ts ~ addOuvrageType: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isOuvrageTypeCUD: false });
        }
    },
    updateOuvrageType: async (ouvrageType: OuvrageType) => {
        set({ isOuvrageTypeCUD: true });
        try {
            const res = await putData({ path: `ouvrage-types/${ouvrageType._id}`, data: ouvrageType });
            set((state) => ({
                ouvrageTypes: state.ouvrageTypes ? state.ouvrageTypes.map((ot) => (ot._id === ouvrageType._id ? res.data : ot)) : [res.data],
            }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: ouvrageTypeStore.ts ~ updateOuvrageType: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isOuvrageTypeCUD: false });
        }
    },
    deleteOuvrageType: async (id: string) => {
        set({ isOuvrageTypeCUD: true });
        try {
            const res = await deleteData({ path: `ouvrage-types/${id}` });
            set((state) => ({ ouvrageTypes: state.ouvrageTypes ? state.ouvrageTypes.filter((ot) => ot._id !== id) : null }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: ouvrageTypeStore.ts ~ deleteOuvrageType: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isOuvrageTypeCUD: false });
        }
    },
}));
