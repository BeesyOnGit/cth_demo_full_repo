import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useCautionStore } from "./cautionStore";
import { DrDataItem, BankDataItem } from "./types";
import { cautionFilterFields, createDrTableColumns, createBankTableColumns, createDetailsTableColumns } from "./cautionUtils";
import { Loader } from "@/components/Loader";
import { Skeleton } from "@/components/Skeleton";
import { formatMoney, formatDate } from "@/utils/utils";
import { useToastStore } from "@/store/useToastStore";
import { useDrStore } from "@/pages/admin-referentials/drs/useDrStore";
import { useAuthStore } from "@/pages/login/useAuthStore";
import FilterQuery from "@/components/FilterQuery";
import { TrendingUp, DollarSign, Shield, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/Card";
import { Table } from "@/components/Table";
import { useLanguage } from "@/i18n";

export const Caution = () => {
    const { t } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const { bondStats, isLoading, getBondStats } = useCautionStore();
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
            await getBondStats(queryString);
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
        getBondStats(finalQueryString).catch((e) => addToast(e, "error"));
    };

    const cautionFilters = useCallback(() => {
        return cautionFilterFields({ drs: drs || [], userDrId: user?.drId });
    }, [drs, user?.drId]);

    const drData: DrDataItem[] = useMemo(() => {
        return (
            bondStats?.byDr?.map((item) => ({
                label: item.dr,
                totalBonds: item.totalBonds,
                totalAmount: item.totalAmount,
                cashedCount: item.cashedCount,
                cashedAmount: item.cashedAmount,
                uncashedAmount: item.uncashedAmount,
            })) || []
        );
    }, [bondStats]);

    const bankData: BankDataItem[] = useMemo(() => {
        return (
            bondStats?.byBank?.map((item) => ({
                label: item.bank,
                totalBonds: item.totalBonds,
                totalAmount: item.totalAmount,
                cashedCount: item.cashedCount,
                cashedAmount: item.cashedAmount,
            })) || []
        );
    }, [bondStats]);

    const detailsData = useMemo(() => {
        return bondStats?.details || [];
    }, [bondStats]);

    return (
        <div className="space-y-6">
            {/* Filters */}
            <FilterQuery noSearch formId="form-fil" fields={cautionFilters()} moreFilters onSubmit={handleApplyFilters} />

            {isLoading ? (
                <>
                    {/* Skeleton for Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    {/* Skeleton for Tables */}
                    <div className="rounded-xl border border-slate-200 p-6 space-y-4">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </>
            ) : bondStats ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title={t("numberOfBonds")}
                            value={bondStats.totalBonds.toString()}
                            icon={<Shield className="text-accent" />}
                            description={
                                bondStats.period
                                    ? `${t("period")}: ${formatDate({ date: bondStats.period.start })} - ${formatDate({
                                          date: bondStats.period.end,
                                      })}`
                                    : undefined
                            }
                        />
                        <StatCard
                            title={t("totalAmount")}
                            value={formatMoney(bondStats.totalAmount)}
                            icon={<DollarSign className="text-blue-500" />}
                            description={t("allBonds")}
                        />
                        <StatCard
                            title={t("cashedBonds")}
                            value={`${bondStats.totalCashed} (${bondStats.cashedPercentage.toFixed(1)}%)`}
                            icon={<CheckCircle2 className="text-emerald-500" />}
                            description={`${t("amount")}: ${formatMoney(bondStats.cashedAmount)}`}
                        />
                        <StatCard
                            title={t("uncashedAmount")}
                            value={formatMoney(bondStats.uncashedAmount)}
                            icon={<XCircle className="text-amber-500" />}
                            description={`${bondStats.totalBonds - bondStats.totalCashed} ${t("bonds")}`}
                        />
                    </div>

                    {/* Detailed List */}
                    {detailsData.length > 0 && (
                        <Card title={t("bondsDetails")} className="p-0">
                            <Table columns={createDetailsTableColumns()} data={detailsData} keyExtractor={(item) => `${item.bondNumber}`} />
                        </Card>
                    )}

                    {/* Data by DR */}
                    {drData.length > 0 && (
                        <Card title={t("byRegionalDirectorate")} className="p-0">
                            <Table columns={createDrTableColumns()} data={drData} keyExtractor={(item) => item.label} />
                        </Card>
                    )}

                    {/* Data by Bank */}
                    {bankData.length > 0 && (
                        <Card title={t("byBank")} className="p-0">
                            <Table columns={createBankTableColumns()} data={bankData} keyExtractor={(item) => item.label} />
                        </Card>
                    )}
                </>
            ) : (
                <div className="text-center py-12 text-slate-500">{t("noDataAvailable")}</div>
            )}
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; description?: string }> = ({ title, value, icon, description }) => (
    <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-white via-amber-100/70 to-yellow-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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
