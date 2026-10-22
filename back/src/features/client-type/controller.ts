import { Request, Response, NextFunction } from "express";
import * as clientTypeService from "./service";
import { GeneralClientTypeType } from "./interface";

export const clientTypeFilterFields = ["isActive", "code", "createdAt", "label"] as const satisfies ReadonlyArray<keyof GeneralClientTypeType>;

export const getClientTypes = async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req;
    try {
        const clientTypes = await clientTypeService.findAllClientTypes(query as any);
        res.status(200).json({ ...clientTypes, message: "ClientTypes retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getClientTypeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const clientTypeId = req.params.id;

        if (!clientTypeId) return res.status(400).json({ message: "ClientType ID is required" });

        const clientType = await clientTypeService.findClientTypeById(clientTypeId);
        res.status(200).json({ data: clientType, message: "ClientType retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const createClientType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userid } = req.headers;
        const { code, label } = req.body;

        if (!code || !label) {
            return res.status(400).json({ message: "Missing required fields: code, label" });
        }

        const clientType = await clientTypeService.createClientType({
            code,
            label,
            createdBy: userid || "system",
        });

        res.status(201).json({ data: clientType, message: "ClientType created successfully" });
    } catch (error) {
        next(error);
    }
};

export const updateClientType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid } = req.headers;

        if (!id) return res.status(400).json({ message: "ClientType ID is required" });

        const clientType = await clientTypeService.updateClientType({
            id,
            ...req.body,
            updatedBy: userid || "system",
        });

        res.status(200).json({ data: clientType, message: "ClientType updated successfully" });
    } catch (error) {
        next(error);
    }
};

export const deleteClientType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid } = req.headers;

        if (!id) return res.status(400).json({ message: "ClientType ID is required" });

        const clientType = await clientTypeService.deleteClientType(id, userid || "system");
        res.status(200).json({ data: clientType, message: "ClientType deleted successfully" });
    } catch (error) {
        next(error);
    }
};
