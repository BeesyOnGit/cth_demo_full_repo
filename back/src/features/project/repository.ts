import { ProjectModel } from "./model";
import { IProject, GeneralProjectType, ProjectPopulatePublicFields } from "./interface";
import { Types } from "mongoose";
import { EmployeePopulatePublicFields } from "../employee/interface";
import { StdQueryOptions } from "../../utils/interface";
import { PaginatedResult, paginateResponse } from "../../utils/response";
import { DrGeneralPopulateFields } from "../../features/dr/interface";
import { AntenneGeneralPopulateFields } from "../../features/antenne/interface";
import { ClientGeneralPopulateFields } from "../../features/client/interface";

export type ProjectFilterParams = StdQueryOptions & Partial<any>;

export const projectFindAll = async (params: ProjectFilterParams = {}): Promise<PaginatedResult<IProject>> => {
    const { page, limit, noPag, ...rest } = params as any;
    const count = await ProjectModel.countDocuments({ isActive: true, isAvenant: false, ...rest });
    if (count === 0) {
        return paginateResponse({ payload: [] as any, total: 0, page: page!, limit: noPag ? count : limit! });
    }

    const projects = await ProjectModel.find({ isActive: true, isAvenant: false, ...rest })
        .sort({ createdAt: -1 })
        .skip(noPag ? 0 : page!)
        .limit(noPag ? 0 : limit!)
        .select("-garantee -createdBy -updatedBy -editHistory -projectManagersSnapshot -ouvrageTypeId -serviceTypeId ")
        .populate({ path: "drId", select: DrGeneralPopulateFields })
        .populate({ path: "antenneId", select: AntenneGeneralPopulateFields })
        .populate({ path: "projectManagerIds", select: EmployeePopulatePublicFields })
        .populate({ path: "clientId", select: ClientGeneralPopulateFields })
        .populate({ path: "parentProjectId", select: ProjectPopulatePublicFields });

    return paginateResponse({ payload: projects, total: count, page: page!, limit: noPag ? count : limit! });
};

export const projectFindById = async (id: string): Promise<IProject | null> => {
    if (!id) throw new Error("Project ID is required");
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid Project ID");

    const project = await ProjectModel.findById(id)
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields })
        .populate({ path: "drId", select: DrGeneralPopulateFields })
        .populate({ path: "antenneId", select: AntenneGeneralPopulateFields });

    if (!project) throw new Error("Project not found");
    return project;
};

export const projectCreate = async (data: Partial<GeneralProjectType>): Promise<IProject> => {
    const project = new ProjectModel({ ...data, createdBy: data.createdBy, updatedBy: data.createdBy });
    await project.save();
    return project.populate([
        { path: "createdBy", select: EmployeePopulatePublicFields },
        { path: "updatedBy", select: EmployeePopulatePublicFields },
    ]);
};

export const projectUpdate = async (data: Partial<GeneralProjectType> & { id: string }): Promise<IProject> => {
    if (!data.id) throw new Error("Project ID is required");
    const updated = await ProjectModel.findByIdAndUpdate(data.id, { ...data, updatedAt: new Date() }, { new: true })
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });
    if (!updated) throw new Error("Failed to update project");
    return updated;
};

export const projectDelete = async (id: string, deletedBy: string): Promise<IProject> => {
    if (!id) throw new Error("Project ID is required");
    if (!deletedBy) throw new Error("Deleted by user ID is required");

    const project = await ProjectModel.findByIdAndUpdate(
        id,
        { isActive: false, updatedAt: new Date(), updatedBy: new Types.ObjectId(deletedBy) },
        { new: true },
    )
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!project) throw new Error("Project not found");
    return project;
};

export const findFullProjectById = async (id: string): Promise<IProject | null> => {
    if (!id) throw new Error("Project ID is required");
    try {
        const project = await ProjectModel.findById(id)
            .populate({ path: "drId", select: DrGeneralPopulateFields })
            .populate({ path: "antenneId", select: AntenneGeneralPopulateFields })
            .populate({ path: "projectManagerIds", select: EmployeePopulatePublicFields })
            .populate({ path: "clientId", select: "name identifier financials addresses" })
            .populate({ path: "parentProjectId", select: ProjectPopulatePublicFields })
            .populate({ path: "ouvrageTypeId", select: "code label" })
            .populate({ path: "serviceTypeId", select: "code label" })
            .populate({
                path: "clientId.addresses.wilayaCode",
                localField: "clientId.addresses.wilayaCode",
                foreignField: "code",
                select: "code name",
            })
            .populate({ path: "clientId.addresses.communeCode", select: "communeLt name" });

        return project;
    } catch (error) {
        throw new Error("Invalid Project ID");
    }
};
