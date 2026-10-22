import { Request, Response, NextFunction } from "express";
import * as vatService from "./service";
import { GeneralVatRateType } from "./interface";

export const vatFilterFields = ["createdAt", "isActive", "rate", "label"] as const satisfies ReadonlyArray<keyof GeneralVatRateType>;

export const getVatRates = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req;
        const rates = await vatService.findAllVatRates(query as any);
        res.status(200).json({ ...rates, message: "VAT rates retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getVatRateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ message: "VAT rate ID is required" });
        const rate = await vatService.findVatRateById(id);
        res.status(200).json({ data: rate, message: "VAT rate retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const createVatRate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userid } = req.headers;
        const data = { ...req.body, createdBy: userid || "system" };
        const rate = await vatService.createVatRate(data as any);
        res.status(201).json({ data: rate, message: "VAT rate created successfully" });
    } catch (error) {
        next(error);
    }
};

export const updateVatRate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid } = req.headers;
        if (!id) return res.status(400).json({ message: "VAT rate ID is required" });
        const rate = await vatService.updateVatRate({ id, ...req.body, updatedBy: userid || "system" });
        res.status(200).json({ data: rate, message: "VAT rate updated successfully" });
    } catch (error) {
        next(error);
    }
};

export const deleteVatRate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid } = req.headers;
        if (!id) return res.status(400).json({ message: "VAT rate ID is required" });
        const rate = await vatService.deleteVatRate(id, userid || "system");
        res.status(200).json({ data: rate, message: "VAT rate deleted successfully" });
    } catch (error) {
        next(error);
    }
};
