import { Request, Response, NextFunction } from "express";
import * as drService from "./service";
import { GeneralDrType } from "./interface";

// declare module "http" {
//     interface IncomingHttpHeaders {
//         userid?: string;
//         role?: string;
//         isadmin?: boolean;
//     }
// }

export const drFilterFields = ["isActive", "code", "createdAt", "name"] as const satisfies ReadonlyArray<keyof GeneralDrType>;

export const getDrs = async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req;
    try {
        const drs = await drService.findAllDrs(query as any);
        res.status(200).json({ ...drs, message: "DRs retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getDrById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const drId = req.params.id;

        if (!drId) return res.status(400).json({ message: "DR ID is required" });

        const dr = await drService.findDrById(drId);
        res.status(200).json({ data: dr, message: "DR retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const createDr = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userid } = req.headers;
        const { code, name, bankName, accountNumber } = req.body;

        if (!code || !name || !bankName || !accountNumber) {
            return res.status(400).json({ message: "Missing required fields: code, name, bankName, accountNumber" });
        }

        const dr = await drService.createDr({
            code,
            name,
            bankName,
            accountNumber,
            createdBy: userid || "system",
        });

        res.status(201).json({ data: dr, message: "DR created successfully" });
    } catch (error) {
        next(error);
    }
};

export const updateDr = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid } = req.headers;

        if (!id) return res.status(400).json({ message: "DR ID is required" });

        const dr = await drService.updateDr({
            id,
            ...req.body,
            updatedBy: userid || "system",
        });

        res.status(200).json({ data: dr, message: "DR updated successfully" });
    } catch (error) {
        next(error);
    }
};

export const deleteDr = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid } = req.headers;

        if (!id) return res.status(400).json({ message: "DR ID is required" });

        const dr = await drService.deleteDr(id, userid || "system");
        res.status(200).json({ data: dr, message: "DR deleted successfully" });
    } catch (error) {
        next(error);
    }
};
