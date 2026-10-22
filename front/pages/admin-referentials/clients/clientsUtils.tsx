import { TableColumn } from "@/components/Table";
import { Client } from "./clientsStore";
import { getTranslation } from "@/i18n";
import { Edit, Trash2 } from "lucide-react";
import { FieldConfig } from "@/components/FormBuilder";
import { formatDate } from "@/utils/utils";
import { Wilaya } from "@/types";
import { Tag } from "@/components/Tag";
import { ClientType } from "../clientTypes/clientTypeStore";
import { Dr } from "../drs/useDrStore";
import { Antenne } from "../antennes/antenneStore";

const t = getTranslation();

// Helper function to generate public client code
export const generatePublicClientCode = (clientType: any, wilaya: any, commune?: any): string => {
    if (!clientType || !wilaya) return "";

    const clientTypeCode = clientType.code || clientType.label;
    const wilayaCode = wilaya.code;
    const communeName = commune ? commune.communeLt : "";

    if (communeName) {
        return `${clientTypeCode}-${wilayaCode}-${communeName}`;
    }
    return `${clientTypeCode}-${wilayaCode}`;
};

// Helper function to generate public client name
export const generatePublicClientName = (clientType: any, wilaya: any, commune?: any): string => {
    if (!clientType || !wilaya) return "";

    const clientTypeCode = clientType.code || clientType.label;
    const wilayaName = wilaya.name;
    const communeName = commune ? commune.communeLt : "";

    if (communeName) {
        return `${clientTypeCode} commune de ${communeName}`;
    }
    return `${clientTypeCode} wilaya de ${wilayaName}`;
};

