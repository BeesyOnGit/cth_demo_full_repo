import { ObjectiveModel } from "./model";
import { IObjective, GeneralObjectiveType } from "./interface";
import { Types } from "mongoose";
import { EmployeePopulatePublicFields } from "../employee/interface";
import { PaginatedResult, paginateResponse } from "../../utils/response";
import { DrGeneralPopulateFields } from "../dr/interface";
import { AntenneGeneralPopulateFields } from "../antenne/interface";

export const objectiveFindAll = async (params: Partial<GeneralObjectiveType> = {}): Promise<PaginatedResult<IObjective>> => {
    const { page, limit, noPag, ...rest } = params as any;
    const count = await ObjectiveModel.countDocuments({ isActive: true, ...rest });
    if (count === 0) return paginateResponse({ payload: [] as any, total: 0, page: page!, limit: noPag ? count : limit! });

    const objectives = await ObjectiveModel.find({ isActive: true, ...rest })
        .sort({ createdAt: -1 })
        .skip(noPag ? 0 : page!)
        .limit(noPag ? 0 : limit!)
        .select("-updatedAt -updatedBy -__v ")
        .populate({ path: "drId", select: DrGeneralPopulateFields })
        .populate({ path: "antenneId", select: AntenneGeneralPopulateFields })
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .sort({ year: -1, month: -1 });

    return paginateResponse({ payload: objectives, total: count, page: page!, limit: noPag ? count : limit! });
};

export const objectiveFindById = async (id: string): Promise<IObjective | null> => {
    if (!id) throw new Error("Objective ID is required");
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid Objective ID");

    const objective = await ObjectiveModel.findById(id)
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields })
        .populate({ path: "drId", select: DrGeneralPopulateFields })
        .populate({ path: "antenneId", select: AntenneGeneralPopulateFields });

    if (!objective) throw new Error("Objective not found");
    return objective;
};

export const objectiveCreate = async (data: any): Promise<IObjective> => {
    const objective = new ObjectiveModel({ ...data, createdBy: data.createdBy, updatedBy: data.createdBy });
    await objective.save();
    return objective.populate([
        { path: "createdBy", select: EmployeePopulatePublicFields },
        { path: "updatedBy", select: EmployeePopulatePublicFields },
        { path: "drId", select: DrGeneralPopulateFields },
        { path: "antenneId", select: AntenneGeneralPopulateFields },
    ]);
};

export const objectiveUpdate = async (data: any): Promise<IObjective> => {
    if (!data.id) throw new Error("Objective ID is required");
    const updated = await ObjectiveModel.findByIdAndUpdate(data.id, { ...data, updatedAt: new Date() }, { new: true })
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields })
        .populate({ path: "drId", select: DrGeneralPopulateFields })
        .populate({ path: "antenneId", select: AntenneGeneralPopulateFields });
    if (!updated) throw new Error("Failed to update objective");
    return updated;
};

export const objectiveDelete = async (id: string, deletedBy: string): Promise<IObjective> => {
    if (!id) throw new Error("Objective ID is required");
    if (!deletedBy) throw new Error("Deleted by user ID is required");

    const objective = await ObjectiveModel.findByIdAndUpdate(
        id,
        { isActive: false, updatedAt: new Date(), updatedBy: new Types.ObjectId(deletedBy) },
        { new: true },
    )
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields })
        .populate({ path: "drId", select: DrGeneralPopulateFields })
        .populate({ path: "antenneId", select: AntenneGeneralPopulateFields });

    if (!objective) throw new Error("Objective not found");
    return objective;
};
