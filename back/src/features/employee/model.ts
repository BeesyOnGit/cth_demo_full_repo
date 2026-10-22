import { Schema, model } from "mongoose";
import { IEmployee } from "./interface";

const employeeSchema = new Schema<IEmployee>(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        passwordHash: {
            type: String,
            required: true,
            select: false,
        },
        roleId: {
            type: Schema.Types.ObjectId,
            ref: "Role",
            required: true,
        },
        drId: {
            type: Schema.Types.ObjectId,
            ref: "Dr",
        },
        antenneId: {
            type: Schema.Types.ObjectId,
            ref: "Antenne",
        },
        wilayaCode: {
            type: String,
            ref: "Wilaya",
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
        isAdmin: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        // never serialize the password hash, even on freshly created documents
        toJSON: {
            transform: (_doc, ret: any) => {
                delete ret.passwordHash;
                return ret;
            },
        },
    }
);

employeeSchema.index({ roleId: 1 });
employeeSchema.index({ drId: 1 });
employeeSchema.index({ antenneId: 1 });
employeeSchema.index({ isActive: 1 });

export const EmployeeModel = model<IEmployee>("Employee", employeeSchema);
