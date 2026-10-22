import * as antenneRepo from "./repository";
import { IAntenne } from "./interface";
import { StdQueryOptions } from "../../utils/interface";
import { config } from "../../config/index";
import { PaginatedResult } from "../../utils/response";
import { AntenneFilterParams } from "./repository";

export const findAllAntennes = async (params: StdQueryOptions): Promise<PaginatedResult<IAntenne>> => {
    const { pageginationDefaultLimit } = config;
    if (!params.limit) {
        params.limit = pageginationDefaultLimit;
    }
    if (!params.page) {
        params.page = 1;
    }
    params.page = (params.page - 1) * params.limit; // Adjust for zero-based indexing
    const antennes = await antenneRepo.antenneFindAll(params as AntenneFilterParams);
    return antennes;
};

export const findAntenneById = async (id: string): Promise<IAntenne> => {
    const antenne = await antenneRepo.antenneFindById(id);
    return antenne as IAntenne;
};

export const createAntenne = async (data: antenneRepo.CreateAntenneInput): Promise<IAntenne> => {
    const antenne = await antenneRepo.antenneCreate(data);
    return antenne as IAntenne;
};

export const updateAntenne = async (data: antenneRepo.UpdateAntenneInput): Promise<IAntenne> => {
    const antenne = await antenneRepo.antenneUpdate(data);
    return antenne as IAntenne;
};

export const deleteAntenne = async (id: string, deletedBy: string): Promise<IAntenne> => {
    const antenne = await antenneRepo.antenneDelete(id, deletedBy);
    return antenne as IAntenne;
};
