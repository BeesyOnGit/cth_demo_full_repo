import { Request, Response, NextFunction } from "express";
import {
    calculateTurnoverStats,
    calculateInvoiceCollectionStats,
    calculatePerformanceBondStats,
    getPerformanceBondDetailsService,
    calculateEmployeeExperienceStats,
    calculateRankingStats,
    getDashboardSummary,
    getAntenneOverviewStats,
} from "./service";

export const getTurnoverStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req;
        const stats = await calculateTurnoverStats(query);
        res.status(200).json({ data: stats, message: "Turnover stats retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getInvoiceCollectionStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req;
        const stats = await calculateInvoiceCollectionStats(query);
        res.status(200).json({ data: stats, message: "Invoice collection stats retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getPerformanceBondStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req;
        const stats = await calculatePerformanceBondStats(query);
        res.status(200).json({ data: stats, message: "Performance bond stats retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getPerformanceBondDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req;
        const details = await getPerformanceBondDetailsService(query);
        res.status(200).json({ data: details, message: "Performance bond details retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getEmployeeExperience = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req;
        const stats = await calculateEmployeeExperienceStats(query);
        res.status(200).json({ data: stats, message: "Employee experience stats retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getRankingStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req;
        const stats = await calculateRankingStats(query as any);
        res.status(200).json({ data: stats, message: "Ranking stats retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const summary = await getDashboardSummary();
        res.status(200).json({ 
            data: summary, 
            message: "Dashboard summary retrieved successfully" 
        });
    } catch (error) {
        next(error);
    }
};

export const getAntenneOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req;
        if (!query.antenneId) return res.status(400).json({ message: "Antenne ID is required" });
        const stats = await getAntenneOverviewStats(query as any);
        res.status(200).json({ 
            data: stats, 
            message: "Antenne overview retrieved successfully" 
        });
    } catch (error) {
        next(error);
    }
};
