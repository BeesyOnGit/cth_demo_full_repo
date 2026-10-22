import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useClassementStore } from "./classementStore";
import { createRankingTableColumns, rankingFilterFields } from "./classementUtils";
import { Card } from "@/components/Card";
import { Loader } from "@/components/Loader";
import { Skeleton } from "@/components/Skeleton";
import { formatMoney, formatDate } from "@/utils/utils";
import { useToastStore } from "@/store/useToastStore";
import { useDrStore } from "@/pages/admin-referentials/drs/useDrStore";
import { useAuthStore } from "@/pages/login/useAuthStore";
import FilterQuery from "@/components/FilterQuery";
import { Trophy } from "lucide-react";
import { Table } from "@/components/Table";
import { useLanguage } from "@/i18n";

export const Classement = () => {
    const { t } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const { rankingStats, isLoading, getRankingStats } = useClassementStore();
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
            await getRankingStats(queryString);
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
        getRankingStats(finalQueryString).catch((e) => addToast(e, "error"));
    };

    const rankingFilters = useCallback(() => {
        return rankingFilterFields({ drs: drs || [], userDrId: user?.drId });
    }, [drs, user?.drId]);

    const metric = searchParams.get("metric") || "turnover";
    const type = searchParams.get("type") || "dr";

    const rankedData = useMemo(() => {
        if (!rankingStats?.rankings) return [];

        // Add rank to each item based on the selected metric
        const sorted = [...rankingStats.rankings].sort((a, b) => {
            const valueA = metric === "turnover" ? a.turnover : a.collection;
            const valueB = metric === "turnover" ? b.turnover : b.collection;
            return valueB - valueA; // Sort descending
        });

        return sorted.map((item, index) => ({
            ...item,
            rank: index + 1,
        }));
    }, [rankingStats, metric]);

    return (
        <div className="space-y-6">
            {/* Filters */}
            <FilterQuery noSearch formId="form-fil" fields={rankingFilters()} moreFilters onSubmit={handleApplyFilters} />

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader />
                </div>
            ) : rankingStats ? (
                <>
                    {/* Rankings Table */}
                    {rankedData.length > 0 && (
                        <Card
                            title={`${t("classement")} ${type === "dr" ? t("rankingOfRegionalDirectorates") : t("rankingOfAntennes")} - ${
                                metric === "turnover" ? t("byTurnover") : t("byCollection")
                            }`}
                            className="p-0"
                        >
                            <Table
                                columns={createRankingTableColumns(metric, type)}
                                data={rankedData}
                                keyExtractor={(item) => `${item.dr}-${item.antenne}`}
                            />
                        </Card>
                    )}
                </>
            ) : (
                <div className="text-center py-12 text-slate-500">{t("noDataAvailable")}</div>
            )}
        </div>
    );
};
