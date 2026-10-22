export interface IBusinessChatRequest {
    message: string;
    conversationHistory?: Array<{
        role: "user" | "assistant";
        content: string;
    }>;
}

export interface IBusinessChatResponse {
    response: string;
    conversationId?: string;
    model: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface IMongoQuery {
    model: string;
    aggregation: any[];
}

export interface IQueryGenerationResponse {
    queries: IMongoQuery[];
    explanation: string;
    model: string;
}

export interface IGroqChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface IGroqChatRequest {
    messages: IGroqChatMessage[];
    model: string;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    stream?: boolean;
}

export interface IGroqChatResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: IGroqChatMessage;
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
