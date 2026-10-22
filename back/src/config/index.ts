import dotenv from "dotenv";

dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    pageginationDefaultLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT || "10"),
    nodeEnv: process.env.NODE_ENV || "development",
    mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/cth-tcom",
    jwtSecret: process.env.JWT_SECRET || "your-secret-key-here",
    jwtExpiration: process.env.JWT_EXPIRATION || "5",
    jwtAuthRefresh: process.env.JWT_AUTH_REFRESH || "5",
    jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || "7",
    pdfConversionApiUrl: process.env.PDF_CONVERSION_API_URL || "https://pdf.inovsoft.online/api/v1/convert",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3005",
    groqApiKey: process.env.GROQ_API_KEY || "",
};
