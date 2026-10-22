import * as vatRepo from "./repository";
import { IVatRate } from "./interface";
import { StdQueryOptions } from "../../utils/interface";
import { config } from "../../config/index";
import { PaginatedResult } from "../../utils/response";

export const findAllVatRates = async (params: StdQueryOptions): Promise<PaginatedResult<IVatRate>> => {
    const { pageginationDefaultLimit } = config;
    if (!params.limit) params.limit = pageginationDefaultLimit;
    if (!params.page) params.page = 1;
    params.page = (params.page - 1) * params.limit;
    return vatRepo.vatRateFindAll(params as any);
};

export const findVatRateById = async (id: string): Promise<IVatRate> => {
    const v = await vatRepo.vatRateFindById(id);
    return v as IVatRate;
};

export const createVatRate = async (data: any): Promise<IVatRate> => {
    return vatRepo.vatRateCreate(data as any) as Promise<IVatRate>;
};

export const updateVatRate = async (data: any): Promise<IVatRate> => {
    return vatRepo.vatRateUpdate(data as any) as Promise<IVatRate>;
};

export const deleteVatRate = async (id: string, deletedBy: string): Promise<IVatRate> => {
    return vatRepo.vatRateDelete(id, deletedBy) as Promise<IVatRate>;
};
