import { Request, Response, NextFunction } from "express";
import * as wilayaService from "./service";
import { config } from "../../config/index";
import { GeneralWilayaType } from "./interface";
import { StdQueryOptions } from "../../utils/interface";

// declare module "http" {
//     interface IncomingHttpHeaders {
//         userid?: string;
//         role?: string;
//         isadmin?: string;
//     }
// }

export const wilayaFilterFields = ["isActive", "code", "createdAt", "name"] as const satisfies ReadonlyArray<keyof GeneralWilayaType>;

export const getWilayas = async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req;
    try {
        const wilayas = await wilayaService.findAllWilayas(query);
        res.status(200).json({ ...wilayas, message: "Wilayas retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getWilayaByCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const wilayaCode = req.params.code;

        if (!wilayaCode) return res.status(400).json({ message: "Wilaya code is required" });

        const wilaya = await wilayaService.findWilayaByCode(wilayaCode);
        res.status(200).json({ data: wilaya, message: "Wilaya retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const createWilaya = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userid } = req.headers;
        console.log("🚀 ~ file: controller.ts:37 ~ createWilaya ~ userid:", userid);
        const { code, name } = req.body;

        if (!code || !name) {
            return res.status(400).json({ message: "Missing required fields: code, name" });
        }

        const wilaya = await wilayaService.createWilaya({
            code,
            name,
            createdBy: userid || "system",
        });

        res.status(201).json({ data: wilaya, message: "Wilaya created successfully" });
    } catch (error) {
        next(error);
    }
};

export const updateWilaya = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const code = req.params.code;
        const { userid } = req.headers;

        if (!code) return res.status(400).json({ message: "Wilaya code is required" });

        const wilaya = await wilayaService.updateWilaya({
            code,
            ...req.body,
            updatedBy: userid || "system",
        });

        res.status(200).json({ data: wilaya, message: "Wilaya updated successfully" });
    } catch (error) {
        next(error);
    }
};

export const deleteWilaya = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const code = req.params.code;
        const { userid } = req.headers;

        if (!code) return res.status(400).json({ message: "Wilaya code is required" });

        const wilaya = await wilayaService.deleteWilaya(code, userid || "system");
        res.status(200).json({ data: wilaya, message: "Wilaya deleted successfully" });
    } catch (error) {
        next(error);
    }
};
