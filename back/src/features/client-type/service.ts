import * as clientTypeRepo from "./repository";
import { IClientType } from "./interface";
import { ClientTypeFilterParams } from "./repository";
import { StdQueryOptions } from "../../utils/interface";
import { config } from "../../config/index";
import { PaginatedResult } from "../../utils/response";

export const findAllClientTypes = async (params: StdQueryOptions): Promise<PaginatedResult<IClientType>> => {
    const { pageginationDefaultLimit } = config;
    if (!params.limit) {
        params.limit = pageginationDefaultLimit;
    }
    if (!params.page) {
        params.page = 1;
    }
    params.page = (params.page - 1) * params.limit; // Adjust for zero-based indexing
    const clientTypes = await clientTypeRepo.clientTypeFindAll(params as ClientTypeFilterParams);
    return clientTypes;
};

export const findClientTypeById = async (id: string): Promise<IClientType> => {
    const clientType = await clientTypeRepo.clientTypeFindById(id);
    return clientType as IClientType;
};

export const createClientType = async (data: clientTypeRepo.CreateClientTypeInput): Promise<IClientType> => {
    const clientType = await clientTypeRepo.clientTypeCreate(data);
    return clientType as IClientType;
};

export const updateClientType = async (data: clientTypeRepo.UpdateClientTypeInput): Promise<IClientType> => {
    const clientType = await clientTypeRepo.clientTypeUpdate(data);
    return clientType as IClientType;
};

export const deleteClientType = async (id: string, deletedBy: string): Promise<IClientType> => {
    const clientType = await clientTypeRepo.clientTypeDelete(id, deletedBy);
    return clientType as IClientType;
};
