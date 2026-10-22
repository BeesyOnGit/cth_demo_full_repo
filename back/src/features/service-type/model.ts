import { Schema, model } from "mongoose";
import { IServiceType } from "./interface";

const serviceTypeSchema = new Schema<IServiceType>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            // enum: ["CONTROLE", "CONTROLE_SUIVI", "EXPERTISE", "ETUDES", "SURVEILLANCE_TRAVAUX"],
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

serviceTypeSchema.index({ isActive: 1 });

export const ServiceTypeModel = model<IServiceType>("ServiceType", serviceTypeSchema);
