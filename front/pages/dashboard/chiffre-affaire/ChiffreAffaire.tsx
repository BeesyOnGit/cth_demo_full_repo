import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useChiffreAffaireStore } from "./chiffreAffaireStore";
import { DataCard } from "./components/DataCard";
import { EvolutionCard } from "./components/EvolutionCard";
import { ObjectivesRealisationTable } from "./components/ObjectivesRealisationTable";
import { CollectionObjectivesTable } from "./components/CollectionObjectivesTable";
import { DrRealisationTable } from "./components/DrRealisationTable";
import { DataItem } from "./types";
import { chiffreAffaireFilterFields } from "./chiffreAffaireUtils";
import { Card } from "@/components/Card";
import { Loader } from "@/components/Loader";
import { Skeleton } from "@/components/Skeleton";
import { formatMoney, formatDate } from "@/utils/utils";
import { useToastStore } from "@/store/useToastStore";
import { useDrStore } from "@/pages/admin-referentials/drs/useDrStore";
import { useAuthStore } from "@/pages/login/useAuthStore";
import FilterQuery from "@/components/FilterQuery";
import { TrendingUp, DollarSign } from "lucide-react";
import { useLanguage } from "@/i18n";

export const ChiffreAffaire = () => {
    const { t } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const { turnoverStats, isLoading, getTurnoverStats } = useChiffreAffaireStore();
    const { drs, getAllDrs } = useDrStore();
    const { user } = useAuthStore();
    const { addToast } = useToastStore();

    useEffect(() => {
        getAllDrs("noPag=true");
        // Auto-filter by user's DR if they have one
        if (user?.drId && !searchParams.get("drId")) {
            const params = new URLSearchParams(searchParams);
            params.set("drId", user.drId);
            setSearchParams(params, { replace: true });
        }
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Include user's drId in query if they have one
            let queryString = searchParams.toString();
            if (user?.drId && !searchParams.get("drId")) {
                queryString += (queryString ? "&" : "") + `drId=${user.drId}`;
            }
            await getTurnoverStats(queryString);
        } catch (error) {
            addToast(error, "error");
        }
    };

    const handleApplyFilters = (queryString: string) => {
        // Always include user's drId if they have one
        let finalQueryString = queryString;
        if (user?.drId) {
            const params = new URLSearchParams(queryString);
            params.set("drId", user.drId);
            finalQueryString = params.toString();
        }
        getTurnoverStats(finalQueryString).catch((e) => addToast(e, "error"));
    };

    const chiffreAffaireFilters = useCallback(() => {
        return chiffreAffaireFilterFields({ drs: drs || [], userDrId: user?.drId });
    }, [drs, user?.drId]);

    const serviceTypeData: DataItem[] = useMemo(() => {
        return (
            turnoverStats?.byServiceType?.map((item) => ({
                label: item.serviceType,
                amount: item.amount,
                contibutionPercentage: item.contibutionPercentage,
                cumulatedAmount: item.cumulatedAmount,
                cumulatedPercentage: item.cumulatedPercentage,
            })) || []
        );
    }, [turnoverStats]);

    const clientTypeData: DataItem[] = useMemo(() => {
        return (
            turnoverStats?.byClientType?.map((item) => ({
                label: item.clientType,
                amount: item.amount,
                contibutionPercentage: item.contibutionPercentage,
                cumulatedAmount: item.cumulatedAmount,
                cumulatedPercentage: item.cumulatedPercentage,
            })) || []
        );
    }, [turnoverStats]);

    const regionalData: DataItem[] = useMemo(() => {
        if ("byWilaya" in (turnoverStats || {})) {
            return (
                (turnoverStats as any)?.byWilaya?.map((item: any) => ({
                    label: item.wilaya,
                    amount: item.amount,
                    contibutionPercentage: item.contibutionPercentage,
                    cumulatedAmount: item.cumulatedAmount,
                    cumulatedPercentage: item.cumulatedPercentage,
                })) || []
            );
        }
        if ("byDr" in (turnoverStats || {})) {
            return (
                (turnoverStats as any)?.byDr?.map((item: any) => ({
                    label: item.dr,
                    amount: item.amount,
                    contibutionPercentage: item.contibutionPercentage,
                    cumulatedAmount: item.cumulatedAmount,
                    cumulatedPercentage: item.cumulatedPercentage,
                })) || []
            );
        }
        return [];
    }, [turnoverStats]);

    const evolutionData = useMemo(() => {
        return turnoverStats?.turnoverEvolution || [];
    }, [turnoverStats]);

    const turnoverObjectivesData = useMemo(() => {
        return turnoverStats?.DrTurnoverObjectivesRealisation || [];
    }, [turnoverStats]);

    const collectionObjectivesData = useMemo(() => {
        return turnoverStats?.DrCollectionObjectivesRealisation || [];
    }, [turnoverStats]);

    const drRealisationData = useMemo(() => {
        return "realisationByDr" in (turnoverStats || {}) ? (turnoverStats as any)?.realisationByDr || [] : [];
    }, [turnoverStats]);

    return (
        <div className="space-y-6">
            {/* Filters */}
            <FilterQuery noSearch formId="form-fil" fields={chiffreAffaireFilters()} moreFilters onSubmit={handleApplyFilters} />

            {isLoading ? (
                <>
                    {/* Skeleton for Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-xl border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-10 w-10 rounded-lg" />
                            </div>
                            <Skeleton className="h-8 w-40 mb-2" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                        <div className="rounded-xl border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-10 w-10 rounded-lg" />
                            </div>
                            <Skeleton className="h-8 w-40 mb-2" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                    </div>
                    {/* Skeleton for Data Cards */}
                    <div className="rounded-xl border border-slate-200 p-6 space-y-4">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="rounded-xl border border-slate-200 p-6 space-y-4">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </>
            ) : turnoverStats ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StatCard
                            title={t("turnoverOfMonth")}
                            value={formatMoney(turnoverStats.totalTurnoverMonth)}
                            icon={<DollarSign className="text-accent" />}
                            description={
                                turnoverStats.period
                                    ? `${t("period")}: ${formatDate({ date: turnoverStats.period.start })} - ${formatDate({
                                          date: turnoverStats.period.end,
                                      })}`
                                    : undefined
                            }
                        />
                        <StatCard
                            title={t("cumulativeTurnover")}
                            value={formatMoney(turnoverStats.totalTurnoverCumulated)}
                            icon={<TrendingUp className="text-emerald-500" />}
                            description={t("sinceYearStart")}
                        />
                    </div>

                    {/* Data Visualizations */}
                    {serviceTypeData.length > 0 && <DataCard title={t("byServiceType")} data={serviceTypeData} labelKey={t("serviceType")} />}

                    {clientTypeData.length > 0 && <DataCard title={t("byClientType")} data={clientTypeData} labelKey={t("clientType")} />}

                    {regionalData.length > 0 && (
                        <DataCard
                            title={searchParams.get("drId") ? t("byWilaya") : t("byRegionalDirectorate")}
                            data={regionalData}
                            labelKey={searchParams.get("drId") ? t("wilaya") : t("regionalDirectorate")}
                        />
                    )}

                    {evolutionData.length > 0 && <EvolutionCard data={evolutionData} />}

                    {turnoverObjectivesData.length > 0 && (
                        <ObjectivesRealisationTable data={turnoverObjectivesData} title={t("turnoverObjectivesRealisation")} />
                    )}

                    {collectionObjectivesData.length > 0 && (
                        <CollectionObjectivesTable data={collectionObjectivesData} title={t("collectionObjectivesRealisation")} />
                    )}

                    {drRealisationData.length > 0 && <DrRealisationTable data={drRealisationData} title={t("drRealisationByObjectives")} />}
                </>
            ) : (
                <div className="text-center py-12 text-slate-500">{t("noDataAvailable")}</div>
            )}
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; description?: string }> = ({ title, value, icon, description }) => (
    <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-white via-blue-100/70 to-indigo-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-600">{title}</h3>
            <div className="p-2.5 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">{icon}</div>
        </div>
        <div className="mt-4">
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {description && <p className="text-xs font-medium text-slate-600 mt-1">{description}</p>}
        </div>
    </div>
);
