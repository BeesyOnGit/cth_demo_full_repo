import { Schema, model } from "mongoose";
import { IInvoice } from "./interface";
import { BillingTypeEnum } from "../project/interface";

const vatRateRefSchema = new Schema(
    {
        vatRateId: {
            type: Schema.Types.ObjectId,
            ref: "VatRate",
            required: true,
        },
        rateSnapshot: {
            type: Number,
            required: true,
        },
    },
    { _id: false },
);

const editHistorySchema = new Schema(
    {
        at: {
            type: Date,
            required: true,
            default: () => {
                return new Date();
            },
        },
        by: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        changes: [
            {
                field: String,
                from: Schema.Types.Mixed,
                to: Schema.Types.Mixed,
            },
        ],
    },
    { _id: false },
);

const invoiceSchema = new Schema<IInvoice>(
    {
        projectId: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        invoiceNumber: {
            type: String,
            required: true,
            // unique: true,
            trim: true,
        },
        invoiceType: {
            type: String,
            required: true,
            enum: Object.values(BillingTypeEnum),
        },
        invoiceDate: {
            type: Date,
            required: true,
        },
        amountHT: {
            type: Number,
            required: true,
            min: 0,
        },
        vatRateRef: {
            type: [vatRateRefSchema],
            required: true,
        },
        amountTTC: {
            type: Number,
            required: true,
            min: 0,
        },
        physicalProgress: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        drId: {
            type: Schema.Types.ObjectId,
            ref: "Dr",
            required: true,
        },
        antenneId: {
            type: Schema.Types.ObjectId,
            ref: "Antenne",
            required: true,
        },
        isRecovered: {
            type: Boolean,
            default: false,
        },
        recoveryDate: {
            type: Date,
            default: null,
        },
        notes: {
            type: String,
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
        editHistory: [editHistorySchema],
    },
    {
        timestamps: true,
    },
);

// Indexes
invoiceSchema.index({ projectId: 1 });
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ invoiceDate: 1 });
invoiceSchema.index({ isActive: 1 });

// Pre-save hook to compute amountTTC
invoiceSchema.pre("save", function (next) {
    if (this.amountHT != null && this.vatRateRef && this.vatRateRef.length > 0) {
        const totalRate = this.vatRateRef.reduce((acc: number, vatRef: any) => acc + vatRef.rateSnapshot, 0);
        this.amountTTC = this.amountHT * (1 + totalRate / 100);
    }
    next();
});

export const InvoiceModel = model<IInvoice>("Invoice", invoiceSchema);
