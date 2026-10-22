import { Router } from "express";
import { getClientTypeById, getClientTypes, createClientType, updateClientType, deleteClientType } from "./controller";
import { authCheck, adminCheck } from "../../middlewares/auth";
import { cleanQuery } from "../../middlewares/request";
const router = Router();
const Root = "/client-types";

// GET endpoints
router.get(`${Root}/`, authCheck, cleanQuery, getClientTypes);
router.get(`${Root}/:id`, authCheck, getClientTypeById);

// POST endpoints
router.post(`${Root}/`, authCheck, adminCheck, createClientType);
// PUT endpoints
router.put(`${Root}/:id`, authCheck, adminCheck, updateClientType);

// DELETE endpoints
router.delete(`${Root}/:id`, authCheck, adminCheck, deleteClientType);

export default router;
