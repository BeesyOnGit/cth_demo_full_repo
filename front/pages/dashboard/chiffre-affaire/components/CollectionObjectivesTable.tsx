import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Table } from "@/components/Table";
import { useLanguage } from "@/i18n";
import { BarChart3, TableIcon } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface CollectionObjectivesTableProps {
    data: Array<{
        objectiveRate: number;
        collectedRate: number;
        month?: number;
    }>;
    title?: string;
}

export const CollectionObjectivesTable: React.FC<CollectionObjectivesTableProps> = ({ data, title }) => {
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
        labels: data.map((item) => (item.month ? getMonthName(item.month) : t("current"))),
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
            title={title || t("collectionObjectivesRealisation")}
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
