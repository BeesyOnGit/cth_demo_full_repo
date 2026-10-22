import * as repository from "./repository";
import { config } from "../../config";
import { StdQueryOptions } from "../../utils/interface";
import { GeneralInvoiceType } from "./interface";
import { findFullProjectById, projectFindById } from "../project/repository";
import { BillingTypeEnum } from "../project/interface";
import { formatCurrency, renderHandlebarsTemplate } from "../../utils/handlebars-template";
import { communeFindById } from "../commune/repository";
import axios from "axios";
import { findDrById } from "../dr/service";

export const findAllInvoices = async (params: StdQueryOptions = {}) => {
    const { pageginationDefaultLimit } = config;
    if (!params.limit) params.limit = pageginationDefaultLimit;
    if (!params.page) params.page = 1;
    params.page = (params.page - 1) * params.limit; // zero-based offset
    return repository.invoiceFindAll(params);
};

export const findInvoiceById = async (id: string) => {
    return repository.invoiceFindById(id);
};

export const createInvoice = async (data: GeneralInvoiceType) => {
    const { projectId } = data;
    const project = await projectFindById(projectId.toString());

    if (!project) {
        throw new Error("Project not found for the given Project ID");
    }
    const { vatRates, billingType, antenneId, drId, projectNumber } = project;

    let editData = { ...data, antenneId: antenneId._id, drId: drId._id };

    if (billingType === BillingTypeEnum.SITUATION) {
        const situationCount = await repository.invoiceNextSituationNumber(projectId.toString());
        editData.invoiceNumber = `${projectNumber}-SIT-${situationCount}`;
    }

    const vatRateRef = vatRates.map((vat) => {
        return {
            vatRateId: vat.vatRateId,
            rateSnapshot: vat.rateSnapshot,
        };
    });

    return repository.invoiceCreate({ ...editData, vatRateRef });
};

export const updateInvoice = async (data: any) => {
    return repository.invoiceUpdate(data);
};

export const deleteInvoice = async (id: string, deletedBy: string) => {
    return repository.invoiceDelete(id, deletedBy);
};

