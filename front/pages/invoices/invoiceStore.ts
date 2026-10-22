import { create } from "zustand";
import { Invoice, PaginationType } from "@/types";
import { getData, postData, putData, deleteData } from "@/services/api";

type InvoiceStore = {
    invoices: Invoice[] | null;
    invoiceDetails: Invoice | null;
    isLoadingInvoices: boolean;
    isInvoiceCUD: boolean;
    isInvoicePrinting: boolean;
    invoicePagination: PaginationType | null;
    clearInvoices: () => void;
    getAllInvoices: (params?: string) => Promise<string>;
    getInvoiceById: (id: string) => Promise<string>;
    getInvoicesByProject: (projectId: string) => Promise<string>;
    createInvoice: (invoice: Partial<Invoice>) => Promise<string>;
    updateInvoice: (invoice: Partial<Invoice>) => Promise<string>;
    deleteInvoice: (id: string) => Promise<string>;
    markAsRecovered: (id: string) => Promise<string>;
    printInvoice: (id: string) => Promise<  {res:Blob,headers:any}  >;
};

// Ignore responses from superseded list requests
let listReqId = 0;

export const useInvoiceStore = create<InvoiceStore>((set) => ({
    invoices: null,
    invoiceDetails: null,
    invoicePagination: null,
    isLoadingInvoices: false,
    isInvoicePrinting: false,
    isInvoiceCUD: false,
    clearInvoices: () => set({ invoices: null, invoicePagination: null, invoiceDetails: null }),

    getAllInvoices: async (params?: string) => {
        const reqId = ++listReqId;
        set({ isLoadingInvoices: true });
        try {
            const res = await getData({ path: "invoices", query: params });
            const { data, pagination, message } = res;
            if (reqId !== listReqId) return message;
            set({ invoices: data, invoicePagination: pagination || null });
            return message;
        } catch (error: any) {
            console.log("invoiceStore.getAllInvoices error", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            if (reqId === listReqId) set({ isLoadingInvoices: false });
        }
    },

    getInvoiceById: async (id: string) => {
        set({ isLoadingInvoices: true });
        try {
            const res = await getData({ path: `invoices/${id}` });
            const { data, message } = res;
            set({ invoiceDetails: data });
            return message;
        } catch (error: any) {
            console.log("invoiceStore.getInvoiceById error", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoadingInvoices: false });
        }
    },

    getInvoicesByProject: async (projectId: string) => {
        set({ isLoadingInvoices: true });
        try {
            const res = await getData({ path: "invoices", query: `projectId=${projectId}` });
            const { data, message } = res;
            set({ invoices: data });
            return message;
        } catch (error: any) {
            console.log("invoiceStore.getInvoicesByProject error", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoadingInvoices: false });
        }
    },

    createInvoice: async (invoice: Invoice) => {
        set({ isInvoiceCUD: true });
        try {
            const res = await postData({ path: "invoices", data: invoice });
            return res.message;
        } catch (error: any) {
            console.log("invoiceStore.createInvoice error", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isInvoiceCUD: false });
        }
    },

    updateInvoice: async (invoice: Invoice) => {
        set({ isInvoiceCUD: true });
        try {
            const res = await putData({ path: `invoices/${invoice._id}`, data: invoice });
            return res.message;
        } catch (error: any) {
            console.log("invoiceStore.updateInvoice error", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isInvoiceCUD: false });
        }
    },

    deleteInvoice: async (id: string) => {
        set({ isInvoiceCUD: true });
        try {
            const res = await deleteData({ path: `invoices/${id}` });
            set((state) => ({ invoices: state.invoices ? state.invoices.filter((i) => i._id !== id) : null }));
            return res.message;
        } catch (error: any) {
            console.log("invoiceStore.deleteInvoice error", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isInvoiceCUD: false });
        }
    },

    markAsRecovered: async (id: string) => {
        set({ isInvoiceCUD: true });
        try {
            const res = await putData({ 
                path: `invoices/${id}`, 
                data: { 
                    isRecovered: true, 
                    recoveryDate: new Date().toISOString() 
                } 
            });
            // update local invoice if present
            set((state) => ({ invoices: state.invoices ? state.invoices.map((inv) => (inv._id === id ? res.data : inv)) : null }));
            return res.message;
        } catch (error: any) {
            console.log("invoiceStore.markAsRecovered error", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isInvoiceCUD: false });
        }
    },

    printInvoice: async (id: string) => {
        set({ isInvoicePrinting: true });
        try {
            const {res, headers} = await getData({
                path: `invoices/${id}/pdf`,
                config: {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    responseType: "blob",
                },
                getHeaders:true
            });
            return {res, headers}; // Assuming the API returns a Blob for the PDF
        } catch (error: any) {
            console.log("invoiceStore.printInvoice error", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isInvoicePrinting: false });
        }
    },
}));
