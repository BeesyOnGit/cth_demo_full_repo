import React, { useEffect } from "react";
import { Card } from "@/components/Card";
import { Table, TableColumn } from "@/components/Table";
import { Loader } from "@/components/Loader";
import { Skeleton } from "@/components/Skeleton";
import { Badge } from "@/components/Badge";
import { Tag } from "@/components/Tag";
import {
    TrendingUp,
    TrendingDown,
    Users,
    Briefcase,
    CheckCircle,
    FolderOpen,
    DollarSign,
    FileText,
    Clock,
    UserPlus,
    FolderPlus,
    FilePlus,
    Award,
    AlertTriangle,
    CheckCircle2,
    Calendar,
} from "lucide-react";
import { useAuthStore } from "../../login/useAuthStore";
import { useOverviewStore } from "./overviewStore";
import { useLanguage } from "../../../i18n";
import {
    formatCurrency,
    formatPercentage,
    formatDate,
    createInvoiceStatusColumns,
    createOldestUnrecoveredColumns,
    createRecentRecoveredColumns,
} from "./overviewUtils";

export const Overview = () => {
    const { user } = useAuthStore();
    const { summary, isLoading, error, fetchDashboardSummary } = useOverviewStore();
    const { t } = useLanguage();

    useEffect(() => {
        // Auto-filter by user's DR if they have one
        fetchDashboardSummary(user?.drId);
    }, [user?.drId]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Skeleton for KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-xl border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-10 rounded-lg" />
                            </div>
                            <Skeleton className="h-8 w-32 mb-2" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    ))}
                </div>
                {/* Skeleton for Charts/Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-xl border border-slate-200 p-6 space-y-4">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="rounded-xl border border-slate-200 p-6 space-y-4">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-red-700">
                    {t("loading")}: {error}
                </p>
            </div>
        );
    }

    if (!summary) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    {t("welcomeBack")}, {user?.fullName}
                </h1>
                <p className="text-slate-500">{t("dashboardOverviewSubtitle")}</p>
            </div>
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t("totalClients")} value={summary.totalClients.toString()} icon={<Users className="text-blue-500" />} />
                <StatCard title={t("totalProjects")} value={summary.totalProjects.toString()} icon={<Briefcase className="text-purple-500" />} />
                <StatCard title={t("activeProjects")} value={summary.activeProjects.toString()} icon={<FolderOpen className="text-emerald-500" />} />
                <StatCard
                    title={t("completedProjects")}
                    value={summary.completedProjects.toString()}
                    icon={<CheckCircle className="text-green-600" />}
                />
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t("totalRevenue")} value={formatCurrency(summary.totalRevenue)} icon={<DollarSign className="text-emerald-500" />} />
                <StatCard
                    title={t("pendingInvoices")}
                    value={formatCurrency(summary.pendingInvoicesAmount)}
                    icon={<Clock className="text-amber-500" />}
                />
                <StatCard title={t("totalInvoices")} value={summary.totalInvoices.toString()} icon={<FileText className="text-indigo-500" />} />
                <StatCard
                    title={t("revenueGrowth")}
                    value={formatPercentage(summary.revenueGrowth)}
                    icon={summary.revenueGrowth >= 0 ? <TrendingUp className="text-green-500" /> : <TrendingDown className="text-red-500" />}
                    change={summary.revenueGrowth >= 0 ? t("positiveGrowth") : t("needsAttention")}
                    changeColor={summary.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}
                />
            </div>

            {/* Top Performing Dr & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performing Dr */}
                {summary.topPerformingDr && (
                    <div className="rounded-xl border border-amber-300 bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-100 p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-800">{t("topPerformingDr")}</h3>
                            <div className="p-2.5 bg-gradient-to-br from-yellow-200 to-amber-200 rounded-lg shadow-sm">
                                <Award className="text-amber-700" size={24} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-2xl font-bold text-slate-900">{summary.topPerformingDr.name}</p>
                            <p className="text-xl font-semibold text-amber-700">{formatCurrency(summary.topPerformingDr.revenue)}</p>
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                <Card title={t("recentActivityThisMonth")}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg shadow-sm">
                                    <UserPlus className="text-blue-800" size={20} />
                                </div>
                                <span className="text-sm font-semibold text-slate-700">{t("newClients")}</span>
                            </div>
                            <span className="text-xl font-bold text-blue-700">{summary.recentActivity.newClientsThisMonth}</span>
                        </div>
                        <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-purple-100 to-fuchsia-100 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-purple-200 to-purple-300 rounded-lg shadow-sm">
                                    <FolderPlus className="text-purple-800" size={20} />
                                </div>
                                <span className="text-sm font-semibold text-slate-700">{t("newProjects")}</span>
                            </div>
                            <span className="text-xl font-bold text-purple-700">{summary.recentActivity.newProjectsThisMonth}</span>
                        </div>
                        <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-green-200 to-green-300 rounded-lg shadow-sm">
                                    <FilePlus className="text-green-800" size={20} />
                                </div>
                                <span className="text-sm font-semibold text-slate-700">{t("invoicesCreated")}</span>
                            </div>
                            <span className="text-xl font-bold text-green-700">{summary.recentActivity.invoicesThisMonth}</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Invoices By Status Table */}
            <Card title={t("invoicesByStatus")}>
                <Table columns={createInvoiceStatusColumns(t)} data={summary.invoicesByStatus} keyExtractor={(item) => item.status} />
            </Card>

            {/* Recovery Management Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{t("recoveryManagement")}</h2>
                        <p className="text-sm text-slate-500 mt-1">{t("recoveryManagementSubtitle")}</p>
                    </div>
                </div>

                {/* Recovery Details Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Oldest Unrecovered Invoices */}
                    <Card
                        title={t("oldestUnrecoveredInvoices")}
                        action={
                            <div className="flex items-center space-x-2 text-red-600">
                                <AlertTriangle size={20} />
                                <span className="text-sm font-semibold">{t("requiresAttention")}</span>
                            </div>
                        }
                    >
                        <Table
                            columns={createOldestUnrecoveredColumns(t)}
                            data={summary.recoveryDetails.oldestUnrecovered}
                            keyExtractor={(item) => item.invoiceNumber}
                            emptyMessage={t("noUnrecoveredInvoices")}
                        />
                    </Card>

                    {/* Recently Recovered Invoices */}
                    <Card
                        title={t("recentlyRecoveredInvoices")}
                        action={
                            <div className="flex items-center space-x-2 text-green-600">
                                <CheckCircle2 size={20} />
                                <span className="text-sm font-semibold">{t("success")}</span>
                            </div>
                        }
                    >
                        <Table
                            columns={createRecentRecoveredColumns(t)}
                            data={summary.recoveryDetails.recentRecovered}
                            keyExtractor={(item) => item.invoiceNumber}
                            emptyMessage={t("noRecentRecoveries")}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ReactNode;
    change?: string;
    changeColor?: string;
}> = ({ title, value, icon, change, changeColor = "text-slate-600" }) => (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-100 to-slate-200/80 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-600">{title}</h3>
            <div className="p-2.5 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">{icon}</div>
        </div>
        <div className="mt-4">
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {change && <p className={`text-xs font-medium ${changeColor} mt-1`}>{change}</p>}
        </div>
    </div>
);
