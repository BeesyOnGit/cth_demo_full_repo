import { Router } from "express";
import {
    getTurnoverStats,
    getInvoiceCollectionStats,
    getPerformanceBondStats,
    getPerformanceBondDetails,
    getEmployeeExperience,
    getRankingStats,
    getDashboard,
    getAntenneOverview,
} from "./controller";
import { authCheck } from "../../middlewares/auth";
import { limitationMiddleware } from "../../middlewares/limitation";
import { NextFunction, Request, Response } from "express";
import { isValidObjectId } from "mongoose";
const router = Router();
const Root = "/stats";

// Reject operator objects/arrays and malformed ids before they reach new Types.ObjectId(...)
function validateStatsQuery(req: Request, res: Response, next: NextFunction) {
    for (const [key, value] of Object.entries(req.query)) {
        if (typeof value !== "string") return res.status(400).json({ message: `Invalid query parameter: ${key}` });
        if (["drId", "antenneId", "employeeId"].includes(key) && !isValidObjectId(value)) {
            return res.status(400).json({ message: `Invalid ${key}` });
        }
    }
    next();
}
const scope = [authCheck, validateStatsQuery, limitationMiddleware];

// GET endpoints
router.get(`${Root}/dashboard`, ...scope, getDashboard);
router.get(`${Root}/antenne-overview`, ...scope, getAntenneOverview);
router.get(`${Root}/turnover`, ...scope, getTurnoverStats);
router.get(`${Root}/invoice-collection`, ...scope, getInvoiceCollectionStats);
router.get(`${Root}/performance-bonds`, ...scope, getPerformanceBondStats);
router.get(`${Root}/performance-bonds/details`, ...scope, getPerformanceBondDetails);
router.get(`${Root}/experience`, ...scope, getEmployeeExperience);
router.get(`${Root}/ranking`, ...scope, getRankingStats);

export default router;
