import { WilayaModel } from "./model";
import { IWilaya } from "./interface";
import { Types } from "mongoose";
import { EmployeePopulatePublicFields } from "../employee/interface";
import { config } from "../../config/index";
import { StdQueryOptions } from "../../utils/interface";
import { PaginatedResult, paginateResponse } from "../../utils/response";

export type WilayaFilterParams = StdQueryOptions & Partial<any>;

export const wilayaFindAll = async (params: WilayaFilterParams): Promise<PaginatedResult<IWilaya>> => {
    // const { pageginationDefaultLimit } = config;
    const { page, limit, noPag, ...rest } = params;
    const count = await WilayaModel.countDocuments({ isActive: true, ...rest });
    if (count === 0) {
        return paginateResponse({ payload: [] as any, total: 0, page: page!, limit: noPag ? count : limit! });
    }
    const wilayas = await WilayaModel.find({ isActive: true, ...rest })
        .sort({ createdAt: -1 })
        .select(noPag ? "_id code name createdAt" : "")
        .skip(noPag ? 0 : page!)
        .limit(noPag ? 0 : limit!)
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    return paginateResponse({ payload: wilayas, total: count, page: page!, limit: noPag ? count : limit! });
};

export const wilayaFindById = async (code: string): Promise<IWilaya | null> => {
    if (!code) throw new Error("Wilaya code is required");

    const wilaya = await WilayaModel.findOne({ code, isActive: true })
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!wilaya) throw new Error("Wilaya not found");

    return wilaya;
};

export type CreateWilayaInput = {
    code: string;
    name: string;
    createdBy: string;
};

export const wilayaCreate = async (data: CreateWilayaInput): Promise<IWilaya> => {
    if (!data.code) throw new Error("Code is required");
    if (!data.name) throw new Error("Name is required");
    if (!data.createdBy) throw new Error("Created by user ID is required");

    const existingWilaya = await WilayaModel.findOne({ code: data.code });
    if (existingWilaya) throw new Error("Wilaya with this code already exists");

    const wilaya = new WilayaModel({
        code: data.code,
        name: data.name,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
    });

    await wilaya.save();
    return wilaya.populate([
        { path: "createdBy", select: EmployeePopulatePublicFields },
        { path: "updatedBy", select: EmployeePopulatePublicFields },
    ]);
};

export type UpdateWilayaInput = {
    code: string;
    name?: string;
    updatedBy: string;
};

export const wilayaUpdate = async (data: UpdateWilayaInput): Promise<IWilaya> => {
    if (!data.code) throw new Error("Wilaya code is required");
    if (!data.updatedBy) throw new Error("Updated by user ID is required");

    const wilaya = await WilayaModel.findOne({ code: data.code });
    if (!wilaya) throw new Error("Wilaya not found");

    const updateData: any = {
        updatedAt: new Date(),
        updatedBy: new Types.ObjectId(data.updatedBy),
    };

    if (data.name) updateData.name = data.name;

    const updatedWilaya = await WilayaModel.findOneAndUpdate({ code: data.code }, updateData, { new: true }).populate([
        { path: "createdBy", select: EmployeePopulatePublicFields },
        { path: "updatedBy", select: EmployeePopulatePublicFields },
    ]);

    if (!updatedWilaya) throw new Error("Failed to update wilaya");

    return updatedWilaya;
};

export const wilayaDelete = async (code: string, deletedBy: string): Promise<IWilaya> => {
    if (!code) throw new Error("Wilaya code is required");
    if (!deletedBy) throw new Error("Deleted by user ID is required");

    const wilaya = await WilayaModel.findOneAndUpdate(
        { code },
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

    if (!wilaya) throw new Error("Wilaya not found");

    return wilaya;
};
