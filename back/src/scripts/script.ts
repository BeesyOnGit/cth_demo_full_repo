// scripts/migrations/add-recovery-to-invoices.ts
import mongoose, { Types } from "mongoose";
import { readFile } from "fs/promises";
import dotenv from "dotenv";
import { config } from "./../config";
import { connectDatabase } from "./../config/database";
dotenv.config();

import { ProjectModel } from "../features/project/model"; // adjust path to your Invoice model
import { CommuneModel } from "../features/commune/model"; // adjust path to your Commune model
import { WilayaModel } from "../features/wilaya/model";
import { BillingTypeEnum } from "../features/project/interface";
import { InvoiceModel } from "../features/invoice/model";

// async function main() {
//     await connectDatabase(config.mongodbUri);

//     // Prefer transaction when connected to a replica set

//     try {
//         // await session.withTransaction(async () => {
//         // Add `recovery` field to invoices that are missing it
//         // const res = await ProjectModel.updateMany(
//         //     {
//         //         isAvenant: { $exists: false },
//         //         signDate: { $exists: false },
//         //         operationNumber: { $exists: false },
//         //         conventionNumber: { $exists: false },
//         //         billingType: { $exists: false },
//         //     },
//         //     {
//         //         $set: {
//         //             isAvenant: false,
//         //             signDate: new Date(),
//         //             operationNumber: "000",
//         //             conventionNumber: "0000",
//         //             billingType: BillingTypeEnum.SITUATION,
//         //         },
//         //     }
//         // );

//         // New JSON format: array of wilayas each with Dairas -> Baladiyas
//         const file = await readFile("algeria_postcodes.json", "utf-8");
//         const wilayas = JSON.parse(file);

//         // Expect flat array of post entries with fields like:
//         // post_code, post_name_ascii, post_name, post_address_ascii, post_address,
//         // commune_id, commune_name_ascii, commune_name, daira_name_ascii, daira_name,
//         // wilaya_code, wilaya_name_ascii, wilaya_name
//         const communesToInsert: any[] = [];
//         let tmp = {};

//         for (const entry of wilayas) {
//             // normalize wilaya code to two digits
//             // const rawCode = entry.wilaya_code ?? entry.wilayaCode ?? entry.wilaya;
//             // if (!rawCode) {
//             //     console.warn(`Skipping entry without wilaya code: ${JSON.stringify(entry).slice(0, 100)}`);
//             //     continue;
//             // }
//             // const code = String(rawCode).padStart(2, "0");

//             // // find the wilaya document by code
//             // const wilayaDoc = await WilayaModel.findOne({ code });
//             // if (!wilayaDoc) {
//             //     console.warn(`Wilaya not found for code=${code} (wilaya name=${entry.wilaya_name_ascii || entry.wilaya_name})`);
//             //     continue;
//             // }

//             tmp = {
//                 ...tmp,
//                 [entry.commune_name_ascii]: {
//                     // postCode: entry.post_code ?? null,
//                     // communeId: entry.commune_id ?? null,
//                     communeLt: entry.commune_name_ascii.toLowerCase() ?? entry.commune_name ?? null,
//                     communeAr: entry.commune_name ?? entry.commune_name_ascii.toLowerCase() ?? null,
//                     dairaLt: entry.daira_name_ascii.toLowerCase() ?? entry.daira_name ?? null,
//                     dairaAr: entry.daira_name ?? entry.daira_name_ascii.toLowerCase() ?? null,
//                     wilayaCode: entry.wilaya_code ?? entry.wilayaCode ?? entry.wilaya ?? null,
//                     // createdBy: "system",
//                     // updatedBy: "system",
//                 },
//             };

//             // communesToInsert.push(communeObj);
//         }
//         communesToInsert.push(...Object.values(tmp));
//         const res = await CommuneModel.create(communesToInsert);
//         // Upsert communes using bulkWrite to be idempotent
//         // const ops: any[] = [];
//         // for (const c of communesToInsert) {
//         //     const filter: any = {};
//         //     if (c.postCode) {
//         //         filter.postCode = c.postCode;
//         //     } else if (c.communeId) {
//         //         filter.communeId = c.communeId;
//         //     } else {
//         //         filter.communeLt = c.communeLt;
//         //         filter.dairaLt = c.dairaLt;
//         //         filter.wilayaId = c.wilayaId;
//         //     }

//         //     ops.push({
//         //         updateOne: {
//         //             filter,
//         //             update: { $setOnInsert: c },
//         //             upsert: true,
//         //         },
//         //     });
//         // }

//         // let res = null;
//         // if (ops.length > 0) {
//         //     const BATCH = 1000;
//         //     for (let i = 0; i < ops.length; i += BATCH) {
//         //         const batch = ops.slice(i, i + BATCH);

//         //         console.log(`Applied batch ${i / BATCH + 1}:`, batch.length, "ops");
//         //     }
//         // }

//         console.log("Migration result:", res);
//         // });
//     } catch (err) {
//         console.error("Migration failed:", err);
//         throw err;
//     } finally {
//         // session.endSession();
//         await mongoose.disconnect();
//     }
// }

async function main() {
    await connectDatabase(config.mongodbUri);
    try {
        const invoices = await InvoiceModel.find();
        const projects = await ProjectModel.find().select("antenneId drId");
        const projectMap: Record<string, { antenneId: Types.ObjectId; drId: Types.ObjectId }> = {};

        for (const project of projects) {
            projectMap[project._id.toString()] = {
                antenneId: project.antenneId,
                drId: project.drId,
            };
        }
        for (const invoice of invoices) {
            const projectInfo = projectMap[invoice.projectId.toString()];
            if (projectInfo) {
                invoice.drId = projectInfo.drId;
                invoice.antenneId = projectInfo.antenneId;
                if (!invoice.invoiceType) {
                    invoice.invoiceType = BillingTypeEnum.SITUATION;
                }
                await invoice.save();
                console.log(`Updated invoice ${invoice._id} with drId and antenneId`);
            }
        }
    } catch (err) {
        console.error("Migration failed:", err);
        throw err;
    } finally {
        await mongoose.disconnect();
    }
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
