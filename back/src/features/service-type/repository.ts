import { ServiceTypeModel } from "./model";
import { IServiceType } from "./interface";
import { Types } from "mongoose";
import { EmployeePopulatePublicFields } from "../employee/interface";
import { StdQueryOptions } from "../../utils/interface";
import { PaginatedResult, paginateResponse } from "../../utils/response";

export type ServiceTypeFilterParams = StdQueryOptions & Partial<any>;

export const serviceTypeFindAll = async (params: ServiceTypeFilterParams = {}): Promise<PaginatedResult<IServiceType>> => {
    const { page, limit, noPag, ...rest } = params;
    const count = await ServiceTypeModel.countDocuments({ isActive: true, ...rest });
    if (count === 0) {
        return paginateResponse({ payload: [] as any, total: 0, page: page!, limit: noPag ? count : limit! });
    }

    const serviceTypes = await ServiceTypeModel.find({ isActive: true, ...rest })
        .sort({ createdAt: -1 })
        .skip(noPag ? 0 : page!)
        .limit(noPag ? 0 : limit!)
        .select(noPag ? "_id code label" : "")
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    return paginateResponse({ payload: serviceTypes, total: count, page: page!, limit: noPag ? count : limit! });
};

export const serviceTypeFindById = async (id: string): Promise<IServiceType | null> => {
    if (!id) throw new Error("ServiceType ID is required");
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid ServiceType ID");

    const serviceType = await ServiceTypeModel.findById(id)
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!serviceType) throw new Error("ServiceType not found");

    return serviceType;
};

export type CreateServiceTypeInput = {
    code: string;
    label: string;
    createdBy: string;
};

export const serviceTypeCreate = async (data: CreateServiceTypeInput): Promise<IServiceType> => {
    if (!data.code) throw new Error("Code is required");
    if (!data.label) throw new Error("Label is required");
    if (!data.createdBy) throw new Error("Created by user ID is required");

    const existingServiceType = await ServiceTypeModel.findOne({ code: data.code });
    if (existingServiceType) throw new Error("ServiceType with this code already exists");

    const serviceType = new ServiceTypeModel({
        code: data.code,
        label: data.label,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
    });

    await serviceType.save();
    return serviceType.populate([
        { path: "createdBy", select: EmployeePopulatePublicFields },
        { path: "updatedBy", select: EmployeePopulatePublicFields },
    ]);
};

export type UpdateServiceTypeInput = {
    id: string;
    label?: string;
    updatedBy: string;
};

export const serviceTypeUpdate = async (data: UpdateServiceTypeInput): Promise<IServiceType> => {
    if (!data.id) throw new Error("ServiceType ID is required");
    if (!Types.ObjectId.isValid(data.id)) throw new Error("Invalid ServiceType ID");
    if (!data.updatedBy) throw new Error("Updated by user ID is required");

    const serviceType = await ServiceTypeModel.findById(data.id);
    if (!serviceType) throw new Error("ServiceType not found");

    const updateData: any = {
        updatedAt: new Date(),
        updatedBy: new Types.ObjectId(data.updatedBy),
    };

    if (data.label) updateData.label = data.label;

    const updatedServiceType = await ServiceTypeModel.findByIdAndUpdate(data.id, updateData, { new: true })
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!updatedServiceType) throw new Error("Failed to update serviceType");

    return updatedServiceType;
};

export const serviceTypeDelete = async (id: string, deletedBy: string): Promise<IServiceType> => {
    if (!id) throw new Error("ServiceType ID is required");
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid ServiceType ID");
    if (!deletedBy) throw new Error("Deleted by user ID is required");

    const serviceType = await ServiceTypeModel.findByIdAndUpdate(
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

    if (!serviceType) throw new Error("ServiceType not found");

    return serviceType;
};
