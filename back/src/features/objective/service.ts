import * as objectiveRepo from "./repository";
import { IObjective } from "./interface";
import { StdQueryOptions } from "../../utils/interface";
import { config } from "../../config/index";
import { PaginatedResult } from "../../utils/response";

export const findAllObjectives = async (params: StdQueryOptions): Promise<PaginatedResult<IObjective>> => {
    const { pageginationDefaultLimit } = config;
    if (!params.limit) params.limit = pageginationDefaultLimit;
    if (!params.page) params.page = 1;
    params.page = (params.page - 1) * params.limit;
    return objectiveRepo.objectiveFindAll(params as any);
};

export const findObjectiveById = async (id: string): Promise<IObjective> => {
    const objective = await objectiveRepo.objectiveFindById(id);
    return objective as IObjective;
};

export const createObjective = async (data: any): Promise<IObjective> => {
    return objectiveRepo.objectiveCreate(data as any) as Promise<IObjective>;
};

export const updateObjective = async (data: any): Promise<IObjective> => {
    return objectiveRepo.objectiveUpdate(data as any) as Promise<IObjective>;
};

export const deleteObjective = async (id: string, deletedBy: string): Promise<IObjective> => {
    return objectiveRepo.objectiveDelete(id, deletedBy) as Promise<IObjective>;
};
