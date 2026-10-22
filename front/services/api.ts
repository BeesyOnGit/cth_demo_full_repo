import axios, { Axios, AxiosRequestConfig } from "axios";
import { useAuthStore } from "../pages/login/useAuthStore";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const carierAxios = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

// Session expired: drop the user and go to login (auth endpoints handle their own 401s)
carierAxios.interceptors.response.use(
    (res) => res,
    (error) => {
        const url: string = error.config?.url || "";
        if (error.response?.status === 401 && !/employees\/(login|checkme|logout)/.test(url)) {
            useAuthStore.setState({ user: null });
            window.location.hash = "#/login";
        }
        return Promise.reject(error);
    },
);

// carierAxios.interceptors.request.use((config) => {
//     console.log("Request Headers:", config.headers);
//     return config;
// });

export async function getData({ path, query, config,getHeaders }: { path: string; query?: string; config?: AxiosRequestConfig,getHeaders?:boolean }) {
    try {
        const res = await carierAxios.get(`${path}${query ? `?${query}` : ""}`, config);
        return getHeaders ?{res:res.data,headers:res.headers}:res.data;
    } catch (error) {
        throw error;
    }
}

export async function postData({
    path,
    data,
    query,
    config,
}: {
    path: string;
    data: Record<string, any>;
    query?: string;
    config?: AxiosRequestConfig;
}) {
    try {
        const res = await carierAxios.post(`${path}${query ? `?${query}` : ""}`, data, config);
        return res.data;
    } catch (error) {
        throw error;
    }
}

export async function putData({
    path,
    data,
    query,
    config,
}: {
    path: string;
    data: Record<string, any>;
    query?: string;
    config?: AxiosRequestConfig;
}) {
    try {
        const res = await carierAxios.put(`${path}${query ? `?${query}` : ""}`, data, config);
        return res.data;
    } catch (error) {
        throw error;
    }
}
export async function patchData({
    path,
    data,
    query,
    config,
}: {
    path: string;
    data: Record<string, any>;
    query?: string;
    config?: AxiosRequestConfig;
}) {
    try {
        const res = await carierAxios.patch(`${path}${query ? `?${query}` : ""}`, data, config);
        return res.data;
    } catch (error) {
        throw error;
    }
}

export async function deleteData({ path, query, config }: { path: string; query?: string; config?: AxiosRequestConfig }) {
    try {
        const res = await carierAxios.delete(`${path}${query ? `?${query}` : ""}`, config);
        return res.data;
    } catch (error) {
        throw error;
    }
}
