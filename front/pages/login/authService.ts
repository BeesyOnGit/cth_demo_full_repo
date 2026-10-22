import { getData, postData } from "../../services/api";

export type Credentials = {
    email: string;
    password: string;
};

export const authService = {
    login: async ({ credentials }: { credentials: Credentials }) => {
        try {
            const res = await postData({ path: "employees/login", data: credentials });
            return res;
        } catch (error) {
            console.log("🚀 ~ file: authService.ts ~ login ~ error:", error);
            throw error;
        }
    },
    getCurrentUser: async () => {
        try {
            const res = await getData({ path: "employees/checkme" });
            return res;
        } catch (error) {
            throw error;
        }
    },
    logout: async () => {
        try {
            const res = await getData({ path: "employees/logout" });
            return res;
        } catch (error) {
            throw error;
        }
    },
};
