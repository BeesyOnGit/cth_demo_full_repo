import { Request, Response, NextFunction } from "express";
import * as communeService from "./service";
import { GeneralCommuneType } from "./interface";

export const communeFilterFields = [
    "isActive",
    // "postCode",
    // "communeId",
    "communeLt",
    "communeAr",
    "dairaLt",
    "dairaAr",
    "wilayaCode",
    "createdAt",
] as const satisfies ReadonlyArray<keyof GeneralCommuneType>;

export const getCommunes = async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req;
    console.log("🚀 ~ file: controller.ts:19 ~ getCommunes ~ query:", query);
    try {
        const communes = await communeService.findAllCommunes(query as any);
        res.status(200).json({ ...communes, message: "Communes retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getCommuneById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const communeId = req.params.id;

        if (!communeId) return res.status(400).json({ message: "Commune ID is required" });

        const commune = await communeService.findCommuneById(communeId);
        res.status(200).json({ data: commune, message: "Commune retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getCommuneByPostCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { postCode } = req.params;

        if (!postCode) return res.status(400).json({ message: "Post code is required" });

        const commune = await communeService.findCommuneByPostCode(postCode);
        res.status(200).json({ data: commune, message: "Commune retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getCommunesByWilayaId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { wilayaId } = req.params;

        if (!wilayaId) return res.status(400).json({ message: "Wilaya ID is required" });

        const communes = await communeService.findCommunesByWilayaId(wilayaId);
        res.status(200).json({ data: communes, message: "Communes retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const createCommune = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userid } = req.headers;
        const { postCode, communeId, communeLt, communeAr, dairaLt, dairaAr, wilayaId } = req.body;

        if (!postCode || !communeId || !communeLt || !communeAr || !dairaLt || !dairaAr || !wilayaId) {
            return res.status(400).json({
                message: "Missing required fields: postCode, communeId, communeLt, communeAr, dairaLt, dairaAr, wilayaId",
            });
        }

        const commune = await communeService.createCommune({
            postCode,
            communeId,
            communeLt,
            communeAr,
            dairaLt,
            dairaAr,
            wilayaId,
            createdBy: userid || "system",
        });

        res.status(201).json({ data: commune, message: "Commune created successfully" });
    } catch (error) {
        next(error);
    }
};

export const updateCommune = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid } = req.headers;

        if (!id) return res.status(400).json({ message: "Commune ID is required" });

        const commune = await communeService.updateCommune({
            id,
            ...req.body,
            updatedBy: userid || "system",
        });

        res.status(200).json({ data: commune, message: "Commune updated successfully" });
    } catch (error) {
        next(error);
    }
};

export const deleteCommune = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid } = req.headers;

        if (!id) return res.status(400).json({ message: "Commune ID is required" });

        const commune = await communeService.deleteCommune(id, userid || "system");
        res.status(200).json({ data: commune, message: "Commune deleted successfully" });
    } catch (error) {
        next(error);
    }
};
