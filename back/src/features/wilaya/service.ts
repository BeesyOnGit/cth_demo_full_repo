import * as wilayaRepo from "./repository";
import { IWilaya } from "./interface";
import { StdQueryOptions } from "../../utils/interface";
import { config } from "../../config/index";
import { PaginatedResult } from "../../utils/response";

export const findAllWilayas = async (params: StdQueryOptions): Promise<PaginatedResult<IWilaya>> => {
    const { pageginationDefaultLimit } = config;
    if (!params.limit) {
        params.limit = pageginationDefaultLimit;
    }
    if (!params.page) {
        params.page = 1;
    }
    params.page = (params.page - 1) * params.limit; // Adjust for zero-based indexing
    const wilayas = await wilayaRepo.wilayaFindAll(params);
    return wilayas;
};

export const findWilayaByCode = async (code: string): Promise<IWilaya> => {
    const wilaya = await wilayaRepo.wilayaFindById(code);
    return wilaya as IWilaya;
};

export const createWilaya = async (data: wilayaRepo.CreateWilayaInput): Promise<IWilaya> => {
    const wilaya = await wilayaRepo.wilayaCreate(data);
    return wilaya as IWilaya;
};

export const updateWilaya = async (data: wilayaRepo.UpdateWilayaInput): Promise<IWilaya> => {
    const wilaya = await wilayaRepo.wilayaUpdate(data);
    return wilaya as IWilaya;
};

export const deleteWilaya = async (code: string, deletedBy: string): Promise<IWilaya> => {
    const wilaya = await wilayaRepo.wilayaDelete(code, deletedBy);
    return wilaya as IWilaya;
};
