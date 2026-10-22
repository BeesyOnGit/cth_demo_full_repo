import { Schema, model } from "mongoose";
import { IOuvrageType } from "./interface";

const ouvrageTypeSchema = new Schema<IOuvrageType>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            // enum: ["BARRAGE", "TRANSFERT", "AEP", "STEP", "CHATEAU_EAU", "AUTRE"],
        },
        label: {
            type: String,
            required: true,
            trim: true,
        },
        createdAt: {
            type: Date,
            default: () => {
                return new Date();
            },
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        updatedAt: {
            type: Date,
            default: () => {
                return new Date();
            },
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

ouvrageTypeSchema.index({ isActive: 1 });

export const OuvrageTypeModel = model<IOuvrageType>("OuvrageType", ouvrageTypeSchema);
