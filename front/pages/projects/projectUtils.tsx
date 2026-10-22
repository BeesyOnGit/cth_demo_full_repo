import { TableColumn } from "@/components/Table";
import { Project, User, BillingTypeEnum, ContractMode } from "@/types";
import { getTranslation } from "@/i18n";
import { Edit, Trash2 } from "lucide-react";
import { FieldConfig } from "@/components/FormBuilder";
import { formatDate, formatMoney, arrayToMap } from "@/utils/utils";
import { Tag } from "@/components/Tag";
import { Antenne } from "../admin-referentials/antennes/antenneStore";
import { Client } from "../admin-referentials/clients/clientsStore";
import { Employee } from "../admin-referentials/employees/employeesStore";
import { VatRate } from "../admin-referentials/vat/vatStore";
import { ServiceType } from "../admin-referentials/serviceTypes/serviceTypeStore";
import { OuvrageType } from "../admin-referentials/ouvrageTypes/ouvrageTypeStore";
import { Dr } from "../admin-referentials/drs/useDrStore";
import { FilterFormatter } from "@/components/FiltersDisplay";

const t = getTranslation();

export const projectColumns: (onEdit: (id: string) => void, onDelete: (id: string) => void) => TableColumn<Project>[] = (onEdit, onDelete) => [
    {
        key: "projectNumber",
        label: t("number"),
        render: ({ projectNumber }) => <span className="font-mono whitespace-nowrap">{projectNumber}</span>,
        fixed: true,
    },
    {
        key: "title",
        label: t("projectTitle"),
        render: ({ title }) => <span className="font-medium text-slate-900">{title}</span>,
    },
    {
        key: "dr",
        label: t("dr"),
        render: ({ drId }) => (
            <span className="font-medium text-slate-900">
                {
                    <Tag variant="default" className="whitespace-nowrap">
                        {
                            // @ts-ignore
                            drId?.name
                        }
                    </Tag>
                }
            </span>
        ),
    },
    {
        key: "antenneId",
        label: t("antenne"),
        render: ({ antenneId }) => (
            <span className="font-medium text-slate-900">
                {
                    <Tag variant="default" className="whitespace-nowrap">
                        {
                            // @ts-ignore
                            antenneId?.label
                        }
                    </Tag>
                }
            </span>
        ),
    },
    {
        key: "contractMode",
        label: t("status"),
        render: ({ contractMode, isConvertedToOds }) => <Tag variant={contractMode === "ODS" ? "success" : "warning"}>{contractMode}</Tag>,
    },
    {
        key: "serviceRate",
        label: t("serviceRate"),
        align: "right" as const,
        render: ({ serviceRate }) => <span className="font-mono whitespace-nowrap">{serviceRate}%</span>,
    },
    {
        key: "serviceTypeId",
        label: t("serviceType"),
        render: ({ serviceTypeId }) => (
            // @ts-ignore
            <span className="whitespace-nowrap">{serviceTypeId?.label || "-"}</span>
        ),
    },
    {
        key: "billingMode",
        label: t("billingMode"),
        render: ({ billingMode }) => <span className="text-xs">{billingMode === "AVANCEMENT_TRAVAUX" ? t("workProgress") : t("clientBilling")}</span>,
    },
    {
        key: "vatRates",
        label: t("vat"),
        render: ({ vatRates }) => (
            <span className="text-xs">{vatRates && vatRates.length > 0 ? vatRates.map((v) => v.rateSnapshot).join(", ") + "%" : "0%"}</span>
        ),
    },
    {
        key: "amountHTSnapshot",
        label: t("amountHT"),
        align: "right" as const,
        render: ({ amountHTSnapshot }) => <span className="font-mono whitespace-nowrap text-xs">{formatMoney(amountHTSnapshot)} DA</span>,
    },
    {
        key: "amountTTC",
        label: t("amountTTC"),
        align: "right" as const,
        render: ({ amountHTSnapshot, vatRates }) => {
            const totalVat = vatRates && vatRates.length > 0 ? vatRates.reduce((acc, v) => acc + v.rateSnapshot, 0) : 0;
            const amountTTC = amountHTSnapshot * (1 + totalVat / 100);
            return <span className="font-mono whitespace-nowrap text-xs">{formatMoney(amountTTC)} DA</span>;
        },
    },
    {
        key: "drId",
        label: t("dr"),
        render: ({ drId }) => (
            // @ts-ignore
            <span className="whitespace-nowrap"> {drId?.code} </span>
        ),
    },
    {
        key: "antenneId",
        label: t("antenne"),
        render: ({ antenneId }) => (
            // @ts-ignore
            <span className="whitespace-nowrap"> {antenneId?.code} </span>
        ),
    },
    {
        key: "clientId",
        label: t("client"),
        render: ({ clientId }) => (
            // @ts-ignore
            <span> {clientId?.identifier} </span>
        ),
    },
    {
        key: "projectManagerIds",
        label: t("projectInCharge"),
        render: ({ projectManagerIds }) => (
            // @ts-ignore
            <span className="flex gap-2">
                {projectManagerIds?.map((man) => {
                    return (
                        <Tag variant="default" className="whitespace-nowrap">
                            {/* @ts-ignore */}
                            {man.fullName}
                        </Tag>
                    );
                })}
            </span>
        ),
    },
    {
        key: "physicalProgress",
        label: t("physicalProgress"),
        align: "right" as const,
        render: ({ stats }) => (
            // @ts-ignore
            <span className="font-mono whitespace-nowrap">{stats?.physicalProgress || 0}%</span>
        ),
    },
    {
        key: "financialProgress",
        label: t("financialProgress"),
        align: "right" as const,
        render: ({ stats }) => (
            // @ts-ignore
            <span className="font-mono whitespace-nowrap">{stats?.financialProgress || 0}%</span>
        ),
    },
    {
        key: "guarantee",
        label: t("guarantee"),
        render: ({ guarantee }) => (
            <span>
                {guarantee.hasPerformanceBond ? (
                    <Tag variant={guarantee.cashed ? "success" : "warning"}>{guarantee.cashed ? t("cashed") : t("notCashed")}</Tag>
                ) : (
                    <span className="text-slate-400 text-xs">-</span>
                )}
            </span>
        ),
    },
    {
        key: "workAmountMT",
        label: t("workAmount"),
        align: "right" as const,
        render: ({ workAmountMT }) => <span className="font-mono whitespace-nowrap">{workAmountMT.toLocaleString()} DA</span>,
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
        fixedRight: true,
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

// aventan columns can be same as project columns for now but with less fields
export const avenantColumns: () => TableColumn<Project>[] = () => [
    {
        key: "projectNumber",
        label: `${t("avenant")} ${t("number")}`,
        render: ({ projectNumber }) => <span className="font-mono whitespace-nowrap">{projectNumber}</span>,
        fixed: true,
    },
    {
        key: "title",
        label: t("title"),
        render: ({ title }) => <span className="font-medium text-slate-900">{title}</span>,
    },
    {
        key: "contractMode",
        label: t("status"),
        render: ({ contractMode, isConvertedToOds }) => <Tag variant={contractMode === "ODS" ? "success" : "warning"}>{contractMode}</Tag>,
    },
    {
        key: "workAmountMT",
        label: t("amount"),
        align: "right" as const,
        render: ({ workAmountMT }) => <span className="font-mono whitespace-nowrap">{workAmountMT.toLocaleString()} DA</span>,
    },
];

export const ProjectFormFields = (
    formData: Partial<Project>,
    clients: Client[] = [],
    antennes: Antenne[] = [],
    services: ServiceType[] = [],
    users: Employee[] = [],
    ouvrageTypes: OuvrageType[] = [],
    vatRates: VatRate[] = [],
    projects: Project[] = [],
    lockAvenant?: boolean,
): FieldConfig[] => {
    const { contractMode, isAvenant } = formData;
    return [
        {
            type: "section",
            title: t("informationproject"),
            description: t("informationprojectDescription"),
        },
        {
            type: "select",
            name: "contractMode",
            label: t("contractMode"),
            options: [
                { label: "LC", value: "LC" },
                { label: "ODS", value: "ODS" },
            ],
        },
        {
            type: "text",
            name: "projectNumber",
            label: isAvenant ? `N° ${t("avenant")}` : t("projectNumber"),
            placeholder: "PJT-2025-001",
            required: true,
        },
        {
            type: "text",
            name: "title",
            label: t("title"),
            placeholder: t("projectTitlePlaceholder"),
            required: true,
        },
        contractMode !== ContractMode.LC && {
            type: "date",
            name: "signDate",
            label: t("signDate"),
        },
        !lockAvenant && {
            type: "checkbox",
            name: "isAvenant",
            label: t("isAvenant"),
        },
        // when this project is an avenant show parent and avenants count
        (formData?.isAvenant || false) && {
            type: "select",
            name: "parentProjectId",
            label: t("parentProjectId"),
            disabled: projects?.length === 1,
            options: projects?.map((p) => ({ label: `${p.title} (${p.projectNumber})`, value: p._id })) || [],
        },
        {
            type: "select",
            name: "clientId",
            label: t("client"),
            disabled: formData.isAvenant === true,
            options: clients?.map((c) => ({ label: c.name, value: c._id })) || [],
        },

        contractMode !== ContractMode.LC && {
            type: "text",
            name: "operationNumber",
            label: t("operationNumber"),
            required: true,
            placeholder: "OP-2025-001",
        },
        contractMode !== ContractMode.LC && {
            type: "text",
            name: "conventionNumber",
            label: t("conventionNumber"),
            placeholder: "CN-2025-001",
            required: true,
        },

        {
            type: "select",
            name: "antenneId",
            label: t("antenne"),
            disabled: formData.isAvenant === true,
            options: antennes?.map((a) => ({ label: a.label, value: a._id })) || [],
        },
        {
            type: "select",
            name: "projectManagerIds",
            label: t("projectManagers") || "Project Managers",
            options: users?.map((u) => ({ label: u.fullName, value: u._id })) || [],
            // indicate multi-select in the config so the FormBuilder can render appropriately
            isMulti: true,
        },
        {
            type: "select",
            name: "serviceTypeId",
            label: t("serviceType"),
            options: services?.map((s) => ({ label: s.label, value: s._id })) || [],
        },
        {
            type: "select",
            name: "ouvrageTypeId",
            label: t("ouvrageType") || "Ouvrage Type",
            options: ouvrageTypes?.map((o) => ({ label: o.label, value: o._id })) || [],
        },
        {
            type: "section",
            title: t("informationcontract"),
            description: t("informationcontractDescription"),
        },
        {
            type: "group",
            fields: [
                {
                    type: "number",
                    name: "workAmountMT",
                    label: t("workAmount"),
                    // accept only numbers
                    // pattern: "[0-9]*",
                    suffix: "DA",
                    placeholder: "1000000",
                },
                {
                    type: "number",
                    name: "serviceRate",
                    label: t("serviceRate"),
                    suffix: "%",
                    placeholder: "15",
                },
                {
                    type: "text",
                    name: "amountHTSnapshot",
                    label: t("amountHTSnapshot"),
                    disabled: true,
                    // number font
                    className: " font-mono",
                    formatDisplay: formatMoney,
                    suffix: "DA",
                    placeholder: "00",
                },
            ],
        },
        {
            type: "select",
            name: "billingType",
            label: t("billingType") || "Billing Type",
            options: [
                { label: "FACTURE", value: BillingTypeEnum.FACTURE },
                { label: "SITUATION", value: BillingTypeEnum.SITUATION },
            ],
        },
        // Contract dates
        contractMode === ContractMode.LC && {
            type: "date",
            name: "lcDate",
            label: t("lcDate") || "LC Date",
        },
        contractMode === ContractMode.ODS && {
            type: "date",
            name: "odsStart",
            label: t("odsStart"),
        },
        contractMode === ContractMode.ODS && {
            type: "date",
            name: "odsEnd",
            label: t("odsEnd"),
        },

        {
            type: "section",
            title: t("vatRates"),
        },
        {
            type: "select",
            name: "vatRates",
            label: t("vatRates"),
            options: vatRates?.map((v) => ({ label: `${v.label} (${v.rate}%)`, value: v._id })) || [],
            isMulti: true,
        },
        {
            type: "section",
            title: t("guarantee"),
        },

        {
            type: "checkbox",
            name: "guarantee.hasPerformanceBond",
            label: t("hasPerformanceBond"),
        },

        formData.guarantee?.hasPerformanceBond && {
            type: "group",
            fields: [
                {
                    type: "text",
                    name: "guarantee.bank",
                    label: t("bank"),
                },
                {
                    type: "text",
                    name: "guarantee.number",
                    label: t("bondNumber"),
                },
            ],
        },
        formData.guarantee?.hasPerformanceBond && {
            type: "group",
            fields: [
                {
                    type: "number",
                    name: "guarantee.amount",
                    label: t("amount") || "Amount",
                },
                {
                    type: "date",
                    name: "guarantee.date",
                    label: t("date") || "Date",
                },
            ],
        },
        formData.guarantee?.hasPerformanceBond && {
            type: "checkbox",
            name: "guarantee.cashed",
            label: t("cashed") || "Cashed",
        },
    ];
};

export const projectFilterFields = ({
    clients: clientsList,
    antennes: antenneList,
    drs: drList,
    users: userList,
    ouvrageTypes: ouvrageTypeList,
    services: serviceList,
    projects: projectList,
}: {
    clients?: Client[];
    antennes?: Antenne[];
    drs?: Dr[];
    users?: Employee[];
    ouvrageTypes?: OuvrageType[];
    services?: ServiceType[];
    projects?: Project[];
}): FieldConfig[] => {
    return [
        {
            type: "group",
            length: 2,
            fields: [
                {
                    type: "select",
                    name: "clientId",
                    label: t("client"),
                    placeholder: t("selectClientType"),
                    options: clientsList?.map((c) => ({ label: c.name, value: c._id })) || [],
                },
                {
                    type: "select",
                    name: "antenneId",
                    label: t("antenne"),
                    placeholder: t("selectAntenne"),
                    options: antenneList?.map((a) => ({ label: a.label, value: a._id })) || [],
                },
                {
                    type: "select",
                    name: "drId",
                    label: t("dr"),
                    placeholder: t("selectDr"),
                    options: drList?.map((d) => ({ label: d.name, value: d._id })) || [],
                },
                {
                    type: "select",
                    name: "projectManagerIds",
                    label: t("projectInCharge"),
                    placeholder: t("selectRole"),
                    options: userList?.map((u) => ({ label: u.fullName, value: u._id })) || [],
                    isMulti: true,
                },
                {
                    type: "select",
                    name: "ouvrageTypeId",
                    label: t("ouvrageType"),
                    placeholder: t("selectWilaya"),
                    options: ouvrageTypeList?.map((o) => ({ label: o.label, value: o._id })) || [],
                },
                {
                    type: "select",
                    name: "serviceTypeId",
                    label: t("serviceType"),
                    placeholder: t("selectWilaya"),
                    options: serviceList?.map((s) => ({ label: s.label, value: s._id })) || [],
                },
                {
                    type: "select",
                    name: "contractMode",
                    label: t("contractMode"),
                    options: [
                        { label: "LC", value: "LC" },
                        { label: "ODS", value: "ODS" },
                    ],
                },
                {
                    type: "select",
                    name: "year",
                    label: t("year"),
                    placeholder: t("selectYear"),
                    options: Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return { label: year.toString(), value: year.toString() };
                    }),
                },
                {
                    type: "select",
                    name: "isConvertedToOds",
                    label: t("isConvertedToOds") || "Converted To ODS",
                    options: [
                        { label: t("yes"), value: "true" },
                        { label: t("no"), value: "false" },
                    ],
                },
                {
                    type: "select",
                    name: "guarantee.hasPerformanceBond",
                    label: t("hasPerformanceBond") || "Has Performance Bond",
                    options: [
                        { label: t("hasPerformanceBond"), value: "true" },
                        { label: t("doesNotHavePerformanceBond"), value: "false" },
                    ],
                },
                {
                    type: "select",
                    name: "guarantee.cashed",
                    label: t("guaranteeStatus"),
                    placeholder: t("selectStatus"),
                    options: [
                        { label: t("cashed"), value: "true" },
                        { label: t("notCashed"), value: "false" },
                    ],
                },
                {
                    type: "select",
                    name: "isAvenant",
                    label: t("isAvenant") || "Is Avenant",
                    options: [
                        { label: t("yes"), value: "true" },
                        { label: t("no"), value: "false" },
                    ],
                },
                {
                    type: "select",
                    name: "parentProjectId",
                    label: t("parentProjectId"),
                    placeholder: t("selectProject"),
                    options: projectList?.map((p) => ({ label: `${p.title} (${p.projectNumber})`, value: p._id })) || [],
                },
            ],
        },
    ];
};

