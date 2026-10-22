import React from "react";
import { Card } from "@/components/Card";
import { Table } from "@/components/Table";
import { formatMoney } from "@/utils/utils";
import { useLanguage } from "@/i18n";
import { Trophy, TrendingUp, AlertTriangle } from "lucide-react";

interface DrRealisationTableProps {
    data: Array<{
        dr: string;
        drId: string;
        turnoverObjective: number;
        turnoverAchieved: number;
        realisationRate: number;
    }>;
    title?: string;
}

export const DrRealisationTable: React.FC<DrRealisationTableProps> = ({ data, title }) => {
    const { t } = useLanguage();

    // Calculate statistics
    const statistics = React.useMemo(() => {
        if (!data || data.length === 0) {
            return { best: null, worst: null, average: 0 };
        }

        const rates = data.map((item) => item.realisationRate);
        const average = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;

        const best = data.reduce((prev, current) => (current.realisationRate > prev.realisationRate ? current : prev));

        const worst = data.reduce((prev, current) => (current.realisationRate < prev.realisationRate ? current : prev));

        return { best, worst, average };
    }, [data]);

    const columns = [
        {
            key: "dr" as const,
            label: t("regionalDirectorate"),
            render: (item: (typeof data)[0]) => <span className="font-medium text-slate-700">{item.dr}</span>,
        },
        {
            key: "turnoverObjective" as const,
            label: t("objective"),
            render: (item: (typeof data)[0]) => formatMoney(item.turnoverObjective),
        },
        {
            key: "turnoverAchieved" as const,
            label: t("realised"),
            render: (item: (typeof data)[0]) => formatMoney(item.turnoverAchieved),
        },
        {
            key: "realisationRate" as const,
            label: t("realisationRate"),
            render: (item: (typeof data)[0]) => {
                const rate = item.realisationRate;
                const isObjectiveMet = rate >= 100;
                return (
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isObjectiveMet ? "bg-green-100 text-green-800" : rate >= 80 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                        }`}
                    >
                        {rate.toFixed(2)}%
                    </span>
                );
            },
        },
        {
            key: "status" as const,
            label: t("status"),
            render: (item: (typeof data)[0]) => {
                const rate = item.realisationRate;
                const isObjectiveMet = rate >= 100;
                return (
                    <span
                        className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold ${
                            isObjectiveMet
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : rate >= 80
                                  ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                    >
                        {isObjectiveMet ? "✓ " + t("objectiveMet") : rate >= 80 ? "⚠ " + t("nearObjective") : "✗ " + t("objectiveNotMet")}
                    </span>
                );
            },
        },
    ];

    return (
        <Card title={title || t("drRealisationByObjectives")} className="p-0">
            {data && data.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-50 border-b border-slate-200">
                    {/* Best Performance */}
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-500 uppercase">{t("bestPerformance")}</span>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <Trophy className="text-green-600" size={20} />
                            </div>
                        </div>
                        {statistics.best && (
                            <>
                                <p className="text-lg font-bold text-slate-900 mb-1">{statistics.best.dr}</p>
                                <p className="text-2xl font-bold text-green-600">{statistics.best.realisationRate.toFixed(2)}%</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {t("realised")}: {formatMoney(statistics.best.turnoverAchieved)}
                                </p>
                            </>
                        )}
                    </div>

                    {/* Average Performance */}
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-500 uppercase">{t("average")}</span>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <TrendingUp className="text-blue-600" size={20} />
                            </div>
                        </div>
                        <p className="text-lg font-bold text-slate-900 mb-1">{t("allDrs")}</p>
                        <p className="text-2xl font-bold text-blue-600">{statistics.average.toFixed(2)}%</p>
                        <p className="text-xs text-slate-500 mt-1">
                            {t("acrossDrs")} {data.length} {data.length === 1 ? "DR" : "DRs"}
                        </p>
                    </div>

                    {/* Worst Performance */}
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-500 uppercase">{t("needsAttention")}</span>
                            <div className="p-2 bg-red-50 rounded-lg">
                                <AlertTriangle className="text-red-600" size={20} />
                            </div>
                        </div>
                        {statistics.worst && (
                            <>
                                <p className="text-lg font-bold text-slate-900 mb-1">{statistics.worst.dr}</p>
                                <p className="text-2xl font-bold text-red-600">{statistics.worst.realisationRate.toFixed(2)}%</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {t("realised")}: {formatMoney(statistics.worst.turnoverAchieved)}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}
            <Table columns={columns} data={data} keyExtractor={(item) => item.drId} emptyMessage={t("noDataAvailable")} />
        </Card>
    );
};
