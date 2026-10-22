import { TableColumn } from "@/components/Table";
import { ServiceType } from "./serviceTypeStore";
import { getTranslation } from "@/i18n";
import { Edit, Trash2 } from "lucide-react";
import { FieldConfig } from "@/components/FormBuilder";
import { formatDate } from "@/utils/utils";
import { ServiceTypeCode } from "@/types";

const t = getTranslation();

export const serviceTypeColumns: (onEdit: (id: string) => void, onDelete: (id: string) => void) => TableColumn<ServiceType>[] = (
    onEdit,
    onDelete
) => [
    {
        key: "code",
        label: t("code"),
        render: ({ code }) => <span className="font-mono">{code}</span>,
    },
    {
        key: "label",
        label: t("label"),
        render: ({ label }) => <span>{label}</span>,
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

export const ServiceTypeFormFields = (): FieldConfig[] => [
    {
        type: "text",
        name: "code",
        label: t("code"),
        // options: Object.values(ServiceTypeCode).map((code) => ({ label: code, value: code })),
        required: true,
    },
    {
        type: "text",
        name: "label",
        label: t("label"),
        placeholder: "Service Type Label",
        required: true,
    },
];
