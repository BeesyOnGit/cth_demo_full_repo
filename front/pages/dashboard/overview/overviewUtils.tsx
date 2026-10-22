import { Badge } from "@/components/Badge";
import { TableColumn } from "@/components/Table";
import { Tag } from "@/components/Tag";
import { Calendar } from "lucide-react";

// Helper functions
export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-DZ", {
        style: "currency",
        currency: "DZD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
};

export const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-DZ", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(date));
};

// Table columns factory functions
export const createInvoiceStatusColumns = (t: any): TableColumn<any>[] => [
    {
        key: "status",
        label: t("status"),
        render: (item) => <Badge variant="neutral">{t(`${item.status}`)}</Badge>,
    },
    {
        key: "count",
        label: t("count"),
        render: (item) => <span className="font-semibold text-slate-900">{item.count}</span>,
    },
    {
        key: "amount",
        label: t("amount"),
        render: (item) => <span className="font-semibold text-slate-900">{formatCurrency(item.amount)}</span>,
    },
    {
        key: "percentage",
        label: t("percentage"),
        render: (item) => (
            <div className="flex items-center space-x-2">
                <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[100px]">
                    <div className="bg-accent h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                </div>
                <span className="text-sm font-medium text-slate-700">{item.percentage.toFixed(1)}%</span>
            </div>
        ),
    },
];

export const createOldestUnrecoveredColumns = (t: any): TableColumn<any>[] => [
    {
        key: "invoiceNumber",
        label: t("invoiceNumber"),
        render: (item) => <span className="font-semibold text-slate-900">{item.invoiceNumber}</span>,
    },
    {
        key: "clientName",
        label: t("client"),
        render: (item) => (
            <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">{item.clientName || "N/A"}</p>
                {item.projectTitle && <p className="text-xs text-slate-500">{item.projectTitle}</p>}
            </div>
        ),
    },
    {
        key: "amountHT",
        label: t("amount"),
        render: (item) => <span className="font-semibold text-slate-900">{formatCurrency(item.amountHT)}</span>,
    },
    {
        key: "daysOverdue",
        label: t("daysOverdue"),
        render: (item) => (
            <Tag className="whitespace-nowrap" variant={item.daysOverdue > 90 ? "danger" : item.daysOverdue > 60 ? "warning" : "warning"}>
                {item.daysOverdue} {t("days")}
            </Tag>
        ),
    },
];

export const createRecentRecoveredColumns = (t: any): TableColumn<any>[] => [
    {
        key: "invoiceNumber",
        label: t("invoiceNumber"),
        render: (item) => <span className="font-semibold text-slate-900">{item.invoiceNumber}</span>,
    },
    {
        key: "clientName",
        label: t("client"),
        render: (item) => (
            <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">{item.clientName || "N/A"}</p>
                {item.projectTitle && <p className="text-xs text-slate-500">{item.projectTitle}</p>}
            </div>
        ),
    },
    {
        key: "amountHT",
        label: t("amount"),
        render: (item) => <span className="font-semibold text-green-600">{formatCurrency(item.amountHT)}</span>,
    },
    {
        key: "recoveryDate",
        label: t("recoveredOn"),
        render: (item) => (
            <div className="flex items-center space-x-2">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-sm text-slate-700 whitespace-nowrap">{formatDate(item.recoveryDate)}</span>
            </div>
        ),
    },
];
