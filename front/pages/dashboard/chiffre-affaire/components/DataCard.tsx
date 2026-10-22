import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Table } from "@/components/Table";
import { DisplayMode, DataItem } from "../types";
import { createTableColumns, createPieChartData, createBarChartData } from "../chiffreAffaireUtils";
import { BarChart3, PieChart as PieChartIcon, TableIcon } from "lucide-react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Doughnut, Bar } from "react-chartjs-2";
import { useLanguage } from "@/i18n";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

type DataCardProps = {
    title: string;
    data: DataItem[];
    labelKey: string;
};

export const DataCard: React.FC<DataCardProps> = ({ title, data, labelKey }) => {
    const [displayMode, setDisplayMode] = useState<DisplayMode>("table");
    const { t } = useLanguage();

    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
    const totalCumulatedAmount = data.reduce((sum, item) => sum + item.cumulatedAmount, 0);

    const dataWithTotals = [
        ...data,
        {
            label: "Total",
            amount: totalAmount,
            contibutionPercentage: 100,
            cumulatedAmount: totalCumulatedAmount,
            cumulatedPercentage: 100,
        } as DataItem,
    ];

    const renderContent = () => {
        if (!data || data.length === 0) {
            return <div className="flex items-center justify-center h-40 text-slate-400">{t("noDataAvailable")}</div>;
        }

        switch (displayMode) {
            case "table":
                return <Table columns={createTableColumns(labelKey, data)} data={dataWithTotals} keyExtractor={(item) => item.label} />;
            case "pie":
                return (
                    <div className="flex items-center justify-center p-6" style={{ height: "400px" }}>
                        <Doughnut
                            plugins={[ChartDataLabels]}
                            data={createPieChartData(data)}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: "right",
                                        labels: {
                                            generateLabels: (chart) => {
                                                const data = chart.data;
                                                if (data.labels && data.datasets.length) {
                                                    return data.labels.map((label, i) => ({
                                                        text: `${label}`,
                                                        fillStyle: data.datasets[0].backgroundColor[i],
                                                        strokeStyle: data.datasets[0].borderColor[i],
                                                        lineWidth: 1,
                                                        hidden: false,
                                                        index: i,
                                                    }));
                                                }
                                                return [];
                                            },
                                        },
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: (context) => {
                                                const label = context.label || "";
                                                const datasetLabel = context.dataset.label || "";
                                                const value = context.parsed || 0;
                                                return `${datasetLabel} - ${label}: ${value.toLocaleString()} DA`;
                                            },
                                        },
                                    },
                                    datalabels: {
                                        color: "#fff",
                                        font: {
                                            weight: "bold",
                                            size: 12,
                                        },
                                        formatter: (value, context) => {
                                            const dataset = context.chart.data.datasets[context.datasetIndex];
                                            const total = dataset.data.reduce((acc: number, val: any) => acc + val, 0);
                                            if (!total) return "0%";
                                            return ((value / total) * 100).toFixed(1) + "%";
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                );
            case "bar":
                return (
                    <div className="p-6" style={{ height: "400px" }}>
                        <Bar
                            plugins={[ChartDataLabels]}
                            data={createBarChartData(data)}
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
            title={title}
            className="p-0"
            action={
                <div className="flex gap-2">
                    <button
                        onClick={() => setDisplayMode("table")}
                        className={`p-2 rounded transition-colors ${
                            displayMode === "table" ? "bg-accent text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                        title="Tableau"
                    >
                        <TableIcon size={16} />
                    </button>
                    <button
                        onClick={() => setDisplayMode("pie")}
                        className={`p-2 rounded transition-colors ${
                            displayMode === "pie" ? "bg-accent text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                        title="Graphique circulaire"
                    >
                        <PieChartIcon size={16} />
                    </button>
                    <button
                        onClick={() => setDisplayMode("bar")}
                        className={`p-2 rounded transition-colors ${
                            displayMode === "bar" ? "bg-accent text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                        title="Graphique à barres"
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
