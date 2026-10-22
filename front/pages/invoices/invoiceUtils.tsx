import { TableColumn } from "@/components/Table";
import { BillingTypeEnum, Invoice, Project } from "@/types";
import { getTranslation } from "@/i18n";
import { formatDate, formatMoney, arrayToMap } from "@/utils/utils";
import { Badge } from "@/components/Badge";
import { FieldConfig } from "@/components/FormBuilder";
import { Tag } from "@/components/Tag";
import { Edit, Trash2 } from "lucide-react";
import { FilterFormatter } from "@/components/FiltersDisplay";
import { Dr } from "../admin-referentials/drs/useDrStore";
import { Antenne } from "../admin-referentials/antennes/antenneStore";

const t = getTranslation();

export const invoiceColumns = (onEdit: (id: string) => void, onDelete: (id: string) => void): TableColumn<Invoice>[] => [
    {
        key: "invoiceNumber",
        label: t("invoiceNumber"),
        render: ({ invoiceNumber }) => <span className="font-mono">{invoiceNumber}</span>,
        fixed: true,
    },
    {
        key: "dr",
        label: t("dr"),
        render: ({ drId }) => (
            <span className="font-medium text-slate-900">
                <Tag variant="default" className="whitespace-nowrap">
                    {
                        // @ts-ignore
                        drId?.name
                    }
                </Tag>
            </span>
        ),
    },
    {
        key: "antenneId",
        label: t("antenne"),
        render: ({ antenneId }) => (
            <span className="font-medium text-slate-900">
                <Tag variant="default" className="whitespace-nowrap">
                    {
                        // @ts-ignore
                        antenneId?.label
                    }
                </Tag>
            </span>
        ),
    },
    {
        key: "amountHT",
        label: t("amountHT"),
        align: "right",
        render: ({ amountHT }) => <span className="font-mono">{formatMoney(amountHT)}</span>,
    },
    {
        key: "amountTTC",
        label: t("amountTTC"),
        align: "right",
        render: ({ amountTTC }) => <span className="font-mono font-bold">{formatMoney(amountTTC)}</span>,
    },
    {
        key: "isRecovered",
        label: t("recovered"),
        align: "center",
        render: ({ isRecovered, recoveryDate }) => (
            <div className="flex flex-col items-center gap-1">
                <Tag variant={isRecovered ? "success" : "danger"}>{isRecovered ? t("yes") : t("no")}</Tag>
                {isRecovered && recoveryDate && <span className="text-xs text-slate-500">{formatDate({ date: recoveryDate })}</span>}
            </div>
        ),
    },
    {
        key: "invoiceDate",
        label: t("date"),
        render: ({ invoiceDate }) => formatDate({ date: invoiceDate }),
    },
    {
        key: "actions",
        label: t("actions"),
        align: "right",
        fixedRight: true,
        render: ({ _id }) => (
            <div className="flex items-center justify-end gap-3">
                <button onClick={() => onEdit(_id)} className="text-accent hover:text-accent/80">
                    <Edit size={18} />
                </button>
                <button onClick={() => onDelete(_id)} className="text-red-500 hover:text-red-600">
                    <Trash2 size={18} />
                </button>
            </div>
        ),
    },
];

export const invoiceInProjectColumns = (): TableColumn<Invoice>[] => [
    {
        key: "invoiceNumber",
        label: t("invoiceNumber"),
        render: ({ invoiceNumber }) => <span className="font-mono">{invoiceNumber}</span>,
        fixed: true,
    },
    {
        key: "amountHT",
        label: t("amountHT"),
        align: "right",
        render: ({ amountHT }) => <span className="font-mono">{formatMoney(amountHT)}</span>,
    },
    {
        key: "amountTTC",
        label: t("amountTTC"),
        align: "right",
        render: ({ amountTTC }) => <span className="font-mono font-bold">{formatMoney(amountTTC)}</span>,
    },
    {
        key: "isRecovered",
        label: t("recovered"),
        align: "center",
        fixedRight: true,

        render: ({ isRecovered, recoveryDate }) => (
            <div className="flex flex-col items-center gap-1">
                <Tag variant={isRecovered ? "success" : "danger"}>{isRecovered ? t("yes") : t("no")}</Tag>
                {isRecovered && recoveryDate && <span className="text-xs text-slate-500">{formatDate({ date: recoveryDate })}</span>}
            </div>
        ),
    },
    {
        key: "invoiceDate",
        label: t("date"),
        render: ({ invoiceDate }) => formatDate({ date: invoiceDate }),
    },
];

