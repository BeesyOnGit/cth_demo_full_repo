import { ClientTypeModel } from "./model";
import { IClientType } from "./interface";
import { Types } from "mongoose";
import { EmployeePopulatePublicFields } from "../employee/interface";
import { StdQueryOptions } from "../../utils/interface";
import { PaginatedResult, paginateResponse } from "../../utils/response";

export type ClientTypeFilterParams = StdQueryOptions & Partial<any>;

export const clientTypeFindAll = async (params: ClientTypeFilterParams = {}): Promise<PaginatedResult<IClientType>> => {
    const { page, limit, noPag, ...rest } = params;
    const count = await ClientTypeModel.countDocuments({ isActive: true, ...rest });
    if (count === 0) {
        return paginateResponse({ payload: [] as any, total: 0, page: page!, limit: noPag ? count : limit! });
    }

    const clientTypes = await ClientTypeModel.find({ isActive: true, ...rest })
        .sort({ createdAt: -1 })
        .skip(noPag ? 0 : page!)
        .limit(noPag ? 0 : limit!)
        .select(noPag ? "_id code label" : "")
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    return paginateResponse({ payload: clientTypes, total: count, page: page!, limit: noPag ? count : limit! });
};

export const clientTypeFindById = async (id: string): Promise<IClientType | null> => {
    if (!id) throw new Error("ClientType ID is required");
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid ClientType ID");

    const clientType = await ClientTypeModel.findById(id)
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!clientType) throw new Error("ClientType not found");

    return clientType;
};

export type CreateClientTypeInput = {
    code: string;
    label: string;
    createdBy: string;
};

export const clientTypeCreate = async (data: CreateClientTypeInput): Promise<IClientType> => {
    if (!data.code) throw new Error("Code is required");
    if (!data.label) throw new Error("Label is required");
    if (!data.createdBy) throw new Error("Created by user ID is required");

    const existingClientType = await ClientTypeModel.findOne({ code: data.code });
    if (existingClientType) throw new Error("ClientType with this code already exists");

    const clientType = new ClientTypeModel({
        code: data.code,
        label: data.label,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
    });

    await clientType.save();
    return clientType.populate([
        { path: "createdBy", select: EmployeePopulatePublicFields },
        { path: "updatedBy", select: EmployeePopulatePublicFields },
    ]);
};

export type UpdateClientTypeInput = {
    id: string;
    label?: string;
    updatedBy: string;
};

export const clientTypeUpdate = async (data: UpdateClientTypeInput): Promise<IClientType> => {
    if (!data.id) throw new Error("ClientType ID is required");
    if (!Types.ObjectId.isValid(data.id)) throw new Error("Invalid ClientType ID");
    if (!data.updatedBy) throw new Error("Updated by user ID is required");

    const clientType = await ClientTypeModel.findById(data.id);
    if (!clientType) throw new Error("ClientType not found");

    const updateData: any = {
        updatedAt: new Date(),
        updatedBy: new Types.ObjectId(data.updatedBy),
    };

    if (data.label) updateData.label = data.label;

    const updatedClientType = await ClientTypeModel.findByIdAndUpdate(data.id, updateData, { new: true })
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!updatedClientType) throw new Error("Failed to update clientType");

    return updatedClientType;
};

export const clientTypeDelete = async (id: string, deletedBy: string): Promise<IClientType> => {
    if (!id) throw new Error("ClientType ID is required");
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid ClientType ID");
    if (!deletedBy) throw new Error("Deleted by user ID is required");

    const clientType = await ClientTypeModel.findByIdAndUpdate(
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

    if (!clientType) throw new Error("ClientType not found");

    return clientType;
};
