import { Schema, model } from "mongoose";
import { IClientType } from "./interface";

const clientTypeSchema = new Schema<IClientType>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
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

export const ClientTypeModel = model<IClientType>("ClientType", clientTypeSchema);