export const clientColumns: (onEdit: (id: string) => void, onDelete: (id: string) => void) => TableColumn<Client>[] = (onEdit, onDelete) => [
    {
        key: "identifier",
        label: t("identifier"),
        render: ({ identifier }) => <span>{identifier}</span>,
    },
    {
        key: "name",
        label: t("name"),
        render: ({ name }) => <span>{name}</span>,
    },
    {
        key: "clientTypeId",
        label: t("clientType"),
        // @ts-ignore
        render: ({ clientTypeId }) => <span>{clientTypeId?.code || t("unassigned")}</span>,
    },
    // {
    //     key: "financial",
    //     label: t("nif"),
    //     render: ({ financial }) => <span>{financial?.nif}</span>,
    // },
    {
        key: "wilayaCodes",
        label: t("wilayas"),
        render: ({ wilayaCodes }) => (
            <div className="flex flex-wrap gap-1">
                {wilayaCodes && wilayaCodes.length > 0 ? (
                    wilayaCodes.map((wilaya: any, index: number) => (
                        <Tag key={index} variant="default" size="sm">
                            {wilaya?.name || wilaya}
                        </Tag>
                    ))
                ) : (
                    <span>{t("unassigned")}</span>
                )}
            </div>
        ),
    },
    {
        key: "drId",
        label: t("drs"),
        render: ({ drId }) => (
            <div className="flex flex-wrap gap-1">
                {drId && drId.length > 0 ? (
                    drId.map((dr: any, index: number) => (
                        <Tag key={index} variant="default" size="sm">
                            {dr?.code || dr}
                        </Tag>
                    ))
                ) : (
                    <span>{t("unassigned")}</span>
                )}
            </div>
        ),
    },
    {
        key: "antenneId",
        label: t("antennes"),
        render: ({ antenneId }) => (
            <div className="flex flex-wrap gap-1">
                {antenneId && antenneId.length > 0 ? (
                    antenneId.map((antenne: any, index: number) => (
                        <Tag key={index} variant="default" className="whitespace-nowrap">
                            {antenne?.code || antenne}
                        </Tag>
                    ))
                ) : (
                    <span>{t("unassigned")}</span>
                )}
            </div>
        ),
    },
    {
        key: "isActive",
        label: t("active"),
        render: ({ isActive }) => <span>{<Tag variant={isActive ? "success" : "danger"}>{isActive ? t("active") : t("inactive")}</Tag>}</span>,
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

export const ClientFormFields = (
    wilayas: Wilaya[] = [],
    communes: any[] = [],
    drs: any[] = [],
    antennes: any[] = [],
    clientTypes: any[] = [],
    formData: any = {}
): FieldConfig[] => {
    const isPublic = formData.isPublic || false;

    // Auto-generate code and name for public clients
    // let autoGeneratedCode = "";
    // let autoGeneratedName = "";

    return [
        // Client Type Selection
        {
            type: "section",
            title: t("clientInformation"),
        },
        {
            type: "select",
            name: "clientTypeId",
            label: t("clientType"),
            placeholder: "DREW",
            required: true,
            options: clientTypes?.map((ct) => ({ label: ct.label, value: ct._id })) || [],
        },
        {
            type: "checkbox",
            name: "isPublic",
            label: t("isPublic"),
        },
        {
            type: "text",
            name: "identifier",
            label: t("identifier"),
            placeholder: "CLI-001",
            // value: isPublic ? autoGeneratedCode : undefined,
            disabled: isPublic,
            required: true,
        },
        {
            type: "text",
            name: "name",
            label: t("name"),
            placeholder: "Algerienne Des Eaux",
            // value: isPublic ? autoGeneratedName : undefined,
            disabled: isPublic,
            required: true,
        },

        // Referenced wilayas (multi-select)
        {
            type: "select",
            name: "wilayaCodes",
            label: t("wilayas"),
            placeholder: t("selectWilaya"),
            // required: true,
            isMulti: true,
            options: wilayas?.map((w) => ({ label: w.name, value: w.code })) || [],
        },
        {
            type: "select",
            name: "communeCodes",
            label: t("communes"),
            placeholder: t("selectCommune"),
            // required: true,
            isMulti: true,
            options: communes?.map((c) => ({ label: c.communeLt, value: c._id })) || [],
        },

        // DR and Antenne selection (multi-select)
        {
            type: "select",
            name: "drId",
            label: t("dr"),
            placeholder: "DR Center",
            isMulti: true,
            options: drs?.map((dr) => ({ label: dr.name, value: dr._id })) || [],
        },
        {
            type: "select",
            name: "antenneId",
            label: t("antenne"),
            placeholder: "Antenne Alger",
            isMulti: true,
            options: antennes?.map((ant) => ({ label: ant.label, value: ant._id })) || [],
        },

        // Financial information
        {
            type: "section",
            title: t("financial"),
        },
        {
            type: "group",
            fields: [
                {
                    type: "text",
                    name: "nif",
                    path: "financial.nif",
                    label: "NIF",
                    placeholder: "00-0000000-000",
                },
                {
                    type: "text",
                    name: "nis",
                    path: "financial.nis",
                    label: "NIS",
                    placeholder: "00-0000000-000",
                },
                {
                    type: "text",
                    name: "rc",
                    path: "financial.rc",
                    label: t("rc"),
                    placeholder: "00-B-0000000-000",
                },
            ],
        },

        // Address (singular now)
        {
            type: "section",
            title: t("address"),
        },
        {
            type: "text",
            name: "label",
            path: "addresses.label",
            label: t("addressLabel"),
            // format adresse algerienne
            placeholder: "Direction Générale",
        },
        {
            type: "text",
            name: "address",
            path: "addresses.address",
            label: t("address"),
            placeholder: "10 Rue des Frères Azzedine, Alger",
        },
        {
            type: "select",
            name: "wilayaCode",
            path: "addresses.wilayaCode",
            label: t("wilaya"),
            placeholder: "Alger",
            options: wilayas?.map((w) => ({ label: w.name, value: w.code })) || [],
        },
        {
            type: "select",
            name: "communeCode",
            path: "addresses.communeCode",
            label: t("commune"),
            placeholder: "Reghaia",
            disabled: !formData.addresses?.wilayaCode,
            options:
                communes?.filter((c) => c.wilayaCode.code === formData.addresses?.wilayaCode).map((c) => ({ label: c.communeLt, value: c._id })) ||
                [],
        },

        // Contact (singular now)
        {
            type: "section",
            title: t("contact"),
        },
        {
            type: "text",
            name: "contactName",
            path: "contacts.name",
            label: t("contactName"),
            placeholder: t("contactNamePlaceholder"),
        },
        {
            type: "tel",
            name: "phone",
            path: "contacts.phone",
            label: t("phone"),
            placeholder: t("phonePlaceholder"),
        },
        {
            type: "email",
            name: "email",
            path: "contacts.email",
            label: t("email"),
            placeholder: t("emailPlaceholder"),
        },
        {
            type: "text",
            name: "contactRole",
            path: "contacts.role",
            label: t("contactRole"),
            placeholder: t("contactRolePlaceholder"),
        },

        // Active flag
        {
            type: "checkbox",
            name: "isActive",
            label: t("active"),
        },
    ];
};

export const clientFilterFields = ({
    clientType,
    drId,
    antenneId,
}: {
    clientType?: ClientType[];
    drId?: Dr[];
    antenneId?: Antenne[];
}): FieldConfig[] => {
    return [
        {
            type: "group",
            length: 2,
            fields: [
                {
                    type: "select",
                    name: "isActive",
                    label: t("activeStatus"),
                    placeholder: t("selectStatus"),
                    options: [
                        { label: t("active"), value: "true" },
                        { label: t("inactive"), value: "false" },
                    ],
                },
                {
                    type: "select",
                    name: "clientTypeId",
                    label: t("clientType"),
                    placeholder: t("selectClientType"),
                    options: clientType?.map((ct) => ({ label: ct.label, value: ct._id })) || [],
                },
                {
                    type: "select",
                    name: "drId",
                    label: t("dr"),
                    placeholder: t("selectDr"),
                    options: drId?.map((dr) => ({ label: dr.name, value: dr._id })) || [],
                },
                {
                    type: "select",
                    name: "antenneId",
                    label: t("antenne"),
                    placeholder: t("selectAntenne"),
                    options: antenneId?.map((ant) => ({ label: ant.label, value: ant._id })) || [],
                },
            ],
        },
    ];
};
