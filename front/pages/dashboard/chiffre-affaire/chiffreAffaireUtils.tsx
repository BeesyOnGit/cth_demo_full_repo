import { TableColumn } from "@/components/Table";
import { formatMoney } from "@/utils/utils";
import { ChartData } from "chart.js";
import { DataItem } from "./types";
import { FieldConfig } from "@/components/FormBuilder";
import { getTranslation } from "@/i18n";

const t = getTranslation();

export const createTableColumns = (labelKey: string, data: DataItem[]): TableColumn<DataItem>[] => {
    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

    return [
        {
            key: "label",
            label: labelKey,
            render: ({ label }) => <span className={label === "Total" ? "font-bold" : "font-medium"}>{label}</span>,
        },
        {
            key: "amount",
            label: t("amount"),
            align: "right",
            render: ({ amount, label }) => <span className={`font-mono ${label === "Total" ? "font-bold" : ""}`}>{formatMoney(amount)}</span>,
        },
        {
            key: "contibutionPercentage",
            label: t("contributionPercent"),
            align: "right",
            render: ({ contibutionPercentage, label }) => (
                <span className={`font-mono ${label === "Total" ? "font-bold" : ""}`}>{contibutionPercentage.toFixed(2)}%</span>
            ),
        },
        {
            key: "cumulatedAmount",
            label: t("cumulative"),
            align: "right",
            render: ({ cumulatedAmount, label }) => (
                <span className={`font-mono ${label === "Total" ? "font-bold" : ""}`}>{formatMoney(cumulatedAmount)}</span>
            ),
        },
        {
            key: "cumulatedPercentage",
            label: t("cumulativePercent"),
            align: "right",
            render: ({ cumulatedPercentage, label }) => (
                <span className={`font-mono ${label === "Total" ? "font-bold" : ""}`}>{cumulatedPercentage.toFixed(2)}%</span>
            ),
        },
    ];
};

export const createPieChartData = (data: DataItem[]): ChartData<"doughnut"> => {
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
        labels: data.map((item) => item.label),
        datasets: [
            {
                label: t("monthlyAmount"),
                data: data.map((item) => item.amount),
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 1,
            },
            {
                label: t("cumulativeAmount"),
                data: data.map((item) => item.cumulatedAmount),
                backgroundColor: colors.map((c) => c.replace("0.8", "0.5")),
                borderColor: borderColors.map((c) => c.replace("1)", "0.7)")),
                borderWidth: 1,
            },
        ],
    };
};

export const createBarChartData = (data: DataItem[]): ChartData<"bar"> => {
    return {
        labels: data.map((item) => item.label),
        datasets: [
            {
                label: t("monthlyAmount"),
                data: data.map((item) => item.amount),
                backgroundColor: "rgba(59, 130, 246, 0.8)",
                borderColor: "rgba(59, 130, 246, 1)",
                borderWidth: 1,
            },
            {
                label: "Montant Cumulé",
                data: data.map((item) => item.cumulatedAmount),
                backgroundColor: "rgba(16, 185, 129, 0.8)",
                borderColor: "rgba(16, 185, 129, 1)",
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

export const getMonthOptions = () => {
    const months = [
        { label: "Janvier", value: "1" },
        { label: "Février", value: "2" },
        { label: "Mars", value: "3" },
        { label: "Avril", value: "4" },
        { label: "Mai", value: "5" },
        { label: "Juin", value: "6" },
        { label: "Juillet", value: "7" },
        { label: "Août", value: "8" },
        { label: "Septembre", value: "9" },
        { label: "Octobre", value: "10" },
        { label: "Novembre", value: "11" },
        { label: "Décembre", value: "12" },
    ];
    return months;
};

export const chiffreAffaireFilterFields = ({
    drs = [],
    userDrId,
}: {
    drs?: Array<{ _id: string; name: string }>;
    userDrId?: string;
}): FieldConfig[] => {
    const fields: any[] = [
        {
            type: "select",
            name: "year",
            label: "Année",
            placeholder: "Sélectionner l'année",
            options: getYearOptions(),
        },
        {
            type: "select",
            name: "month",
            label: "Mois",
            placeholder: "Sélectionner le mois",
            options: getMonthOptions(),
        },
    ];

    // Only add DR filter if user doesn't have a DR assigned
    if (!userDrId) {
        fields.unshift({
            type: "select",
            name: "drId",
            label: t("dr") || "Direction Régionale",
            placeholder: t("selectDr") || "Sélectionner DR",
            options: [{ label: "Toutes les DR", value: "" }, ...(drs?.map((dr) => ({ label: dr.name, value: dr._id })) || [])],
        });
    }

    return [
        {
            type: "group",
            className: "flex-wrap",
            fields,
        },
    ];
};
