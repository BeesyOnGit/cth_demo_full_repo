import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Table } from "@/components/Table";
import { formatMoney } from "@/utils/utils";
import { useLanguage } from "@/i18n";
import { BarChart3, TableIcon } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ObjectivesRealisationTableProps {
    data: Array<{
        objective: number;
        turnover: number;
        realisationRate: number;
        month?: number;
    }>;
    title?: string;
}

export const ObjectivesRealisationTable: React.FC<ObjectivesRealisationTableProps> = ({ data, title }) => {
    const { t } = useLanguage();
    const [displayMode, setDisplayMode] = useState<"table" | "bar">("table");

    const getMonthName = (monthNumber: number) => {
        const monthNames = [
            t("january"),
            t("february"),
            t("march"),
            t("april"),
            t("may"),
            t("june"),
            t("july"),
            t("august"),
            t("september"),
            t("october"),
            t("november"),
            t("december"),
        ];
        return monthNames[monthNumber - 1] || `${t("month")} ${monthNumber}`;
    };

    const columns = [
        {
            key: "month" as const,
            label: t("month"),
            render: (item: (typeof data)[0]) => {
                if (item.month) {
                    return getMonthName(item.month);
                }
                return t("current");
            },
        },
        {
            key: "objective" as const,
            label: t("objective"),
            render: (item: (typeof data)[0]) => formatMoney(item.objective),
        },
        {
            key: "turnover" as const,
            label: t("realised"),
            render: (item: (typeof data)[0]) => formatMoney(item.turnover),
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

    const chartData = {
        labels: data.map((item) => (item.month ? getMonthName(item.month) : t("current"))),
        datasets: [
            {
                label: t("objective"),
                data: data.map((item) => item.objective),
                backgroundColor: "rgba(148, 163, 184, 0.6)",
                borderColor: "rgba(148, 163, 184, 1)",
                borderWidth: 1,
            },
            {
                label: t("realised"),
                data: data.map((item) => item.turnover),
                backgroundColor: data.map((item) => {
                    const rate = item.realisationRate;
                    if (rate >= 100) return "rgba(34, 197, 94, 0.6)";
                    if (rate >= 80) return "rgba(234, 179, 8, 0.6)";
                    return "rgba(239, 68, 68, 0.6)";
                }),
                borderColor: data.map((item) => {
                    const rate = item.realisationRate;
                    if (rate >= 100) return "rgba(34, 197, 94, 1)";
                    if (rate >= 80) return "rgba(234, 179, 8, 1)";
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
                return (
                    <Table columns={columns} data={data} keyExtractor={(item) => `${item.month || "current"}`} emptyMessage={t("noDataAvailable")} />
                );
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
                                                return `${datasetLabel}: ${value.toLocaleString()} DA`;
                                            },
                                        },
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            callback: (value) => `${value.toLocaleString()} DA`,
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
            title={title || t("objectivesRealisation")}
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
            {renderContent()}
        </Card>
    );
};
