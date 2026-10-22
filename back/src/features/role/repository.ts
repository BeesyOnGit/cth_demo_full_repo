import { RoleModel } from "./model";
import { IRole } from "./interface";
import { Types } from "mongoose";
import { EmployeePopulatePublicFields } from "../employee/interface";
import { StdQueryOptions } from "../../utils/interface";
import { PaginatedResult, paginateResponse } from "../../utils/response";

export type RoleFilterParams = StdQueryOptions & Partial<any>;

export const roleFindAll = async (params: RoleFilterParams = {}): Promise<PaginatedResult<IRole>> => {
    const { page, limit, noPag, ...rest } = params;
    const count = await RoleModel.countDocuments({ isActive: true, ...rest });
    if (count === 0) {
        return paginateResponse({ payload: [] as any, total: 0, page: page!, limit: noPag ? count : limit! });
    }

    const roles = await RoleModel.find({ isActive: true, ...rest })
        .sort({ createdAt: -1 })
        .skip(noPag ? 0 : page!)
        .limit(noPag ? 0 : limit!)
        .select(noPag ? "_id code label" : "")
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    return paginateResponse({ payload: roles, total: count, page: page!, limit: noPag ? count : limit! });
};

export const roleFindById = async (id: string): Promise<IRole | null> => {
    if (!id) throw new Error("Role ID is required");
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid Role ID");

    const role = await RoleModel.findById(id)
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!role) throw new Error("Role not found");

    return role;
};

export type CreateRoleInput = {
    code: string;
    label: string;
    permissions?: string[];
    createdBy: string;
};

export const roleCreate = async (data: CreateRoleInput): Promise<IRole> => {
    if (!data.code) throw new Error("Code is required");
    if (!data.label) throw new Error("Label is required");
    if (!data.createdBy) throw new Error("Created by user ID is required");

    const existingRole = await RoleModel.findOne({ code: data.code });
    if (existingRole) throw new Error("Role with this code already exists");

    const role = new RoleModel({
        code: data.code,
        label: data.label,
        permissions: data.permissions,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
    });

    await role.save();
    return role.populate([
        { path: "createdBy", select: EmployeePopulatePublicFields },
        { path: "updatedBy", select: EmployeePopulatePublicFields },
    ]);
};

export type UpdateRoleInput = {
    id: string;
    label?: string;
    permissions?: string[];
    updatedBy: string;
};

export const roleUpdate = async (data: UpdateRoleInput): Promise<IRole> => {
    if (!data.id) throw new Error("Role ID is required");
    if (!Types.ObjectId.isValid(data.id)) throw new Error("Invalid Role ID");
    if (!data.updatedBy) throw new Error("Updated by user ID is required");

    const role = await RoleModel.findById(data.id);
    if (!role) throw new Error("Role not found");

    const updateData: any = {
        updatedAt: new Date(),
        updatedBy: new Types.ObjectId(data.updatedBy),
    };

    if (data.label) updateData.label = data.label;
    if (data.permissions !== undefined) updateData.permissions = data.permissions;

    const updatedRole = await RoleModel.findByIdAndUpdate(data.id, updateData, { new: true })
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!updatedRole) throw new Error("Failed to update role");

    return updatedRole;
};

export const roleDelete = async (id: string, deletedBy: string): Promise<IRole> => {
    if (!id) throw new Error("Role ID is required");
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid Role ID");
    if (!deletedBy) throw new Error("Deleted by user ID is required");

    const role = await RoleModel.findByIdAndUpdate(
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

    if (!role) throw new Error("Role not found");

    return role;
};
