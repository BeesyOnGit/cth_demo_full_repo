import { TableColumn } from "@/components/Table";
import { Wilaya } from "@/types";
import { getTranslation } from "@/i18n";
import { Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/Input";
import { FieldConfig } from "@/components/FormBuilder";
import { formatDate } from "@/utils/utils";

const t = getTranslation();

export const wilayaColumns: (onEdit: (id: string) => void, onDelete: (id: string) => void) => TableColumn<Wilaya>[] = (onEdit, onDelete) => [
    {
        key: "code",
        label: t("code"),
        render: ({ code }) => {
            return <span>{code}</span>;
        },
    },
    {
        key: "name",
        label: t("name"),
        render: ({ name }) => {
            return <span>{name}</span>;
        },
    },
    {
        key: "createdAt",
        label: t("createdAt"),
        render: ({ createdAt }) => {
            return <span>{formatDate({ date: createdAt })}</span>;
        },
    },
    {
        key: "actions",
        label: "Actions",
        align: "right" as const,
        render: ({ _id, code }) => (
            <div className="flex items-center justify-end gap-3">
                <button onClick={() => onEdit(_id)} className="text-accent hover:text-accent/80">
                    <Edit size={18} />
                </button>
                <button onClick={() => onDelete(code)} className="text-danger hover:text-danger/80">
                    <Trash2 size={18} />
                </button>
            </div>
        ),
    },
];

export const WilayaFormFields = (): FieldConfig[] => [
    {
        type: "text",
        name: "code",
        label: t("code"),
        placeholder: "16",
        required: true,
    },
    {
        type: "text",
        name: "name",
        label: t("name"),
        placeholder: "Alger",
        required: true,
    },
];
