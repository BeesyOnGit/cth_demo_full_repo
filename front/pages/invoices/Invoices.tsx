import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { ViewToggle } from "../../components/ViewToggle";
import { Skeleton } from "../../components/Skeleton";
import { Table } from "../../components/Table";
import { BillingTypeEnum, Invoice } from "../../types";
import { useInvoiceStore } from "./invoiceStore";
import { Plus, Search } from "lucide-react";
import { useLanguage } from "../../i18n";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "@/store/useToastStore";
import { Modal } from "../../components/Modal";
import { FormBuilder } from "../../components/FormBuilder";
import { handleFormChange, todayLocalDate, useQueryParams } from "@/utils/utils";
import { invoiceColumns, InvoiceFormFields, invoiceFilterFields, invoiceFilterFormatters } from "./invoiceUtils";
import { useProjectsStore } from "../projects/projectsStore";
import { Pagination } from "@/components/Pagination";
import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "../login/useAuthStore";
import FilterQuery from "@/components/FilterQuery";
import { FiltersDisplay } from "@/components/FiltersDisplay";
import { useAntenneStore } from "../admin-referentials/antennes/antenneStore";
import { useDrStore } from "../admin-referentials/drs/useDrStore";

export const Invoices = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [searchParams] = useSearchParams();
    const { addToast } = useToastStore();
    const { setQueryParam, removeQueryParam, useQuery } = useQueryParams();

    const { invoices, invoicePagination, isLoadingInvoices, getAllInvoices, createInvoice, updateInvoice, deleteInvoice, isInvoiceCUD } =
        useInvoiceStore();
    const { projects, getAllProjects } = useProjectsStore();
    const { getAllAntennes, antennes } = useAntenneStore();
    const { getAllDrs, drs } = useDrStore();

    const [view, setView] = useState<"grid" | "table">("table");
    const [formData, setFormData] = useState<Partial<Invoice>>({});

    // const i|sModalOpen = useQuery("modal");
    const modal: "create" | "edit" | "delete" = useQuery("modal");
    const targetId = useQuery("target");
    const page = useQuery("page");

    useEffect(() => {
        loadData();
    }, [page]);

    useEffect(() => {
        if (!user) {
            return;
        }
        const { antenneId } = user;
        const onError = (e: any) => addToast(e as string, "error");
        getAllProjects(`${antenneId ? `antenneId=${antenneId}` : ""}&noPag=true`).catch(onError);
        getAllAntennes("noPag=true").catch(onError);
        getAllDrs("noPag=true").catch(onError);
    }, [user]);

    useEffect(() => {
        if (modal && modal === "edit" && targetId && invoices) {
            const invoice = invoices.find((i) => i._id === targetId);
            if (invoice) {
                const vat =
                    invoice?.vatRateRef && invoice.vatRateRef?.length > 0 ? invoice.vatRateRef.reduce((acc, rate) => acc + rate.rateSnapshot, 0) : 0;
                setFormData({
                    ...invoice,
                    // @ts-ignore
                    projectId: invoice.projectId?._id,
                    // @ts-ignore
                    vatAmount: (invoice.amountHT * vat) / 100,
                    invoiceType: invoice.invoiceType,
                });
            }
            return;
        }
        setFormData({});
    }, [targetId, invoices]);

    const loadData = async () => {
        try {
            await getAllInvoices(searchParams.toString());
        } catch (error) {
            addToast(error as string, "error");
        }
    };

    const handleEdit = (id: string) => {
        setQueryParam([
            { name: "modal", value: "edit" },
            { name: "target", value: id },
        ]);
    };

    const handleDelete = (id: string) => {
        setQueryParam([
            { name: "modal", value: "delete" },
            { name: "target", value: id },
        ]);
    };

    const handleCloseModal = () => {
        removeQueryParam(["modal", "target"]);
        setFormData({});
    };

    const autoGenerateNumber = useMemo(() => {
        return formData.projectId && projects?.find((p) => p._id === formData.projectId)?.billingType === BillingTypeEnum.SITUATION;
    }, [formData.projectId, projects]);

    // Filter Config Section
    const invoiceFilters = React.useCallback(() => {
        return invoiceFilterFields({ projects: projects || [], antennes: antennes || [], drs: drs || [] });
    }, [projects, antennes, drs]);

    const filterFormatters = React.useMemo(() => {
        return invoiceFilterFormatters({ projects: projects || [], antennes: antennes || [], drs: drs || [] });
    }, [projects, antennes, drs]);

    const handleApplyInvoiceFilters = React.useCallback(
        (data: any) => {
            getAllInvoices(data).catch((e) => addToast(e as string, "error"));
        },
        [getAllInvoices, addToast],
    );

    const modalContent = {
        create: {
            title: t("newInvoice"),
            content: InvoiceFormFields(projects || [], false, autoGenerateNumber),
            formData: formData,
            loading: isInvoiceCUD,
            handleChange: (name: string, value: any, path?: string) => {
                if (name === "amountHT" && formData.projectId) {
                    const amountHT = parseFloat(value) || 0;
                    const project = projects?.find((p) => p._id === formData.projectId);
                    const vat =
                        project?.vatRates && project.vatRates.length > 0 ? project.vatRates.reduce((acc, rate) => acc + rate.rateSnapshot, 0) : 0;
                    setFormData((prev) => ({
                        ...prev,
                        vatAmount: (amountHT * vat) / 100,
                        amountTTC: amountHT + (amountHT * vat) / 100,
                    }));
                }
                if (name === "projectId") {
                    const project = projects?.find((p) => p._id === value);
                    const amountHT = parseFloat(`${formData.amountHT}`) || 0;
                    const vat =
                        project?.vatRates && project.vatRates.length > 0 ? project.vatRates.reduce((acc, rate) => acc + rate.rateSnapshot, 0) : 0;
                    setFormData((prev) => ({
                        ...prev,
                        vatAmount: (amountHT * vat) / 100,
                        amountTTC: amountHT + (amountHT * vat) / 100,
                        invoiceType: project?.billingType,
                        drId: project?.drId,
                        antenneId: project?.antenneId,
                    }));
                }
                if (name === "isRecovered") {
                    setFormData((prev) => ({
                        ...prev,
                        recoveryDate: value ? todayLocalDate() : null,
                    }));
                }

                handleFormChange(setFormData, name, value, path);
            },
            handleSubmit: async () => {
                try {
                    await createInvoice(formData as Invoice);
                    addToast(t("invoiceCreated"), "success");
                    handleCloseModal();
                    loadData();
                } catch (error) {
                    addToast(error as string, "error");
                }
            },
        },
        edit: {
            title: t("editInvoice"),
            content: InvoiceFormFields(projects || [], true, autoGenerateNumber),
            formData: formData,
            loading: isInvoiceCUD,
            handleChange: (name: string, value: any, path?: string) => {
                if (name === "amountHT") {
                    const amountHT = parseFloat(value) || 0;
                    const vat =
                        formData?.vatRateRef && formData.vatRateRef?.length > 0
                            ? formData.vatRateRef.reduce((acc, rate) => acc + rate.rateSnapshot, 0)
                            : 0;
                    setFormData((prev) => ({
                        ...prev,
                        vatAmount: (amountHT * vat) / 100,
                        amountTTC: amountHT + (amountHT * vat) / 100,
                    }));
                }
                if (name === "isRecovered") {
                    setFormData((prev) => ({
                        ...prev,
                        recoveryDate: value ? todayLocalDate() : null,
                    }));
                }

                handleFormChange(setFormData, name, value, path);
            },
            handleSubmit: async () => {
                try {
                    await updateInvoice({ ...formData, _id: targetId } as Invoice);
                    addToast(t("invoiceUpdated"), "success");
                    handleCloseModal();
                    loadData();
                } catch (error) {
                    addToast(error as string, "error");
                }
            },
        },
        delete: {
            title: t("deleteInvoice"),
            content: null,
            formData: {},
            loading: isInvoiceCUD,
            handleChange: () => {},
            handleSubmit: async () => {
                if (!targetId) return;
                try {
                    await deleteInvoice(targetId);
                    addToast(t("invoiceDeleted"), "success");
                    handleCloseModal();
                    loadData();
                } catch (error) {
                    addToast(error as string, "error");
                }
            },
        },
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900">{t("invoices")}</h1>
                    {/* <div className="flex items-center gap-3">
                        <ViewToggle view={view} onChange={setView} />

                        <Button onClick={() => setQueryParam([{ name: "modal", value: "create" }])}>
                            <Plus size={18} className="me-2" />
                            {t("newInvoice")}
                        </Button>
                    </div> */}
                </div>
                <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
                    <FilterQuery
                        moreFilters
                        formId="invoice-filter"
                        fields={invoiceFilters()}
                        onSubmit={handleApplyInvoiceFilters}
                        queryName="search"
                        placeholder={t("search")}
                    />
                </div>
                <FiltersDisplay excludeKeys={["page", "modal", "target"]} formatters={filterFormatters} />

                {isLoadingInvoices ? (
                    <Card className="overflow-hidden p-0">
                        <div className="p-4 space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-12 w-full rounded-lg" />
                                </div>
                            ))}
                        </div>
                    </Card>
                ) : (
                    <>
                        <Card className="overflow-hidden p-0">
                            <Table
                                columns={invoiceColumns(handleEdit, handleDelete)}
                                data={invoices || []}
                                keyExtractor={(item) => item._id}
                                onRowClick={(invoice) => navigate(`/invoices/${invoice._id}`)}
                                emptyMessage={t("noInvoicesFound")}
                            />
                        </Card>
                        {invoicePagination && (
                            <Pagination
                                totalItems={invoicePagination.total}
                                itemsPerPage={invoicePagination.limit}
                                // onPageChange={(page) => setQueryParam("page", page.toString())}
                            />
                        )}
                    </>
                )}
            </div>
            <Modal
                isOpen={!!modal}
                onClose={handleCloseModal}
                title={modalContent[modal!]?.title}
                size={modal === "delete" ? "sm" : "lg"}
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={handleCloseModal} disabled={modalContent[modal!]?.loading}>
                            {t("cancel")}
                        </Button>
                        <Button
                            // delete has no form: submit directly; others go through FormBuilder validation
                            onClick={modal === "delete" ? modalContent.delete.handleSubmit : undefined}
                            loading={modalContent[modal!]?.loading}
                            disabled={modalContent[modal!]?.loading}
                            variant={modal === "delete" ? "danger" : "primary"}
                            type="submit"
                            form={modal === "delete" ? undefined : `${modal}-invoice-form`}
                        >
                            {modal === "delete" ? t("delete") : modal === "edit" ? t("saveChanges") : t("createInvoice")}
                        </Button>
                    </div>
                }
            >
                {modal === "delete" ? (
                    <p className="text-slate-600">{t("deleteInvoiceConfirmation")}</p>
                ) : (
                    <FormBuilder
                        fields={modalContent[modal!]?.content || []}
                        formData={modalContent[modal!]?.formData || {}}
                        onChange={modalContent[modal!]?.handleChange}
                        onSubmit={modalContent[modal!]?.handleSubmit}
                        formId={`${modal}-invoice-form`}
                    />
                )}
            </Modal>
        </>
    );
};
