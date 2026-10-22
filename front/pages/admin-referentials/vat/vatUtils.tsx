import { TableColumn } from "@/components/Table";
import { VatRate } from "./vatStore";
import { getTranslation } from "@/i18n";
import { Edit, Trash2 } from "lucide-react";
import { FieldConfig } from "@/components/FormBuilder";
import { formatDate } from "@/utils/utils";

const t = getTranslation();

export const vatColumns: (onEdit: (id: string) => void, onDelete: (id: string) => void) => TableColumn<VatRate>[] = (onEdit, onDelete) => [
    {
        key: "label",
        label: t("label"),
        render: ({ label }) => <span>{label}</span>,
    },
    {
        key: "rate",
        label: t("rate"),
        render: ({ rate }) => <span>{rate}%</span>,
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

export const VatFormFields = (): FieldConfig[] => [
    {
        type: "text",
        name: "label",
        label: t("label"),
        placeholder: "Standard VAT",
        required: true,
    },
    {
        type: "number",
        name: "rate",
        label: t("rate"),
        placeholder: "19",
        required: true,
    },
];
