import { AntenneModel } from "./model";
import { IAntenne } from "./interface";
import { Types } from "mongoose";
import { WilayaGeneralPopulateFields } from "../wilaya/interface";
import { EmployeePopulatePublicFields } from "../employee/interface";
import { DrGeneralPopulateFields } from "../dr/interface";
import { StdQueryOptions } from "../../utils/interface";
import { PaginatedResult, paginateResponse } from "../../utils/response";

export type AntenneFilterParams = StdQueryOptions & Partial<any>;

export const antenneFindAll = async (params: AntenneFilterParams = {}): Promise<PaginatedResult<IAntenne>> => {
    console.log("🚀 ~ file: repository.ts:13 ~ antenneFindAll ~ params:", params);
    const { page, limit, noPag, ...rest } = params as any;
    const count = await AntenneModel.countDocuments({ isActive: true, ...rest });
    if (count === 0) {
        return paginateResponse({ payload: [] as any, total: 0, page: page!, limit: noPag ? count : limit! });
    }

    const antennes = await AntenneModel.find({ isActive: true, ...rest })
        .sort({ createdAt: -1 })
        .skip(noPag ? 0 : page!)
        .limit(noPag ? 0 : limit!)
        .select(noPag ? "_id code label" : "")
        .populate({ path: "drId", select: DrGeneralPopulateFields })
        .populate({ path: "wilayaCode", foreignField: "code", localField: "wilayaCode", select: WilayaGeneralPopulateFields })
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    return paginateResponse({ payload: antennes, total: count, page: page!, limit: noPag ? count : limit! });
};

export const antenneFindById = async (id: string): Promise<IAntenne | null> => {
    if (!id) throw new Error("Antenne ID is required");
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid Antenne ID");

    const antenne = await AntenneModel.findById(id)
        .populate({ path: "drId", select: DrGeneralPopulateFields })
        .populate({ path: "wilayaCode", foreignField: "code", localField: "wilayaCode", select: WilayaGeneralPopulateFields })
        .populate({ path: "createdBy", select: EmployeePopulatePublicFields })
        .populate({ path: "updatedBy", select: EmployeePopulatePublicFields });

    if (!antenne) throw new Error("Antenne not found");

    return antenne;
};

export type CreateAntenneInput = {
    code: string;
    label: string;
    drId: string;
    wilayaCode: string;
    createdBy: string;
};

export const antenneCreate = async (data: CreateAntenneInput): Promise<IAntenne> => {
    if (!data.code) throw new Error("Code is required");
    if (!data.label) throw new Error("Label is required");
    // if (!data.type) throw new Error("Type is required");
    if (!data.drId) throw new Error("DR ID is required");
    if (!data.wilayaCode) throw new Error("Wilaya code is required");
    if (!data.createdBy) throw new Error("Created by user ID is required");

    const existingAntenne = await AntenneModel.findOne({ code: data.code });
    if (existingAntenne) throw new Error("Antenne with this code already exists");

    const antenne = new AntenneModel({
        code: data.code,
        label: data.label,
        // type: data.type,
        drId: data.drId,
        wilayaCode: data.wilayaCode,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
    });

    await antenne.save();
    return antenne.populate([
        { path: "drId", select: DrGeneralPopulateFields },
        { path: "wilayaCode", foreignField: "code", localField: "wilayaCode", select: WilayaGeneralPopulateFields },
        { path: "createdBy", select: EmployeePopulatePublicFields },
        { path: "updatedBy", select: EmployeePopulatePublicFields },
    ]);
};

export type UpdateAntenneInput = {
    id: string;
    label?: string;
    type?: "AC" | "DT_DR";
    drId?: string;
    wilayaCode?: string;
    updatedBy: string;
};

export const antenneUpdate = async (data: UpdateAntenneInput): Promise<IAntenne> => {
    if (!data.id) throw new Error("Antenne ID is required");
    if (!Types.ObjectId.isValid(data.id)) throw new Error("Invalid Antenne ID");
    if (!data.updatedBy) throw new Error("Updated by user ID is required");

    const antenne = await AntenneModel.findById(data.id);
    if (!antenne) throw new Error("Antenne not found");

    const updateData: any = {
        updatedAt: new Date(),
        updatedBy: new Types.ObjectId(data.updatedBy),
    };

    if (data.label) updateData.label = data.label;
    if (data.type) updateData.type = data.type;
    if (data.drId !== undefined) updateData.drId = data.drId ? new Types.ObjectId(data.drId) : null;
    if (data.wilayaCode !== undefined) updateData.wilayaCode = data.wilayaCode || null;

    const updatedAntenne = await AntenneModel.findByIdAndUpdate(data.id, updateData, { new: true }).populate([
        { path: "drId", select: DrGeneralPopulateFields },
        { path: "wilayaCode", foreignField: "code", localField: "wilayaCode", select: WilayaGeneralPopulateFields },
        { path: "createdBy", select: EmployeePopulatePublicFields },
        { path: "updatedBy", select: EmployeePopulatePublicFields },
    ]);

    if (!updatedAntenne) throw new Error("Failed to update antenne");

    return updatedAntenne;
};

export const antenneDelete = async (id: string, deletedBy: string): Promise<IAntenne> => {
    if (!id) throw new Error("Antenne ID is required");
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid Antenne ID");
    if (!deletedBy) throw new Error("Deleted by user ID is required");

    const antenne = await AntenneModel.findByIdAndUpdate(
        id,
        {
            isActive: false,
            updatedAt: new Date(),
            updatedBy: new Types.ObjectId(deletedBy),
        },
        { new: true },
    ).populate([
        { path: "drId", select: DrGeneralPopulateFields },
        { path: "wilayaCode", foreignField: "code", localField: "wilayaCode", select: WilayaGeneralPopulateFields },
        { path: "createdBy", select: EmployeePopulatePublicFields },
        { path: "updatedBy", select: EmployeePopulatePublicFields },
    ]);

    if (!antenne) throw new Error("Antenne not found");

    return antenne;
};
