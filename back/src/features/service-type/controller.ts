import { Request, Response, NextFunction } from "express";
import * as serviceTypeService from "./service";
import { GeneralServiceType } from "./interface";

export const serviceTypeFilterFields = ["isActive", "code", "createdAt", "label"] as const satisfies ReadonlyArray<keyof GeneralServiceType>;

export const getServiceTypes = async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req;
    try {
        const serviceTypes = await serviceTypeService.findAllServiceTypes(query as any);
        res.status(200).json({ ...serviceTypes, message: "ServiceTypes retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getServiceTypeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const serviceTypeId = req.params.id;

        if (!serviceTypeId) return res.status(400).json({ message: "ServiceType ID is required" });

        const serviceType = await serviceTypeService.findServiceTypeById(serviceTypeId);
        res.status(200).json({ data: serviceType, message: "ServiceType retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const createServiceType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userid } = req.headers;
        const { code, label } = req.body;

        if (!code || !label) {
            return res.status(400).json({ message: "Missing required fields: code, label" });
        }

        const serviceType = await serviceTypeService.createServiceType({
            code,
            label,
            createdBy: userid || "system",
        });

        res.status(201).json({ data: serviceType, message: "ServiceType created successfully" });
    } catch (error) {
        next(error);
    }
};

export const updateServiceType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid } = req.headers;

        if (!id) return res.status(400).json({ message: "ServiceType ID is required" });

        const serviceType = await serviceTypeService.updateServiceType({
            id,
            ...req.body,
            updatedBy: userid || "system",
        });

        res.status(200).json({ data: serviceType, message: "ServiceType updated successfully" });
    } catch (error) {
        next(error);
    }
};

export const deleteServiceType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid } = req.headers;

        if (!id) return res.status(400).json({ message: "ServiceType ID is required" });

        const serviceType = await serviceTypeService.deleteServiceType(id, userid || "system");
        res.status(200).json({ data: serviceType, message: "ServiceType deleted successfully" });
    } catch (error) {
        next(error);
    }
};
