import { Router } from "express";
import {
    getCommuneById,
    getCommunes,
    getCommuneByPostCode,
    getCommunesByWilayaId,
    createCommune,
    updateCommune,
    deleteCommune,
} from "./controller";
import { authCheck, adminCheck } from "../../middlewares/auth";
import { cleanQuery } from "../../middlewares/request";
const router = Router();
const Root = "/communes";

// GET endpoints
router.get(`${Root}/`, authCheck, cleanQuery, getCommunes);
router.get(`${Root}/:id`, authCheck, getCommuneById);
router.get(`${Root}/post-code/:postCode`, authCheck, getCommuneByPostCode);
router.get(`${Root}/wilaya/:wilayaId`, authCheck, getCommunesByWilayaId);

// POST endpoints
router.post(`${Root}/`, authCheck, adminCheck, createCommune);

// PUT endpoints
router.put(`${Root}/:id`, authCheck, adminCheck, updateCommune);

// DELETE endpoints
router.delete(`${Root}/:id`, authCheck, adminCheck, deleteCommune);

export default router;
