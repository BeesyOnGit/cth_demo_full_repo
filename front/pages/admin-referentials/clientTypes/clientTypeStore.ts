import { getData, postData, putData, deleteData } from "@/services/api";
import { AuditFields, PaginationType } from "@/types";
import { create } from "zustand";

export type ClientType = AuditFields & {
    code: string;
    label: string;
};

type ClientTypeStore = {
    clientTypes: ClientType[] | null;
    isLoadingClientType: boolean;
    isClientTypeCUD: boolean;
    clientTypePagination: PaginationType | null;
    getAllClientTypes: (params?: string) => Promise<void>;
    addClientType: (clientType: ClientType) => Promise<string>;
    updateClientType: (clientType: ClientType) => Promise<string>;
    deleteClientType: (id: string) => Promise<string>;
};

export const useClientTypeStore = create<ClientTypeStore>((set) => ({
    clientTypes: null,
    isLoadingClientType: false,
    isClientTypeCUD: false,
    clientTypePagination: null,
    getAllClientTypes: async (params?: string) => {
        set({ isLoadingClientType: true });
        try {
            const res = await getData({ path: "client-types", query: params });
            set({ clientTypes: res.data, clientTypePagination: res.pagination || null });
        } catch (error) {
            console.log("🚀 ~ file: clientTypeStore.ts ~ getAllClientTypes: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoadingClientType: false });
        }
    },
    addClientType: async (clientType: ClientType) => {
        set({ isClientTypeCUD: true });
        try {
            const res = await postData({ path: "client-types", data: clientType });
            set((state) => ({ clientTypes: state.clientTypes ? [...state.clientTypes, res.data] : [res.data] }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: clientTypeStore.ts ~ addClientType: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isClientTypeCUD: false });
        }
    },
    updateClientType: async (clientType: ClientType) => {
        set({ isClientTypeCUD: true });
        try {
            const res = await putData({ path: `client-types/${clientType._id}`, data: clientType });
            set((state) => ({
                clientTypes: state.clientTypes ? state.clientTypes.map((ct) => (ct._id === clientType._id ? res.data : ct)) : [res.data],
            }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: clientTypeStore.ts ~ updateClientType: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isClientTypeCUD: false });
        }
    },
    deleteClientType: async (id: string) => {
        set({ isClientTypeCUD: true });
        try {
            const res = await deleteData({ path: `client-types/${id}` });
            set((state) => ({ clientTypes: state.clientTypes ? state.clientTypes.filter((ct) => ct._id !== id) : null }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: clientTypeStore.ts ~ deleteClientType: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isClientTypeCUD: false });
        }
    },
}));