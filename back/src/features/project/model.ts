import { Schema, model } from "mongoose";
import { BillingTypeEnum, IProject } from "./interface";

const projectManagerSnapshotSchema = new Schema(
    {
        employeeId: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        fullName: {
            type: String,
            required: true,
        },
    },
    { _id: false }
);

const vatRateSnapshotSchema = new Schema(
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
        labelSnapshot: {
            type: String,
        },
    },
    { _id: false }
);

const guaranteeSchema = new Schema(
    {
        hasPerformanceBond: {
            type: Boolean,
            required: true,
            default: false,
        },
        date: {
            type: Date,
        },
        number: {
            type: String,
        },
        amount: {
            type: Number,
        },
        bank: {
            type: String,
        },
        cashed: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false }
);

const projectStatsSchema = new Schema(
    {
        totalInvoicedHT: {
            type: Number,
            default: 0,
        },
        totalInvoicedTTC: {
            type: Number,
            default: 0,
        },
        totalRecoveredTTC: {
            type: Number,
            default: 0,
        },
        lastPhysicalProgress: {
            type: Number,
            default: 0,
        },
    },
    { _id: false }
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
    { _id: false }
);

const projectSchema = new Schema<IProject>(
    {
        projectNumber: {
            type: String,
            required: true,
            // unique: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },

        isAvenant: {
            type: Boolean,
            required: true,
            default: false,
        },

        parentProjectId: {
            type: Schema.Types.ObjectId,
            ref: "Project",
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

        clientId: {
            type: Schema.Types.ObjectId,
            ref: "Client",
            required: true,
        },

        projectManagerIds: [
            {
                type: Schema.Types.ObjectId,
                ref: "Employee",
                required: true,
            },
        ],
        // projectManagersSnapshot: [projectManagerSnapshotSchema],
        ouvrageTypeId: {
            type: Schema.Types.ObjectId,
            ref: "OuvrageType",
            required: true,
        },
        serviceTypeId: {
            type: Schema.Types.ObjectId,
            ref: "ServiceType",
            required: true,
        },

        signDate: {
            type: Date,
            required: function (): boolean {
                return this.contractMode && this.contractMode === "ODS";
            },
        },
        operationNumber: {
            type: String,
            required: function (): boolean {
                return this.contractMode && this.contractMode === "ODS";
            },
            trim: true,
        },
        conventionNumber: {
            type: String,
            required: function (): boolean {
                return this.contractMode && this.contractMode === "ODS";
            },
            trim: true,
        },

        billingType: {
            type: String,
            required: true,
            enum: Object.values(BillingTypeEnum),
        },

        billingMode: {
            type: String,
            required: true,
            enum: ["AVANCEMENT_TRAVAUX", "FACTURATION_MO"],
        },
        vatRates: {
            type: [vatRateSnapshotSchema],
            required: true,
            validate: {
                validator: (v: any[]) => v && v.length > 0,
                message: "At least one VAT rate is required",
            },
        },
        contractMode: {
            type: String,
            required: true,
            enum: ["LC", "ODS"],
        },
        lcDate: {
            type: Date,
        },
        isConvertedToOds: {
            type: Boolean,
            default: false,
        },
        convertedAt: {
            type: Date,
        },
        convertedBy: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
        },
        odsStart: {
            type: Date,
        },
        odsEnd: {
            type: Date,
        },
        workAmountMT: {
            type: Number,
            required: true,
            min: 0,
        },
        serviceRate: {
            type: Number,
            required: true,
            min: 0,
        },
        amountHTSnapshot: {
            type: Number,
            required: true,
            min: 0,
        },
        guarantee: guaranteeSchema,
        // last situation number issued (atomic counter, see invoiceNextSituationNumber)
        situationCounter: {
            type: Number,
        },
        // stats: projectStatsSchema,
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
    }
);

// Indexes
projectSchema.index({ projectNumber: 1 });
projectSchema.index({ drId: 1 });
projectSchema.index({ antenneId: 1 });
projectSchema.index({ clientId: 1 });
projectSchema.index({ contractMode: 1 });
projectSchema.index({ isConvertedToOds: 1 });
projectSchema.index({ isActive: 1 });

// Validation: LC requires lcDate
projectSchema.pre("save", function (next) {
    if (this.contractMode === "LC" && !this.lcDate) {
        next(new Error("lcDate is required when contractMode is LC"));
    }

    // ODS or converted LC requires odsStart and odsEnd
    if ((this.contractMode === "ODS" || this.isConvertedToOds) && (!this.odsStart || !this.odsEnd)) {
        next(new Error("odsStart and odsEnd are required for ODS or converted LC"));
    }

    // Guarantee validation
    if (this.guarantee?.hasPerformanceBond) {
        if (!this.guarantee.date || !this.guarantee.number || !this.guarantee.amount || !this.guarantee.bank) {
            next(new Error("Guarantee details (date, number, amount, bank) are required when hasPerformanceBond is true"));
        }
    }

    // VAT rates validation

    next();
});

export const ProjectModel = model<IProject>("Project", projectSchema);
