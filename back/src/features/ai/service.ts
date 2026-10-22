import axios, { AxiosError } from "axios";
import { config } from "../../config/index";
import {
    IBusinessChatRequest,
    IBusinessChatResponse,
    IGroqChatRequest,
    IGroqChatResponse,
    IGroqChatMessage,
    IQueryGenerationResponse,
} from "./interface";
import * as fs from "fs";
import * as path from "path";
import { AntenneModel } from "../antenne/model";
import { ClientModel } from "../client/model";
import { ClientTypeModel } from "../client-type/model";
import { CommuneModel } from "../commune/model";
import { DrModel } from "../dr/model";
import { EmployeeModel } from "../employee/model";
import { InvoiceModel } from "../invoice/model";
import { ObjectiveModel } from "../objective/model";
import { OuvrageTypeModel } from "../ouvrage-type/model";
import { ProjectModel } from "../project/model";
import { RoleModel } from "../role/model";
import { ServiceTypeModel } from "../service-type/model";
import { VatRateModel } from "../vat-rate/model";
import { WilayaModel } from "../wilaya/model";
import { httpError } from "../../utils/access";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = config.groqApiKey || "";
const DEV_MODE = config.nodeEnv !== "production";
const DEFAULT_MODEL = "openai/gpt-oss-120b"; // or "mixtral-8x7b-32768"

/**
 * Get a map of all available MongoDB models
 */
export const getAllModelsMap = (): Record<string, any> => {
    const modelsMap: Record<string, any> = {
        Antenne: AntenneModel,
        Client: ClientModel,
        ClientType: ClientTypeModel,
        Commune: CommuneModel,
        Dr: DrModel,
        Employee: EmployeeModel,
        Invoice: InvoiceModel,
        Objective: ObjectiveModel,
        OuvrageType: OuvrageTypeModel,
        Project: ProjectModel,
        Role: RoleModel,
        ServiceType: ServiceTypeModel,
        VatRate: VatRateModel,
        Wilaya: WilayaModel,
    };
    return modelsMap;
};

const FORBIDDEN_OPERATORS = new Set([
    "$out",
    "$merge",
    "$function",
    "$accumulator",
    "$where",
    "$unionWith",
    "$currentOp",
    "$listSessions",
    "$listLocalSessions",
    "$collStats",
    "$indexStats",
    "$planCacheStats",
]);
const CREDENTIAL_FIELDS = ["passwordHash"];
const MAX_RESULTS = 500;

/**
 * Validate an LLM-generated aggregation pipeline before running it.
 * Rejects write/JS/cross-collection operators (recursively, incl. nested $lookup/$facet pipelines)
 * and lookups into collections outside the allowed set (employees are never joinable).
 */
export const sanitizeAggregation = (model: string, aggregation: unknown): any[] => {
    if (!Array.isArray(aggregation)) throw httpError(400, "Generated query rejected: aggregation must be an array");

    const allowedCollections = new Set(
        Object.values(getAllModelsMap())
            .filter((m) => m !== EmployeeModel)
            .map((m) => m.collection.name)
    );

    const check = (node: any): void => {
        if (Array.isArray(node)) return node.forEach(check);
        if (node === null || typeof node !== "object" || node instanceof Date) return;
        for (const [key, value] of Object.entries(node)) {
            if (FORBIDDEN_OPERATORS.has(key)) throw httpError(400, `Generated query rejected: ${key} is not allowed`);
            if ((key === "$lookup" || key === "$graphLookup") && !allowedCollections.has((value as any)?.from)) {
                throw httpError(400, `Generated query rejected: ${key} into "${(value as any)?.from}" is not allowed`);
            }
            check(value);
        }
    };
    check(aggregation);

    return [
        // credentials are removed at the source so later stages ($group/$push...) can never see them
        ...(model === "Employee" ? [{ $unset: CREDENTIAL_FIELDS }] : []),
        ...aggregation,
        { $unset: CREDENTIAL_FIELDS },
        { $limit: MAX_RESULTS },
    ];
};

/**
 * Read all model files and extract schema information
 */
