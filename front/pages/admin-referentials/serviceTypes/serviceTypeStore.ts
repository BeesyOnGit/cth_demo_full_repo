import { getData, postData, putData, deleteData } from "@/services/api";
import { AuditFields, PaginationType, ServiceTypeCode } from "@/types";
import { create } from "zustand";

export type ServiceType = AuditFields & {
    code: string;
    label: string;
};

type ServiceTypeStore = {
    serviceTypes: ServiceType[] | null;
    isLoadingServiceType: boolean;
    isServiceTypeCUD: boolean;
    serviceTypePagination: PaginationType | null;
    getAllServiceTypes: (params?: string) => Promise<void>;
    addServiceType: (serviceType: ServiceType) => Promise<string>;
    updateServiceType: (serviceType: ServiceType) => Promise<string>;
    deleteServiceType: (id: string) => Promise<string>;
};

export const useServiceTypeStore = create<ServiceTypeStore>((set) => ({
    serviceTypes: null,
    isLoadingServiceType: false,
    isServiceTypeCUD: false,
    serviceTypePagination: null,
    getAllServiceTypes: async (params?: string) => {
        set({ isLoadingServiceType: true });
        try {
            const res = await getData({ path: "service-types", query: params });
            set({ serviceTypes: res.data, serviceTypePagination: res.pagination || null });
        } catch (error) {
            console.log("🚀 ~ file: serviceTypeStore.ts ~ getAllServiceTypes: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoadingServiceType: false });
        }
    },
    addServiceType: async (serviceType: ServiceType) => {
        set({ isServiceTypeCUD: true });
        try {
            const res = await postData({ path: "service-types", data: serviceType });
            set((state) => ({ serviceTypes: state.serviceTypes ? [...state.serviceTypes, res.data] : [res.data] }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: serviceTypeStore.ts ~ addServiceType: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isServiceTypeCUD: false });
        }
    },
    updateServiceType: async (serviceType: ServiceType) => {
        set({ isServiceTypeCUD: true });
        try {
            const res = await putData({ path: `service-types/${serviceType._id}`, data: serviceType });
            set((state) => ({
                serviceTypes: state.serviceTypes ? state.serviceTypes.map((st) => (st._id === serviceType._id ? res.data : st)) : [res.data],
            }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: serviceTypeStore.ts ~ updateServiceType: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isServiceTypeCUD: false });
        }
    },
    deleteServiceType: async (id: string) => {
        set({ isServiceTypeCUD: true });
        try {
            const res = await deleteData({ path: `service-types/${id}` });
            set((state) => ({ serviceTypes: state.serviceTypes ? state.serviceTypes.filter((st) => st._id !== id) : null }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: serviceTypeStore.ts ~ deleteServiceType: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isServiceTypeCUD: false });
        }
    },
}));
