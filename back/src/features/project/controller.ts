import { Request, Response, NextFunction } from "express";
import * as projectService from "./service";
import { GeneralProjectType } from "./interface";
import { isValidObjectId } from "mongoose";
import { stripProtected } from "../../utils/access";

// computed / workflow fields that generic updates must not touch
const projectProtectedFields = ["situationCounter", "isConvertedToOds", "convertedAt", "convertedBy"];

export const projectFilterFields = [
    "drId",
    "antenneId",
    "clientId",
    "isActive",
    "billingMode",
    "updatedAt",
    "title",
    "serviceTypeId",
    "projectManagerIds",
    "ouvrageTypeId",
    "isAvenant",
    "parentProjectId",
    "projectNumber",
    "contractMode",
    "guarantee",
] as const satisfies ReadonlyArray<keyof GeneralProjectType>;

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req;
        const projects = await projectService.findAllProjects(query as any);
        res.status(200).json({ ...projects, message: "Projects retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ message: "Project ID is required" });
        const project = await projectService.findProjectById(id);
        res.status(200).json({ data: project, message: "Project retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userid, drid, antenneid, isadmin } = req.headers;

        const data = {
            ...req.body,
            ...(isValidObjectId(drid) ? { drId: drid } : {}),
            ...(!isadmin && isValidObjectId(antenneid) ? { antenneId: antenneid } : {}),
            createdBy: userid || "system",
        };
        const project = await projectService.createProject(data as any);
        res.status(201).json({ data: project, message: "Project created successfully" });
    } catch (error) {
        next(error);
    }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid, isadmin } = req.headers;
        if (!id) return res.status(400).json({ message: "Project ID is required" });
        const project = await projectService.updateProject({
            ...stripProtected(req.body, isadmin, projectProtectedFields),
            id,
            updatedBy: userid || "system",
        });
        res.status(200).json({ data: project, message: "Project updated successfully" });
    } catch (error) {
        next(error);
    }
};

export const convertToOds = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid, isadmin } = req.headers;
        if (!id) return res.status(400).json({ message: "Project ID is required" });
        const project = await projectService.convertToOds({
            ...stripProtected(req.body, isadmin, projectProtectedFields),
            id,
            updatedBy: userid || "system",
        });
        res.status(200).json({ data: project, message: "Project updated successfully" });
    } catch (error) {
        next(error);
    }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid } = req.headers;
        if (!id) return res.status(400).json({ message: "Project ID is required" });
        const project = await projectService.deleteProject(id, userid || "system");
        res.status(200).json({ data: project, message: "Project deleted successfully" });
    } catch (error) {
        next(error);
    }
};
