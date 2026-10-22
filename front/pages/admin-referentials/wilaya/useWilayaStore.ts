import { getData, putData, postData, deleteData } from "@/services/api";
import { PaginationType, Wilaya } from "@/types";
import { create } from "zustand";

type WilayaStore = {
    wilayas: Wilaya[] | null; // List of wilayas
    isLoadingWilaya: boolean; // Loading state for wilayas
    isWilayaCUD: boolean; // Wilaya Create/Update/Delete operation flag
    wilayaPagination: PaginationType | null;
    getAllWilayas: (params?: string) => Promise<void>;
    addWilaya: (wilaya: Wilaya) => Promise<string>;
    updateWilaya: (wilaya: Wilaya) => Promise<string>;
    deleteWilaya: (id: string) => Promise<string>;
};

export const useWilayaStore = create<WilayaStore>((set) => ({
    wilayas: null,
    isLoadingWilaya: false,
    isWilayaCUD: false,
    wilayaPagination: null,
    getAllWilayas: async (params?: string) => {
        set({ isLoadingWilaya: true });
        // const { addToast } = useToastStore();

        try {
            const res = await getData({ path: "wilayas", query: params });
            set({ wilayas: res.data, wilayaPagination: res.pagination || null });
        } catch (error) {
            console.log("🚀 ~ file: useWilayaStore.ts:31 ~ getAllWilayas: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoadingWilaya: false });
        }
    },
    addWilaya: async (wilaya: Wilaya) => {
        set({ isWilayaCUD: true });
        try {
            const res = await postData({ path: "wilayas", data: wilaya });
            set((state) => ({
                wilayas: state.wilayas ? [...state.wilayas, res.data] : [res.data],
            }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: useWilayaStore.ts:52 ~ addWilaya: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isWilayaCUD: false });
        }
    },
    updateWilaya: async (wilaya: Wilaya) => {
        set({ isWilayaCUD: true });
        try {
            const res = await putData({ path: `wilayas/${wilaya._id}`, data: wilaya });
            set((state) => ({
                wilayas: state.wilayas ? state.wilayas.map((w) => (w._id === wilaya._id ? res.data : w)) : [res.data],
            }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: useWilayaStore.ts:73 ~ updateWilaya: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isWilayaCUD: false });
        }
    },
    deleteWilaya: async (id: string) => {
        set({ isWilayaCUD: true });
        try {
            const res = await deleteData({ path: `wilayas/${id}` });
            set((state) => ({
                wilayas: state.wilayas ? state.wilayas.filter((w) => w.code !== id) : null,
            }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: useWilayaStore.ts:94 ~ deleteWilaya: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isWilayaCUD: false });
        }
    },
}));
