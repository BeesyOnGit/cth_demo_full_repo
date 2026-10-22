import React, { use, useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Badge } from "../../components/Badge";
import { Input } from "../../components/Input";
import { Modal } from "../../components/Modal";
import { Project, Invoice, ContractMode, BillingTypeEnum } from "../../types";
// import { projectService } from "../projects/projectService";
import { Edit, Trash2, TrendingUp, DollarSign, Activity, Lock, RefreshCcw, Plus } from "lucide-react";
import { ArrowBack } from "@/utils/rtl";
import { useLanguage } from "../../i18n";
import { useProjectsStore } from "../projects/projectsStore";
import { useClientStore } from "../admin-referentials/clients/clientsStore";
import { useToastStore } from "@/store/useToastStore";
import { Loader } from "@/components/Loader";
import { Skeleton } from "@/components/Skeleton";
import { Tag } from "@/components/Tag";
import { formatMoney, handleFormChange, useQueryParams } from "@/utils/utils";
import { avenantColumns, ConvertToOdsFormFields } from "../projects/projectUtils";
import { FormBuilder } from "@/components/FormBuilder";
import { projectInvoiceFields, invoiceInProjectColumns } from "../invoices/invoiceUtils";
import { useInvoiceStore } from "../invoices/invoiceStore";
import { Table } from "@/components/Table";
import { Pagination } from "@/components/Pagination";
import { MiniButton } from "@/components/MiniButton";

