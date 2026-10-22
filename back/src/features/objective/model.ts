import { Schema, model } from "mongoose";
import { IObjective } from "./interface";

const objectiveSchema = new Schema<IObjective>(
    {
        scopeType: {
            type: String,
            required: true,
            enum: ["NATIONAL", "DR", "ANTENNE"],
        },
        drId: {
            type: Schema.Types.ObjectId,
            ref: "Dr",
        },
        antenneId: {
            type: Schema.Types.ObjectId,
            ref: "Antenne",
        },
        year: {
            type: Number,
            required: true,
        },
        month: {
            type: Number,
            min: 1,
            max: 12,
        },
        targetCA: {
            type: Number,
            required: true,
            min: 0,
        },
        targetRecoveryRate: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
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

// Unique compound index
objectiveSchema.index(
    {
        scopeType: 1,
        drId: 1,
        antenneId: 1,
        year: 1,
        month: 1,
    },
    { unique: true }
);

objectiveSchema.index({ scopeType: 1 });
objectiveSchema.index({ year: 1 });
objectiveSchema.index({ isActive: 1 });

export const ObjectiveModel = model<IObjective>("Objective", objectiveSchema);
