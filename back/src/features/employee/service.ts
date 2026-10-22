import * as employeeRepo from "./repository";
import { CreateEmployeeInput, GeneralEmployeeType, IEmployee, IEmployeePublic, UpdateEmployeeInput } from "./interface";
import { hashPassword } from "../../utils/password";
import { comparePassword } from "../../utils/password";
import { authTokenTtl, buildTokenPayload, generateToken, refreshTokenTtl } from "../../utils/token";
import { config } from "../../config/index";
import { StdQueryOptions } from "../../utils/interface";
import { PaginatedResult } from "../../utils/response";
import { EmployeeFilterParams } from "./repository";

export const findAllEmployees = async (params: StdQueryOptions): Promise<PaginatedResult<IEmployeePublic>> => {
    const { pageginationDefaultLimit } = config;
    if (!params.limit) {
        params.limit = pageginationDefaultLimit;
    }
    if (!params.page) {
        params.page = 1;
    }
    params.page = (params.page - 1) * params.limit; // Adjust for zero-based indexing
    const employees = await employeeRepo.employeeFindAll(params as EmployeeFilterParams);
    return employees;
};

export const findEmployeeById = async (id: string): Promise<IEmployeePublic> => {
    const employee = await employeeRepo.employeeFindById(id);
    return employee as IEmployeePublic;
};

export const createEmployee = async (data: CreateEmployeeInput): Promise<IEmployeePublic> => {
    const hashedPassword = await hashPassword(data.passwordHash);

    if (!hashedPassword) {
        throw new Error("Failed to hash password");
    }

    const employee = await employeeRepo.employeeCreate({ ...data, passwordHash: hashedPassword });
    return employee as IEmployeePublic;
};

export const updateEmployee = async (data: UpdateEmployeeInput): Promise<IEmployeePublic> => {
    if (!data.passwordHash) {
        const employee = await employeeRepo.employeeUpdate(data);
        return employee as IEmployeePublic;
    }

    const hashedPassword = await hashPassword(data.passwordHash);

    if (!hashedPassword) {
        throw new Error("Failed to hash password");
    }

    data.passwordHash = hashedPassword;
    const employee = await employeeRepo.employeeUpdate(data);
    return employee as IEmployeePublic;
};

export const deactivateEmployee = async (id: string, deactivatedBy: string): Promise<IEmployeePublic> => {
    const employee = await employeeRepo.employeeDeactivate(id, deactivatedBy);
    return employee as IEmployeePublic;
};

export const findEmployeesByFilters = async (filters: Partial<GeneralEmployeeType>): Promise<IEmployee[]> => {
    const employees = await employeeRepo.employeeFindByFilters(filters);
    return employees;
};

export const loginEmployee = async (email: string, password: string): Promise<{ employee: IEmployeePublic; token: string; refreshToken: string }> => {
    try {
        if (!email || !password) {
            throw new Error("Email and password are required");
        }

        const employee = await employeeRepo.employeeFindByEmail(email);

        if (!employee) {
            throw new Error("Invalid credentials");
        }

        const isPasswordValid = await comparePassword({ password, hashedPassword: employee.passwordHash });

        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }
        const payload = buildTokenPayload(employee);

        const token = generateToken({ payload, expire: authTokenTtl });

        const refreshToken = generateToken({ payload, expire: refreshTokenTtl });

        if (!token || !refreshToken) {
            throw new Error("Failed to generate token");
        }

        // const refreshToken = generateRefreshToken({
        //     employeeId: employee._id.toString(),
        //     email: employee.email,
        //     roleId: employee.roleId.toString(),
        // });

        // Remove password from response
        const { passwordHash, ...employeeWithoutPassword } = employee.toObject();

        return {
            employee: employeeWithoutPassword as IEmployeePublic,
            token,
            refreshToken,
        };
    } catch (error) {
        throw error;
    }
};
