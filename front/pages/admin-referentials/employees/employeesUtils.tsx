import { TableColumn } from "@/components/Table";
import { Employee } from "./employeesStore";
import { getTranslation } from "@/i18n";
import { Edit, Trash2 } from "lucide-react";
import { FieldConfig } from "@/components/FormBuilder";
import { formatDate } from "@/utils/utils";
import { Dr } from "../drs/useDrStore";
import { Wilaya } from "@/types";
import { Role } from "../roles/useRoleStore";
import { Antenne } from "../antennes/antenneStore";

const t = getTranslation();

export const employeesColumns: (onEdit: (id: string) => void, onDelete: (id: string) => void) => TableColumn<Employee>[] = (onEdit, onDelete) => [
    {
        key: "fullName",
        label: t("name"),
        render: ({ fullName }) => {
            return <span>{fullName}</span>;
        },
    },
    {
        key: "email",
        label: t("email"),
        render: ({ email }) => {
            return <span>{email}</span>;
        },
    },
    {
        key: "roleId",
        label: t("role"),
        render: ({ roleId }) => {
            return <span>{!roleId ? "-" : typeof roleId === "string" ? roleId : roleId.label}</span>;
        },
    },
    {
        key: "drId",
        label: t("dr"),
        render: ({ drId }) => {
            return <span>{!drId ? "-" : typeof drId === "string" ? drId : drId.name}</span>;
        },
    },
    {
        key: "antenneId",
        label: t("antenne"),
        render: ({ antenneId }) => {
            return <span>{!antenneId ? "-" : typeof antenneId === "string" ? antenneId : antenneId.label}</span>;
        },
    },
    {
        key: "wilayaCode",
        label: t("wilaya"),
        render: ({ wilayaCode }) => {
            return <span>{typeof wilayaCode === "string" ? wilayaCode : wilayaCode?.name || t("unassigned")}</span>;
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

export const EmployeeFormFields = (roles: Role[] = [], drs: Dr[] = [], wilayas: Wilaya[] = [], antennes: any[] = []): FieldConfig[] => [
    {
        type: "text",
        name: "fullName",
        label: t("name"),
        placeholder: "John Doe",
        required: true,
    },
    {
        type: "text",
        name: "email",
        label: t("email"),
        placeholder: "john@example.com",
        required: true,
    },
    {
        type: "password",
        name: "passwordHash",
        label: "Password",
        placeholder: "••••••••",
        required: false,
    },
    {
        type: "select",
        name: "roleId",
        label: t("role"),
        placeholder: "Select Role",
        required: true,
        options: roles?.map((r) => ({ label: r.label, value: r._id })) || [],
    },
    {
        type: "select",
        name: "drId",
        label: t("dr"),
        placeholder: "Select DR",
        required: false,
        options: drs?.map((d) => ({ label: d.name, value: d._id })) || [],
    },
    {
        type: "select",
        name: "antenneId",
        label: t("antenne"),
        placeholder: "Select Antenne",
        required: false,
        options: antennes?.map((a) => ({ label: a.label, value: a._id })) || [],
    },
    {
        type: "select",
        name: "wilayaCode",
        label: t("wilaya"),
        placeholder: "Select Wilaya",
        required: false,
        options: wilayas?.map((w) => ({ label: w.name, value: w.code })) || [],
    },
    {
        type: "checkbox",
        name: "isAdmin",
        label: "Is Admin",
    },
];

export const employeeFilterFields = ({
    roles,
    drs,
    antennes,
    wilayas: wilayaList,
}: {
    roles?: Role[];
    drs?: Dr[];
    antennes?: Antenne[];
    wilayas?: Wilaya[];
}): FieldConfig[] => {
    return [
        {
            type: "group",
            length: 2,
            fields: [
                {
                    type: "select",
                    name: "roleId",
                    label: t("role"),
                    placeholder: t("selectRole"),
                    options: roles?.map((r) => ({ label: r?.label, value: r._id })) || [],
                },
                {
                    type: "select",
                    name: "drId",
                    label: t("dr"),
                    placeholder: t("selectDr"),
                    options: drs?.map((dr) => ({ label: dr.name, value: dr._id })) || [],
                },
                {
                    type: "select",
                    name: "antenneId",
                    label: t("antenne"),
                    placeholder: t("selectAntenne"),
                    options: antennes?.map((ant) => ({ label: ant?.label || "", value: ant?._id || "" })) || [],
                },
                {
                    type: "select",
                    name: "wilayaCode",
                    label: t("wilaya"),
                    placeholder: t("selectWilaya"),
                    options: wilayaList?.map((w) => ({ label: w.name, value: w.code })) || [],
                },
            ],
        },
    ];
};
