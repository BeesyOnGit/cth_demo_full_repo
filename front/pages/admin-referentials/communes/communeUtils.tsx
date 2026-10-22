import { TableColumn } from "@/components/Table";
import { Commune } from "./communeStore";
import { getTranslation } from "@/i18n";
import { Edit, Trash2 } from "lucide-react";
import { FieldConfig } from "@/components/FormBuilder";
import { formatDate } from "@/utils/utils";
import { Wilaya } from "../../../types";

const t = getTranslation();

export const communeColumns: (onEdit: (id: string) => void, onDelete: (id: string) => void) => TableColumn<Commune>[] = (onEdit, onDelete) => [
    {
        key: "communeLt",
        label: t("commune") + " (Latin)",
        render: ({ communeLt }) => <span>{communeLt}</span>,
    },
    {
        key: "communeAr",
        label: t("commune") + " (Arabic)",
        render: ({ communeAr }) => <span className="text-right">{communeAr}</span>,
    },
    {
        key: "dairaLt",
        label: t("daira") + " (Latin)",
        render: ({ dairaLt }) => <span>{dairaLt}</span>,
    },
    {
        key: "dairaAr",
        label: t("daira") + " (Arabic)",
        render: ({ dairaAr }) => <span className="text-right">{dairaAr}</span>,
    },
    {
        key: "wilayaCode",
        label: t("wilaya"),
        // @ts-ignore
        render: ({ wilayaCode }) => <span className="font-mono">{wilayaCode.name}</span>,
    },
    {
        key: "createdAt",
        label: t("createdAt"),
        render: ({ createdAt }) => <span>{formatDate({ date: createdAt })}</span>,
    },
    {
        key: "actions",
        label: t("actions"),
        align: "right" as const,
        render: ({ _id }) => (
            <div className="flex items-center justify-end gap-3">
                <button onClick={() => onEdit(_id)} className="text-accent hover:text-accent/80">
                    <Edit size={18} />
                </button>
                <button onClick={() => onDelete(_id)} className="text-danger hover:text-danger/80">
                    <Trash2 size={18} />
                </button>
            </div>
        ),
    },
];

export const CommuneFormFields = (wilayas: Wilaya[] = []): FieldConfig[] => [
    {
        type: "group",
        fields: [
            {
                type: "text",
                name: "communeLt",
                label: t("commune") + " (Latin)",
                placeholder: "Algiers",
                required: true,
            },
            {
                type: "text",
                name: "communeAr",
                label: t("commune") + " (Arabic)",
                placeholder: "الجزائر",
                required: true,
            },
        ],
    },
    {
        type: "group",
        fields: [
            {
                type: "text",
                name: "dairaLt",
                label: t("daira") + " (Latin)",
                placeholder: "Algiers",
                required: true,
            },
            {
                type: "text",
                name: "dairaAr",
                label: t("daira") + " (Arabic)",
                placeholder: "الجزائر",
                required: true,
            },
        ],
    },
    {
        type: "select",
        name: "wilayaCode",
        label: t("wilaya"),
        options: wilayas?.map((w) => ({ label: `${w.code} - ${w.name}`, value: w.code })) || [],
        required: true,
    },
];
