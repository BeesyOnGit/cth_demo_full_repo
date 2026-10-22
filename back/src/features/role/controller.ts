import { Request, Response, NextFunction } from "express";
import * as roleService from "./service";
import { GeneralRoleType } from "./interface";

export const roleFilterFields = ["isActive", "code", "createdAt", "label"] as const satisfies ReadonlyArray<keyof GeneralRoleType>;

export const getRoles = async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req;
    try {
        const roles = await roleService.findAllRoles(query as any);
        res.status(200).json({ ...roles, message: "Roles retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getRoleById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const roleId = req.params.id;

        if (!roleId) return res.status(400).json({ message: "Role ID is required" });

        const role = await roleService.findRoleById(roleId);
        res.status(200).json({ data: role, message: "Role retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const createRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userid } = req.headers;
        const { code, label, permissions } = req.body;

        if (!code || !label) {
            return res.status(400).json({ message: "Missing required fields: code, label" });
        }

        const role = await roleService.createRole({
            code,
            label,
            permissions,
            createdBy: userid || "system",
        });

        res.status(201).json({ data: role, message: "Role created successfully" });
    } catch (error) {
        next(error);
    }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid } = req.headers;

        if (!id) return res.status(400).json({ message: "Role ID is required" });

        const role = await roleService.updateRole({
            id,
            ...req.body,
            updatedBy: userid || "system",
        });

        res.status(200).json({ data: role, message: "Role updated successfully" });
    } catch (error) {
        next(error);
    }
};

export const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid } = req.headers;

        if (!id) return res.status(400).json({ message: "Role ID is required" });

        const role = await roleService.deleteRole(id, userid || "system");
        res.status(200).json({ data: role, message: "Role deleted successfully" });
    } catch (error) {
        next(error);
    }
};
