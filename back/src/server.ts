import { StdQueryOptions } from "./utils/interface";
import { createApp } from "./app";
import { config } from "./config";
import { connectDatabase } from "./config/database";
import logger from "./utils/logger";
declare module "http" {
    interface IncomingHttpHeaders {
        userid?: string;
        role?: string;
        isadmin?: boolean;
        antenneid?: string;
        drid?: string;
    }
    interface QueryString extends StdQueryOptions {}
}

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDatabase(config.mongodbUri);

        // Create app with routes
        const { app, port, env } = createApp();

        // Start server
        app.listen(port, () => {
            logger.info(`=================================`);
            logger.info(`======= ENV: ${env} =======`);
            logger.info(`🚀 App listening on the port ${port}`);
            logger.info(`=================================`);
        });
    } catch (error) {
        logger.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
