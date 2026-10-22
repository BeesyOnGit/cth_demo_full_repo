import { Router } from "express";
import { getAntenneById, getAntennes, createAntenne, updateAntenne, deleteAntenne } from "./controller";
import { authCheck, adminCheck } from "../../middlewares/auth";
import { cleanQuery } from "../../middlewares/request";
import { limitationMiddleware } from "../../middlewares/limitation";

const router = Router();
const Root = "/antennes";

// GET endpoints
router.get(`${Root}/`, authCheck, cleanQuery, limitationMiddleware, getAntennes);
router.get(`${Root}/:id`, authCheck, getAntenneById);

// POST endpoints
router.post(`${Root}/`, authCheck, adminCheck, createAntenne);
// PUT endpoints
router.put(`${Root}/:id`, authCheck, adminCheck, updateAntenne);

// DELETE endpoints
router.delete(`${Root}/:id`, authCheck, adminCheck, deleteAntenne);

export default router;
