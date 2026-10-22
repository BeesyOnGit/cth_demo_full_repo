import { Schema, model } from "mongoose";
import { IRole } from "./interface";

const roleSchema = new Schema<IRole>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            // enum: ["ADMIN", "PDG", "DGA", "DR", "CHEF_ANTENNE", "CDT", "DT", "DFC"],
        },
        label: {
            type: String,
            required: true,
            trim: true,
        },
        permissions: [
            {
                type: String,
            },
        ],
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

roleSchema.index({ isActive: 1 });

export const RoleModel = model<IRole>("Role", roleSchema);
