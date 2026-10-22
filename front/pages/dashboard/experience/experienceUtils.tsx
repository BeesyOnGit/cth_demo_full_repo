import { TableColumn } from "@/components/Table";
import { formatMoney, formatDate } from "@/utils/utils";
import { ChartData } from "chart.js";
import { EmployeeStatItem } from "./types";
import { FieldConfig } from "@/components/FormBuilder";
import { getTranslation } from "@/i18n";

const t = getTranslation();

export const createPivotedTableColumns = (types: string[]): TableColumn<any>[] => {
    const columns: TableColumn<any>[] = [
        {
            key: "employeeName",
            label: t("employee"),
            render: ({ employeeName }) => <span className="font-medium">{employeeName}</span>,
        },
    ];

    // Add a column for each type
    types.forEach((type) => {
        columns.push({
            key: type,
            label: type,
            align: "center",
            render: (row: any) => <span className="font-mono text-accent font-semibold">{row[type] || 0}</span>,
        });
    });

    return columns;
};

export const createPivotedPieChartData = (pivotedData: any[], typeNames: string[]): ChartData<"doughnut"> => {
    const colors = [
        "rgba(59, 130, 246, 0.8)", // blue
        "rgba(16, 185, 129, 0.8)", // green
        "rgba(245, 158, 11, 0.8)", // amber
        "rgba(239, 68, 68, 0.8)", // red
        "rgba(139, 92, 246, 0.8)", // violet
        "rgba(236, 72, 153, 0.8)", // pink
        "rgba(20, 184, 166, 0.8)", // teal
        "rgba(251, 146, 60, 0.8)", // orange
    ];

    // Inner ring: Employee totals
    const innerLabels: string[] = [];
    const innerValues: number[] = [];
    const innerColors: string[] = [];
    const innerBorderColors: string[] = [];

    pivotedData.forEach((employee, index) => {
        const total = typeNames.reduce((sum, type) => sum + (employee[type] || 0), 0);
        innerLabels.push(employee.employeeName);
        innerValues.push(total);
        innerColors.push(colors[index % colors.length]);
        innerBorderColors.push(colors[index % colors.length].replace("0.8", "1"));
    });

    // Outer ring: Employee-Type breakdown
    const outerLabels: string[] = [];
    const outerValues: number[] = [];
    const outerColors: string[] = [];
    const outerBorderColors: string[] = [];

    pivotedData.forEach((employee, empIndex) => {
        const baseColor = colors[empIndex % colors.length];
        typeNames.forEach((type, typeIndex) => {
            const value = employee[type] || 0;
            if (value > 0) {
                outerLabels.push(`${employee.employeeName} - ${type}`);
                outerValues.push(value);
                // Create variations of the employee's color for each type
                const opacity = 0.5 + typeIndex * 0.1;
                outerColors.push(baseColor.replace("0.8", opacity.toString()));
                outerBorderColors.push(baseColor.replace("0.8", "1"));
            }
        });
    });

    return {
        labels: [...innerLabels, ...outerLabels],
        datasets: [
            {
                label: t("totalByEmployee"),
                data: innerValues,
                backgroundColor: innerColors,
                borderColor: innerBorderColors,
                borderWidth: 2,
                weight: 1,
            },
            {
                label: t("contribution"),
                data: outerValues,
                backgroundColor: outerColors,
                borderColor: outerBorderColors,
                borderWidth: 1,
                weight: 2,
            },
        ],
    };
};

export const createPivotedBarChartData = (pivotedData: any[], typeNames: string[]): ChartData<"bar"> => {
    const colors = [
        "rgba(59, 130, 246, 0.8)", // blue
        "rgba(16, 185, 129, 0.8)", // green
        "rgba(245, 158, 11, 0.8)", // amber
        "rgba(239, 68, 68, 0.8)", // red
        "rgba(139, 92, 246, 0.8)", // violet
        "rgba(236, 72, 153, 0.8)", // pink
        "rgba(20, 184, 166, 0.8)", // teal
        "rgba(251, 146, 60, 0.8)", // orange
    ];

    const datasets = typeNames.map((type, index) => ({
        label: type,
        data: pivotedData.map((employee) => employee[type] || 0),
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length].replace("0.8", "1"),
        borderWidth: 1,
    }));

    return {
        labels: pivotedData.map((employee) => employee.employeeName),
        datasets,
    };
};

export const createTypeStatsTableColumns = (labelKey: string): TableColumn<any>[] => {
    return [
        {
            key: "typeName",
            label: labelKey,
            render: ({ typeName }) => <span className="font-medium">{typeName}</span>,
        },
        {
            key: "stats",
            label: t("statisticsByEmployee"),
            render: ({ stats }) => (
                <div className="flex flex-wrap gap-3">
                    {stats.map((stat: any) => (
                        <div key={stat.employeeId} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                            <span className="text-sm text-slate-700">{stat.employeeName}:</span>
                            <span className="text-sm font-bold text-accent">{stat.projectCount}</span>
                        </div>
                    ))}
                </div>
            ),
        },
    ];
};

