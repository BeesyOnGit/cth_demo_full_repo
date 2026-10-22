import { create } from "zustand";
import { User } from "../../types";
import { authService, Credentials } from "./authService";

type AuthState = {
    user: User | null;
    isLoading: boolean;
    login: ({ credentials }: { credentials: Credentials }) => Promise<any>;
    logout: () => void;
    checkAuth: () => Promise<any>;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    login: async ({ credentials }) => {
        set({ isLoading: true });
        // const { addToast } = useToastStore();

        try {
            const res = await authService.login({ credentials });
            set({ user: res.user });
            return res;
        } catch (error) {
            console.log("🚀 ~ file: useAuthStore.ts:31 ~ login: ~ error:", error);
            throw error.response?.data?.message || "An error occurred";
        } finally {
            set({ isLoading: false });
        }
    },
    logout: async () => {
        try {
            // The auth cookie is httpOnly: the server clears it
            await authService.logout();
        } catch (error) {
            console.log("🚀 ~ file: useAuthStore.ts:36 ~ logout: ~ error:", error);
        } finally {
            set({ user: null });
            window.location.hash = "#/login";
        }
    },
    checkAuth: async () => {
        set({ isLoading: true, user: {} as any });
        try {
            // Simulate checking auth token
            const res = await authService.getCurrentUser();
            set({ user: res.user });
            set({ isLoading: false });
        } catch (error) {
            set({ isLoading: false, user: null });
            throw error.response?.data?.message || "An error occurred";
        }
    },
}));
