import { Schema, model } from "mongoose";
import { IClient, IClientFinancial } from "./interface";

const clientAddressSchema = new Schema(
    {
        label: {
            type: String,
            // required: true,
        },
        address: {
            type: String,
            // required: true,
        },
        wilayaCode: {
            type: String,
            ref: "Wilaya",
        },
        communeCode: {
            type: String,
            ref: "Commune",
        },
    },
    { _id: false }
);

const clientContactSchema = new Schema(
    {
        name: {
            type: String,
            // required: true,
        },
        phone: {
            type: String,
            // required: true,
        },
        email: {
            type: String,
            // required: true,
        },
        role: {
            type: String,
            // required: true,
        },
    },
    { _id: false }
);

const clientFinancialSchema = new Schema<IClientFinancial>(
    {
        nif: {
            type: String,
            required: true,
        },
        nis: {
            type: String,
            required: true,
        },
        rc: {
            type: String,
            required: true,
        },
    },
    { _id: false }
);

const clientSchema = new Schema<IClient>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        identifier: {
            type: String,
            trim: true,
        },
        financial: clientFinancialSchema,
        wilayaCodes: {
            type: [String],
            ref: "Wilaya",
            // required: true,
        },
        communeCodes: {
            type: [String],
            ref: "Commune",
            // required: true,
        },
        drId: {
            type: [Schema.Types.ObjectId],
            ref: "Dr",
            // required: true,
        },
        antenneId: {
            type: [Schema.Types.ObjectId],
            ref: "Antenne",
            // required: true,
        },
        clientTypeId: {
            type: Schema.Types.ObjectId,
            ref: "ClientType",
            // required: true,
        },

        addresses: clientAddressSchema,
        contacts: clientContactSchema,
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

clientSchema.index({ name: 1 });
clientSchema.index({ isActive: 1 });
clientSchema.index({ wilayaCodes: 1 });

export const ClientModel = model<IClient>("Client", clientSchema);
