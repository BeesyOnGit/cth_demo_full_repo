import * as drRepo from "./repository";
import { IDr } from "./interface";
import { StdQueryOptions } from "../../utils/interface";
import { config } from "../../config/index";
import { PaginatedResult } from "../../utils/response";

export const findAllDrs = async (params: StdQueryOptions): Promise<PaginatedResult<IDr>> => {
    const { pageginationDefaultLimit } = config;
    if (!params.limit) {
        params.limit = pageginationDefaultLimit;
    }
    if (!params.page) {
        params.page = 1;
    }
    params.page = (params.page - 1) * params.limit; // Adjust for zero-based indexing
    const drs = await drRepo.drFindAll(params as any);
    return drs;
};

export const findDrById = async (id: string): Promise<IDr> => {
    const dr = await drRepo.drFindById(id);
    return dr as IDr;
};

export const createDr = async (data: drRepo.CreateDrInput): Promise<IDr> => {
    const dr = await drRepo.drCreate(data);
    return dr as IDr;
};

export const updateDr = async (data: drRepo.UpdateDrInput): Promise<IDr> => {
    const dr = await drRepo.drUpdate(data);
    return dr as IDr;
};

export const deleteDr = async (id: string, deletedBy: string): Promise<IDr> => {
    const dr = await drRepo.drDelete(id, deletedBy);
    return dr as IDr;
};
