import { ClientModel } from "./model";
import { IClient, GeneralClientType, ClientGeneralPopulateFields } from "./interface";
import { Types } from "mongoose";
import { EmployeePopulatePublicFields } from "../employee/interface";
import { PaginatedResult, paginateResponse } from "../../utils/response";
import { DrGeneralPopulateFields } from "../dr/interface";
import { AntenneGeneralPopulateFields } from "../antenne/interface";

export const clientFindAll = async (params: Partial<GeneralClientType> = {}): Promise<PaginatedResult<IClient>> => {
    const { page, limit, noPag, ...rest } = params as any;
    const count = await ClientModel.countDocuments({ isActive: true, ...rest });
    if (count === 0) return paginateResponse({ payload: [] as any, total: 0, page: page!, limit: noPag ? count : limit! });

    const clients = await ClientModel.find({ isActive: true, ...rest })
        .sort({ createdAt: -1 })
        .skip(noPag ? 0 : page!)
        .limit(noPag ? 0 : limit!)
        .select("-updatedAt -updatedBy -createdBy -__v ")
        // .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        // .populate({ path: "updatedBy", select: EmployeePopulatePublicFields })
        .populate({ path: "wilayaCodes", localField: "wilayaCodes", foreignField: "code", select: "code name" })
        .populate({ path: "communeCodes", select: "communeLt" })
        .populate({ path: "clientTypeId", select: "label code" })
        .populate({ path: "drId", select: DrGeneralPopulateFields })
        .populate({ path: "antenneId", select: AntenneGeneralPopulateFields });

    return paginateResponse({ payload: clients, total: count, page: page!, limit: noPag ? count : limit! });
};

export const clientFindById = async (id: string): Promise<IClient | null> => {
    if (!id) throw new Error("Client ID is required");
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid Client ID");

    const client = await ClientModel.findById(id)
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!client) throw new Error("Client not found");
    return client;
};

export const clientCreate = async (data: any): Promise<IClient> => {
    const client = new ClientModel({ ...data, createdBy: data.createdBy, updatedBy: data.createdBy });
    await client.save();
    return client.populate([
        { path: "createdBy", select: EmployeePopulatePublicFields },
        { path: "updatedBy", select: EmployeePopulatePublicFields },
        { path: "wilayaCodes", localField: "wilayaCodes", foreignField: "code", select: "code name" },
    ]);
};

export const clientUpdate = async (data: any): Promise<IClient> => {
    if (!data.id) throw new Error("Client ID is required");
    const updated = await ClientModel.findByIdAndUpdate(data.id, { ...data, updatedAt: new Date() }, { new: true })
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });
    if (!updated) throw new Error("Failed to update client");
    return updated;
};

export const clientDelete = async (id: string, deletedBy: string): Promise<IClient> => {
    if (!id) throw new Error("Client ID is required");
    if (!deletedBy) throw new Error("Deleted by user ID is required");

    const client = await ClientModel.findByIdAndUpdate(
        id,
        { isActive: false, updatedAt: new Date(), updatedBy: new Types.ObjectId(deletedBy) },
        { new: true },
    )
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!client) throw new Error("Client not found");
    return client;
};
