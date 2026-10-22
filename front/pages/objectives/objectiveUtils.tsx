import { TableColumn } from "@/components/Table";
import { Objective } from "@/types";
import { getTranslation } from "@/i18n";
import { formatDate, formatMoney } from "@/utils/utils";
import { Tag } from "@/components/Tag";
import { Edit, Trash2 } from "lucide-react";
import { FieldConfig } from "@/components/FormBuilder";

const t = getTranslation();

export const objectiveColumns = (onEdit: (id: string) => void, onDelete: (id: string) => void): TableColumn<Objective>[] => [
    {
        key: "year",
        label: t("year"),
        render: ({ year }) => <span className="font-mono font-semibold">{year}</span>,
        fixed: true,
    },
    {
        key: "month",
        label: t("month"),
        render: ({ month }) => (
            <span className="text-sm">
                {month ? new Date(2000, month - 1).toLocaleString("default", { month: "long" }) : t("annual")}
            </span>
        ),
    },
    {
        key: "scopeType",
        label: t("scope"),
        render: ({ scopeType }) => {
            const variant = scopeType === "NATIONAL" ? "info" : scopeType === "DR" ? "warning" : "success";
            return <Tag variant={variant}>{scopeType}</Tag>;
        },
    },
    {
        key: "drId",
        label: t("dr"),
        render: ({ drId, scopeType }) => (
            <span className="text-sm">
                {scopeType === "DR" || scopeType === "ANTENNE" ? (drId as any)?.name || drId || "-" : "-"}
            </span>
        ),
    },
    {
        key: "antenneId",
        label: t("antenne"),
        render: ({ antenneId, scopeType }) => (
            <span className="text-sm">
                {scopeType === "ANTENNE" ? (antenneId as any)?.label || antenneId || "-" : "-"}
            </span>
        ),
    },
    {
        key: "targetCA",
        label: t("targetCA"),
        align: "right",
        render: ({ targetCA }) => <span className="font-mono font-bold text-success">{formatMoney(targetCA)}</span>,
    },
    {
        key: "targetRecoveryRate",
        label: t("targetRecoveryRate"),
        align: "center",
        render: ({ targetRecoveryRate }) => <span className="font-mono font-bold text-accent">{targetRecoveryRate}%</span>,
    },
    {
        key: "createdAt",
        label: t("createdAt"),
        render: ({ createdAt }) => <span className="text-xs text-slate-500">{formatDate({ date: createdAt })}</span>,
    },
    {
        key: "actions",
        label: t("actions"),
        align: "right",
        render: (objective) => (
            <div className="flex items-center justify-end gap-2">
                <button onClick={() => onEdit(objective._id)} className="p-1.5 rounded-md hover:bg-slate-100 text-accent transition-colors">
                    <Edit size={16} />
                </button>
                <button onClick={() => onDelete(objective._id)} className="p-1.5 rounded-md hover:bg-slate-100 text-danger transition-colors">
                    <Trash2 size={16} />
                </button>
            </div>
        ),
    },
];

export const ObjectiveFormFields = (
    drs: any[] = [],
    antennes: any[] = [],
    formData: Partial<Objective>
): FieldConfig[] => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => ({
        label: String(currentYear + i - 5),
        value: String(currentYear + i - 5),
    }));

    const months = [
        { label: t("january"), value: "1" },
        { label: t("february"), value: "2" },
        { label: t("march"), value: "3" },
        { label: t("april"), value: "4" },
        { label: t("may"), value: "5" },
        { label: t("june"), value: "6" },
        { label: t("july"), value: "7" },
        { label: t("august"), value: "8" },
        { label: t("september"), value: "9" },
        { label: t("october"), value: "10" },
        { label: t("november"), value: "11" },
        { label: t("december"), value: "12" },
    ];

    const scopeOptions = [
        { label: t("national"), value: "NATIONAL" },
        { label: t("dr"), value: "DR" },
        { label: t("antenne"), value: "ANTENNE" },
    ];

    return [
        {
            name: "scopeType",
            label: t("scopeType"),
            type: "select",
            placeholder: t("selectScope"),
            required: true,
            options: scopeOptions,
        },
        {
            name: "year",
            label: t("year"),
            type: "select",
            placeholder: t("selectYear"),
            required: true,
            options: years,
        },
        {
            name: "month",
            label: t("month"),
            type: "select",
            placeholder: t("selectMonth") + " (" + t("optional") + ")",
            required: false,
            options: months,
        },
        ...(formData.scopeType === "DR" || formData.scopeType === "ANTENNE"
            ? [
                  {
                      name: "drId",
                      label: t("dr"),
                      type: "select" as const,
                      placeholder: t("selectDr"),
                      required: true,
                      options: drs.map((dr) => ({ label: dr.name, value: dr._id })),
                  },
              ]
            : []),
        ...(formData.scopeType === "ANTENNE"
            ? [
                  {
                      name: "antenneId",
                      label: t("antenne"),
                      type: "select" as const,
                      placeholder: t("selectAntenne"),
                      required: true,
                      options: antennes
                          .filter((ant) => !formData.drId || ant.drId === formData.drId || ant.drId?._id === formData.drId)
                          .map((ant) => ({ label: ant.label, value: ant._id })),
                  },
              ]
            : []),
        {
            name: "targetCA",
            label: t("targetCA"),
            type: "number",
            placeholder: t("enterTargetCA"),
            required: true,
        },
        {
            name: "targetRecoveryRate",
            label: t("targetRecoveryRate"),
            type: "number",
            placeholder: t("enterTargetRecoveryRate") + " (0-100)",
            required: true,
            min: 0,
            max: 100,
        },
    ];
};

export const objectiveFilterFields = (drs: any[] = [], antennes: any[] = []): FieldConfig[] => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => ({
        label: String(currentYear + i - 5),
        value: String(currentYear + i - 5),
    }));

    const scopeOptions = [
        { label: t("national"), value: "NATIONAL" },
        { label: t("dr"), value: "DR" },
        { label: t("antenne"), value: "ANTENNE" },
    ];

    return [
        {
            name: "year",
            label: t("year"),
            type: "select",
            placeholder: t("filterByYear"),
            options: years,
        },
        {
            name: "scopeType",
            label: t("scope"),
            type: "select",
            placeholder: t("filterByScope"),
            options: scopeOptions,
        },
        {
            name: "drId",
            label: t("dr"),
            type: "select",
            placeholder: t("filterByDr"),
            options: drs.map((dr) => ({ label: dr.name, value: dr._id })),
        },
        {
            name: "antenneId",
            label: t("antenne"),
            type: "select",
            placeholder: t("filterByAntenne"),
            options: antennes.map((ant) => ({ label: ant.label, value: ant._id })),
        },
    ];
};
