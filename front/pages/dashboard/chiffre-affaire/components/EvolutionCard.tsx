import React, { useState, useMemo } from "react";
import { Card } from "@/components/Card";
import { Table, TableColumn } from "@/components/Table";
import { LineChart, TableIcon } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import { formatMoney } from "@/utils/utils";
import { useLanguage } from "@/i18n";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type EvolutionDataItem = {
    dr: string;
    yearlyData: {
        year: number;
        amount: number;
    }[];
};

type EvolutionCardProps = {
    data: EvolutionDataItem[];
};

type DisplayMode = "table" | "line";

export const EvolutionCard: React.FC<EvolutionCardProps> = ({ data }) => {
    const { t } = useLanguage();
    const [displayMode, setDisplayMode] = useState<DisplayMode>("table");

    // Get all unique years across all DRs
    const allYears = useMemo(() => {
        const yearsSet = new Set<number>();
        data.forEach((dr) => {
            dr.yearlyData.forEach((yearData) => {
                yearsSet.add(yearData.year);
            });
        });
        return Array.from(yearsSet).sort();
    }, [data]);

    // Transform data for table view
    const tableData = useMemo(() => {
        return data.map((dr) => {
            const row: any = { dr: dr.dr };
            allYears.forEach((year) => {
                const yearData = dr.yearlyData.find((d) => d.year === year);
                row[`year_${year}`] = yearData?.amount || 0;
            });
            return row;
        });
    }, [data, allYears]);

    // Create table columns dynamically based on years
    const tableColumns: TableColumn<any>[] = useMemo(() => {
        const columns: TableColumn<any>[] = [
            {
                key: "dr",
                label: "Direction Régionale",
                render: ({ dr }) => <span className="font-medium">{dr}</span>,
            },
        ];

        allYears.forEach((year) => {
            columns.push({
                key: `year_${year}`,
                label: year.toString(),
                align: "right",
                render: (row) => <span className="font-mono">{formatMoney(row[`year_${year}`])}</span>,
            });
        });

        return columns;
    }, [allYears]);

    // Transform data for line chart
    const lineChartData = useMemo(() => {
        const colors = [
            "rgba(59, 130, 246, 1)", // blue
            "rgba(16, 185, 129, 1)", // green
            "rgba(245, 158, 11, 1)", // amber
            "rgba(239, 68, 68, 1)", // red
            "rgba(139, 92, 246, 1)", // violet
            "rgba(236, 72, 153, 1)", // pink
            "rgba(20, 184, 166, 1)", // teal
            "rgba(251, 146, 60, 1)", // orange
        ];

        return {
            labels: allYears.map((year) => year.toString()),
            datasets: data.map((dr, index) => ({
                label: dr.dr,
                data: allYears.map((year) => {
                    const yearData = dr.yearlyData.find((d) => d.year === year);
                    return yearData?.amount || 0;
                }),
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length].replace("1)", "0.1)"),
                tension: 0.05,
                borderWidth: 4,
                pointRadius: 3,
                pointHoverRadius: 10,
                pointStyle: index % 2 === 0 ? "circle" : "rect",
                // offset: true,
            })),
        };
    }, [data, allYears]);

    const renderContent = () => {
        if (!data || data.length === 0) {
            return <div className="flex items-center justify-center h-40 text-slate-400">{t("noDataAvailable")}</div>;
        }

        switch (displayMode) {
            case "table":
                return <Table columns={tableColumns} data={tableData} keyExtractor={(item) => item.dr} />;
            case "line":
                return (
                    <div className="p-6" style={{ height: "400px" }}>
                        <Line
                            data={lineChartData}
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
                                                const label = context.dataset.label || "";
                                                const value = context.parsed.y || 0;
                                                return `${label}: ${value.toLocaleString("fr-FR")} DA`;
                                            },
                                        },
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            callback: (value) => {
                                                const num = value as number;

                                                return formatMoney(num) + " DA";
                                            },
                                        },
                                    },
                                    x: {
                                        grid: {
                                            display: false,
                                        },
                                        // stacked: false,
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
            title="Évolution du Chiffre d'Affaire"
            className="p-0"
            action={
                <div className="flex gap-2">
                    <button
                        onClick={() => setDisplayMode("table")}
                        className={`p-2 rounded transition-colors ${
                            displayMode === "table" ? "bg-accent text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                        title="Table"
                    >
                        <TableIcon size={18} />
                    </button>
                    <button
                        onClick={() => setDisplayMode("line")}
                        className={`p-2 rounded transition-colors ${
                            displayMode === "line" ? "bg-accent text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                        title="Line Chart"
                    >
                        <LineChart size={18} />
                    </button>
                </div>
            }
        >
            {renderContent()}
        </Card>
    );
};
