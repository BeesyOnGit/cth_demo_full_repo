import { TableColumn } from "@/components/Table";
import { Role } from "./useRoleStore";
import { getTranslation } from "@/i18n";
import { Edit, Trash2 } from "lucide-react";
import { FieldConfig } from "@/components/FormBuilder";
import { formatDate } from "@/utils/utils";

const t = getTranslation();

export const roleColumns: (onEdit: (id: string) => void, onDelete: (id: string) => void) => TableColumn<Role>[] = (onEdit, onDelete) => [
    {
        key: "code",
        label: t("code"),
        render: ({ code }) => <span>{code}</span>,
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
        label: "Actions",
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

export const RoleFormFields = (): FieldConfig[] => [
    {
        type: "text",
        name: "code",
        label: t("code"),
        placeholder: "NEW_ROLE",
        required: true,
    },
    {
        type: "text",
        name: "label",
        label: t("label"),
        placeholder: "Role Label",
        required: true,
    },
];