export const getAllModelsContext = async (): Promise<string> => {
    try {
        const featuresPath = path.join(__dirname, "..");
        const contextParts: string[] = [
            "# Available MongoDB Models",
            "Below are all the MongoDB models available in this application for querying:\n",
        ];

        const modelsMap = getAllModelsMap();
        const fileExt = DEV_MODE ? "ts" : "js";
        contextParts.push("## Model Names:");
        contextParts.push(JSON.stringify(Object.keys(modelsMap), null, 2));
        contextParts.push("\n## Model Details:\n");

        // Read model.ts from each feature directory
        const featureDirs = fs
            .readdirSync(featuresPath, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name)
            .filter((name) => name !== "ai" && name !== "stats" && name !== "wilaya" && name !== "commune" && name !== "vat-rate" && name !== "role"); // Exclude AI feature itself and others without models

        for (const featureDir of featureDirs) {
            const modelPath = path.join(featuresPath, featureDir, `model.${fileExt}`);

            if (fs.existsSync(modelPath)) {
                const modelContent = fs.readFileSync(modelPath, "utf-8");
                // Extract model name from export statement
                const modelMatch = modelContent.match(/model<\w+>\("(\w+)"/);
                if (modelMatch) {
                    const modelName = modelMatch[1];
                    // Minify content: remove extra whitespace and newlines
                    const minifiedContent = modelContent.replace(/\s+/g, " ").replace(/\n/g, "").trim();
                    contextParts.push(`### ${modelName} Model (feature: ${featureDir})`);
                    contextParts.push(minifiedContent);
                }
            }
        }

        return contextParts.join("\n");
    } catch (error) {
        console.error("Error reading models:", error);
        return "# Models Context\nUnable to load model information.";
    }
};

/**
 * Read all interface files from features directory and compile them into a context string
 */
export const getAllInterfacesContext = async (): Promise<string> => {
    try {
        const featuresPath = path.join(__dirname, "..");
        const fileExt = DEV_MODE ? "ts" : "js";
        const contextParts: string[] = [
            "# Application Data Models Context",
            "Below are all the TypeScript interfaces that define the data models in this application:\n",
        ];

        // Read all directories in features folder
        const featureDirs = fs
            .readdirSync(featuresPath, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name)
            .filter((name) => name !== "ai"); // Exclude AI feature itself

        // Read interface.ts from each feature directory
        for (const featureDir of featureDirs) {
            const interfacePath = path.join(featuresPath, featureDir, `interface.${fileExt}`);

            if (fs.existsSync(interfacePath)) {
                const interfaceContent = fs.readFileSync(interfacePath, "utf-8");
                // Minify content: remove extra whitespace and newlines
                const minifiedContent = interfaceContent.replace(/\s+/g, " ").replace(/\n/g, "").trim();
                contextParts.push(`## ${featureDir.toUpperCase()} Feature Interfaces`);
                contextParts.push(minifiedContent);
            }
        }

        return contextParts.join("\n");
    } catch (error) {
        console.error("Error reading interfaces:", error);
        return "# Application Context\nUnable to load application interfaces.";
    }
};

/**
 * Send a business chat message to Groq AI
 */
export const sendBusinessChat = async (data: IBusinessChatRequest): Promise<any> => {
    try {
        if (!GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY is not configured in environment variables");
        }

        if (!data.message || data.message.trim().length === 0) {
            throw new Error("Message is required and cannot be empty");
        }

        const modelMap = getAllModelsMap();

        const aiQuery = await generateQueries(data.message);

        // return aiQuery;

        const { queries } = aiQuery;
        if (!Array.isArray(queries)) {
            throw httpError(400, "Generated query rejected: queries must be an array");
        }

        let res = [];
        for await (const q of queries) {
            const { model, aggregation } = q;
            const modelToQuery = modelMap[model];
            if (!modelToQuery) {
                throw new Error(`Model "${model}" not found in application models`);
            }
            const queryResult = await modelToQuery.aggregate(sanitizeAggregation(model, aggregation)).exec();
            // @ts-ignore
            res.push({ model, data: queryResult });
        }

        // Get application context from all interfaces

        // Build the messages array for Groq
        const messages: IGroqChatMessage[] = [
            {
                role: "system",
                content: `You are a helpful business assistant specialized in providing professional advice, insights, and support for business-related queries about this application. Be concise, accurate, and professional in your responses.

**CRITICAL FORMATTING INSTRUCTIONS:**
You MUST format your responses using the custom encoding tags below. These tags will be replaced with frontend components.
Currency is in Algerian Dinar (DZD).

**Custom Encoding Tags:**

1. **Title/Main Heading**: <TITLE>text</TITLE>
2. **Section Heading**: <SECTION>text</SECTION>
3. **Subsection Heading**: <SUBSECTION>text</SUBSECTION>
4. **Bold/Important**: <BOLD>text</BOLD>
5. **Metric/Number**: <METRIC>label: value</METRIC>
6. **List**: 
   <LIST>
   <ITEM>item 1</ITEM>
   <ITEM>item 2</ITEM>
   </LIST>
7. **Table**: 
   <TABLE>
   <THEAD><TH>Header1</TH><TH>Header2</TH><TH>Header3</TH></THEAD>
   <TROW><TD>Data1</TD><TD>Data2</TD><TD>Data3</TD></TROW>
   <TROW><TD>Data1</TD><TD>Data2</TD><TD>Data3</TD></TROW>
   </TABLE>
8. **Key Insight/Quote**: <INSIGHT>text</INSIGHT>
9. **Summary Box**: <SUMMARY>text</SUMMARY>
10. **Separator**: <SEPARATOR/>
11. **Paragraph**: <PARA>text</PARA>

**Response Structure Requirements:**
- Start with <SUMMARY> containing key findings
- Use <SECTION> to organize different topics
- Use <TABLE> for structured data with multiple rows
- Use <LIST> for enumerations
- Use <METRIC> for key numbers and KPIs
- Use <INSIGHT> for important conclusions
- Separate major sections with <SEPARATOR/>
- Answer in the same language the question was asked

**Example Response:**
<SUMMARY>Based on the analysis, <BOLD>the top performing DR</BOLD> achieved <METRIC>Revenue: 15M DZD</METRIC> in 2025.</SUMMARY>

<SEPARATOR/>

<SECTION>Top Performing DR</SECTION>
<TABLE>
<THEAD><TH>DR Name</TH><TH>Total Revenue</TH><TH>Rank</TH></THEAD>
<TROW><TD>DR East</TD><TD>15,000,000 DZD</TD><TD>1</TD></TROW>
</TABLE>

<SEPARATOR/>

<SECTION>Top 3 Antennas</SECTION>
<LIST>
<ITEM><BOLD>Antenna A</BOLD>: <METRIC>Revenue: 5M DZD</METRIC></ITEM>
<ITEM><BOLD>Antenna B</BOLD>: <METRIC>Revenue: 4.5M DZD</METRIC></ITEM>
<ITEM><BOLD>Antenna C</BOLD>: <METRIC>Revenue: 3.2M DZD</METRIC></ITEM>
</LIST>

<INSIGHT>The top antenna generated 33% of the total DR revenue.</INSIGHT>

---

Here is the data fetched from the database: ${JSON.stringify(res)}

Use the above data and encoding tags to provide accurate, well-structured responses.`,
            },
        ];

        // Add conversation history if provided
        if (data.conversationHistory && data.conversationHistory.length > 0) {
            messages.push(...data.conversationHistory);
        }

        // Add the current user message
        messages.push({
            role: "user",
            content: data.message,
        });

        // Prepare the Groq API request
        const groqRequest: IGroqChatRequest = {
            messages,
            model: DEFAULT_MODEL,
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 1,
            stream: false,
        };

        // Make the API call to Groq
        const response = await axios.post<IGroqChatResponse>(GROQ_API_URL, groqRequest, {
            headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            timeout: 30000, // 30 seconds timeout
        });

        // Extract the response
        const groqResponse = response.data;
        const assistantMessage = groqResponse.choices[0]?.message?.content || "No response generated";

        return {
            response: assistantMessage,
        };
    } catch (error) {
        // Handle Groq API errors
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<any>;
            if (axiosError.response) {
                const status = axiosError.response.status;
                const errorMessage = axiosError.response.data?.error?.message || "Groq API error";

                throw new Error(`Groq API error (${status}): ${errorMessage}`);
            } else if (axiosError.request) {
                throw new Error("No response from Groq API. Please check your network connection.");
            }
        }

        // Re-throw any other errors
        throw error;
    }
};

