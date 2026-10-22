import { TableColumn } from "@/components/Table";
import { Antenne } from "./antenneStore";
import { getTranslation } from "@/i18n";
import { Edit, Trash2 } from "lucide-react";
import { FieldConfig } from "@/components/FormBuilder";
import { formatDate } from "@/utils/utils";
import { Dr } from "../drs/useDrStore";
import { Wilaya } from "@/types";
import { Tag } from "@/components/Tag";

const t = getTranslation();

export const antenneColumns: (onEdit: (id: string) => void, onDelete: (id: string) => void) => TableColumn<Antenne>[] = (onEdit, onDelete) => [
    {
        key: "code",
        label: t("code"),
        render: ({ code }) => {
            return <span>{code}</span>;
        },
    },
    {
        key: "label",
        label: t("name"),
        render: ({ label }) => {
            return <span>{label}</span>;
        },
    },
    {
        key: "drId",
        label: t("dr"),
        render: ({ drId }) => {
            return <span>{typeof drId === "string" ? drId : drId.name}</span>;
        },
    },
    {
        key: "wilayaCode",
        label: t("wilaya"),
        render: ({ wilayaCode }) => {
            if (Array.isArray(wilayaCode)) {
                return (
                    <span className="flex gap-1">
                        {wilayaCode.map((w) => (
                            <Tag variant="default">{typeof w === "string" ? w : w.name}</Tag>
                        ))}
                    </span>
                );
            }
            return (
                <span>
                    <Tag>{typeof wilayaCode === "string" ? wilayaCode : wilayaCode.name}</Tag>
                </span>
            );
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

export const AntenneFormFields = (drListe?: Dr[], wilaya?: Wilaya[]): FieldConfig[] => [
    {
        type: "text",
        name: "code",
        label: t("code"),
        placeholder: "16",
        required: true,
    },
    {
        type: "text",
        name: "label",
        label: t("name"),
        placeholder: "Alger",
        required: true,
    },
    {
        type: "select",
        name: "drId",
        label: t("dr"),
        placeholder: "dr1",
        required: true,
        options: drListe?.map((dr) => ({ label: dr.name, value: dr._id })) || [],
    },
    {
        type: "select",
        name: "wilayaCode",
        label: t("wilaya"),
        isMulti: true,
        placeholder: "Select Wilaya(s)",
        required: true,
        options: wilaya?.map((w) => ({ label: w.name, value: w.code })) || [],
    },
];

export const antenneFilterFields = ({ drs }: { drs?: Dr[] }): FieldConfig[] => {
    return [
        {
            type: "select",
            name: "drId",
            label: t("dr"),
            placeholder: "dr1",
            required: false,
            options: drs?.map((dr) => ({ label: dr.name, value: dr._id })) || [],
        },
    ];
};
