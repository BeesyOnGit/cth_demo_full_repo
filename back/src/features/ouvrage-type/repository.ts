import { OuvrageTypeModel } from "./model";
import { IOuvrageType } from "./interface";
import { Types } from "mongoose";
import { EmployeePopulatePublicFields } from "../employee/interface";
import { StdQueryOptions } from "../../utils/interface";
import { PaginatedResult, paginateResponse } from "../../utils/response";

export type OuvrageTypeFilterParams = StdQueryOptions & Partial<any>;

export const ouvrageTypeFindAll = async (params: OuvrageTypeFilterParams = {}): Promise<PaginatedResult<IOuvrageType>> => {
    const { page, limit, noPag, ...rest } = params;
    const count = await OuvrageTypeModel.countDocuments({ isActive: true, ...rest });
    if (count === 0) {
        return paginateResponse({ payload: [] as any, total: 0, page: page!, limit: noPag ? count : limit! });
    }

    const ouvrageTypes = await OuvrageTypeModel.find({ isActive: true, ...rest })
        .sort({ createdAt: -1 })
        .skip(noPag ? 0 : page!)
        .limit(noPag ? 0 : limit!)
        .select(noPag ? "_id code label" : "")
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    return paginateResponse({ payload: ouvrageTypes, total: count, page: page!, limit: noPag ? count : limit! });
};

export const ouvrageTypeFindById = async (id: string): Promise<IOuvrageType | null> => {
    if (!id) throw new Error("OuvrageType ID is required");
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid OuvrageType ID");

    const ouvrageType = await OuvrageTypeModel.findById(id)
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!ouvrageType) throw new Error("OuvrageType not found");

    return ouvrageType;
};

export type CreateOuvrageTypeInput = {
    code: string;
    label: string;
    createdBy: string;
};

export const ouvrageTypeCreate = async (data: CreateOuvrageTypeInput): Promise<IOuvrageType> => {
    if (!data.code) throw new Error("Code is required");
    if (!data.label) throw new Error("Label is required");
    if (!data.createdBy) throw new Error("Created by user ID is required");

    const existingOuvrageType = await OuvrageTypeModel.findOne({ code: data.code });
    if (existingOuvrageType) throw new Error("OuvrageType with this code already exists");

    const ouvrageType = new OuvrageTypeModel({
        code: data.code,
        label: data.label,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
    });

    await ouvrageType.save();
    return ouvrageType.populate([
        { path: "createdBy", select: EmployeePopulatePublicFields },
        { path: "updatedBy", select: EmployeePopulatePublicFields },
    ]);
};

export type UpdateOuvrageTypeInput = {
    id: string;
    label?: string;
    updatedBy: string;
};

export const ouvrageTypeUpdate = async (data: UpdateOuvrageTypeInput): Promise<IOuvrageType> => {
    if (!data.id) throw new Error("OuvrageType ID is required");
    if (!Types.ObjectId.isValid(data.id)) throw new Error("Invalid OuvrageType ID");
    if (!data.updatedBy) throw new Error("Updated by user ID is required");

    const ouvrageType = await OuvrageTypeModel.findById(data.id);
    if (!ouvrageType) throw new Error("OuvrageType not found");

    const updateData: any = {
        updatedAt: new Date(),
        updatedBy: new Types.ObjectId(data.updatedBy),
    };

    if (data.label) updateData.label = data.label;

    const updatedOuvrageType = await OuvrageTypeModel.findByIdAndUpdate(data.id, updateData, { new: true })
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!updatedOuvrageType) throw new Error("Failed to update ouvrageType");

    return updatedOuvrageType;
};

export const ouvrageTypeDelete = async (id: string, deletedBy: string): Promise<IOuvrageType> => {
    if (!id) throw new Error("OuvrageType ID is required");
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid OuvrageType ID");
    if (!deletedBy) throw new Error("Deleted by user ID is required");

    const ouvrageType = await OuvrageTypeModel.findByIdAndUpdate(
        id,
        {
            isActive: false,
            updatedAt: new Date(),
            updatedBy: new Types.ObjectId(deletedBy),
        },
        { new: true },
    ).populate([
        { path: "createdBy", select: EmployeePopulatePublicFields },
        { path: "updatedBy", select: EmployeePopulatePublicFields },
    ]);

    if (!ouvrageType) throw new Error("OuvrageType not found");

    return ouvrageType;
};
