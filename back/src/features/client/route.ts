import { Router } from "express";
import { getClientById, getClients, createClient, updateClient, deleteClient } from "./controller";
import { authCheck, adminCheck } from "../../middlewares/auth";
import { cleanQuery } from "../../middlewares/request";

const router = Router();
const Root = "/clients";

// GET endpoints
router.get(`${Root}/`, authCheck, cleanQuery, getClients);
router.get(`${Root}/:id`, authCheck, getClientById);

// POST endpoints
router.post(`${Root}/`, authCheck, adminCheck, createClient);
// PUT endpoints
router.put(`${Root}/:id`, authCheck, adminCheck, updateClient);

// DELETE endpoints
router.delete(`${Root}/:id`, authCheck, adminCheck, deleteClient);

export default router;