/**
 * Generate MongoDB queries based on user request
 * This function asks the AI to analyze the request and generate appropriate queries
 */
export const generateQueries = async (userRequest: string): Promise<any> => {
    try {
        if (!GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY is not configured in environment variables");
        }

        if (!userRequest || userRequest.trim().length === 0) {
            throw new Error("User request is required and cannot be empty");
        }

        // Get models context
        const modelsContext = await getAllModelsContext();

        // Build the query generation prompt
        const messages: IGroqChatMessage[] = [
            {
                role: "system",
                content: `You are a MongoDB aggregation pipeline generator assistant. Your task is to analyze user requests and generate the appropriate MongoDB aggregation pipelines needed to fetch the required data.

${modelsContext}

**IMPORTANT INSTRUCTIONS:**
1. Analyze the user's request carefully
2. Determine which models need to be queried
3. Generate MongoDB aggregation pipelines as arrays of stage objects
4. Return ONLY a valid JSON object in this exact format:
{
    queries: [{
        "model": "ModelName",
        "aggregation": [{ "$match": { "field": "value" } }]
    }]
}

**Aggregation Pipeline Guidelines:**
- Always use aggregation pipeline stages: $match, $lookup, $project, $group, $sort, $limit, $skip, $unwind, $addFields, etc.
- For filtering, start with $match: [{ "$match": { "field": "value" } }]
- For joins/references, use $lookup: { "$lookup": { "from": "collection", "localField": "field", "foreignField": "_id", "as": "alias" } }
- After $lookup, use $unwind to deconstruct arrays if needed
- For text search: { "$match": { "fieldName": { "$regex": "searchTerm", "$options": "i" } } }
- For date filtering, wrap date values with __DATE__ prefix: { "$match": { "date": { "$gte": "__DATE__2025-01-01T00:00:00.000Z", "$lte": "__DATE__2025-12-31T23:59:59.999Z" } } }
- In $expr comparisons, also wrap dates: { "$gte": ["$invoiceDate", "__DATE__2025-01-01T00:00:00.000Z"] }
- For grouping/aggregations: { "$group": { "_id": "$field", "total": { "$sum": "$amount" }, "count": { "$sum": 1 } } }
- For sorting: { "$sort": { "field": 1 } } (1 for ascending, -1 for descending)
- For limiting results: { "$limit": 10 }
- Use $project to shape output: { "$project": { "field1": 1, "field2": 1, "_id": 0 } }
- Use $addFields to add computed fields
- Model names must exactly match: Antenne, Client, ClientType, Commune, Dr, Employee, Invoice, Objective, OuvrageType, Project, Role, ServiceType, VatRate, Wilaya
- Collection names in $lookup should be lowercase: antennes, clients, drs, projects, invoices, etc.
- CRITICAL: ALL date values MUST be prefixed with __DATE__ marker (e.g., "__DATE__2025-01-01T00:00:00.000Z")

**Examples:**
User: "Get all active clients"
Response: {"queries":[{"model":"Client","aggregation":[{"$match":{"isActive":true}}]}]}

User: "Find projects in wilaya 16 with their client details"
Response: {"queries":[{"model":"Project","aggregation":[{"$match":{"wilayaCode":"16"}},{"$lookup":{"from":"clients","localField":"clientId","foreignField":"_id","as":"clientDetails"}},{"$unwind":"$clientDetails"}]}]}

User: "Count clients by wilaya"
Response: {"queries":[{"model":"Client","aggregation":[{"$unwind":"$wilayaCodes"},{"$group":{"_id":"$wilayaCodes","count":{"$sum":1}}},{"$sort":{"count":-1}}]}]}

User: "Quelle est la DR la plus performante en chiffre d'affaires durant l'année 2025 et donne moi aussi le classement des 3 antennes les plus performantes de cette DR"
Response: {"queries":[{"model":"Invoice","aggregation":[{"$match":{"invoiceDate":{"$gte":"__DATE__2025-01-01T00:00:00.000Z","$lte":"__DATE__2025-12-31T23:59:59.999Z"}}},{"$group":{"_id":"$drId","totalRevenue":{"$sum":"$amountTTC"}}},{"$sort":{"totalRevenue":-1}},{"$limit":1},{"$lookup":{"from":"drs","localField":"_id","foreignField":"_id","as":"drDetails"}},{"$unwind":"$drDetails"},{"$project":{"drId":"$_id","drName":"$drDetails.label","totalRevenue":1,"_id":0}}]},{"model":"Invoice","aggregation":[{"$match":{"invoiceDate":{"$gte":"__DATE__2025-01-01T00:00:00.000Z","$lte":"__DATE__2025-12-31T23:59:59.999Z"}}},{"$group":{"_id":"$drId","totalRevenue":{"$sum":"$amountTTC"}}},{"$sort":{"totalRevenue":-1}},{"$limit":1},{"$lookup":{"from":"invoices","let":{"topDrId":"$_id"},"pipeline":[{"$match":{"$expr":{"$and":[{"$eq":["$drId","$$topDrId"]},{"$gte":["$invoiceDate","__DATE__2025-01-01T00:00:00.000Z"]},{"$lte":["$invoiceDate","__DATE__2025-12-31T23:59:59.999Z"]}]}}},{"$group":{"_id":"$antenneId","antenneRevenue":{"$sum":"$amountTTC"}}},{"$sort":{"antenneRevenue":-1}},{"$limit":3},{"$lookup":{"from":"antennes","localField":"_id","foreignField":"_id","as":"antenneDetails"}},{"$unwind":"$antenneDetails"},{"$project":{"antenneId":"$_id","antenneName":"$antenneDetails.label","antenneRevenue":1,"_id":0}}],"as":"topAntennes"}},{"$project":{"drId":"$_id","topAntennes":1,"_id":0}}]}]}

User: "Total revenue by project type for 2025"
Response: {"queries":[{"model":"Invoice","aggregation":[{"$match":{"invoiceDate":{"$gte":"__DATE__2025-01-01T00:00:00.000Z","$lte":"__DATE__2025-12-31T23:59:59.999Z"}}},{"$lookup":{"from":"projects","localField":"projectId","foreignField":"_id","as":"project"}},{"$unwind":"$project"},{"$lookup":{"from":"ouvrages","localField":"project.ouvrageTypeId","foreignField":"_id","as":"ouvrageType"}},{"$unwind":"$ouvrageType"},{"$group":{"_id":"$ouvrageType.label","totalRevenue":{"$sum":"$amountTTC"},"count":{"$sum":1}}},{"$sort":{"totalRevenue":-1}}]}]}

Return ONLY the JSON object, no markdown, no explanation outside the JSON.`,
            },
            {
                role: "user",
                content: userRequest,
            },
        ];

        // Prepare the Groq API request with lower temperature for more deterministic output
        const groqRequest: IGroqChatRequest = {
            messages,
            model: DEFAULT_MODEL,
            temperature: 0.2,
            max_tokens: 8192,
            top_p: 1,
            stream: false,
        };

        // Make the API call to Groq
        const response = await axios.post<IGroqChatResponse>(GROQ_API_URL, groqRequest, {
            headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            timeout: 30000,
        });

        // Extract and parse the response
        const groqResponse = response.data;
        let assistantMessage = groqResponse.choices[0]?.message?.content || "{}";

        // Clean up the response - remove markdown code blocks if present
        assistantMessage = assistantMessage
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .replace(/^[^{]*/, "") // Remove any text before the first {
            .replace(/[^}]*$/, "") // Remove any text after the last }
            .trim();

        // Parse the JSON response
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(assistantMessage);
        } catch (parseError) {
            console.error("Failed to parse AI response:", assistantMessage);
            throw new Error(`Failed to parse AI response as JSON. Response: ${assistantMessage.substring(0, 500)}`);
        }

        // Convert all __DATE__ markers to actual Date objects
        const convertDates = (obj: any): any => {
            if (typeof obj === "string" && obj.startsWith("__DATE__")) {
                return new Date(obj.replace("__DATE__", ""));
            }
            if (Array.isArray(obj)) {
                return obj.map(convertDates);
            }
            if (obj !== null && typeof obj === "object") {
                const converted: any = {};
                for (const key in obj) {
                    converted[key] = convertDates(obj[key]);
                }
                return converted;
            }
            return obj;
        };

        parsedResponse = convertDates(parsedResponse);

        return parsedResponse;
        // explanation: parsedResponse.explanation || "No explanation provided",
    } catch (error) {
        // Handle parsing errors
        if (error instanceof SyntaxError) {
            throw new Error(`Failed to parse AI response as JSON. Error: ${error.message}`);
        }

        // Handle Groq API errors
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<any>;
            if (axiosError.response) {
                const status = axiosError.response.status;
                const errorMessage = axiosError.response.data?.error?.message || "Groq API error";
                throw new Error(`Groq API error (${status}): ${errorMessage}`);
            } else if (axiosError.request) {
                throw new Error("No response from Groq API. Please check your network connection.");
            }
        }

        // Re-throw any other errors
        throw error;
    }
};
