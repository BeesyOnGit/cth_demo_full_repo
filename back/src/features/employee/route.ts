import { Router } from "express";
import { getEmployeeById, getEmployees, createEmployee, updateEmployee, deactivateEmployee, login, logout, checkUser } from "./controller";
import { adminCheck, authCheck } from "../../middlewares/auth";
import { cleanQuery } from "../../middlewares/request";
import { limitationMiddleware } from "../../middlewares/limitation";
import { rateLimit } from "../../middlewares/rateLimit";

const router = Router();
const Root = "/employees";

// GET endpoints
router.get(`${Root}/`, authCheck, cleanQuery, limitationMiddleware, getEmployees);
router.get(`${Root}/checkme`, authCheck, checkUser);
router.get(`${Root}/logout`, logout);
// Public on purpose: login screen shows these when DEMO_MODE=true
router.get(`${Root}/demo`, (req, res) => {
    if (process.env.DEMO_MODE !== "true") return res.json({ demo: false });
    res.json({ demo: true, email: process.env.DEMO_EMAIL, password: process.env.DEMO_PASSWORD });
});
router.get(`${Root}/:id`, authCheck, getEmployeeById);

// POST endpoints
router.post(`${Root}/`, authCheck, adminCheck, createEmployee);
// keyed by ip + email: still per-account if the API sits behind a proxy without "trust proxy"
const loginRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, key: (req) => `${req.ip}|${String(req.body?.email ?? "").toLowerCase()}` });
router.post(`${Root}/login`, loginRateLimit, login);

// PUT endpoints
router.put(`${Root}/:id`, authCheck, adminCheck, updateEmployee);
// DELETE endpoints
router.delete(`${Root}/:id`, authCheck, adminCheck, deactivateEmployee);

export default router;
