import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error.middleware";
import logger from "./utils/logger";
import employeeRoutes from "./features/employee/route";
import anteneRoutes from "./features/antenne/route";
import drRoutes from "./features/dr/route";
import roleRoutes from "./features/role/route";
import wilayaRoutes from "./features/wilaya/route";
import communeRoutes from "./features/commune/route";
import projectRoutes from "./features/project/route";
import clientRoutes from "./features/client/route";
import clientTypeRoutes from "./features/client-type/route";
import serviceTypeRoutes from "./features/service-type/route";
import ouvrageTypeRoutes from "./features/ouvrage-type/route";
import vatRoutes from "./features/vat-rate/route";
import invoiceRoutes from "./features/invoice/route";
import objectiveRoutes from "./features/objective/route";
import statsRoutes from "./features/stats/route";
import aiRoutes from "./features/ai/route";

export const createApp = () => {
    const app = express();
    const env = process.env.NODE_ENV || "development";
    const port = process.env.PORT || 3000;
    const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : ["http://localhost:3005"];
    // Behind the VPS nginx: take the client IP from X-Forwarded-For, but only when it comes from localhost
    app.set("trust proxy", "loopback");
    // Middlewares
    app.use(helmet());
    app.use(
        cors({
            // origin: process.env.FRONTEND_URL || "http://localhost:3000",
            // origin: "*",
            // credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            // allowedHeaders: ["Content-Type", "Authorization"],
            origin: allowedOrigins, // Your exact frontend URL
            credentials: true,
            allowedHeaders: ["Content-Type", "Authorization"],
            exposedHeaders: ["Content-Disposition"],
        })
    );
    app.use(cookieParser());
    app.use(express.json());

    const morganFormat = ":method :url :status :res[content-length] - :response-time ms";
    app.use(
        morgan(morganFormat, {
            stream: {
                write: (message) => {
                    const logObject = {
                        method: message.split(" ")[0],
                        url: message.split(" ")[1],
                        status: message.split(" ")[2],
                        responseTime: message.split(" ")[5],
                    };
                    logger.http(JSON.stringify(logObject));
                },
            },
        })
    );

    // Production image: also serve the built front end (HashRouter, so only / and /assets are needed)
    if (process.env.STATIC_DIR) {
        app.use(express.static(process.env.STATIC_DIR, { index: "index.html" }));
    }

    app.use(
        "/",
        employeeRoutes,
        anteneRoutes,
        drRoutes,
        roleRoutes,
        wilayaRoutes,
        communeRoutes,
        projectRoutes,
        clientRoutes,
        clientTypeRoutes,
        serviceTypeRoutes,
        ouvrageTypeRoutes,
        vatRoutes,
        invoiceRoutes,
        objectiveRoutes,
        statsRoutes,
        aiRoutes
    );

    app.get("/health", (req, res) => {
        res.status(200).json({ status: "UP" });
    });

    // Error handling
    app.use(errorMiddleware);

    return { app, port, env };
};
