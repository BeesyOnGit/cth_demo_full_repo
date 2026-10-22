import { Router } from "express";
import { getRoleById, getRoles, createRole, updateRole, deleteRole } from "./controller";
import { authCheck, adminCheck } from "../../middlewares/auth";
import { cleanQuery } from "../../middlewares/request";
const router = Router();
const Root = "/roles";

// GET endpoints
router.get(`${Root}/`, authCheck, cleanQuery, getRoles);
router.get(`${Root}/:id`, authCheck, getRoleById);

// POST endpoints
router.post(`${Root}/`, authCheck, adminCheck, createRole);
// PUT endpoints
router.put(`${Root}/:id`, authCheck, adminCheck, updateRole);

// DELETE endpoints
router.delete(`${Root}/:id`, authCheck, adminCheck, deleteRole);

export default router;
