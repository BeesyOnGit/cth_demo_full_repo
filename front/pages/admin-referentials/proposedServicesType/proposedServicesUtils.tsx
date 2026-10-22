import { getData, postData, putData, deleteData } from "@/services/api";

export const getProposedServiceTypes = async (query?: string) => {
    try {
        const res = await getData({ path: "proposed-service-types", query });
        return { data: res.data, pagination: res.pagination, message: res.message };
    } catch (err: any) {
        console.error("Error fetching proposed service types", err);
        throw err.response?.data?.message || err.message || "An error occurred";
    }
};

export const createProposedServiceType = async (data: any) => {
    try {
        const res = await postData({ path: "proposed-service-types", data });
        return { data: res.data, message: res.message };
    } catch (err: any) {
        console.error("Error creating proposed service type", err);
        throw err.response?.data?.message || err.message || "An error occurred";
    }
};

export const updateProposedServiceType = async (id: string, data: any) => {
    try {
        const res = await putData({ path: `proposed-service-types/${id}`, data });
        return { data: res.data, message: res.message };
    } catch (err: any) {
        console.error("Error updating proposed service type", err);
        throw err.response?.data?.message || err.message || "An error occurred";
    }
};

export const deleteProposedServiceType = async (id: string) => {
    try {
        const res = await deleteData({ path: `proposed-service-types/${id}` });
        return { message: res.message };
    } catch (err: any) {
        console.error("Error deleting proposed service type", err);
        throw err.response?.data?.message || err.message || "An error occurred";
    }
};

export default {
    getProposedServiceTypes,
    createProposedServiceType,
    updateProposedServiceType,
    deleteProposedServiceType,
};
