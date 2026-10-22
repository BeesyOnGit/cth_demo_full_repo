import { CommuneModel } from "./model";
import { ICommune } from "./interface";
import { Types } from "mongoose";
import { EmployeePopulatePublicFields } from "../employee/interface";
import { StdQueryOptions } from "../../utils/interface";
import { PaginatedResult, paginateResponse } from "../../utils/response";

export type CommuneFilterParams = StdQueryOptions & Partial<any>;

export const communeFindAll = async (params: CommuneFilterParams = {}): Promise<PaginatedResult<ICommune>> => {
    const { page, limit, noPag, ...rest } = params;
    const count = await CommuneModel.countDocuments({ isActive: true, ...rest });
    if (count === 0) {
        return paginateResponse({ payload: [] as any, total: 0, page: page!, limit: noPag ? count : limit! });
    }

    const communes = await CommuneModel.find({ isActive: true, ...rest })
        .sort({ createdAt: -1 })
        .skip(noPag ? 0 : page!)
        .limit(noPag ? 0 : limit!)
        .select(noPag ? "_id communeLt communeAr dairaLt dairaAr wilayaCode" : "")
        .populate({ path: "wilayaCode", localField: "wilayaCode", foreignField: "code", select: "code name" });
    return paginateResponse({ payload: communes, total: count, page: page!, limit: noPag ? count : limit! });
};

export const communeFindById = async (id: string): Promise<ICommune | null> => {
    if (!id) throw new Error("Commune ID is required");
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid Commune ID");

    const commune = await CommuneModel.findById(id)
        .populate({ path: "wilayaCode", foreignField: "code", select: "code nameLt nameAr" })
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!commune) throw new Error("Commune not found");

    return commune;
};

export const communeFindByPostCode = async (postCode: string): Promise<ICommune | null> => {
    if (!postCode) throw new Error("Post code is required");

    const commune = await CommuneModel.findOne({ postCode, isActive: true })
        .populate({ path: "wilayaId", select: "code nameLt nameAr" })
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!commune) throw new Error("Commune not found");

    return commune;
};

export const communeFindByWilayaId = async (wilayaId: string): Promise<ICommune[]> => {
    if (!wilayaId) throw new Error("Wilaya ID is required");
    if (!Types.ObjectId.isValid(wilayaId)) throw new Error("Invalid Wilaya ID");

    const communes = await CommuneModel.find({ wilayaId, isActive: true })
        .populate({ path: "wilayaId", select: "code nameLt nameAr" })
        .sort({ communeId: 1 });

    return communes;
};

export type CreateCommuneInput = {
    postCode: string;
    communeId: number;
    communeLt: string;
    communeAr: string;
    dairaLt: string;
    dairaAr: string;
    wilayaId: string;
    createdBy: string;
};

export const communeCreate = async (data: CreateCommuneInput): Promise<ICommune> => {
    if (!data.postCode) throw new Error("Post code is required");
    if (!data.communeId) throw new Error("Commune ID is required");
    if (!data.communeLt) throw new Error("Commune name (Latin) is required");
    if (!data.communeAr) throw new Error("Commune name (Arabic) is required");
    if (!data.dairaLt) throw new Error("Daira name (Latin) is required");
    if (!data.dairaAr) throw new Error("Daira name (Arabic) is required");
    if (!data.wilayaId) throw new Error("Wilaya ID is required");
    if (!data.createdBy) throw new Error("Created by user ID is required");

    const existingCommune = await CommuneModel.findOne({
        $or: [{ postCode: data.postCode }, { communeId: data.communeId }],
    });
    if (existingCommune) throw new Error("Commune with this post code or commune ID already exists");

    const commune = new CommuneModel({
        postCode: data.postCode,
        communeId: data.communeId,
        communeLt: data.communeLt,
        communeAr: data.communeAr,
        dairaLt: data.dairaLt,
        dairaAr: data.dairaAr,
        wilayaId: data.wilayaId,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
    });

    await commune.save();
    return commune.populate([
        { path: "wilayaId", select: "code nameLt nameAr" },
        { path: "createdBy", select: EmployeePopulatePublicFields },
        { path: "updatedBy", select: EmployeePopulatePublicFields },
    ]);
};

export type UpdateCommuneInput = {
    id: string;
    communeLt?: string;
    communeAr?: string;
    dairaLt?: string;
    dairaAr?: string;
    wilayaId?: string;
    updatedBy: string;
};

export const communeUpdate = async (data: UpdateCommuneInput): Promise<ICommune> => {
    if (!data.id) throw new Error("Commune ID is required");
    if (!Types.ObjectId.isValid(data.id)) throw new Error("Invalid Commune ID");
    if (!data.updatedBy) throw new Error("Updated by user ID is required");

    const commune = await CommuneModel.findById(data.id);
    if (!commune) throw new Error("Commune not found");

    const updateData: any = {
        updatedAt: new Date(),
        updatedBy: new Types.ObjectId(data.updatedBy),
    };

    if (data.communeLt) updateData.communeLt = data.communeLt;
    if (data.communeAr) updateData.communeAr = data.communeAr;
    if (data.dairaLt) updateData.dairaLt = data.dairaLt;
    if (data.dairaAr) updateData.dairaAr = data.dairaAr;
    if (data.wilayaId) updateData.wilayaId = new Types.ObjectId(data.wilayaId);

    const updatedCommune = await CommuneModel.findByIdAndUpdate(data.id, updateData, { new: true })
        .populate({ path: "wilayaId", select: "code nameLt nameAr" })
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!updatedCommune) throw new Error("Failed to update commune");

    return updatedCommune;
};

export const communeDelete = async (id: string, deletedBy: string): Promise<ICommune> => {
    if (!id) throw new Error("Commune ID is required");
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid Commune ID");
    if (!deletedBy) throw new Error("Deleted by user ID is required");

    const commune = await CommuneModel.findByIdAndUpdate(
        id,
        {
            isActive: false,
            updatedAt: new Date(),
            updatedBy: new Types.ObjectId(deletedBy),
        },
        { new: true },
    ).populate([
        { path: "wilayaId", select: "code nameLt nameAr" },
        { path: "createdBy", select: EmployeePopulatePublicFields },
        { path: "updatedBy", select: EmployeePopulatePublicFields },
    ]);

    if (!commune) throw new Error("Commune not found");

    return commune;
};
