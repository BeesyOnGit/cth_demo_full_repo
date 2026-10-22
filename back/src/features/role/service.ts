import * as roleRepo from "./repository";
import { IRole } from "./interface";
import { RoleFilterParams } from "./repository";
import { StdQueryOptions } from "../../utils/interface";
import { config } from "../../config/index";
import { PaginatedResult } from "../../utils/response";

export const findAllRoles = async (params: StdQueryOptions): Promise<PaginatedResult<IRole>> => {
    const { pageginationDefaultLimit } = config;
    if (!params.limit) {
        params.limit = pageginationDefaultLimit;
    }
    if (!params.page) {
        params.page = 1;
    }
    params.page = (params.page - 1) * params.limit; // Adjust for zero-based indexing
    const roles = await roleRepo.roleFindAll(params as RoleFilterParams);
    return roles;
};

export const findRoleById = async (id: string): Promise<IRole> => {
    const role = await roleRepo.roleFindById(id);
    return role as IRole;
};

export const createRole = async (data: roleRepo.CreateRoleInput): Promise<IRole> => {
    const role = await roleRepo.roleCreate(data);
    return role as IRole;
};

export const updateRole = async (data: roleRepo.UpdateRoleInput): Promise<IRole> => {
    const role = await roleRepo.roleUpdate(data);
    return role as IRole;
};

export const deleteRole = async (id: string, deletedBy: string): Promise<IRole> => {
    const role = await roleRepo.roleDelete(id, deletedBy);
    return role as IRole;
};
