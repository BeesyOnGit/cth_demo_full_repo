import { TableColumn } from "@/components/Table";
import { formatMoney, formatDate } from "@/utils/utils";
import { ChartData } from "chart.js";
import { DrDataItem, BankDataItem } from "./types";
import { FieldConfig } from "@/components/FormBuilder";
import { getTranslation } from "@/i18n";
import { Tag } from "@/components/Tag";

const t = getTranslation();

export const createDrTableColumns = (): TableColumn<DrDataItem>[] => {
    return [
        {
            key: "label",
            label: t("regionalDirectorate"),
            render: ({ label }) => <span className="font-medium">{label}</span>,
        },
        {
            key: "totalBonds",
            label: t("count"),
            align: "center",
            render: ({ totalBonds }) => <span className="font-mono">{totalBonds}</span>,
        },
        {
            key: "totalAmount",
            label: t("totalAmount"),
            align: "right",
            render: ({ totalAmount }) => <span className="font-mono">{formatMoney(totalAmount)}</span>,
        },
        {
            key: "cashedCount",
            label: t("cashedCount"),
            align: "center",
            render: ({ cashedCount }) => <span className="font-mono text-emerald-600">{cashedCount}</span>,
        },
        {
            key: "cashedAmount",
            label: t("cashedAmount"),
            align: "right",
            render: ({ cashedAmount }) => <span className="font-mono text-emerald-600">{formatMoney(cashedAmount)}</span>,
        },
        {
            key: "uncashedAmount",
            label: t("uncashedAmount"),
            align: "right",
            render: ({ uncashedAmount }) => <span className="font-mono text-amber-600">{formatMoney(uncashedAmount)}</span>,
        },
    ];
};

export const createBankTableColumns = (): TableColumn<BankDataItem>[] => {
    return [
        {
            key: "label",
            label: t("bank"),
            render: ({ label }) => <span className="font-medium">{label}</span>,
        },
        {
            key: "totalBonds",
            label: t("count"),
            align: "center",
            render: ({ totalBonds }) => <span className="font-mono">{totalBonds}</span>,
        },
        {
            key: "totalAmount",
            label: t("totalAmount"),
            align: "right",
            render: ({ totalAmount }) => <span className="font-mono">{formatMoney(totalAmount)}</span>,
        },
        {
            key: "cashedCount",
            label: t("cashedCount"),
            align: "center",
            render: ({ cashedCount }) => <span className="font-mono text-emerald-600">{cashedCount}</span>,
        },
        {
            key: "cashedAmount",
            label: t("cashedAmount"),
            align: "right",
            render: ({ cashedAmount }) => <span className="font-mono text-emerald-600">{formatMoney(cashedAmount)}</span>,
        },
    ];
};

export const createDetailsTableColumns = (): TableColumn<any>[] => {
    return [
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
            key: "projectTitle",
            label: t("title"),
            render: ({ projectTitle }) => <span className="font-medium">{projectTitle}</span>,
        },
        {
            key: "conventionNumber",
            label: t("conventionNumber"),
            render: ({ conventionNumber }) => <span className="font-mono">{conventionNumber}</span>,
        },
        {
            key: "bondNumber",
            label: t("bondNumber"),
            render: ({ bondNumber }) => <span className="font-mono">{bondNumber}</span>,
        },
        {
            key: "date",
            label: t("date"),
            render: ({ date }) => <span>{formatDate({ date })}</span>,
        },
        {
            key: "bank",
            label: t("bank"),
            render: ({ bank }) => <span>{bank}</span>,
        },
        {
            key: "amount",
            label: t("amount"),
            align: "right",
            render: ({ amount }) => <span className="font-mono">{formatMoney(amount)}</span>,
        },
        {
            key: "cashed",
            label: t("status"),
            align: "center",
            render: ({ cashed }) => <Tag variant={cashed ? "success" : "warning"}>{cashed ? t("cashed") : t("nonRecouvert")}</Tag>,
        },
    ];
};

export const createPieChartData = (data: DrDataItem[] | BankDataItem[], valueKey: "totalAmount" | "cashedAmount"): ChartData<"doughnut"> => {
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
                label: valueKey === "totalAmount" ? "Montant Total" : "Montant Encaissé",
                data: data.map((item) => item[valueKey]),
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 1,
            },
        ],
    };
};

export const createBarChartData = (data: DrDataItem[]): ChartData<"bar"> => {
    return {
        labels: data.map((item) => item.label),
        datasets: [
            {
                label: "Montant Total",
                data: data.map((item) => item.totalAmount),
                backgroundColor: "rgba(59, 130, 246, 0.8)",
                borderColor: "rgba(59, 130, 246, 1)",
                borderWidth: 1,
            },
            {
                label: "Montant Encaissé",
                data: data.map((item) => item.cashedAmount),
                backgroundColor: "rgba(16, 185, 129, 0.8)",
                borderColor: "rgba(16, 185, 129, 1)",
                borderWidth: 1,
            },
            {
                label: "Montant Non Encaissé",
                data: data.map((item) => item.uncashedAmount),
                backgroundColor: "rgba(245, 158, 11, 0.8)",
                borderColor: "rgba(245, 158, 11, 1)",
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

export const cautionFilterFields = ({ drs = [], userDrId }: { drs?: Array<{ _id: string; name: string }>; userDrId?: string }): FieldConfig[] => {
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
        {
            type: "select",
            name: "includeDetails",
            label: "details",
            placeholder: "Tous",
            options: [
                { label: "Tous", value: "" },
                { label: "Details", value: "true" },
                { label: "Sans Détails", value: "false" },
            ],
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
