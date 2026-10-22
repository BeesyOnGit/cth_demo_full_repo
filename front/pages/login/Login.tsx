import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./useAuthStore";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Credentials } from "./authService";
import { handleChange } from "@/utils/utils";
import { useToastStore } from "../../store/useToastStore";
import { useLanguage } from "@/i18n";

export const Login = () => {
    const { login, isLoading, user } = useAuthStore();
    const { addToast } = useToastStore();
    const { t } = useLanguage();

    const navigate = useNavigate();
    const [creds, setCreds] = useState<Credentials>({ email: "", password: "" });

    // useEffect(() => {
    //     if (user) {
    //         if (user.antenneId) {
    //             navigate("/projects", { replace: true });
    //             return;
    //         }
    //         navigate(from, { replace: true });
    //     }
    // }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await login({ credentials: creds });
            const { message, user } = res;
            addToast(message, "success");
            if (user.antenneId) {
                navigate("/antenne-overview", { replace: true });
                return;
            }

            navigate("/", { replace: true });
        } catch (err) {
            // alert("Login failed");
            addToast(err, "error");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">ProGC</h1>
                    <p className="mt-2 text-sm text-slate-500">{t("signIntoAccount")}</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <Input
                            label={t("emailAddress")}
                            type="email"
                            name="email"
                            value={creds.email}
                            onChange={(e) => {
                                handleChange({ e, setState: setCreds });
                            }}
                            required
                        />
                        <Input
                            label={t("password")}
                            type="password"
                            name="password"
                            value={creds.password}
                            onChange={(e) => {
                                handleChange({ e, setState: setCreds });
                            }}
                            required
                        />
                    </div>
                    {/* <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 text-slate-600">
                            <input type="checkbox" className="rounded border-slate-300" />
                            {t("rememberMe")}
                        </label>
                        <a href="#" className="text-accent hover:underline">
                            {t("forgotPassword")}
                        </a>
                    </div> */}
                    <Button type="submit" className="w-full" disabled={isLoading} loading={isLoading}>
                        {t("signIn")}
                    </Button>

                    {/* <div className="mt-4 text-xs text-center text-slate-400">
                        <p>Demo Credentials:</p>
                        <p>Admin: admin@progc.dz</p>
                        <p>Chef Antenne: chef@progc.dz</p>
                    </div> */}
                </form>
            </div>
        </div>
    );
};
