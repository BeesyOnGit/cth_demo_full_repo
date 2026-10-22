import { getData, putData, postData, deleteData } from "@/services/api";
import { AuditFields, PaginationType } from "@/types";
import { create } from "zustand";

export type Role = AuditFields & {
    code: string;
    label: string;
};

type RoleStore = {
    roles: Role[] | null;
    isLoadingRole: boolean;
    isRoleCUD: boolean;
    rolesPagination: PaginationType | null;
    getAllRoles: (params?: string) => Promise<void>;
    addRole: (role: Role) => Promise<string>;
    updateRole: (role: Role) => Promise<string>;
    deleteRole: (id: string) => Promise<string>;
};

export const useRoleStore = create<RoleStore>((set) => ({
    roles: null,
    isLoadingRole: false,
    isRoleCUD: false,
    rolesPagination: null,
    getAllRoles: async (params?: string) => {
        set({ isLoadingRole: true });
        try {
            const res = await getData({ path: "roles", query: params });
            set({ roles: res.data, rolesPagination: res.pagination || null });
        } catch (error) {
            console.log("🚀 ~ file: roleStore.ts ~ getAllRoles: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoadingRole: false });
        }
    },
    addRole: async (role: Role) => {
        set({ isRoleCUD: true });
        try {
            const res = await postData({ path: "roles", data: role });
            set((state) => ({ roles: state.roles ? [...state.roles, res.data] : [res.data] }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: roleStore.ts ~ addRole: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isRoleCUD: false });
        }
    },
    updateRole: async (role: Role) => {
        set({ isRoleCUD: true });
        try {
            const res = await putData({ path: `roles/${role._id}`, data: role });
            set((state) => ({ roles: state.roles ? state.roles.map((r) => (r._id === role._id ? res.data : r)) : [res.data] }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: roleStore.ts ~ updateRole: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isRoleCUD: false });
        }
    },
    deleteRole: async (id: string) => {
        set({ isRoleCUD: true });
        try {
            const res = await deleteData({ path: `roles/${id}` });
            set((state) => ({ roles: state.roles ? state.roles.filter((r) => r._id !== id) : null }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: roleStore.ts ~ deleteRole: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isRoleCUD: false });
        }
    },
}));