export const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t } = useLanguage();

    const {
        projectDetails: project,
        getOneProject,
        isLoadingProjects: loading,
        convertProjectToOds,
        updateProject,
        isProjectCUD,
        clearProject,
        avenants,
        isLoadingAvenants,
        avenantPagination,
        getProjectsAvenants,
    } = useProjectsStore();
    const { clientDetails: client, getClientDetails, clearClients, isLoadingClient } = useClientStore();
    const { isInvoiceCUD, invoices, getAllInvoices, isLoadingInvoices, createInvoice, clearInvoices, invoicePagination } = useInvoiceStore();

    const { addToast } = useToastStore();

    const { setQueryParam, useQuery, removeQueryParam } = useQueryParams();

    const isModalOpen: "ods" | "invoice" | "cashGuarantee" | null = useQuery("modal");

    const pageAvenant = useQuery("avPg");
    const pageInvoice = useQuery("invPg");
    const pageLimit = 5;

    // Modals
    const [formOds, setFormOds] = useState<Partial<Project>>({});
    const [formInvoice, setFormInvoice] = useState<Partial<Invoice>>({});

    useEffect(() => {
        return () => {
            clearProject();
            clearClients();
            clearInvoices();
        };
    }, []);

    useEffect(() => {
        if (!id) {
            return;
        }
        fetchProject(id);
    }, [id, project?._id]);

    useEffect(() => {
        setFormInvoice({
            projectId: project?._id || "",
            invoiceType: project?.billingType || BillingTypeEnum.SITUATION,
        });
    }, [project]);
    useEffect(() => {
        if (!id) {
            return;
        }
        getProjectsAvenants(`page=${pageAvenant}&limit=${pageLimit}&parentProjectId=${id}`);
    }, [pageAvenant]);
    useEffect(() => {
        if (!id) {
            return;
        }
        getAllInvoices(`page=${pageInvoice}&limit=${pageLimit}&projectId=${id}`);
    }, [pageInvoice]);

    async function fetchProject(id: string) {
        try {
            if (!project || project._id !== id) {
                await getOneProject(id);
                await getProjectsAvenants(`limit=${pageLimit}&parentProjectId=${id}`);
                return;
            }
            await getClientDetails(project.clientId);
            await getAllInvoices(`projectId=${id}&limit=${pageLimit}`);
        } catch (error) {
            addToast(error || "Failed to load project", "error");
            navigate("/projects");
        }
    }

    const handleCloseModal = () => {
        removeQueryParam("modal");
        setFormOds({});
    };

    const modalContent = {
        ods: {
            title: t("convertLCtoODS"),
            content: ConvertToOdsFormFields(),
            formData: formOds,
            loading: isProjectCUD,
            handleChange: (name: string, value: any, path?: string) => {
                handleFormChange(setFormOds, name, value, path);
            },
            handleSubmit: async () => {
                if (!id || !formOds.odsStart || !formOds.odsEnd) {
                    addToast("Please fill in all required fields", "error");
                    return;
                }
                try {
                    const mess = await convertProjectToOds(id, formOds);
                    addToast(mess || "Project converted to ODS successfully", "success");
                    handleCloseModal();
                    await getOneProject(id);
                } catch (error) {
                    addToast(error || "Failed to convert project to ODS", "error");
                }
            },
        },
        invoice: {
            title: t("createInvoice"),
            content: projectInvoiceFields(
                [{ title: project?.title || "", _id: project?._id || "" }],
                true,
                project?.billingType === BillingTypeEnum.SITUATION,
            ),
            loading: isInvoiceCUD,
            handleChange: (name: string, value: any, path?: string) => {
                // handle invoice form change
                if (name === "physicalProgress") {
                    let percent = (parseInt(`${value}`) - project.lastProgress) / 100 || 0;

                    if (!percent || percent <= 0) {
                        percent = 0;
                    }

                    const amountHT = project.amountHTSnapshot * percent || 0;
                    const vat =
                        project?.vatRates && project.vatRates.length > 0 ? project.vatRates.reduce((acc, rate) => acc + rate.rateSnapshot, 0) : 0;
                    setFormInvoice((prev) => ({
                        ...prev,
                        amountHT: amountHT,
                        amountTTC: amountHT + (amountHT * vat) / 100,
                        vatAmount: (amountHT * vat) / 100,
                    }));
                }
                // if (name === "recovery.status") {
                //     if (value === true) {
                //         value = "OUI";
                //     }
                //     if (value === false) {
                //         value = "NON";
                //     }
                // }
                handleFormChange(setFormInvoice, name, value, path);
            },
            handleSubmit: async () => {
                // handle invoice form submit
                if (!formInvoice.invoiceDate || !formInvoice.amountHT || !formInvoice.amountTTC || !project?._id) {
                    addToast("Please fill in all required fields", "error");
                    return;
                }
                if (parseInt(`${formInvoice.physicalProgress}`) <= project.lastProgress) {
                    addToast("Le pourcentage de progression ne peut pas être inférieur ou égal au dernier progrès", "warning");
                    return;
                }
                try {
                    // Add your submit logic here
                    const mess = await createInvoice(formInvoice);
                    setFormInvoice({
                        projectId: project?._id || "",
                        invoiceType: project?.billingType || BillingTypeEnum.SITUATION,
                    });
                    addToast(mess || "Invoice created successfully", "success");
                    handleCloseModal();
                    await getOneProject(project._id);
                    await getAllInvoices(`page=${pageInvoice || 1}&limit=${pageLimit}&projectId=${project._id}`);
                    // await getAllInvoices(`projectId=${project._id}`);
                } catch (error) {
                    addToast(error || "Failed to create invoice", "error");
                }
            },
            formData: formInvoice,
        },
        cashGuarantee: {
            title: t("markAsCashed"),
            content: null,
            formData: {},
            loading: isProjectCUD,
            handleChange: () => {},
            handleSubmit: async () => {
                if (!id) return;
                try {
                    const updatedProject = {
                        ...project,
                        guarantee: {
                            ...project.guarantee,
                            cashed: true,
                        },
                    };
                    await updateProject(updatedProject);
                    addToast("Guarantee marked as cashed successfully", "success");
                    handleCloseModal();
                    await getOneProject(id);
                } catch (error) {
                    addToast(error || "Failed to mark guarantee as cashed", "error");
                }
            },
        },
    };

    const isLCLocked = project?.contractMode === ContractMode.LC && !project.isConvertedToOds;

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                        <Skeleton className="h-8 w-64 mb-2" />
                        <div className="flex gap-2">
                            <Skeleton className="h-5 w-24 rounded-full" />
                            <Skeleton className="h-5 w-32 rounded-full" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                    </div>
                </div>
                {/* Metrics Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-xl border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-10 rounded-lg" />
                            </div>
                            <Skeleton className="h-8 w-32 mb-2" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    ))}
                </div>
                {/* Content Skeleton */}
                <div className="rounded-xl border border-slate-200 p-6 space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }
    if (!project) return <div className="p-8 text-center">{t("projectNotFound")}</div>;

    // Metrics Calculation
    const totalInvoicedHT = project.invoiced || 0;
    const totalRecoveredTTC = project.collected || 0;
    const financialProgress = project.amountHTSnapshot > 0 ? (totalInvoicedHT / project.amountHTSnapshot) * 100 : 0;

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate("/projects")} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                            <ArrowBack size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="font-mono text-sm text-slate-500">{project.projectNumber}</span>
                                <Tag variant="default">{client?.name || "Unknown Client"}</Tag>
                                {/* @ts-ignore */}
                                <Tag variant="default">{project.drId.name || "Unknown DR"}</Tag>
                                {/* @ts-ignore */}
                                <Tag variant="default">{project.antenneId.label || "Unknown Antenne"}</Tag>
                                <Tag variant={project.isActive ? "success" : "warning"}>{project.isActive ? "Active" : "Inactive"}</Tag>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isLCLocked && (
                            <MiniButton
                                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                onClick={() => setQueryParam([{ name: "modal", value: "ods" }])}
                                icon={<RefreshCcw size={18} />}
                            >
                                {t("convertToOds")}
                            </MiniButton>
                            // <Button
                            //     className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                            //     onClick={() => setQueryParam([{ name: "modal", value: "ods" }])}
                            // >

                            // </Button>
                        )}
                        <MiniButton
                            variant="outline"
                            className="gap-2"
                            onClick={() => navigate(`/projects/new?edit=${id}`)}
                            icon={<Edit size={18} />}
                        >
                            {t("edit")}
                        </MiniButton>
                        <MiniButton
                            variant="outline"
                            className="gap-2"
                            onClick={() => navigate(`/projects/new?avenantFor=${id}`)}
                            icon={<Plus size={18} />}
                        >
                            {t("createAvenant")}
                        </MiniButton>
                        <MiniButton variant="danger" className="gap-2" onClick={() => {}} icon={<Trash2 size={18} />}>
                            {t("delete")}
                        </MiniButton>
                        {/* <Button variant="outline" className="gap-2" onClick={() => navigate(`/projects/new?edit=${id}`)}>
                            <Edit size={18} /> {t("edit")}
                        </Button>
                        <Button variant="outline" className="gap-2" onClick={() => navigate(`/projects/new?avenantFor=${id}`)}>
                            <Plus size={18} /> {t("createAvenant")}
                        </Button>
                        <Button variant="danger" className="gap-2" onClick={() => {}}>
                            <Trash2 size={18} /> {t("delete")}
                        </Button> */}
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <MetricCard
                        title={t("workAmount")}
                        value={`${formatMoney(project.amountHTSnapshot)} DA`}
                        icon={<DollarSign className="text-slate-400" />}
                    />
                    <MetricCard
                        title={t("totalInvoiced")}
                        value={`${formatMoney(totalInvoicedHT)} DA`}
                        icon={<TrendingUp className="text-emerald-500" />}
                    />
                    <MetricCard title={t("recovery")} value={`${formatMoney(totalRecoveredTTC)} DA`} icon={<Activity className="text-sky-500" />} />
                    <MetricCard
                        title={t("financialProgress")}
                        value={`${financialProgress.toFixed(1)}%`}
                        icon={<Activity className="text-amber-500" />}
                    />
                </div>

                {/* Content Tabs/Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Col: Details */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card title={t("overview")}>
                            <div className="space-y-4 text-sm">
                                <DetailRow label={t("contractMode")} value={project.contractMode} />
                                {project.lcDate && <DetailRow label="LC Date" value={new Date(project.lcDate).toLocaleDateString()} />}
                                {project.isConvertedToOds && (
                                    <DetailRow label={t("conversionDate")} value={new Date(project.convertedAt!).toLocaleDateString()} />
                                )}
                                {project.odsStart && <DetailRow label={t("odsStart")} value={new Date(project.odsStart).toLocaleDateString()} />}
                                {project.odsEnd && <DetailRow label={t("odsEnd")} value={new Date(project.odsEnd).toLocaleDateString()} />}

                                {/* Client Info Section */}
                                <div className="pt-4 border-t border-slate-100">
                                    <h4 className="font-semibold mb-2 text-slate-700">{t("client")}</h4>
                                    {isLoadingClient ? (
                                        <span>
                                            <Loader />
                                        </span>
                                    ) : client ? (
                                        <div className="text-slate-600 space-y-1">
                                            <p className="font-medium">{client.name}</p>
                                            <p className="text-xs">NIF: {client.financial?.nif || "-"}</p>
                                            <p className="text-xs">RC: {client.financial?.rc || "-"}</p>
                                        </div>
                                    ) : null}
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-slate-700">{t("performanceBond")}</h4>
                                    </div>
                                    {project?.guarantee?.hasPerformanceBond ? (
                                        <>
                                            <DetailRow label={t("bank")} value={project.guarantee.bank || "-"} />
                                            <DetailRow label={t("bondNumber")} value={project.guarantee.number || "-"} />
                                            <DetailRow label="Amount" value={`${project.guarantee.amount?.toLocaleString()} DA`} />
                                            <DetailRow
                                                label={t("cashed")}
                                                value={
                                                    <Tag variant={project.guarantee.cashed ? "success" : "warning"}>
                                                        {project.guarantee.cashed ? t("yes") : t("no")}
                                                    </Tag>
                                                }
                                            />
                                            <div className="py-2 flex justify-end items-center">
                                                {project.guarantee.hasPerformanceBond && !project.guarantee.cashed && (
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs"
                                                        onClick={() => setQueryParam([{ name: "modal", value: "cashGuarantee" }])}
                                                    >
                                                        <DollarSign size={14} /> {t("markAsCashed")}
                                                    </Button>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-slate-500 italic">{t("notRequired")}</span>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <h4 className="font-semibold mb-2 text-slate-700">{t("vatRates")}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {project.vatRates.map((v, i) => (
                                            <Badge key={i} variant="neutral">
                                                {v.rateSnapshot}%
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Col: Invoices */}
                    <div className="lg:col-span-2">
                        <Card
                            title={t("invoices")}
                            action={
                                !isLCLocked &&
                                project.lastProgress < 100 && (
                                    <Button size="sm" onClick={() => setQueryParam([{ name: "modal", value: "invoice" }])}>
                                        <Plus size={14} className="me-1" /> {t("createInvoice")}
                                    </Button>
                                )
                            }
                        >
                            <div className="relative">
                                {isLCLocked && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-lg border-2 border-dashed border-slate-300">
                                        <Lock size={32} className="text-slate-400 mb-2" />
                                        <h3 className="font-semibold text-slate-800">{t("lcLocked")}</h3>
                                        <p className="text-sm text-slate-500">{t("lcLockedDesc")}</p>
                                    </div>
                                )}

                                <div className={isLCLocked ? "opacity-30 pointer-events-none filter blur-sm select-none" : ""}>
                                    {isLoadingInvoices ? (
                                        <div className="p-8 text-center">
                                            <Loader />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <Table
                                                columns={invoiceInProjectColumns()}
                                                data={invoices || []}
                                                keyExtractor={(invoice) => invoice._id}
                                                onRowClick={(invoice) => {
                                                    navigate(`/invoices/${invoice._id}`);
                                                }}
                                                emptyMessage={t("noInvoicesFound")}
                                            />
                                            {invoicePagination && (
                                                <Pagination
                                                    pageParam="invPg"
                                                    totalItems={invoicePagination?.total}
                                                    itemsPerPage={invoicePagination?.limit}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                        {avenants && (
                            <Card title={t("avenant")} className="mt-6">
                                <div className="flex flex-col gap-2">
                                    <Table
                                        columns={avenantColumns()}
                                        data={avenants}
                                        keyExtractor={(k) => k._id}
                                        emptyMessage={t("noAvenantsFound")}
                                    />
                                    {avenantPagination && (
                                        <Pagination
                                            pageParam="avPg"
                                            totalItems={avenantPagination?.total || 0}
                                            itemsPerPage={avenantPagination?.limit || 10}
                                        />
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {
                <Modal
                    isOpen={!!isModalOpen}
                    onClose={handleCloseModal}
                    title={modalContent[isModalOpen!]?.title}
                    size={isModalOpen === "cashGuarantee" ? "sm" : "md"}
                    footer={
                        <div className=" flex justify-end gap-2">
                            <Button variant="danger" onClick={handleCloseModal} disabled={modalContent[isModalOpen!]?.loading}>
                                {t("cancel")}
                            </Button>
                            <Button
                                // cashGuarantee has no form: submit directly; others go through FormBuilder validation
                                onClick={isModalOpen === "cashGuarantee" ? modalContent.cashGuarantee.handleSubmit : undefined}
                                loading={modalContent[isModalOpen!]?.loading}
                                disabled={modalContent[isModalOpen!]?.loading}
                                type="submit"
                                form={isModalOpen === "cashGuarantee" ? undefined : `${isModalOpen}-project-form`}
                                variant="primary"
                            >
                                {isModalOpen === "cashGuarantee" ? t("markAsCashed") : t("save")}
                            </Button>
                        </div>
                    }
                >
                    {isModalOpen === "cashGuarantee" ? (
                        <div className="space-y-4">
                            <p className="text-slate-600">{t("confirmMarkGuaranteeAsCashed")}</p>
                            {project?.guarantee && (
                                <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">{t("bank")}:</span>
                                        <span className="font-medium">{project.guarantee.bank || "-"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">{t("bondNumber")}:</span>
                                        <span className="font-medium">{project.guarantee.number || "-"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">{t("amount")}:</span>
                                        <span className="font-medium">{project.guarantee.amount?.toLocaleString()} DA</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <FormBuilder
                            // @ts-ignore
                            fields={modalContent[isModalOpen]?.content || []}
                            formData={modalContent[isModalOpen]?.formData || {}}
                            onChange={modalContent[isModalOpen]?.handleChange}
                            onSubmit={modalContent[isModalOpen]?.handleSubmit}
                            formId={`${isModalOpen}-project-form`}
                        />
                    )}
                </Modal>
            }

            {/* Convert Modal */}
            {/* {isConvertModalOpen && (
                <ConvertLCModal
                    onClose={() => setIsConvertModalOpen(false)}
                    onSuccess={() => {
                        setIsConvertModalOpen(false);
                        // loadData();
                    }}
                    projectId={project._id}
                />
            )} */}

            {/* Create Invoice Modal */}
        </>
    );
};

// const ConvertLCModal = ({ onClose, onSuccess, projectId }: { onClose: () => void; onSuccess: () => void; projectId: string }) => {
//     const { t } = useLanguage();
//     const [odsStart, setOdsStart] = useState("");
//     const [odsEnd, setOdsEnd] = useState("");

//     const handleSubmit = async () => {
//         if (!odsStart || !odsEnd) return;
//         // await projectService.convertToOds(projectId, odsStart, odsEnd);
//         onSuccess();
//     };

//     return (
//         <Modal
//             isOpen={true}
//             onClose={onClose}
//             title={t("convertLCtoODSTitle")}
//             size="sm"
//             footer={
//                 <>
//                     <Button variant="secondary" onClick={onClose}>
//                         {t("cancel")}
//                     </Button>
//                     <Button onClick={handleSubmit}>{t("save")}</Button>
//                 </>
//             }
//         >
//             <div className="space-y-4">
//                 <p className="text-sm text-slate-600">{t("convertingToOdsDesc")}</p>
//                 <Input label={t("odsStart")} type="date" value={odsStart} onChange={(e) => setOdsStart(e.target.value)} />
//                 <Input label={t("odsEnd")} type="date" value={odsEnd} onChange={(e) => setOdsEnd(e.target.value)} />
//             </div>
//         </Modal>
//     );
// };

const MetricCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-xs font-medium text-slate-500 uppercase">{title}</p>
            <p className="text-lg font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
    </div>
);

const DetailRow = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
    <div className="flex justify-between py-1">
        <span className="text-slate-500">{label}</span>
        {typeof value === "string" ? <span className="font-medium text-slate-900">{value}</span> : <div>{value}</div>}
    </div>
);
