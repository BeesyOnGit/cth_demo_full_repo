import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Table } from "@/components/Table";
import { DisplayMode, EmployeeStatItem } from "../types";
import { createPivotedTableColumns, createPivotedBarChartData } from "../experienceUtils";
import { BarChart3, TableIcon } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";
import { useLanguage } from "@/i18n";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type DataCardProps = {
    title: string;
    data: Array<{ typeName: string; stats: EmployeeStatItem[] }>;
    labelKey: string;
};

export const ExperienceDataCard: React.FC<DataCardProps> = ({ title, data, labelKey }) => {
    const [displayMode, setDisplayMode] = useState<DisplayMode>("bar");
    const { t } = useLanguage();

    // Transform data for pivoted table: employees as rows, types as columns
    const pivotedTableData = React.useMemo(() => {
        const employeeMap = new Map<string, any>();

        data.forEach((typeItem) => {
            typeItem.stats.forEach((stat) => {
                if (!employeeMap.has(stat.employeeId)) {
                    employeeMap.set(stat.employeeId, {
                        employeeId: stat.employeeId,
                        employeeName: stat.employeeName,
                    });
                }
                const employee = employeeMap.get(stat.employeeId);
                employee[typeItem.typeName] = stat.projectCount;
            });
        });

        return Array.from(employeeMap.values());
    }, [data]);

    const typeNames = React.useMemo(() => {
        return data.map((item) => item.typeName);
    }, [data]);

    const renderContent = () => {
        if (!data || data.length === 0) {
            return <div className="flex items-center justify-center h-40 text-slate-400">{t("noDataAvailable")}</div>;
        }

        switch (displayMode) {
            case "table":
                return <Table columns={createPivotedTableColumns(typeNames)} data={pivotedTableData} keyExtractor={(item) => item.employeeId} />;
            case "bar":
                return (
                    <div className="p-6" style={{ height: "500px" }}>
                        <Bar
                            plugins={[ChartDataLabels]}
                            data={createPivotedBarChartData(pivotedTableData, typeNames)}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: true,
                                        position: "bottom",
                                        labels: {
                                            padding: 15,
                                            font: {
                                                size: 11,
                                            },
                                        },
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function (context) {
                                                const label = context.dataset.label || "";
                                                const value = context.parsed.y || 0;
                                                return `${label}: ${value} projets`;
                                            },
                                        },
                                    },
                                    datalabels: {
                                        color: "#1e293b",
                                        anchor: "end",
                                        align: "top",
                                        font: {
                                            weight: "bold",
                                            size: 11,
                                        },
                                        formatter: (value: number) => {
                                            return value > 0 ? value : "";
                                        },
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            stepSize: 1,
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Card
            title={title}
            className="p-0 w-full"
            action={
                <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                    <button
                        onClick={() => setDisplayMode("table")}
                        className={`p-2 rounded transition-colors ${
                            displayMode === "table" ? "bg-white text-accent shadow-sm" : "text-slate-500 hover:text-slate-700"
                        }`}
                        title={t("tableView")}
                    >
                        <TableIcon size={18} />
                    </button>
                    <button
                        onClick={() => setDisplayMode("bar")}
                        className={`p-2 rounded transition-colors ${
                            displayMode === "bar" ? "bg-white text-accent shadow-sm" : "text-slate-500 hover:text-slate-700"
                        }`}
                        title={t("chartView")}
                    >
                        <BarChart3 size={18} />
                    </button>
                </div>
            }
        >
            {renderContent()}
        </Card>
    );
};
