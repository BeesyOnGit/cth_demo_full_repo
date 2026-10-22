import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { Badge } from "../../components/Badge";
import { Invoice, Project, Client } from "../../types";
import { useInvoiceStore } from "../invoices/invoiceStore";
import { useProjectsStore } from "../projects/projectsStore";
import { useClientStore } from "../admin-referentials/clients/clientsStore";
import { useToastStore } from "@/store/useToastStore";
import { Printer, CheckCircle, X } from "lucide-react";
import { ArrowBack } from "@/utils/rtl";
import { useLanguage } from "../../i18n";
import { Loader } from "../../components/Loader";
import { Skeleton } from "../../components/Skeleton";
import { formatMoney, printFile } from "@/utils/utils";

export const InvoiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { addToast } = useToastStore();

    const {
        invoiceDetails: invoice,
        getInvoiceById,
        markAsRecovered,
        isLoadingInvoices,
        isInvoiceCUD,
        isInvoicePrinting,
        clearInvoices,
        printInvoice,
    } = useInvoiceStore();
    const { projectDetails: project, getOneProject, clearProject } = useProjectsStore();
    const { clientDetails: client, getClientDetails, clearClients } = useClientStore();

    useEffect(() => {
        return () => {
            clearInvoices();
            clearProject();
            clearClients();
        };
    }, []);

    useEffect(() => {
        if (!id) return;
        loadData();
    }, [id]);

    const loadData = async () => {
        if (!id) return;
        try {
            await getInvoiceById(id);
        } catch (error) {
            addToast(error as string, "error");
            navigate("/invoices");
        }
    };

    useEffect(() => {
        if (!invoice) return;
        fetchRelatedData();
    }, [invoice]);

    useEffect(() => {
        if (!project) return;
        fetchClientData();
    }, [project]);

    const fetchRelatedData = async () => {
        if (!invoice) return;
        try {
            // @ts-ignore
            const projectId = typeof invoice.projectId === "string" ? invoice.projectId : invoice.projectId?._id;
            if (projectId) {
                await getOneProject(projectId);
            }
        } catch (error) {
            addToast(error as string, "error");
        }
    };
    const fetchClientData = async () => {
        if (!project) return;
        try {
            await getClientDetails(project.clientId);
        } catch (error) {
            addToast(error as string, "error");
        }
    };

    const handleMarkPaid = async () => {
        if (!id) return;
        try {
            await markAsRecovered(id);
            addToast(t("invoiceMarkedAsPaid"), "success");
            await loadData();
        } catch (error) {
            addToast(error as string, "error");
        }
    };

    const handlePrint = async () => {
        // window.print();
        if (!id) return;
        try {
            // @ts-ignore
            const { res, headers } = await printInvoice(id);
            const file = new Blob([res], { type: "application/pdf" });
            const cd: string = headers["content-disposition"] || "";
            const encoded = cd.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
            const fileName = encoded ? decodeURIComponent(encoded) : cd.match(/filename="?([^";]+)"?/i)?.[1] || `invoice-${id}.pdf`;
            printFile({ fileBlob: file, name: fileName });
            // const pdfUrl = URL.createObjectURL(file);
            // // const url = URL.createObjectURL(pdfBlob);
            // // const link = document.createElement("a");
            // // link.href = pdfUrl;

            // // link.download = fileName || `invoice_${id}.pdf`;
            // // link.click();
            // // print the pdf in the same tab
            // window.URL.revokeObjectURL(pdfUrl);
        } catch (error) {
            addToast(error as string, "error");
        }
    };

    if (isLoadingInvoices) {
        return (
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-32 rounded-lg" />
                        <Skeleton className="h-10 w-24 rounded-lg" />
                    </div>
                </div>
                {/* Invoice Card Skeleton */}
                <div className="rounded-xl border border-slate-200 p-8 space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-24 w-24" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                        ))}
                    </div>
                    <Skeleton className="h-px w-full" />
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex justify-between">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
    if (!invoice || !project) return <div className="p-8 text-center">{t("invoiceNotFound")}</div>;

    const isRecovered = invoice?.isRecovered || false;

    return (
        <div className="space-y-6 max-w-4xl mx-auto print:max-w-none">
            {/* Actions Bar - Hidden in Print */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <ArrowBack size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900">{t("invoiceTemplate")}</h1>
                </div>
                <div className="flex gap-2">
                    {!isRecovered && (
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={handleMarkPaid} loading={isInvoiceCUD}>
                            <CheckCircle size={16} /> {t("markAsPaid")}
                        </Button>
                    )}
                    <Button variant="outline" className="gap-2" loading={isInvoicePrinting} disabled={isInvoicePrinting} onClick={handlePrint}>
                        <Printer size={16} /> {t("print")}
                    </Button>
                </div>
            </div>

            {/* Invoice Paper Layout */}
            <div className="bg-white border border-slate-200 shadow-lg rounded-none sm:rounded-xl p-8 md:p-12 print:shadow-none print:border-none print:p-0">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">CTH</h2>
                        <p className="text-slate-500 mt-1">Organisme National de Contrôle Technique de la Construction Hydrolique</p>
                        <div className="mt-4 text-sm text-slate-600">
                            <p>Cité 504 Logements Ain Naadja</p>
                            <p>Gué de constantine, Alger</p>
                            {/* <p>{t("companyEmail")}</p> */}
                        </div>
                    </div>
                    <div className="text-right">
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">
                            {t("invoiceNumber")}: {invoice.invoiceNumber}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {t("date")}: {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </p>
                        <div className="mt-4">
                            {isRecovered ? <Badge variant="success">{t("paidRecovered")}</Badge> : <Badge variant="warning">{t("unpaid")}</Badge>}
                        </div>
                    </div>
                </div>

                {/* Client & Project Info */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("customerInfo")}</h4>
                        <p className="font-bold text-slate-800 text-lg">{client?.name || t("clientName")}</p>
                        <div className="text-slate-600 text-sm mt-2 space-y-1">
                            <p>
                                <span className="font-medium">NIF:</span> {client?.financial?.nif || "N/A"}
                            </p>
                            <p>
                                <span className="font-medium">NIS:</span> {client?.financial?.nis || "N/A"}
                            </p>
                            <p>
                                <span className="font-medium">RC:</span> {client?.financial?.rc || "N/A"}
                            </p>
                            {client?.addresses?.[0] && <p className="pt-2">{client.addresses[0].address}</p>}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("projectInfo")}</h4>
                        <p className="font-semibold text-slate-800">{project.title}</p>
                        <p className="text-slate-600 text-sm mt-1 font-mono">{project.projectNumber}</p>
                        <p className="text-slate-600 text-sm mt-1">
                            {t("contractMode")}: {project.contractMode}
                        </p>
                    </div>
                </div>

                {/* Line Items */}
                <div className="mb-8">
                    <table className="w-full text-left">
                        <thead className="border-b-2 border-slate-100">
                            <tr>
                                <th className="py-3 text-sm font-semibold text-slate-600">{t("description")}</th>
                                <th className="py-3 text-sm font-semibold text-slate-600 text-right">{t("rate")}</th>
                                <th className="py-3 text-sm font-semibold text-slate-600 text-right">{t("amount")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="py-4 text-slate-800">
                                    <p className="font-medium">{t("situationDesTravaux")}</p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {t("physicalProgress")}: {invoice.physicalProgress}%
                                    </p>
                                </td>
                                <td className="py-4 text-right text-slate-600">-</td>
                                <td className="py-4 text-right font-medium text-slate-900">{formatMoney(invoice.amountHT)} DA</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>{t("subtotalHT")}</span>
                            <span className="font-medium">{invoice.amountHT.toLocaleString()} DA</span>
                        </div>
                        {invoice.vatRateRef && invoice.vatRateRef.length > 0 ? (
                            invoice.vatRateRef.map((vat, index) => {
                                const vatAmount = (invoice.amountHT * vat.rateSnapshot) / 100;
                                return (
                                    <div key={index} className="flex justify-between text-sm text-slate-600">
                                        <span>
                                            {/* @ts-ignore */}
                                            {vat.vatRateId.label} ({vat.rateSnapshot}%)
                                        </span>
                                        <span className="font-medium">{formatMoney(vatAmount)} DA</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>{t("vat")} (0%)</span>
                                <span className="font-medium">0 DA</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-slate-200 pt-3">
                            <span>{t("total")} (TTC)</span>
                            <span>{formatMoney(invoice.amountTTC)} DA</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
                    <p>CTH - {t("thankYouMessage")}</p>
                </div>
            </div>
        </div>
    );
};
