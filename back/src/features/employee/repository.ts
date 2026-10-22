import { EmployeeModel } from "./model";
import { CreateEmployeeInput, GeneralEmployeeType, IEmployee, IEmployeePublic, IEmployeePublicDetails, UpdateEmployeeInput } from "./interface";
import { Types } from "mongoose";
import { StdQueryOptions } from "../../utils/interface";
import { PaginatedResult, paginateResponse } from "../../utils/response";

export type EmployeeFilterParams = StdQueryOptions & Partial<GeneralEmployeeType>;

export const employeeFindAll = async (params: EmployeeFilterParams): Promise<PaginatedResult<IEmployeePublic>> => {
    const { page, limit, noPag, ...rest } = params as any;
    const count = await EmployeeModel.countDocuments({ isActive: true, ...rest });
    if (count === 0) {
        return paginateResponse({ payload: [] as any, total: 0, page: page!, limit: noPag ? count : limit! });
    }

    const employees: any = await EmployeeModel.find({ isActive: true, ...rest })
        .sort({ createdAt: -1 })
        .skip(noPag ? 0 : page!)
        .limit(noPag ? 0 : limit!)
        .select(noPag ? "_id fullName" : "-passwordHash -editHistory")
        .populate({ path: "roleId", select: "_id code label" })
        .populate({ path: "drId", select: "_id code name" })
        .populate({ path: "antenneId", select: "_id code label" })
        .populate({ path: "wilayaCode", foreignField: "code", localField: "wilayaCode", select: "code name" });

    return paginateResponse({ payload: employees, total: count, page: page!, limit: noPag ? count : limit! });
};

export const employeeFindById = async (id: string): Promise<IEmployeePublicDetails | null> => {
    if (!id) throw new Error("Employee ID is required");
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid Employee ID");

    const employee: any = await EmployeeModel.findById(id)
        .select("-passwordHash")
        .populate("roleId")
        .populate("drId")
        .populate("antenneId")
        .populate({ path: "wilayaCode", foreignField: "code", localField: "wilayaCode" });

    if (!employee) throw new Error("Employee not found");

    return employee as IEmployeePublicDetails;
};

export const employeeCreate = async (data: CreateEmployeeInput): Promise<IEmployeePublic> => {
    if (!data.fullName) throw new Error("Full name is required");
    if (!data.email) throw new Error("Email is required");
    if (!data.passwordHash) throw new Error("Password hash is required");
    if (!data.roleId) throw new Error("Role ID is required");

    const employee = new EmployeeModel({
        fullName: data.fullName,
        email: data.email,
        passwordHash: data.passwordHash,
        roleId: data.roleId,
        drId: data.drId ? data.drId : undefined,
        antenneId: data.antenneId ? data.antenneId : undefined,
        wilayaCode: data.wilayaCode ? data.wilayaCode : undefined,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
    });

    await employee.save();
    return await employee.populate(["roleId", "drId", "antenneId", { path: "wilayaCode", foreignField: "code", localField: "wilayaCode" }]);
};

export const employeeUpdate = async (data: UpdateEmployeeInput): Promise<IEmployeePublic> => {
    if (!data.id) throw new Error("Employee ID is required");
    if (!Types.ObjectId.isValid(data.id)) throw new Error("Invalid Employee ID");
    if (!data.updatedBy) throw new Error("Updated by user ID is required");

    const employee = await EmployeeModel.findById(data.id);
    if (!employee) throw new Error("Employee not found");

    const updateData: any = {
        ...data,
        updatedAt: new Date(),
        updatedBy: new Types.ObjectId(data.updatedBy),
    };

    if (data.fullName) updateData.fullName = data.fullName;
    if (data.drId !== undefined) updateData.drId = data.drId ? new Types.ObjectId(data.drId) : null;
    if (data.antenneId !== undefined) updateData.antenneId = data.antenneId ? new Types.ObjectId(data.antenneId) : null;
    if (data.wilayaCode !== undefined) updateData.wilayaCode = data.wilayaCode || null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isAdmin !== undefined) updateData.isAdmin = data.isAdmin;

    const updatedEmployee: any = await EmployeeModel.findByIdAndUpdate(data.id, updateData, { new: true })
        .populate(["roleId", "drId", "antenneId", { path: "wilayaCode", foreignField: "code", localField: "wilayaCode" }])
        .select("-passwordHash -editHistory");

    if (!updatedEmployee) throw new Error("Failed to update employee");

    return updatedEmployee as IEmployeePublic;
};

export const employeeDeactivate = async (id: string, deactivatedBy: string): Promise<IEmployeePublic> => {
    if (!id) throw new Error("Employee ID is required");
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid Employee ID");
    if (!deactivatedBy) throw new Error("Deactivated by user ID is required");

    const employee: any = await EmployeeModel.findByIdAndUpdate(
        id,
        {
            isActive: false,
            updatedAt: new Date(),
            updatedBy: new Types.ObjectId(deactivatedBy),
        },
        { new: true },
    )
        .populate(["roleId", "drId", "antenneId", { path: "wilayaCode", foreignField: "code", localField: "wilayaCode" }])
        .select("-passwordHash -editHistory");

    if (!employee) throw new Error("Employee not found");

    return employee as IEmployeePublic;
};

export const employeeFindByFilters = async (filters: Partial<GeneralEmployeeType>): Promise<IEmployee[]> => {
    const query: any = {};

    if (filters.roleId) query.roleId = new Types.ObjectId(filters.roleId);
    if (filters.antenneId) query.antenneId = new Types.ObjectId(filters.antenneId);
    if (filters.drId) query.drId = new Types.ObjectId(filters.drId);
    if (filters.wilayaCode) query.wilayaCode = filters.wilayaCode;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;

    const employees = await EmployeeModel.find(query)
        .select("-passwordHash")
        .populate("roleId")
        .populate("drId")
        .populate("antenneId")
        .populate({ path: "wilayaCode", foreignField: "code", localField: "wilayaCode" });

    return employees;
};

export const employeeFindByEmail = async (email: string): Promise<IEmployee | null> => {
    if (!email) throw new Error("Email is required");

    const employee = await EmployeeModel.findOne({ email: email.toLowerCase(), isActive: true }).select("+passwordHash");

    return employee;
};
