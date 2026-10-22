import { create } from "zustand";
import { Objective, PaginationType } from "@/types";
import { getData, postData, putData, deleteData } from "@/services/api";

type ObjectiveStore = {
    objectives: Objective[] | null;
    objectiveDetails: Objective | null;
    isLoadingObjectives: boolean;
    isObjectiveCUD: boolean;
    objectivePagination: PaginationType | null;
    clearObjectives: () => void;
    getAllObjectives: (params?: string) => Promise<string>;
    getObjectiveById: (id: string) => Promise<string>;
    createObjective: (objective: Partial<Objective>) => Promise<string>;
    updateObjective: (objective: Partial<Objective>) => Promise<string>;
    deleteObjective: (id: string) => Promise<string>;
};

// Ignore responses from superseded list requests
let listReqId = 0;

export const useObjectiveStore = create<ObjectiveStore>((set) => ({
    objectives: null,
    objectiveDetails: null,
    objectivePagination: null,
    isLoadingObjectives: false,
    isObjectiveCUD: false,
    clearObjectives: () => set({ objectives: null, objectivePagination: null, objectiveDetails: null }),

    getAllObjectives: async (params?: string) => {
        const reqId = ++listReqId;
        set({ isLoadingObjectives: true });
        try {
            const res = await getData({ path: "objectives", query: params });
            const { data, pagination, message } = res;
            if (reqId !== listReqId) return message;
            set({ objectives: data, objectivePagination: pagination || null });
            return message;
        } catch (error: any) {
            console.log("objectiveStore.getAllObjectives error", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            if (reqId === listReqId) set({ isLoadingObjectives: false });
        }
    },

    getObjectiveById: async (id: string) => {
        set({ isLoadingObjectives: true });
        try {
            const res = await getData({ path: `objectives/${id}` });
            const { data, message } = res;
            set({ objectiveDetails: data });
            return message;
        } catch (error: any) {
            console.log("objectiveStore.getObjectiveById error", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoadingObjectives: false });
        }
    },

    createObjective: async (objective: Partial<Objective>) => {
        set({ isObjectiveCUD: true });
        try {
            const res = await postData({ path: "objectives", data: objective });
            const { message } = res;
            return message;
        } catch (error: any) {
            console.log("objectiveStore.createObjective error", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isObjectiveCUD: false });
        }
    },

    updateObjective: async (objective: Partial<Objective>) => {
        set({ isObjectiveCUD: true });
        try {
            const res = await putData({ path: `objectives/${objective._id}`, data: objective });
            const { message } = res;
            return message;
        } catch (error: any) {
            console.log("objectiveStore.updateObjective error", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isObjectiveCUD: false });
        }
    },

    deleteObjective: async (id: string) => {
        set({ isObjectiveCUD: true });
        try {
            const res = await deleteData({ path: `objectives/${id}` });
            const { message } = res;
            return message;
        } catch (error: any) {
            console.log("objectiveStore.deleteObjective error", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isObjectiveCUD: false });
        }
    },
}));
