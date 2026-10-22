import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabItem } from "../../components/Tabs";
import { BarChart3, DollarSign, FileText, Shield, Award, TrendingUp } from "lucide-react";
import { useLanguage } from "@/i18n";

export const Dashboard = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    const dashboardTabs: TabItem[] = [
        { id: "overview", label: t("overview"), icon: BarChart3 },
        { id: "chiffre-affaire", label: t("chiffreAffaire"), icon: DollarSign },
        { id: "encaissement", label: t("encaissement"), icon: TrendingUp },
        // { id: "facturation", label: t("facturation"), icon: FileText },
        { id: "caution", label: t("caution"), icon: Shield },
        { id: "experience", label: t("experience"), icon: Award },
        { id: "classement", label: t("classement"), icon: BarChart3 },
    ];

    // Extract the current tab from the pathname
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const activeTab = pathSegments.length > 1 && pathSegments[0] === "dashboard" ? pathSegments[1] : "overview";

    const handleTabChange = (tabId: string) => {
        if (tabId === "overview") {
            navigate("/dashboard");
        } else {
            navigate(`/dashboard/${tabId}`);
        }
    };

    return (
        <div className="space-y-6">
            <Tabs tabs={dashboardTabs} defaultTab="overview" onChange={handleTabChange} useRouting={true} activeTab={activeTab} />
            <Outlet />
        </div>
    );
};