export const createEmployeeStatsTableColumns = (labelKey: string): TableColumn<EmployeeStatItem>[] => {
    return [
        {
            key: "employeeName",
            label: t("employee"),
            render: ({ employeeName }) => <span className="font-medium">{employeeName}</span>,
        },
        {
            key: "projectCount",
            label: t("projectsCount"),
            align: "center",
            render: ({ projectCount }) => <span className="font-mono text-accent font-semibold">{projectCount}</span>,
        },
    ];
};

export const createExperienceDetailsTableColumns = (): TableColumn<any>[] => {
    return [
        {
            key: "projectNumber",
            label: t("projectNumber"),
            render: ({ projectNumber }) => <span className="font-mono">{projectNumber}</span>,
        },
        {
            key: "dr",
            label: t("dr"),
            render: ({ dr }) => <span className="whitespace-nowrap">{dr}</span>,
        },
        {
            key: "antenne",
            label: t("antenne"),
            render: ({ antenne }) => <span className="whitespace-nowrap">{antenne}</span>,
        },
        {
            key: "serviceType",
            label: t("serviceType"),
            render: ({ serviceType }) => <span>{serviceType}</span>,
        },
        {
            key: "ouvrageType",
            label: t("ouvrageType"),
            render: ({ ouvrageType }) => <span>{ouvrageType}</span>,
        },
    ];
};

export const createPieChartData = (data: EmployeeStatItem[]): ChartData<"doughnut"> => {
    const colors = [
        "rgba(59, 130, 246, 0.8)", // blue
        "rgba(16, 185, 129, 0.8)", // green
        "rgba(245, 158, 11, 0.8)", // amber
        "rgba(239, 68, 68, 0.8)", // red
        "rgba(139, 92, 246, 0.8)", // violet
        "rgba(236, 72, 153, 0.8)", // pink
        "rgba(20, 184, 166, 0.8)", // teal
        "rgba(251, 146, 60, 0.8)", // orange
    ];

    const borderColors = [
        "rgba(59, 130, 246, 1)",
        "rgba(16, 185, 129, 1)",
        "rgba(245, 158, 11, 1)",
        "rgba(239, 68, 68, 1)",
        "rgba(139, 92, 246, 1)",
        "rgba(236, 72, 153, 1)",
        "rgba(20, 184, 166, 1)",
        "rgba(251, 146, 60, 1)",
    ];

    return {
        labels: data.map((item) => item.employeeName),
        datasets: [
            {
                label: "Nombre de Projets",
                data: data.map((item) => item.projectCount),
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 1,
            },
        ],
    };
};

export const createBarChartData = (data: EmployeeStatItem[]): ChartData<"bar"> => {
    const colors = [
        "rgba(59, 130, 246, 0.8)", // blue
        "rgba(16, 185, 129, 0.8)", // green
        "rgba(245, 158, 11, 0.8)", // amber
        "rgba(239, 68, 68, 0.8)", // red
        "rgba(139, 92, 246, 0.8)", // violet
        "rgba(236, 72, 153, 0.8)", // pink
        "rgba(20, 184, 166, 0.8)", // teal
        "rgba(251, 146, 60, 0.8)", // orange
    ];

    const borderColors = [
        "rgba(59, 130, 246, 1)",
        "rgba(16, 185, 129, 1)",
        "rgba(245, 158, 11, 1)",
        "rgba(239, 68, 68, 1)",
        "rgba(139, 92, 246, 1)",
        "rgba(236, 72, 153, 1)",
        "rgba(20, 184, 166, 1)",
        "rgba(251, 146, 60, 1)",
    ];

    return {
        labels: data.map((item) => item.employeeName),
        datasets: [
            {
                label: "Nombre de Projets",
                data: data.map((item) => item.projectCount),
                backgroundColor: colors.slice(0, data.length),
                borderColor: borderColors.slice(0, data.length),
                borderWidth: 1,
            },
        ],
    };
};

export const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 10; i--) {
        years.push({ label: i.toString(), value: i.toString() });
    }
    return years;
};

export const experienceFilterFields = ({ employees = [] }: { employees?: Array<{ _id: string; fullName: string }> }): FieldConfig[] => {
    return [
        {
            type: "group",
            className: "flex-wrap",
            fields: [
                {
                    type: "select",
                    name: "employeeId",
                    label: "Employé",
                    placeholder: "Sélectionner un employé",
                    options: [
                        { label: "Tous les employés", value: "" },
                        ...(employees?.map((emp) => ({ label: emp.fullName, value: emp._id })) || []),
                    ],
                },
                {
                    type: "select",
                    name: "year",
                    label: "Année",
                    placeholder: "Sélectionner l'année",
                    options: [{ label: "Toutes les années", value: "" }, ...getYearOptions()],
                },
            ],
        },
    ];
};
