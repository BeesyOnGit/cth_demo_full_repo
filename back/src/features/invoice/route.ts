import { Router } from "express";
import { getInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice, generateInvoicePDF } from "./controller";
import { authCheck } from "../../middlewares/auth";
import { cleanQuery } from "../../middlewares/request";
import { limitationMiddleware } from "../../middlewares/limitation";
import { scopeById } from "../../utils/access";
import { InvoiceModel } from "./model";

const router = Router();

const Root = "/invoices";

router.get(`${Root}/`, authCheck, cleanQuery, limitationMiddleware, getInvoices);
router.get(`${Root}/:id`, authCheck, scopeById(InvoiceModel), getInvoiceById);
router.get(`${Root}/:id/pdf`, authCheck, scopeById(InvoiceModel), generateInvoicePDF);
router.post(`${Root}/`, authCheck, createInvoice);
router.put(`${Root}/:id`, authCheck, scopeById(InvoiceModel), updateInvoice);
router.delete(`${Root}/:id`, authCheck, scopeById(InvoiceModel), deleteInvoice);

export default router;
