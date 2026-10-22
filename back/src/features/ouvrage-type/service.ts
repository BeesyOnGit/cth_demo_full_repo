import * as ouvrageTypeRepo from "./repository";
import { IOuvrageType } from "./interface";
import { OuvrageTypeFilterParams } from "./repository";
import { StdQueryOptions } from "../../utils/interface";
import { config } from "../../config/index";
import { PaginatedResult } from "../../utils/response";

export const findAllOuvrageTypes = async (params: StdQueryOptions): Promise<PaginatedResult<IOuvrageType>> => {
    const { pageginationDefaultLimit } = config;
    if (!params.limit) {
        params.limit = pageginationDefaultLimit;
    }
    if (!params.page) {
        params.page = 1;
    }
    params.page = (params.page - 1) * params.limit; // Adjust for zero-based indexing
    const ouvrageTypes = await ouvrageTypeRepo.ouvrageTypeFindAll(params as OuvrageTypeFilterParams);
    return ouvrageTypes;
};

export const findOuvrageTypeById = async (id: string): Promise<IOuvrageType> => {
    const ouvrageType = await ouvrageTypeRepo.ouvrageTypeFindById(id);
    return ouvrageType as IOuvrageType;
};

export const createOuvrageType = async (data: ouvrageTypeRepo.CreateOuvrageTypeInput): Promise<IOuvrageType> => {
    const ouvrageType = await ouvrageTypeRepo.ouvrageTypeCreate(data);
    return ouvrageType as IOuvrageType;
};

export const updateOuvrageType = async (data: ouvrageTypeRepo.UpdateOuvrageTypeInput): Promise<IOuvrageType> => {
    const ouvrageType = await ouvrageTypeRepo.ouvrageTypeUpdate(data);
    return ouvrageType as IOuvrageType;
};

export const deleteOuvrageType = async (id: string, deletedBy: string): Promise<IOuvrageType> => {
    const ouvrageType = await ouvrageTypeRepo.ouvrageTypeDelete(id, deletedBy);
    return ouvrageType as IOuvrageType;
};
