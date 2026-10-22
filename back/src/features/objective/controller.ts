import { Request, Response, NextFunction } from "express";
import { stripProtected } from "../../utils/access";
import * as objectiveService from "./service";
import { GeneralObjectiveType } from "./interface";

export const objectiveFilterFields = ["scopeType", "drId", "antenneId", "year", "month", "createdAt"] as const satisfies ReadonlyArray<
    keyof GeneralObjectiveType
>;

export const getObjectives = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req;
        const objectives = await objectiveService.findAllObjectives(query as any);
        res.status(200).json({ ...objectives, message: "Objectives retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getObjectiveById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ message: "Objective ID is required" });
        const objective = await objectiveService.findObjectiveById(id);
        res.status(200).json({ data: objective, message: "Objective retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const createObjective = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userid } = req.headers;
        const data = { ...req.body, createdBy: userid || "system" };
        const objective = await objectiveService.createObjective(data as any);
        res.status(201).json({ data: objective, message: "Objective created successfully" });
    } catch (error) {
        next(error);
    }
};

export const updateObjective = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid, isadmin } = req.headers;
        if (!id) return res.status(400).json({ message: "Objective ID is required" });
        const objective = await objectiveService.updateObjective({ ...stripProtected(req.body, isadmin), id, updatedBy: userid || "system" });
        res.status(200).json({ data: objective, message: "Objective updated successfully" });
    } catch (error) {
        next(error);
    }
};

export const deleteObjective = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid } = req.headers;
        if (!id) return res.status(400).json({ message: "Objective ID is required" });
        const objective = await objectiveService.deleteObjective(id, userid || "system");
        res.status(200).json({ data: objective, message: "Objective deleted successfully" });
    } catch (error) {
        next(error);
    }
};
