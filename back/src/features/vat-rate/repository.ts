import { VatRateModel } from "./model";
import { IVatRate } from "./interface";
import { Types } from "mongoose";
import { EmployeePopulatePublicFields } from "../employee/interface";
import { StdQueryOptions } from "../../utils/interface";
import { PaginatedResult, paginateResponse } from "../../utils/response";

export type VatRateFilterParams = StdQueryOptions & Partial<any>;

export const vatRateFindAll = async (params: VatRateFilterParams = {}): Promise<PaginatedResult<IVatRate>> => {
    const { page, limit, noPag, ...rest } = params as any;
    const count = await VatRateModel.countDocuments({ isActive: true, ...rest });
    if (count === 0) return paginateResponse({ payload: [] as any, total: 0, page: page!, limit: noPag ? count : limit! });

    const rates = await VatRateModel.find({ isActive: true, ...rest })
        .sort({ createdAt: -1 })
        .skip(noPag ? 0 : page!)
        .limit(noPag ? 0 : limit!)
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    return paginateResponse({ payload: rates, total: count, page: page!, limit: noPag ? count : limit! });
};

export const vatRateFindById = async (id: string): Promise<IVatRate | null> => {
    if (!id) throw new Error("VAT rate ID is required");
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid VAT rate ID");

    const rate = await VatRateModel.findById(id)
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!rate) throw new Error("VAT rate not found");
    return rate;
};

export const vatRateCreate = async (data: any): Promise<IVatRate> => {
    const rate = new VatRateModel({ ...data, createdBy: data.createdBy, updatedBy: data.createdBy });
    await rate.save();
    return rate.populate([
        { path: "createdBy", select: EmployeePopulatePublicFields },
        { path: "updatedBy", select: EmployeePopulatePublicFields },
    ]);
};

export const vatRateUpdate = async (data: any): Promise<IVatRate> => {
    if (!data.id) throw new Error("VAT rate ID is required");
    const updated = await VatRateModel.findByIdAndUpdate(data.id, { ...data, updatedAt: new Date() }, { new: true })
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });
    if (!updated) throw new Error("Failed to update VAT rate");
    return updated;
};

export const vatRateDelete = async (id: string, deletedBy: string): Promise<IVatRate> => {
    if (!id) throw new Error("VAT rate ID is required");
    if (!deletedBy) throw new Error("Deleted by user ID is required");

    const rate = await VatRateModel.findByIdAndUpdate(
        id,
        { isActive: false, updatedAt: new Date(), updatedBy: new Types.ObjectId(deletedBy) },
        { new: true },
    )
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!rate) throw new Error("VAT rate not found");
    return rate;
};
