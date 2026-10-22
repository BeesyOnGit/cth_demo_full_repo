import { getData, putData, postData, deleteData } from "@/services/api";
import { AuditFields, PaginationType } from "@/types";
import { create } from "zustand";

export type Dr = AuditFields & {
    code: string;
    name: string;
    bankName: string;
    accountNumber: string;
};

type DrStore = {
    drs: Dr[] | null;
    isLoadingDr: boolean;
    isDrCUD: boolean;
    drsPagination: PaginationType | null;
    getAllDrs: (params?: string) => Promise<void>;
    addDr: (dr: Dr) => Promise<string>;
    updateDr: (dr: Dr) => Promise<string>;
    deleteDr: (id: string) => Promise<string>;
};

export const useDrStore = create<DrStore>((set) => ({
    drs: null,
    isLoadingDr: false,
    isDrCUD: false,
    drsPagination: null,
    getAllDrs: async (params?: string) => {
        set({ isLoadingDr: true });
        try {
            const res = await getData({ path: "drs", query: params });
            set({ drs: res.data, drsPagination: res.pagination || null });
        } catch (error) {
            console.log("🚀 ~ file: useDrStore.ts: getAllDrs error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoadingDr: false });
        }
    },
    addDr: async (dr: Dr) => {
        set({ isDrCUD: true });
        try {
            const res = await postData({ path: "drs", data: dr });
            set((state) => ({ drs: state.drs ? [...state.drs, res.data] : [res.data] }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: useDrStore.ts: addDr error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isDrCUD: false });
        }
    },
    updateDr: async (dr: Dr) => {
        set({ isDrCUD: true });
        try {
            const res = await putData({ path: `drs/${dr._id}`, data: dr });
            set((state) => ({ drs: state.drs ? state.drs.map((d) => (d._id === dr._id ? res.data : d)) : [res.data] }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: useDrStore.ts: updateDr error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isDrCUD: false });
        }
    },
    deleteDr: async (id: string) => {
        set({ isDrCUD: true });
        try {
            const res = await deleteData({ path: `drs/${id}` });
            set((state) => ({ drs: state.drs ? state.drs.filter((d) => d._id !== id) : null }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: useDrStore.ts: deleteDr error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isDrCUD: false });
        }
    },
}));
