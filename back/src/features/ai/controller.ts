import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as aiService from "./service";

const businessChatSchema = z.object({
    message: z.string().trim().min(1).max(2000),
    conversationHistory: z
        .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
        .max(20)
        .optional(),
});

/**
 * Handle business chat requests
 * POST /business-chat
 */
export const businessChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request
        const parsed = businessChatSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid request: message (1-2000 chars) is required, conversationHistory max 20 items of {role, content}",
            });
        }
        const { message, conversationHistory } = parsed.data;

        // Call the AI service
        const result = await aiService.sendBusinessChat({
            message,
            conversationHistory,
        });

        // Send successful response
        res.status(200).json({
            success: true,
            data: result,
            message: "Chat response generated successfully",
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handle query generation requests
 * POST /generate-queries
 */
export const generateQueries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { request } = req.body;

        // Validate request
        if (!request) {
            return res.status(400).json({
                success: false,
                message: "Request is required",
            });
        }

        // Call the AI service to generate queries
        const result = await aiService.generateQueries(request);

        // Send successful response
        res.status(200).json({
            success: true,
            data: result,
            message: "Queries generated successfully",
        });
    } catch (error) {
        next(error);
    }
};