export const ConvertToOdsFormFields = (): FieldConfig[] => [
    {
        type: "section",
        // title: t("convertToOds"),
        description: t("youhavetoenterodsdates"),
        className: "mt-0",
    },

    {
        type: "group",
        fields: [
            {
                type: "date",
                name: "odsStart",
                label: t("odsStart"),
                required: true,
            },
            {
                type: "date",
                name: "odsEnd",
                label: t("odsEnd"),
                required: true,
            },
        ],
    },
];

export const projectFilterFormatters = ({
    clients,
    antennes,
    drs,
    employees,
    ouvrageTypes,
    serviceTypes,
    projects,
}: {
    clients?: Client[];
    antennes?: Antenne[];
    drs?: Dr[];
    employees?: Employee[];
    ouvrageTypes?: OuvrageType[];
    serviceTypes?: ServiceType[];
    projects?: Project[];
}): FilterFormatter[] => {
    return [
        {
            key: "clientId",
            format: (value: string) =>
                arrayToMap({ arr: clients || [], keyGetter: (item) => item._id, valueGetter: (item) => item.name }).get(value) || value,
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
            key: "projectManagerIds",
            format: (value: string) => {
                const ids = value.split(",");
                const names = ids
                    .map((id) =>
                        arrayToMap({ arr: employees || [], keyGetter: (item) => item._id, valueGetter: (item) => item.fullName }).get(id.trim()),
                    )
                    .filter(Boolean);
                return names.length > 0 ? names.join(", ") : value;
            },
        },
        {
            key: "ouvrageTypeId",
            format: (value: string) =>
                arrayToMap({ arr: ouvrageTypes || [], keyGetter: (item) => item._id, valueGetter: (item) => item.label }).get(value) || value,
        },
        {
            key: "serviceTypeId",
            format: (value: string) =>
                arrayToMap({ arr: serviceTypes || [], keyGetter: (item) => item._id, valueGetter: (item) => item.label }).get(value) || value,
        },
        {
            key: "contractMode",
            format: (value: string) => value.toUpperCase(),
        },
        {
            key: "year",
            format: (value: string) => value,
        },
        {
            key: "isConvertedToOds",
            format: (value: string) => (value === "true" ? t("yes") : t("no")),
        },
        {
            key: "guarantee.hasPerformanceBond",
            format: (value: string) => (value === "true" ? t("hasPerformanceBond") : t("doesNotHavePerformanceBond")),
        },
        {
            key: "guarantee.cashed",
            format: (value: string) => (value === "true" ? t("cashed") : t("notCashed")),
        },
        {
            key: "isAvenant",
            format: (value: string) => (value === "true" ? t("yes") : t("no")),
        },
        {
            key: "parentProjectId",
            format: (value: string) => {
                const project = projects?.find((p) => p._id === value);
                return project ? `${project.title} (${project.projectNumber})` : value;
            },
        },
    ];
};
