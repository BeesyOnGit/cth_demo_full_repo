import { Schema, model } from "mongoose";
import { IAntenne } from "./interface";

const antenneSchema = new Schema<IAntenne>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        label: {
            type: String,
            required: true,
            trim: true,
        },
        drId: {
            type: Schema.Types.ObjectId,
            ref: "Dr",
            required: true,
        },
        wilayaCode: {
            type: [String],
            ref: "Wilaya",
            required: true,
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

antenneSchema.index({ drId: 1 });
antenneSchema.index({ isActive: 1 });

export const AntenneModel = model<IAntenne>("Antenne", antenneSchema);
