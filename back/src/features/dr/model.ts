import { Schema, model } from "mongoose";
import { IDr } from "./interface";

const drSchema = new Schema<IDr>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            // enum: ["DRC", "DRG", "DRA", "DRS", "DRO", "DRT"],
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        bankName: {
            type: String,
            required: true,
            trim: true,
        },
        accountNumber: {
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

drSchema.index({ isActive: 1 });

export const DrModel = model<IDr>("Dr", drSchema);
