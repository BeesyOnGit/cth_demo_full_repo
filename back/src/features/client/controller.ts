import { Request, Response, NextFunction } from "express";
import { stripProtected } from "../../utils/access";
import * as clientService from "./service";
import { GeneralClientType } from "./interface";

export const clientFilterFields = [
    "wilayaCodes",
    "identifier",
    "isActive",
    "createdAt",
    "name",
    "drId",
    "antenneId",
    "clientTypeId",
] as const satisfies ReadonlyArray<keyof GeneralClientType>;

export const getClients = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req;
        const clients = await clientService.findAllClients(query as any);
        res.status(200).json({ ...clients, message: "Clients retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getClientById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ message: "Client ID is required" });
        const client = await clientService.findClientById(id);
        res.status(200).json({ data: client, message: "Client retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const createClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userid } = req.headers;
        const data = { ...req.body, createdBy: userid || "system" };
        const client = await clientService.createClient(data as any);
        res.status(201).json({ data: client, message: "Client created successfully" });
    } catch (error) {
        next(error);
    }
};

export const updateClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid, isadmin } = req.headers;
        if (!id) return res.status(400).json({ message: "Client ID is required" });
        const client = await clientService.updateClient({ ...stripProtected(req.body, isadmin), id, updatedBy: userid || "system" });
        res.status(200).json({ data: client, message: "Client updated successfully" });
    } catch (error) {
        next(error);
    }
};

export const deleteClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid } = req.headers;
        if (!id) return res.status(400).json({ message: "Client ID is required" });
        const client = await clientService.deleteClient(id, userid || "system");
        res.status(200).json({ data: client, message: "Client deleted successfully" });
    } catch (error) {
        next(error);
    }
};
