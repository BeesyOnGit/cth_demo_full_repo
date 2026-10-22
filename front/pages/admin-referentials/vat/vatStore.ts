import { getData, postData, putData, deleteData } from "@/services/api";
import { AuditFields, PaginationType } from "@/types";
import { create } from "zustand";

export type VatRate = AuditFields & {
    label: string;
    rate: number;
};

type VatStore = {
    vatRates: VatRate[] | null;
    isLoadingVat: boolean;
    isVatCUD: boolean;
    vatPagination: PaginationType | null;
    getAllVatRates: (params?: string) => Promise<void>;
    addVatRate: (vat: VatRate) => Promise<string>;
    updateVatRate: (vat: VatRate) => Promise<string>;
    deleteVatRate: (id: string) => Promise<string>;
};

export const useVatStore = create<VatStore>((set) => ({
    vatRates: null,
    isLoadingVat: false,
    isVatCUD: false,
    vatPagination: null,
    getAllVatRates: async (params?: string) => {
        set({ isLoadingVat: true });
        try {
            const res = await getData({ path: "vat", query: params });
            set({ vatRates: res.data, vatPagination: res.pagination || null });
        } catch (error) {
            console.log("🚀 ~ file: vatStore.ts ~ getAllVatRates: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoadingVat: false });
        }
    },
    addVatRate: async (vat: VatRate) => {
        set({ isVatCUD: true });
        try {
            const res = await postData({ path: "vat", data: vat });
            set((state) => ({ vatRates: state.vatRates ? [...state.vatRates, res.data] : [res.data] }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: vatStore.ts ~ addVatRate: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isVatCUD: false });
        }
    },
    updateVatRate: async (vat: VatRate) => {
        set({ isVatCUD: true });
        try {
            const res = await putData({ path: `vat/${vat._id}`, data: vat });
            set((state) => ({ vatRates: state.vatRates ? state.vatRates.map((v) => (v._id === vat._id ? res.data : v)) : [res.data] }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: vatStore.ts ~ updateVatRate: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isVatCUD: false });
        }
    },
    deleteVatRate: async (id: string) => {
        set({ isVatCUD: true });
        try {
            const res = await deleteData({ path: `vat/${id}` });
            set((state) => ({ vatRates: state.vatRates ? state.vatRates.filter((v) => v._id !== id) : null }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: vatStore.ts ~ deleteVatRate: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isVatCUD: false });
        }
    },
}));
