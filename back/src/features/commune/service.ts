import * as communeRepo from "./repository";
import { ICommune } from "./interface";
import { CommuneFilterParams } from "./repository";
import { StdQueryOptions } from "../../utils/interface";
import { config } from "../../config/index";
import { PaginatedResult } from "../../utils/response";

export const findAllCommunes = async (params: StdQueryOptions): Promise<PaginatedResult<ICommune>> => {
    const { pageginationDefaultLimit } = config;
    if (!params.limit) {
        params.limit = pageginationDefaultLimit;
    }
    if (!params.page) {
        params.page = 1;
    }
    params.page = (params.page - 1) * params.limit; // Adjust for zero-based indexing
    const communes = await communeRepo.communeFindAll(params as CommuneFilterParams);
    return communes;
};

export const findCommuneById = async (id: string): Promise<ICommune> => {
    const commune = await communeRepo.communeFindById(id);
    return commune as ICommune;
};

export const findCommuneByPostCode = async (postCode: string): Promise<ICommune> => {
    const commune = await communeRepo.communeFindByPostCode(postCode);
    return commune as ICommune;
};

export const findCommunesByWilayaId = async (wilayaId: string): Promise<ICommune[]> => {
    const communes = await communeRepo.communeFindByWilayaId(wilayaId);
    return communes;
};

export const createCommune = async (data: communeRepo.CreateCommuneInput): Promise<ICommune> => {
    const commune = await communeRepo.communeCreate(data);
    return commune as ICommune;
};

export const updateCommune = async (data: communeRepo.UpdateCommuneInput): Promise<ICommune> => {
    const commune = await communeRepo.communeUpdate(data);
    return commune as ICommune;
};

export const deleteCommune = async (id: string, deletedBy: string): Promise<ICommune> => {
    const commune = await communeRepo.communeDelete(id, deletedBy);
    return commune as ICommune;
};
