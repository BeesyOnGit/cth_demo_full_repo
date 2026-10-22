import * as clientRepo from "./repository";
import { IClient } from "./interface";
import { StdQueryOptions } from "../../utils/interface";
import { config } from "../../config/index";
import { PaginatedResult } from "../../utils/response";

export const findAllClients = async (params: StdQueryOptions): Promise<PaginatedResult<IClient>> => {
    const { pageginationDefaultLimit } = config;
    if (!params.limit) params.limit = pageginationDefaultLimit;
    if (!params.page) params.page = 1;
    params.page = (params.page - 1) * params.limit;
    return clientRepo.clientFindAll(params as any);
};

export const findClientById = async (id: string): Promise<IClient> => {
    const c = await clientRepo.clientFindById(id);
    return c as IClient;
};

export const createClient = async (data: any): Promise<IClient> => {
    return clientRepo.clientCreate(data as any) as Promise<IClient>;
};

export const updateClient = async (data: any): Promise<IClient> => {
    return clientRepo.clientUpdate(data as any) as Promise<IClient>;
};

export const deleteClient = async (id: string, deletedBy: string): Promise<IClient> => {
    return clientRepo.clientDelete(id, deletedBy) as Promise<IClient>;
};
