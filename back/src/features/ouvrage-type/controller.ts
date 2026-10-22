import { Request, Response, NextFunction } from "express";
import * as ouvrageTypeService from "./service";
import { GeneralOuvrageType } from "./interface";

export const ouvrageTypeFilterFields = ["isActive", "code", "createdAt", "label"] as const satisfies ReadonlyArray<keyof GeneralOuvrageType>;

export const getOuvrageTypes = async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req;
    try {
        const ouvrageTypes = await ouvrageTypeService.findAllOuvrageTypes(query as any);
        res.status(200).json({ ...ouvrageTypes, message: "OuvrageTypes retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getOuvrageTypeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ouvrageTypeId = req.params.id;

        if (!ouvrageTypeId) return res.status(400).json({ message: "OuvrageType ID is required" });

        const ouvrageType = await ouvrageTypeService.findOuvrageTypeById(ouvrageTypeId);
        res.status(200).json({ data: ouvrageType, message: "OuvrageType retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const createOuvrageType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userid } = req.headers;
        const { code, label } = req.body;

        if (!code || !label) {
            return res.status(400).json({ message: "Missing required fields: code, label" });
        }

        const ouvrageType = await ouvrageTypeService.createOuvrageType({
            code,
            label,
            createdBy: userid || "system",
        });

        res.status(201).json({ data: ouvrageType, message: "OuvrageType created successfully" });
    } catch (error) {
        next(error);
    }
};

export const updateOuvrageType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid } = req.headers;

        if (!id) return res.status(400).json({ message: "OuvrageType ID is required" });

        const ouvrageType = await ouvrageTypeService.updateOuvrageType({
            id,
            ...req.body,
            updatedBy: userid || "system",
        });

        res.status(200).json({ data: ouvrageType, message: "OuvrageType updated successfully" });
    } catch (error) {
        next(error);
    }
};

export const deleteOuvrageType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid } = req.headers;

        if (!id) return res.status(400).json({ message: "OuvrageType ID is required" });

        const ouvrageType = await ouvrageTypeService.deleteOuvrageType(id, userid || "system");
        res.status(200).json({ data: ouvrageType, message: "OuvrageType deleted successfully" });
    } catch (error) {
        next(error);
    }
};
