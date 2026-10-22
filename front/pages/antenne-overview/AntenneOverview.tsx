import React, { useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/Card";
import { Skeleton } from "@/components/Skeleton";
import FilterQuery from "@/components/FilterQuery";
import { TrendingUp, DollarSign, FileText, Calendar } from "lucide-react";
import { useAuthStore } from "../login/useAuthStore";
import { useAntenneOverviewStore } from "./antenneOverviewStore";
import { useLanguage } from "../../i18n";
import { formatMoney, formatDate } from "@/utils/utils";
import { getYearOptions, getMonthOptions } from "./antenneOverviewUtils";
import { FieldConfig } from "@/components/FormBuilder";

export const AntenneOverview = () => {
    const { user } = useAuthStore();
    const { stats, isLoading, error, fetchAntenneOverview } = useAntenneOverviewStore();
    const { t } = useLanguage();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const queryString = searchParams.toString();
        await fetchAntenneOverview(queryString);
    };

    const handleSubmit = (queryString: string) => {
        fetchAntenneOverview(queryString);
    };

    const filterFields = useCallback((): FieldConfig[] => {
        return [
            {
                type: "group",
                className: "flex-wrap",
                fields: [
                    {
                        type: "select",
                        name: "year",
                        label: t("year"),
                        placeholder: t("selectYear"),
                        options: getYearOptions(),
                    },
                    {
                        type: "select",
                        name: "month",
                        label: t("month"),
                        placeholder: t("selectMonth"),
                        options: getMonthOptions(t),
                    },
                ],
            },
        ];
    }, [t]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Period Skeleton */}
                <div className="rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Skeleton className="h-6 w-6 rounded" />
                        <Skeleton className="h-6 w-48" />
                    </div>
                    <Skeleton className="h-5 w-64" />
                </div>

                {/* KPI Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="rounded-xl border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-10 w-10 rounded-lg" />
                            </div>
                            <Skeleton className="h-8 w-40 mb-2" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-500 text-lg">{error}</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-slate-500 text-lg">{t("noDataAvailable")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">{t("antenneOverview")}</h1>
                <p className="text-slate-600 mt-1">{t("antenneOverviewDescription")}</p>
            </div>

            {/* Filters */}
            <FilterQuery moreFilters fields={filterFields()} onSubmit={handleSubmit} noSearch formId="form-filt" />

            {/* Period Card */}
            <Card className="bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
                        <Calendar className="text-accent" size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{t("period")}</h3>
                </div>
                <p className="text-slate-700 font-medium">
                    {formatDate({ date: stats.period.start })} - {formatDate({ date: stats.period.end })}
                </p>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Turnover Card */}
                <StatCard
                    title={t("turnover")}
                    value={formatMoney(stats.turnover)}
                    icon={<DollarSign className="text-accent" />}
                    gradient="from-blue-100/70 to-indigo-100"
                />

                {/* Collection Card */}
                <StatCard
                    title={t("collection")}
                    value={formatMoney(stats.collection)}
                    icon={<TrendingUp className="text-emerald-500" />}
                    gradient="from-emerald-100/70 to-teal-100"
                />

                {/* Pending Invoices Card */}
                <StatCard
                    title={t("pendingInvoicesAmount")}
                    value={formatMoney(stats.pendingInvoices)}
                    icon={<FileText className="text-amber-500" />}
                    gradient="from-amber-100/70 to-orange-100"
                />
            </div>
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    gradient?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, gradient = "from-white via-blue-100/70 to-indigo-100" }) => (
    <div
        className={`rounded-xl border border-blue-200 bg-gradient-to-br ${gradient} p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
    >
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-600">{title}</h3>
            <div className="p-2.5 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">{icon}</div>
        </div>
        <div className="mt-4">
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
    </div>
);
