import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Table } from "@/components/Table";
import { useLanguage } from "@/i18n";
import { BarChart3, TableIcon, Trophy, TrendingUp, AlertTriangle } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DrCollectionRealisationTableProps {
    data: Array<{
        dr: string;
        drId: string;
        objectiveRate: number;
        collectedRate: number;
    }>;
    title?: string;
}

export const DrCollectionRealisationTable: React.FC<DrCollectionRealisationTableProps> = ({ data, title }) => {
    const { t } = useLanguage();
    const [displayMode, setDisplayMode] = useState<"table" | "bar">("table");

    // Calculate statistics
    const statistics = React.useMemo(() => {
        if (!data || data.length === 0) {
            return { best: null, worst: null, average: 0 };
        }

        const rates = data.map((item) => item.collectedRate);
        const average = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;

        const best = data.reduce((prev, current) => (current.collectedRate > prev.collectedRate ? current : prev));

        const worst = data.reduce((prev, current) => (current.collectedRate < prev.collectedRate ? current : prev));

        return { best, worst, average };
    }, [data]);

    const columns = [
        {
            key: "dr" as const,
            label: t("regionalDirectorate"),
            render: (item: (typeof data)[0]) => <span className="font-medium text-slate-700">{item.dr}</span>,
        },
        {
            key: "objectiveRate" as const,
            label: t("objectiveRate"),
            render: (item: (typeof data)[0]) => `${item.objectiveRate.toFixed(2)}%`,
        },
        {
            key: "collectedRate" as const,
            label: t("collectedRate"),
            render: (item: (typeof data)[0]) => `${item.collectedRate.toFixed(2)}%`,
        },
        {
            key: "status" as const,
            label: t("status"),
            render: (item: (typeof data)[0]) => {
                const isObjectiveMet = item.collectedRate >= item.objectiveRate;
                const difference = Math.abs(item.collectedRate - item.objectiveRate);
                const isNear = difference <= 5 && !isObjectiveMet;
                return (
                    <span
                        className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold ${
                            isObjectiveMet
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : isNear
                                  ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                    >
                        {isObjectiveMet ? "✓ " + t("objectiveMet") : isNear ? "⚠ " + t("nearObjective") : "✗ " + t("objectiveNotMet")}
                    </span>
                );
            },
        },
    ];

    const chartData = {
        labels: data.map((item) => item.dr),
        datasets: [
            {
                label: t("objectiveRate"),
                data: data.map((item) => item.objectiveRate),
                backgroundColor: "rgba(148, 163, 184, 0.6)",
                borderColor: "rgba(148, 163, 184, 1)",
                borderWidth: 1,
            },
            {
                label: t("collectedRate"),
                data: data.map((item) => item.collectedRate),
                backgroundColor: data.map((item) => {
                    const isObjectiveMet = item.collectedRate >= item.objectiveRate;
                    const difference = Math.abs(item.collectedRate - item.objectiveRate);
                    const isNear = difference <= 5 && !isObjectiveMet;
                    if (isObjectiveMet) return "rgba(34, 197, 94, 0.6)";
                    if (isNear) return "rgba(234, 179, 8, 0.6)";
                    return "rgba(239, 68, 68, 0.6)";
                }),
                borderColor: data.map((item) => {
                    const isObjectiveMet = item.collectedRate >= item.objectiveRate;
                    const difference = Math.abs(item.collectedRate - item.objectiveRate);
                    const isNear = difference <= 5 && !isObjectiveMet;
                    if (isObjectiveMet) return "rgba(34, 197, 94, 1)";
                    if (isNear) return "rgba(234, 179, 8, 1)";
                    return "rgba(239, 68, 68, 1)";
                }),
                borderWidth: 1,
            },
        ],
    };

    const renderContent = () => {
        if (!data || data.length === 0) {
            return <div className="flex items-center justify-center h-40 text-slate-400">{t("noDataAvailable")}</div>;
        }

        switch (displayMode) {
            case "table":
                return <Table columns={columns} data={data} keyExtractor={(item) => item.drId} emptyMessage={t("noDataAvailable")} />;
            case "bar":
                return (
                    <div className="p-6" style={{ height: "400px" }}>
                        <Bar
                            data={chartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: true,
                                        position: "top",
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: (context) => {
                                                const datasetLabel = context.dataset.label || "";
                                                const value = context.parsed.y || 0;
                                                return `${datasetLabel}: ${value.toFixed(2)}%`;
                                            },
                                        },
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            callback: (value) => `${value}%`,
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                );
        }
    };

    return (
        <Card
            title={title || t("drRealisationByObjectives")}
            className="p-0"
            action={
                <div className="flex gap-2">
                    <button
                        onClick={() => setDisplayMode("table")}
                        className={`p-2 rounded transition-colors ${
                            displayMode === "table" ? "bg-accent text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                        title={t("tableView")}
                    >
                        <TableIcon size={16} />
                    </button>
                    <button
                        onClick={() => setDisplayMode("bar")}
                        className={`p-2 rounded transition-colors ${
                            displayMode === "bar" ? "bg-accent text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                        title={t("chartView")}
                    >
                        <BarChart3 size={16} />
                    </button>
                </div>
            }
        >
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
                                <p className="text-2xl font-bold text-green-600">{statistics.best.collectedRate.toFixed(2)}%</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {t("objectiveRate")}: {statistics.best.objectiveRate.toFixed(2)}%
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
                                <p className="text-2xl font-bold text-red-600">{statistics.worst.collectedRate.toFixed(2)}%</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {t("objectiveRate")}: {statistics.worst.objectiveRate.toFixed(2)}%
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}
            {renderContent()}
        </Card>
    );
};
