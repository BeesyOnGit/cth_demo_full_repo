import { Schema, model } from "mongoose";
import { IVatRate } from "./interface";

const vatRateSchema = new Schema<IVatRate>(
    {
        label: {
            type: String,
            required: true,
            trim: true,
        },
        rate: {
            type: Number,
            required: true,
            min: 0,
        },
        validFrom: {
            type: Date,
        },
        validTo: {
            type: Date,
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

vatRateSchema.index({ isActive: 1 });
vatRateSchema.index({ validFrom: 1, validTo: 1 });

export const VatRateModel = model<IVatRate>("VatRate", vatRateSchema);
