import { InvoiceModel } from "./model";
import { IInvoice, InvoiceFilterOptions, GeneralInvoiceType } from "./interface";
import { Types } from "mongoose";
import { EmployeePopulatePublicFields } from "../employee/interface";
import { StdQueryOptions } from "../../utils/interface";
import { PaginatedResult, paginateResponse } from "../../utils/response";
import { ProjectPopulatePublicFields } from "../project/interface";
import { AntenneGeneralPopulateFields } from "../antenne/interface";
import { DrGeneralPopulateFields } from "../dr/interface";
import { ProjectModel } from "../project/model";
import { BillingTypeEnum } from "../project/interface";

export type InvoiceFilterParams = StdQueryOptions & InvoiceFilterOptions & Partial<GeneralInvoiceType>;

export const invoiceFindAll = async (params: InvoiceFilterParams = {}): Promise<PaginatedResult<IInvoice>> => {
    const { page, limit, noPag, ...rest } = params as any;
    const count = await InvoiceModel.countDocuments({ isActive: true, ...rest });
    if (count === 0) return paginateResponse({ payload: [] as any, total: 0, page: page!, limit: noPag ? count : limit! });

    const invoices = await InvoiceModel.find({ isActive: true, ...rest })
        .sort({ createdAt: -1 })
        .skip(noPag ? 0 : page!)
        .limit(noPag ? 0 : limit!)
        .populate({ path: "projectId", select: ProjectPopulatePublicFields })
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "antenneId", select: AntenneGeneralPopulateFields })
        .populate({ path: "drId", select: DrGeneralPopulateFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    return paginateResponse({ payload: invoices, total: count, page: page!, limit: noPag ? count : limit! });
};

export const invoiceFindById = async (id: string): Promise<IInvoice | null> => {
    if (!id) throw new Error("Invoice ID is required");
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid Invoice ID");

    const invoice = await InvoiceModel.findById(id)
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields })
        .populate({ path: "projectId", select: ProjectPopulatePublicFields })
        .populate({ path: "vatRateRef.vatRateId", select: ["_id", "rate", "label"] });

    if (!invoice) throw new Error("Invoice not found");
    return invoice;
};

export const invoiceCreate = async (data: any): Promise<IInvoice> => {
    // if (!data.projectId) throw new Error("Project ID is required");
    // if (!data.invoiceNumber) throw new Error("Invoice number is required");
    // if (!data.invoiceDate) throw new Error("Invoice date is required");
    // if (data.amountHT === undefined) throw new Error("Amount HT is required");
    // if (!data.vatRateRef || !Array.isArray(data.vatRateRef) || data.vatRateRef.length === 0) throw new Error("VAT rate reference is required");
    // if (!data.createdBy) throw new Error("Created by user ID is required");

    const invoice = new InvoiceModel(data);
    await invoice.save();
    return invoice.populate([
        { path: "createdBy", select: EmployeePopulatePublicFields },
        { path: "updatedBy", select: EmployeePopulatePublicFields },
    ]);
};

export const invoiceUpdate = async (data: any): Promise<IInvoice> => {
    if (!data.id) throw new Error("Invoice ID is required");
    if (!Types.ObjectId.isValid(data.id)) throw new Error("Invalid Invoice ID");

    const updateData: any = { updatedAt: new Date(), ...data };

    // amountTTC is only computed in pre("save"): recompute it here when HT or VAT changes
    if (data.amountHT != null || data.vatRateRef) {
        const current = await InvoiceModel.findById(data.id).select("amountHT vatRateRef").lean();
        if (!current) throw new Error("Invoice not found");
        const amountHT = Number(data.amountHT ?? current.amountHT);
        const vatRateRef: any[] = data.vatRateRef ?? current.vatRateRef ?? [];
        const totalRate = vatRateRef.reduce((acc: number, vatRef: any) => acc + Number(vatRef.rateSnapshot || 0), 0);
        updateData.amountTTC = amountHT * (1 + totalRate / 100);
    }

    const updated = await InvoiceModel.findByIdAndUpdate(data.id, updateData, { new: true })
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!updated) throw new Error("Failed to update invoice");
    return updated;
};

export const invoiceDelete = async (id: string, deletedBy: string): Promise<IInvoice> => {
    if (!id) throw new Error("Invoice ID is required");
    if (!deletedBy) throw new Error("Deleted by user ID is required");

    const invoice = await InvoiceModel.findByIdAndUpdate(
        id,
        { isActive: false, updatedAt: new Date(), updatedBy: new Types.ObjectId(deletedBy) },
        { new: true },
    )
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!invoice) throw new Error("Invoice not found");
    return invoice;
};

// Next situation number for a project. The counter lives on the project and is bumped atomically;
// it is seeded with the highest number already issued (including deleted invoices) so numbers are never reused.
export const invoiceNextSituationNumber = async (projectId: string): Promise<number> => {
    const existing = await InvoiceModel.find({ projectId, invoiceType: BillingTypeEnum.SITUATION }).select("invoiceNumber").lean();
    const maxIssued = existing.reduce((max, inv) => Math.max(max, parseInt(inv.invoiceNumber.match(/-SIT-(\d+)$/)?.[1] ?? "0", 10)), 0);

    const project = await ProjectModel.findByIdAndUpdate(
        projectId,
        [{ $set: { situationCounter: { $add: [{ $max: [{ $ifNull: ["$situationCounter", 0] }, maxIssued] }, 1] } } }],
        { new: true },
    )
        .select("situationCounter")
        .lean();
    if (!project?.situationCounter) throw new Error("Project not found");
    return project.situationCounter;
};