export const generateInvoicePDF = async (id: string) => {
    try {
        const invoice = await findInvoiceById(id);
        if (!invoice) {
            throw new Error("Invoice not found for the given ID");
        }
        const { projectId } = invoice;
        const project = await findFullProjectById(projectId._id.toString());

        if (!project) {
            throw new Error("Project not found for the given ID");
        }
        const invoices = await findAllInvoices({ projectId: projectId._id.toString(), noPag: true } as any);

        if (!invoice) {
            throw new Error("Invoice not found for the given Project ID");
        }

        const dr = await findDrById(project.drId._id.toString());

        if (!dr) {
            throw new Error("DR not found for the given ID");
        }

        const { bankName, accountNumber } = dr;

        const { data: allInvoices } = invoices;
        const allExceptCurrent = allInvoices.filter(
            (inv) => inv._id.toString() !== id && inv.isActive && new Date(inv.invoiceDate).getTime() <= new Date(invoice.invoiceDate).getTime(),
        );

        // toObject() deep-converts populated docs; Handlebars denies prototype getters on mongoose docs
        // @ts-ignore
        const { clientId, ...rest } = project.toObject();

        const cleanedProject: any = rest;
        // @ts-ignore
        const inv = invoice.toObject();
        cleanedProject.clientId = clientId.name;

        cleanedProject.drId = `${cleanedProject.drId.name} (${cleanedProject.drId.code})`;
        cleanedProject.antenneId = `${cleanedProject.antenneId.label} (${cleanedProject.antenneId.code})`;
        cleanedProject.cumulatedRecoveredAmountHT = allExceptCurrent.reduce((acc: number, inv: any) => {
            if (inv.isRecovered) {
                return acc + inv.amountHT;
            }
            return acc;
        }, 0);
        cleanedProject.cumulatedAmountHT = allExceptCurrent.reduce((acc: number, inv: any) => {
            return acc + inv.amountHT;
        }, 0);

        cleanedProject.cumulatedAmountHT = cleanedProject.cumulatedAmountHT + inv.amountHT;
        cleanedProject.cumulatedUnrecoveredAmountHT = allExceptCurrent.reduce((acc: number, inv: any) => {
            if (!inv.isRecovered) {
                return acc + inv.amountHT;
            }
            return acc;
        }, 0);

        cleanedProject.decompteNumber = inv.invoiceNumber.split("-")[inv.invoiceNumber.split("-").length - 1];

        cleanedProject.cumulatedRecoveredAmountHT = cleanedProject.cumulatedRecoveredAmountHT;

        if (cleanedProject.vatRates && cleanedProject.vatRates.length > 0) {
            const totalVat = cleanedProject.vatRates.reduce((acc: number, vat: any) => {
                return acc + vat.rateSnapshot;
            }, 0);

            cleanedProject.vatRates = cleanedProject.vatRates.map((vat: any) => {
                return {
                    label: vat.labelSnapshot,
                    amount: inv.amountHT * (vat.rateSnapshot / 100),
                };
            });

            inv.amountTTC = inv.amountTTC;
            cleanedProject.montantTTC = cleanedProject.amountHTSnapshot * (1 + totalVat / 100);
            // "net à payer" is a TTC amount: previous unpaid situations + current one, VAT included
            cleanedProject.cumulatedUnrecoveredAmountTTC = (cleanedProject.cumulatedUnrecoveredAmountHT + inv.amountHT) * (1 + totalVat / 100);
            inv.amountHT = inv.amountHT;
        } else {
            // Set default values when no VAT rates
            cleanedProject.vatRates = [];
            cleanedProject.montantTTC = cleanedProject.amountHTSnapshot;
            cleanedProject.cumulatedUnrecoveredAmountTTC = cleanedProject.cumulatedUnrecoveredAmountHT + inv.amountHT;
        }

        // Calculate allCumulated regardless of VAT rates
        cleanedProject.allCumulated = cleanedProject.cumulatedAmountHT;

        const company = {
            code: "CTH",
            name: "Organisme National de Contrôle Technique de la Construction Hydraulique",
            address: "Cité 504 Logements Ain Naadja, Gué de constantine, Alger",
            nif: "NIF123456",
            nis: "NIS654321",
            rc: "RC789012",
            bankName: "",
        };

        if (clientId?.addresses && clientId?.addresses.communeCode) {
            const commune = await communeFindById(`${clientId.addresses.communeCode}`);
            if (commune) {
                clientId.addresses.commune = commune.communeLt;
            }
        }

        inv.definitive = inv.physicalProgress === 100;

        company.bankName = `${accountNumber || ""} - ${bankName || ""}`;

        // @ts-ignore
        cleanedProject.ref = `${company.code}/${project.drId.code}/${clientId?.addresses?.commune ?? ""}/${project.projectNumber}`;

        const res = await renderHandlebarsTemplate("Situation_Decompte", { project: cleanedProject, invoice: inv, client: clientId, company });

        // Minify HTML: remove unnecessary whitespace, newlines, and tabs
        const minifiedHtml = res
            .replace(/\n/g, "") // Remove newlines
            .replace(/\t/g, "") // Remove tabs
            .replace(/\s{2,}/g, " ") // Replace multiple spaces with single space
            .replace(/>\s+</g, "><") // Remove spaces between tags
            .trim();

        const response = await axios.post(
            `${config.pdfConversionApiUrl}`,
            // page size/margins come from the template's @page CSS
            { html: minifiedHtml },
            {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "arraybuffer",
            },
        );
        return { pdfBuffer: Buffer.from(response.data), name: `${inv.invoiceNumber}-${cleanedProject.clientId}.pdf` };
        // return repository.invoiceGeneratePDF(invoice);
    } catch (error) {
        // PDF API returns { error } as JSON, but axios hands it back as an arraybuffer
        const data = (error as any)?.response?.data;
        let detail = String(error);
        if (data) {
            try {
                detail = JSON.parse(Buffer.from(data).toString("utf8")).error ?? detail;
            } catch {}
        }
        console.log("🚀 ~ file: service.ts:165 ~ generateInvoicePDF ~ error:", detail);
        throw new Error(`Error generating invoice PDF: ${detail}`);
    }
};
