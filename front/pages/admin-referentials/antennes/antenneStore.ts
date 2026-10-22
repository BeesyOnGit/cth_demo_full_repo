import { getData, putData, postData, deleteData } from "@/services/api";
import { AuditFields, Wilaya, PaginationType } from "@/types";
import { create } from "zustand";
import { Dr } from "../drs/useDrStore";

export type Antenne = AuditFields & {
    code: string;
    label: string;
    drId: string | Dr;
    wilayaCode: string | string[] | Wilaya | Wilaya[];
};

type AntenneStore = {
    antennes: Antenne[] | null; // List of antennes
    isLoadingAntenne: boolean; // Loading state for antennes
    isAntenneCUD: boolean; // antenne Create/Update/Delete operation flag
    antennePagination: PaginationType | null;
    getAllAntennes: (params?: string) => Promise<void>;
    addAntenne: (antenne: Antenne) => Promise<string>;
    updateAntenne: (antenne: Antenne) => Promise<string>;
    deleteAntenne: (id: string) => Promise<string>;
};

export const useAntenneStore = create<AntenneStore>((set) => ({
    antennes: null,
    isLoadingAntenne: false,
    isAntenneCUD: false,
    antennePagination: null,
    getAllAntennes: async (params?: string) => {
        set({ isLoadingAntenne: true });
        // const { addToast } = useToastStore();

        try {
            const res = await getData({ path: "antennes", query: params });
            set({ antennes: res.data, antennePagination: res.pagination || null });
        } catch (error) {
            console.log("🚀 ~ file: useantenneStore.ts:31 ~ getAllantennes: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoadingAntenne: false });
        }
    },
    addAntenne: async (antenne: Antenne) => {
        set({ isAntenneCUD: true });
        try {
            const res = await postData({ path: "antennes", data: antenne });
            set((state) => ({
                antennes: state.antennes ? [...state.antennes, res.data] : [res.data],
            }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: useantenneStore.ts:52 ~ addAntenne: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isAntenneCUD: false });
        }
    },
    updateAntenne: async (antenne: Antenne) => {
        set({ isAntenneCUD: true });
        try {
            const res = await putData({ path: `antennes/${antenne._id}`, data: antenne });
            set((state) => ({
                antennes: state.antennes ? state.antennes.map((w) => (w._id === antenne._id ? res.data : w)) : [res.data],
            }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: useantenneStore.ts:73 ~ updateantenne: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isAntenneCUD: false });
        }
    },
    deleteAntenne: async (id: string) => {
        set({ isAntenneCUD: true });
        try {
            const res = await deleteData({ path: `antennes/${id}` });
            set((state) => ({
                antennes: state.antennes ? state.antennes.filter((w) => w._id !== id) : null,
            }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: useantenneStore.ts:94 ~ deleteantenne: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isAntenneCUD: false });
        }
    },
}));