export const InvoiceFormFields = (projects: Partial<Project>[] = [], disableProjectSelect = false, noName = false): FieldConfig[] => [
    !noName && {
        type: "text",
        name: "invoiceNumber",
        label: t("invoiceNumber"),
        placeholder: "FACT-001",
        required: true,
    },
    {
        type: "group",
        fields: [
            {
                type: "select",
                name: "projectId",
                label: t("projects"),
                options: projects.map((p) => ({ label: p.title, value: p._id })),
                required: true,
                disabled: disableProjectSelect,
            },
            {
                type: "select",
                name: "invoiceType",
                label: t("invoiceType") || "Billing Type",
                required: true,
                disabled: true,
                options: [
                    { label: "FACTURE", value: BillingTypeEnum.FACTURE },
                    { label: "SITUATION", value: BillingTypeEnum.SITUATION },
                ],
            },
        ],
    },
    {
        type: "date",
        name: "invoiceDate",
        label: t("date"),
        required: true,
    },
    {
        type: "number",
        name: "amountHT",
        label: t("amountHT"),
        suffix: "DA",
        required: true,
    },
    {
        type: "group",
        fields: [
            {
                type: "text",
                name: "vatAmount",
                label: t("vatAmount"),
                suffix: "DA",
                formatDisplay: formatMoney,
                disabled: true,
            },
            {
                type: "text",
                name: "amountTTC",
                label: t("amountTTC"),
                suffix: "DA",
                formatDisplay: formatMoney,
                disabled: true,
                required: true,
            },
        ],
    },
    {
        type: "checkbox",
        name: "isRecovered",
        label: t("recovered"),
    },
    {
        type: "date",
        name: "recoveryDate",
        label: t("recoveryDate") || "Recovery Date",
        disabled: true,
    },
    {
        type: "number",
        name: "physicalProgress",
        label: t("progress"),
        suffix: "%",
    },
];
export const projectInvoiceFields = (projects: Partial<Project>[] = [], disableProjectSelect = false, noName = false): FieldConfig[] => [
    !noName && {
        type: "text",
        name: "invoiceNumber",
        label: t("invoiceNumber"),
        placeholder: "FACT-001",
        required: true,
    },
    {
        type: "group",
        fields: [
            {
                type: "select",
                name: "projectId",
                label: t("projects"),
                options: projects.map((p) => ({ label: p.title, value: p._id })),
                required: true,
                disabled: disableProjectSelect,
            },
            {
                type: "select",
                name: "invoiceType",
                label: t("invoiceType") || "Billing Type",
                required: true,
                disabled: true,
                options: [
                    { label: "FACTURE", value: BillingTypeEnum.FACTURE },
                    { label: "SITUATION", value: BillingTypeEnum.SITUATION },
                ],
            },
        ],
    },
    {
        type: "date",
        name: "invoiceDate",
        label: t("date"),
        required: true,
    },
    {
        type: "number",
        name: "physicalProgress",
        label: t("progress"),
        suffix: "%",
    },
    {
        type: "number",
        name: "amountHT",
        label: t("amountHT"),
        suffix: "DA",
        required: true,
        disabled: true,
    },
    {
        type: "group",
        fields: [
            {
                type: "text",
                name: "vatAmount",
                label: t("vatAmount"),
                suffix: "DA",
                formatDisplay: formatMoney,
                disabled: true,
            },
            {
                type: "text",
                name: "amountTTC",
                label: t("amountTTC"),
                suffix: "DA",
                formatDisplay: formatMoney,
                disabled: true,
                required: true,
            },
        ],
    },
    {
        type: "checkbox",
        name: "isRecovered",
        label: t("recovered"),
    },
    {
        type: "date",
        name: "recoveryDate",
        label: t("recoveryDate") || "Recovery Date",
        disabled: true,
    },
];

export const invoiceFilterFields = ({
    projects = [],
    antennes = [],
    drs = [],
}: {
    projects?: Partial<Project>[];
    antennes?: Antenne[];
    drs?: Dr[];
}): FieldConfig[] => {
    return [
        {
            type: "group",
            length: 2,
            className: "flex-wrap",
            fields: [
                {
                    type: "select",
                    name: "projectId",
                    label: t("projects"),
                    placeholder: t("selectProject"),
                    options: projects?.map((p) => ({ label: p.title, value: p._id })) || [],
                },
                {
                    type: "select",
                    name: "antenneId",
                    label: t("antenne"),
                    placeholder: t("selectAntenne"),
                    options: antennes?.map((a) => ({ label: a.label, value: a._id })) || [],
                },
                {
                    type: "select",
                    name: "drId",
                    label: t("dr"),
                    placeholder: t("selectDr"),
                    options: drs?.map((d) => ({ label: d.name, value: d._id })) || [],
                },
                {
                    type: "select",
                    name: "invoiceType",
                    label: t("invoiceType") || "Billing Type",
                    options: [
                        { label: "FACTURE", value: BillingTypeEnum.FACTURE },
                        { label: "SITUATION", value: BillingTypeEnum.SITUATION },
                    ],
                },
                {
                    type: "select",
                    name: "isRecovered",
                    label: t("recovered") || "Recovered",
                    options: [
                        { label: t("recouvert"), value: "true" },
                        { label: t("nonRecouvert"), value: "false" },
                    ],
                },
            ],
        },
    ];
};

export const invoiceFilterFormatters = ({
    projects = [],
    antennes = [],
    drs = [],
}: {
    projects?: Partial<Project>[];
    antennes?: Antenne[];
    drs?: Dr[];
}): FilterFormatter[] => {
    return [
        {
            key: "projectId",
            format: (value: string) => {
                const project = projects?.find((p) => p._id === value);
                return project?.title || value;
            },
        },
        {
            key: "antenneId",
            format: (value: string) =>
                arrayToMap({ arr: antennes || [], keyGetter: (item) => item._id, valueGetter: (item) => item.label }).get(value) || value,
        },
        {
            key: "drId",
            format: (value: string) =>
                arrayToMap({ arr: drs || [], keyGetter: (item) => item._id, valueGetter: (item) => item.name }).get(value) || value,
        },
        {
            key: "invoiceType",
            format: (value: string) => value.toUpperCase(),
        },
        {
            key: "isRecovered",
            format: (value: string) => (value === "true" ? t("recouvert") : t("nonRecouvert")),
        },
    ];
};
