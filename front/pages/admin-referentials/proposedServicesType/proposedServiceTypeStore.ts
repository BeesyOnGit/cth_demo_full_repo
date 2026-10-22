import { create } from "zustand";
import { getProposedServiceTypes, createProposedServiceType, updateProposedServiceType, deleteProposedServiceType } from "./proposedServicesUtils";
import { AuditFields, ServiceTypeCode } from "@/types";

export type ProposedServiceType = AuditFields & {
    code: ServiceTypeCode;
    label: string;
};

type ProposedServiceTypeStore = {
    items: ProposedServiceType[] | null;
    isLoading: boolean;
    isCUD: boolean;
    pagination: any | null;
    getAllProposedServiceTypes: (params?: string) => Promise<void>;
    addProposedServiceType: (item: ProposedServiceType) => Promise<string>;
    updateProposedServiceTypeItem: (item: ProposedServiceType) => Promise<string>;
    deleteProposedServiceTypeItem: (id: string) => Promise<string>;
};

export const useProposedServiceTypeStore = create<ProposedServiceTypeStore>((set) => ({
    items: null,
    isLoading: false,
    isCUD: false,
    pagination: null,

    getAllProposedServiceTypes: async (params?: string) => {
        set({ isLoading: true });
        try {
            const res = await getProposedServiceTypes(params);
            set({ items: res.data, pagination: res.pagination || null });
        } catch (error: any) {
            console.error("Error loading proposed service types", error);
            throw error?.message || error;
        } finally {
            set({ isLoading: false });
        }
    },

    addProposedServiceType: async (item: ProposedServiceType) => {
        set({ isCUD: true });
        try {
            const res = await createProposedServiceType(item);
            set((state) => ({ items: state.items ? [...state.items, res.data] : [res.data] }));
            return res.message;
        } catch (error: any) {
            console.error("Error adding proposed service type", error);
            throw error?.message || error;
        } finally {
            set({ isCUD: false });
        }
    },

    updateProposedServiceTypeItem: async (item: ProposedServiceType) => {
        set({ isCUD: true });
        try {
            const res = await updateProposedServiceType(item._id, item);
            set((state) => ({ items: state.items ? state.items.map((i) => (i._id === res.data._id ? res.data : i)) : [res.data] }));
            return res.message;
        } catch (error: any) {
            console.error("Error updating proposed service type", error);
            throw error?.message || error;
        } finally {
            set({ isCUD: false });
        }
    },

    deleteProposedServiceTypeItem: async (id: string) => {
        set({ isCUD: true });
        try {
            const res = await deleteProposedServiceType(id);
            set((state) => ({ items: state.items ? state.items.filter((i) => i._id !== id) : null }));
            return res.message;
        } catch (error: any) {
            console.error("Error deleting proposed service type", error);
            throw error?.message || error;
        } finally {
            set({ isCUD: false });
        }
    },
}));

export default useProposedServiceTypeStore;
