import { getData, putData, postData, deleteData } from "@/services/api";
import { AuditFields, Wilaya, PaginationType, ClientAddress, ClientContact, ClientFinancial } from "@/types";
import { create } from "zustand";

export type Client = AuditFields & {
    identifier: string;
    clientTypeId?: string;
    name: string;
    financial?: ClientFinancial;
    wilayaCodes?: Partial<Wilaya>[];
    communeCodes?: string[];
    drId?: string[];
    antenneId?: string[];
    addresses?: ClientAddress;
    contacts?: ClientContact;
    isActive?: boolean;
};

type ClientStore = {
    clients: Client[] | null;
    clientDetails: Client | null;
    isLoadingClient: boolean;
    isClientCUD: boolean;
    clientsPagination: PaginationType | null;
    clearClients: () => void;
    getAllClients: (params?: string) => Promise<string>;
    getClientDetails: (id: string) => Promise<string>;
    addClient: (client: Client) => Promise<string>;
    updateClient: (client: Client) => Promise<string>;
    deleteClient: (id: string) => Promise<string>;
};

export const useClientStore = create<ClientStore>((set) => ({
    clients: null,
    clientDetails: null,
    isLoadingClient: false,
    isClientCUD: false,
    clientsPagination: null,
    clearClients: () => set({ clients: null, clientDetails: null }),
    getAllClients: async (params?: string) => {
        set({ isLoadingClient: true });
        try {
            const res = await getData({ path: "clients", query: params });
            const { data, pagination, message } = res;
            set({ clients: data, clientsPagination: pagination || null });
            return message;
        } catch (error) {
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoadingClient: false });
        }
    },
    getClientDetails: async (id: string) => {
        set({ isLoadingClient: true });
        try {
            const res = await getData({ path: `clients/${id}` });
            const { data, message } = res;
            set({ clientDetails: data });
            return message;
        } catch (error) {
            console.log("🚀 ~ file: clientsStore.ts ~ getClientDetails: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoadingClient: false });
        }
    },
    addClient: async (client) => {
        set({ isClientCUD: true });
        try {
            const res = await postData({ path: "clients", data: client });
            set((state) => ({ clients: state.clients ? [...state.clients, res.data] : [res.data] }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: clientsStore.ts ~ addClient: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isClientCUD: false });
        }
    },
    updateClient: async (client: Client) => {
        set({ isClientCUD: true });
        try {
            const res = await putData({ path: `clients/${client._id}`, data: client });
            set((state) => ({ clients: state.clients ? state.clients.map((c) => (c._id === client._id ? res.data : c)) : [res.data] }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: clientsStore.ts ~ updateClient: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isClientCUD: false });
        }
    },
    deleteClient: async (id: string) => {
        set({ isClientCUD: true });
        try {
            const res = await deleteData({ path: `clients/${id}` });
            set((state) => ({ clients: state.clients ? state.clients.filter((c) => c._id !== id) : null }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: clientsStore.ts ~ deleteClient: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isClientCUD: false });
        }
    },
}));
