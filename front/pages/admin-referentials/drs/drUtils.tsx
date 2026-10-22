import { TableColumn } from "@/components/Table";
import { Dr } from "./useDrStore";
import { getTranslation } from "@/i18n";
import { Edit, Trash2 } from "lucide-react";
import { FieldConfig } from "@/components/FormBuilder";
import { formatDate } from "@/utils/utils";

const t = getTranslation();

export const drColumns: (onEdit: (id: string) => void, onDelete: (id: string) => void) => TableColumn<Dr>[] = (onEdit, onDelete) => [
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
        key: "bankName",
        label: t("bank"),
        render: ({ bankName }) => {
            return <span>{bankName || "-"}</span>;
        },
    },
    {
        key: "accountNumber",
        label: t("accountNumber"),
        render: ({ accountNumber }) => {
            return <span className="font-mono">{accountNumber || "-"}</span>;
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

export const DrFormFields = (): FieldConfig[] => [
    {
        type: "text",
        name: "code",
        label: t("code"),
        placeholder: "DR1",
        required: true,
    },
    {
        type: "text",
        name: "name",
        label: t("name"),
        placeholder: "Direction Régionale",
        required: true,
    },
    {
        type: "section",
        title: t("bankAccountInfo"),
    },
    {
        type: "text",
        name: "bankName",
        label: t("bankName"),
        placeholder: "CPA Agence Blida - 456",
        required: true,
    },
    {
        type: "text",
        name: "accountNumber",
        label: t("accountNumber"),
        placeholder: "0000 0000 0000 0000",
        required: true,
    },
];
