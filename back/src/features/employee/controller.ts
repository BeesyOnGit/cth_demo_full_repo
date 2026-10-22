import { Request, Response, NextFunction } from "express";
import * as employeeService from "./service";
import { GeneralEmployeeType } from "./interface";
import { authCookieOptions, authTokenTtl, refreshTokenTtl } from "../../utils/token";
import { stripProtected } from "../../utils/access";

// declare module "http" {
//     interface IncomingHttpHeaders {
//         userid?: string;
//         role?: string;
//         isadmin?: boolean;
//     }
// }

export const employeeFilterFields = ["antenneId", "drId", "isActive", "roleId", "wilayaCode", "fullName", "email"] as const satisfies ReadonlyArray<
    keyof GeneralEmployeeType
>;
export const getEmployees = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req;
        const employees = await employeeService.findAllEmployees(query as any);
        res.status(200).json({ ...employees, message: "Employees retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getEmployeeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employeeId = req.params.id;

        if (!employeeId) return res.status(400).json({ message: "Employee ID is required" });

        const employee = await employeeService.findEmployeeById(employeeId);
        res.status(200).json({ data: employee, message: "Employee retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { body, headers } = req;
        const { userid, role, isadmin } = headers;
        const { fullName, email, passwordHash, roleId, drId, antenneId, wilayaCode, isAdmin } = body;

        // if (!fullName || !email || !passwordHash || !roleId) {
        //     return res.status(400).json({ message: "Missing required fields: fullName, email, passwordHash, roleId" });
        // }

        const employee = await employeeService.createEmployee({
            fullName,
            email,
            passwordHash,
            roleId,
            drId,
            antenneId,
            wilayaCode,
            createdBy: userid,
            updatedBy: userid,
            isAdmin,
        });

        res.status(201).json({ data: employee, message: "Employee created successfully" });
    } catch (error) {
        next(error);
    }
};

export const updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid, role, isadmin } = req.headers;
        if (!id) return res.status(400).json({ message: "Employee ID is required" });

        const employee = await employeeService.updateEmployee({
            ...stripProtected(req.body, isadmin),
            // password changes go through passwordHash (plain text, hashed by the service)
            ...(req.body.passwordHash ? { passwordHash: req.body.passwordHash } : {}),
            id,
            updatedBy: userid || "system",
        });

        res.status(200).json({ data: employee, message: "Employee updated successfully" });
    } catch (error) {
        next(error);
    }
};

export const deactivateEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid, role, isadmin } = req.headers;
        if (!id) return res.status(400).json({ message: "Employee ID is required" });

        const employee = await employeeService.deactivateEmployee(id, userid || "system");
        res.status(200).json({ data: employee, message: "Employee deactivated successfully" });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password || typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const result = await employeeService.loginEmployee(email, password);

        res.cookie("authorization", result.token, { ...authCookieOptions, maxAge: authTokenTtl * 1000 });
        res.cookie("refreshAuthorization", result.refreshToken, { ...authCookieOptions, maxAge: refreshTokenTtl * 1000 });

        res.status(200).json({
            user: {
                id: result.employee._id,
                fullName: result.employee.fullName,
                email: result.employee.email,
                roleId: result.employee.roleId,
                antenneId: result.employee.antenneId,
                drId: result.employee.drId,
                wilayaID: result.employee.wilayaCode,
                isAdmin: result.employee.isAdmin,
            },
            message: `Login successful welcome back ${result.employee.fullName}`,
        });
    } catch (error) {
        if (error instanceof Error && error.message === "Invalid credentials") {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        next(error);
    }
};

export const checkUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userid, isadmin, role, antenneid, drid } = req.headers;

        const employee = await employeeService.findEmployeeById(userid!);

        if (!employee) {
            return res.status(401).json({ message: "invalid user" });
        }

        const userInfos = {
            id: employee._id,
            fullName: employee.fullName,
            email: employee.email,
            roleId: employee.roleId?.code,
            antenneId: employee.antenneId?._id,
            drId: employee.drId?._id,
            wilayaID: employee.wilayaCode,
            isAdmin: employee.isAdmin,
        };

        res.status(200).json({ message: "Token is valid", user: userInfos });
    } catch (error) {
        next(error);
    }
};
export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie("authorization", authCookieOptions);
        res.clearCookie("refreshAuthorization", authCookieOptions);
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        next(error);
    }
};
