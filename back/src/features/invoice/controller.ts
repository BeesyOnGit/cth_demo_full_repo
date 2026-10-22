import { Request, Response, NextFunction } from "express";
import * as invoiceService from "./service";
import { GeneralInvoiceType } from "./interface";
import { assertDocInScope, stripProtected } from "../../utils/access";
import { ProjectModel } from "../project/model";

// derived from the project / computed on save
const invoiceProtectedFields = ["projectId", "amountTTC", "drId", "antenneId"];

export const invoiceFilterFields = [
    "projectId",
    "invoiceNumber",
    "invoiceDate",
    "amountHT",
    "createdBy",
    "updatedBy",
    "isActive",
    "physicalProgress",
    "invoiceType",
    "isRecovered",
    "antenneId",
    "drId",
] as const satisfies ReadonlyArray<keyof GeneralInvoiceType>;

export const getInvoices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req;
        const invoices = await invoiceService.findAllInvoices(query as any);
        return res.status(200).json({ ...invoices, message: "Invoices retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ message: "Invoice ID is required" });
        const invoice = await invoiceService.findInvoiceById(id);
        return res.status(200).json({ data: invoice, message: "Invoice retrieved successfully" });
    } catch (error) {
        next(error);
    }
};

export const createInvoice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { body, headers } = req;
        const { userid } = headers as any;

        await assertDocInScope(ProjectModel, body.projectId, headers);
        const created = await invoiceService.createInvoice({ ...stripProtected(body, headers.isadmin), projectId: body.projectId, createdBy: userid, updatedBy: userid });
        return res.status(201).json({ data: created, message: "Invoice created successfully" });
    } catch (error) {
        next(error);
    }
};

export const updateInvoice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid, isadmin } = req.headers as any;
        if (!id) return res.status(400).json({ message: "Invoice ID is required" });

        const updated = await invoiceService.updateInvoice({ ...stripProtected(req.body, isadmin, invoiceProtectedFields), id, updatedBy: userid || "system" });
        return res.status(200).json({ data: updated, message: "Invoice updated successfully" });
    } catch (error) {
        next(error);
    }
};

export const deleteInvoice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { userid } = req.headers as any;
        if (!id) return res.status(400).json({ message: "Invoice ID is required" });

        const deleted = await invoiceService.deleteInvoice(id, userid);
        return res.status(200).json({ data: deleted, message: "Invoice deleted successfully" });
    } catch (error) {
        next(error);
    }
};

export const generateInvoicePDF = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ message: "Invoice ID is required" });
        const { pdfBuffer, name } = await invoiceService.generateInvoicePDF(id);

        res.attachment(name); // sets an RFC 5987 encoded Content-Disposition
        res.setHeader("Content-Type", "application/pdf");
        return res.status(200).send(pdfBuffer);
    } catch (error) {
        next(error);
    }
};
