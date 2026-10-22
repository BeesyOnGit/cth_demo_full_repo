import { Request, Response, NextFunction } from "express";
import * as antenneService from "./service";
import { GeneralAntenneType } from "./interface";

export const antenneFilterFields = ["drId", "wilayaCode", "isActive", "code", "createdAt", "label"] as const satisfies ReadonlyArray<
    keyof GeneralAntenneType
>;

export const getAntennes = async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req;
    try {
        const antennes = await antenneService.findAllAntennes(query as any);
        res.status(200).json({ ...antennes, message: "Antennes retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getAntenneById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const antenneId = req.params.id;

        if (!antenneId) return res.status(400).json({ message: "Antenne ID is required" });

        const antenne = await antenneService.findAntenneById(antenneId);
        res.status(200).json({ data: antenne, message: "Antenne retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const createAntenne = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userid } = req.headers;
        const { code, label, drId, wilayaCode } = req.body;

        if (!code || !label || !drId || !wilayaCode) {
            return res.status(400).json({ message: "Missing required fields: code, label, type, drId, wilayaCode" });
        }

        const antenne = await antenneService.createAntenne({
            code,
            label,
            drId,
            wilayaCode,
            createdBy: userid || "system",
        });

        res.status(201).json({ data: antenne, message: "Antenne created successfully" });
    } catch (error) {
        next(error);
    }
};

export const updateAntenne = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid } = req.headers;

        if (!id) return res.status(400).json({ message: "Antenne ID is required" });

        const antenne = await antenneService.updateAntenne({
            id,
            ...req.body,
            updatedBy: userid || "system",
        });

        res.status(200).json({ data: antenne, message: "Antenne updated successfully" });
    } catch (error) {
        next(error);
    }
};

export const deleteAntenne = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid } = req.headers;

        if (!id) return res.status(400).json({ message: "Antenne ID is required" });

        const antenne = await antenneService.deleteAntenne(id, userid || "system");
        res.status(200).json({ data: antenne, message: "Antenne deleted successfully" });
    } catch (error) {
        next(error);
    }
};
