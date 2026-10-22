import { Schema, model } from "mongoose";
import { ICommune } from "./interface";
import { string } from "zod";

const communeSchema = new Schema<ICommune>(
    {
        // postCode: {
        //     type: String,
        //     required: true,
        //     unique: true,
        // },
        // communeId: {
        //     type: Number,
        //     required: true,
        //     unique: true,
        //     index: true,
        // },
        communeLt: {
            type: String,
            required: true,
            trim: true,
        },
        communeAr: {
            type: String,
            required: true,
            trim: true,
        },
        dairaLt: {
            type: String,
            required: true,
            trim: true,
        },
        dairaAr: {
            type: String,
            required: true,
            trim: true,
        },
        wilayaCode: {
            type: String,
            ref: "Wilaya",
            required: true,
            index: true,
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

communeSchema.index({ wilayaId: 1, isActive: 1 });
communeSchema.index({ communeLt: 1 });
communeSchema.index({ dairaLt: 1 });

export const CommuneModel = model<ICommune>("Commune", communeSchema);
