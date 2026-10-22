import { create } from "zustand";
import { PaginationType, Project } from "@/types";
import { getData, postData, putData, deleteData, patchData } from "@/services/api";

type ProjectsStore = {
    projects: Project[] | null;
    fullProjects: Project[] | null;
    avenants: Project[] | null;
    projectDetails: Project | null;
    isLoadingProjects: boolean;
    isLoadingAvenants: boolean;
    isProjectCUD: boolean;
    projectPagination: null | PaginationType;
    avenantPagination: null | PaginationType;
    clearProject: () => void;
    getAllProjects: (params?: string) => Promise<string>;
    getFullProjects: () => Promise<void>;
    getProjectsAvenants: (params: string) => Promise<string>;
    getOneProject: (id: string) => Promise<string>;
    addProject: (project: Project) => Promise<string>;
    updateProject: (project: Project) => Promise<string>;
    deleteProject: (id: string) => Promise<string>;
    convertProjectToOds: (projectId: string, editData: Partial<Project>) => Promise<string>;
};

// Ignore responses from superseded list requests
let projectsReqId = 0;
let avenantsReqId = 0;

export const useProjectsStore = create<ProjectsStore>((set) => ({
    projects: null,
    fullProjects: null,
    avenants: null,
    projectDetails: null,
    projectPagination: null,
    avenantPagination: null,
    isLoadingAvenants: false,
    isLoadingProjects: false,
    isProjectCUD: false,
    clearProject: () => set({ projectDetails: null, avenants: null, avenantPagination: null }),
    getFullProjects: async () => {
        try {
            const res = await getData({ path: "projects", query: "noPag=true" });
            const { data, message } = res;
            set({ fullProjects: data });
        } catch (error) {
            console.log("🚀 ~ file: projectsStore.ts:39 ~ getFullProjects: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        }
    },
    getAllProjects: async (params?: string) => {
        const reqId = ++projectsReqId;
        set({ isLoadingProjects: true });
        try {
            const res = await getData({ path: "projects", query: params });
            const { data, pagination, message } = res;
            if (reqId !== projectsReqId) return message;
            set({ projects: data, projectPagination: pagination || null });
            return message;
        } catch (error: any) {
            console.log("🚀 ~ file: projectsStore.ts ~ getAllProjects: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            if (reqId === projectsReqId) set({ isLoadingProjects: false });
        }
    },
    getProjectsAvenants: async (params: string) => {
        const reqId = ++avenantsReqId;
        set({ isLoadingAvenants: true });
        try {
            const res = await getData({ path: `projects`, query: params });
            const { data, message, pagination } = res;
            if (reqId !== avenantsReqId) return message;
            set({ avenants: data, avenantPagination: pagination || null });
            return message;
        } catch (error: any) {
            console.log("🚀 ~ file: projectsStore.ts ~ getProjectsAvenants: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            if (reqId === avenantsReqId) set({ isLoadingAvenants: false });
        }
    },
    getOneProject: async (id) => {
        set({ isLoadingProjects: true });
        try {
            const res = await getData({ path: `projects/${id}` });
            const { data, message } = res;
            set({ projectDetails: data });
            return message;
        } catch (error: any) {
            console.log("🚀 ~ file: projectsStore.ts ~ getAllProjects: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoadingProjects: false });
        }
    },
    addProject: async (project: Project) => {
        set({ isProjectCUD: true });
        try {
            const res = await postData({ path: "projects", data: project });
            return res.message;
        } catch (error: any) {
            console.log("🚀 ~ file: projectsStore.ts ~ addProject: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isProjectCUD: false });
        }
    },
    updateProject: async (project: Project) => {
        set({ isProjectCUD: true });
        try {
            const res = await putData({ path: `projects/${project._id}`, data: project });
            return res.message;
        } catch (error: any) {
            console.log("🚀 ~ file: projectsStore.ts ~ updateProject: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isProjectCUD: false });
        }
    },
    deleteProject: async (id: string) => {
        set({ isProjectCUD: true });
        try {
            const res = await deleteData({ path: `projects/${id}` });
            set((state) => ({ projects: state.projects ? state.projects.filter((p) => p._id !== id) : null }));
            return res.message;
        } catch (error: any) {
            console.log("🚀 ~ file: projectsStore.ts ~ deleteProject: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isProjectCUD: false });
        }
    },
    convertProjectToOds: async (projectId: string, editData: Partial<Project>) => {
        set({ isProjectCUD: true });
        try {
            const { odsStart, odsEnd } = editData;
            if (!odsStart || !odsEnd) {
                throw "ODS start and end dates are required";
            }
            const res = await patchData({ path: `projects/${projectId}/convert-to-ods`, data: { odsStart, odsEnd, contractMode: "ODS" } });
            set((state) => ({ projects: state.projects ? state.projects.map((p) => (p._id === projectId ? res.data : p)) : null }));
            return res.message;
        } catch (error: any) {
            console.log("🚀 ~ file: projectsStore.ts ~ convertProjectToOds: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isProjectCUD: false });
        }
    },
}));
