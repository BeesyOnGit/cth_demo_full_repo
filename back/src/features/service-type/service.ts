import * as serviceTypeRepo from "./repository";
import { IServiceType } from "./interface";
import { ServiceTypeFilterParams } from "./repository";
import { StdQueryOptions } from "../../utils/interface";
import { config } from "../../config/index";
import { PaginatedResult } from "../../utils/response";

export const findAllServiceTypes = async (params: StdQueryOptions): Promise<PaginatedResult<IServiceType>> => {
    const { pageginationDefaultLimit } = config;
    if (!params.limit) {
        params.limit = pageginationDefaultLimit;
    }
    if (!params.page) {
        params.page = 1;
    }
    params.page = (params.page - 1) * params.limit; // Adjust for zero-based indexing
    const serviceTypes = await serviceTypeRepo.serviceTypeFindAll(params as ServiceTypeFilterParams);
    return serviceTypes;
};

export const findServiceTypeById = async (id: string): Promise<IServiceType> => {
    const serviceType = await serviceTypeRepo.serviceTypeFindById(id);
    return serviceType as IServiceType;
};

export const createServiceType = async (data: serviceTypeRepo.CreateServiceTypeInput): Promise<IServiceType> => {
    const serviceType = await serviceTypeRepo.serviceTypeCreate(data);
    return serviceType as IServiceType;
};

export const updateServiceType = async (data: serviceTypeRepo.UpdateServiceTypeInput): Promise<IServiceType> => {
    const serviceType = await serviceTypeRepo.serviceTypeUpdate(data);
    return serviceType as IServiceType;
};

export const deleteServiceType = async (id: string, deletedBy: string): Promise<IServiceType> => {
    const serviceType = await serviceTypeRepo.serviceTypeDelete(id, deletedBy);
    return serviceType as IServiceType;
};
