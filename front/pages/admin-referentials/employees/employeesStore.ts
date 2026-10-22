import { getData, putData, postData, deleteData } from "@/services/api";
import { AuditFields, Wilaya, PaginationType } from "@/types";
import { create } from "zustand";
import { Dr } from "../drs/useDrStore";
import { Antenne } from "../antennes/antenneStore";
import { Role } from "../roles/useRoleStore";

export type Employee = AuditFields & {
    fullName: string;
    email: string;
    passwordHash: string;
    roleId: string | Partial<Role>;
    drId?: string | Partial<Dr>;
    antenneId?: string | Partial<Antenne>;
    wilayaCode?: string | Partial<Wilaya>;
    isAdmin?: boolean;
};

type EmployeeStore = {
    employees: Employee[] | null;
    isLoadingEmployee: boolean;
    isEmployeeCUD: boolean;
    employeesPagination: PaginationType | null;
    getAllEmployees: (params?: string) => Promise<void>;
    addEmployee: (employee: Employee) => Promise<string>;
    updateEmployee: (employee: Employee) => Promise<string>;
    deleteEmployee: (id: string) => Promise<string>;
};

export const useEmployeeStore = create<EmployeeStore>((set) => ({
    employees: null,
    isLoadingEmployee: false,
    isEmployeeCUD: false,
    employeesPagination: null,
    getAllEmployees: async (params?: string) => {
        set({ isLoadingEmployee: true });
        try {
            const res = await getData({ path: "employees", query: params });
            set({ employees: res.data, employeesPagination: res.pagination || null });
        } catch (error) {
            console.log("🚀 ~ file: employeesStore.ts ~ getAllEmployees: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoadingEmployee: false });
        }
    },
    addEmployee: async (employee: Employee) => {
        set({ isEmployeeCUD: true });
        try {
            const res = await postData({ path: "employees", data: employee });
            set((state) => ({
                employees: state.employees ? [...state.employees, res.data] : [res.data],
            }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: employeesStore.ts ~ addEmployee: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isEmployeeCUD: false });
        }
    },
    updateEmployee: async (employee: Employee) => {
        set({ isEmployeeCUD: true });
        try {
            const res = await putData({ path: `employees/${employee._id}`, data: employee });
            set((state) => ({
                employees: state.employees ? state.employees.map((e) => (e._id === employee._id ? res.data : e)) : [res.data],
            }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: employeesStore.ts ~ updateEmployee: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isEmployeeCUD: false });
        }
    },
    deleteEmployee: async (id: string) => {
        set({ isEmployeeCUD: true });
        try {
            const res = await deleteData({ path: `employees/${id}` });
            set((state) => ({
                employees: state.employees ? state.employees.filter((e) => e._id !== id) : null,
            }));
            return res.message;
        } catch (error) {
            console.log("🚀 ~ file: employeesStore.ts ~ deleteEmployee: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isEmployeeCUD: false });
        }
    },
}));
