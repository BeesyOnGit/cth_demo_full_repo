import { DrModel } from "./model";
import { IDr } from "./interface";
import { Types } from "mongoose";
import { EmployeePopulatePublicFields } from "..//employee/interface";
import { StdQueryOptions } from "../../utils/interface";
import { PaginatedResult, paginateResponse } from "../../utils/response";

export type DrFilterParams = StdQueryOptions & Partial<any>;

export const drFindAll = async (params: DrFilterParams = {}): Promise<PaginatedResult<IDr>> => {
    const { page, limit, noPag, ...rest } = params;
    const count = await DrModel.countDocuments({ isActive: true, ...rest });
    if (count === 0) {
        return paginateResponse({ payload: [] as any, total: 0, page: page!, limit: noPag ? count : limit! });
    }

    const drs = await DrModel.find({ isActive: true, ...rest })
        .sort({ createdAt: -1 })
        .skip(noPag ? 0 : page!)
        .limit(noPag ? 0 : limit!)
        .select(noPag ? "_id code name" : "")
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    return paginateResponse({ payload: drs, total: count, page: page!, limit: noPag ? count : limit! });
};

export const drFindById = async (id: string): Promise<IDr | null> => {
    if (!id) throw new Error("DR ID is required");
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid DR ID");

    const dr = await DrModel.findById(id)
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!dr) throw new Error("DR not found");

    return dr;
};

export type CreateDrInput = {
    code: "DRC" | "DRG" | "DRA" | "DRS" | "DRO" | "DRT";
    name: string;
    bankName: string;
    accountNumber: string;
    createdBy: string;
};

export const drCreate = async (data: CreateDrInput): Promise<IDr> => {
    if (!data.code) throw new Error("Code is required");
    if (!data.name) throw new Error("Name is required");
    if (!data.bankName) throw new Error("Bank name is required");
    if (!data.accountNumber) throw new Error("Account number is required");
    if (!data.createdBy) throw new Error("Created by user ID is required");

    const existingDr = await DrModel.findOne({ code: data.code });
    if (existingDr) throw new Error("DR with this code already exists");

    const dr = new DrModel({
        code: data.code,
        name: data.name,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
    });

    await dr.save();
    return dr.populate([
        { path: "createdBy", select: EmployeePopulatePublicFields },
        { path: "updatedBy", select: EmployeePopulatePublicFields },
    ]);
};

export type UpdateDrInput = {
    id: string;
    name?: string;
    bankName?: string;
    accountNumber?: string;
    updatedBy: string;
};

export const drUpdate = async (data: UpdateDrInput): Promise<IDr> => {
    if (!data.id) throw new Error("DR ID is required");
    if (!Types.ObjectId.isValid(data.id)) throw new Error("Invalid DR ID");
    if (!data.updatedBy) throw new Error("Updated by user ID is required");

    const dr = await DrModel.findById(data.id);
    if (!dr) throw new Error("DR not found");

    const updateData: any = {
        updatedAt: new Date(),
        updatedBy: new Types.ObjectId(data.updatedBy),
    };

    if (data.name) updateData.name = data.name;
    if (data.bankName) updateData.bankName = data.bankName;
    if (data.accountNumber) updateData.accountNumber = data.accountNumber;

    const updatedDr = await DrModel.findByIdAndUpdate(data.id, updateData, { new: true })
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!updatedDr) throw new Error("Failed to update DR");

    return updatedDr;
};

export const drDelete = async (id: string, deletedBy: string): Promise<IDr> => {
    if (!id) throw new Error("DR ID is required");
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid DR ID");
    if (!deletedBy) throw new Error("Deleted by user ID is required");

    const dr = await DrModel.findByIdAndUpdate(
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

    if (!dr) throw new Error("DR not found");

    return dr;
};
