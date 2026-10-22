import { InvoiceModel } from "../invoice/model";
import { ServiceTypeModel } from "../service-type/model";
import { DrModel } from "../dr/model";
import { WilayaModel } from "../wilaya/model";
import { ClientTypeModel } from "../client-type/model";
import { ProjectModel } from "../project/model";
import { ClientModel } from "../client/model";
import { ObjectiveModel } from "../objective/model";
import { Types } from "mongoose";

interface AggregationResult {
    _id: any;
    amount: number;
}

interface CumulatedAggregationResult {
    _id: any;
    cumulatedAmount: number;
}

export const aggregateTurnoverByDr = async (matchCriteria: any, amountType: "ht" | "ttc" = "ht"): Promise<AggregationResult[]> => {
    const amountField = amountType === "ttc" ? "$amountTTC" : "$amountHT";
    return await InvoiceModel.aggregate([
        {
            $match: matchCriteria,
        },
        {
            $lookup: {
                from: "drs",
                localField: "drId",
                foreignField: "_id",
                as: "dr",
            },
        },
        {
            $unwind: {
                path: "$dr",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $group: {
                _id: { name: "$dr.name", id: "$dr._id" },
                amount: { $sum: amountField },
            },
        },
        {
            $sort: { amount: -1 },
        },
    ]);
};

export const aggregateCumulatedTurnoverByDr = async (matchCriteria: any, amountType: "ht" | "ttc" = "ht"): Promise<CumulatedAggregationResult[]> => {
    const amountField = amountType === "ttc" ? "$amountTTC" : "$amountHT";
    return await InvoiceModel.aggregate([
        {
            $match: matchCriteria,
        },
        {
            $lookup: {
                from: "drs",
                localField: "drId",
                foreignField: "_id",
                as: "dr",
            },
        },
        {
            $unwind: {
                path: "$dr",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $group: {
                _id: { name: "$dr.name", id: "$dr._id" },
                cumulatedAmount: { $sum: amountField },
            },
        },
    ]);
};

export const aggregateTurnoverByServiceType = async (matchCriteria: any, amountType: "ht" | "ttc" = "ht"): Promise<AggregationResult[]> => {
    const amountField = amountType === "ttc" ? "$amountTTC" : "$amountHT";
    return await InvoiceModel.aggregate([
        {
            $match: matchCriteria,
        },
        {
            $lookup: {
                from: "projects",
                localField: "projectId",
                foreignField: "_id",
                as: "project",
            },
        },
        {
            $unwind: "$project",
        },
        {
            $lookup: {
                from: "servicetypes",
                localField: "project.serviceTypeId",
                foreignField: "_id",
                as: "serviceType",
            },
        },
        {
            $unwind: {
                path: "$serviceType",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $group: {
                _id: "$serviceType.label",
                amount: { $sum: amountField },
            },
        },
        {
            $sort: { amount: -1 },
        },
    ]);
};

export const aggregateCumulatedTurnoverByServiceType = async (
    matchCriteria: any,
    amountType: "ht" | "ttc" = "ht",
): Promise<CumulatedAggregationResult[]> => {
    const amountField = amountType === "ttc" ? "$amountTTC" : "$amountHT";
    return await InvoiceModel.aggregate([
        {
            $match: matchCriteria,
        },
        {
            $lookup: {
                from: "projects",
                localField: "projectId",
                foreignField: "_id",
                as: "project",
            },
        },
        {
            $unwind: "$project",
        },
        {
            $lookup: {
                from: "servicetypes",
                localField: "project.serviceTypeId",
                foreignField: "_id",
                as: "serviceType",
            },
        },
        {
            $unwind: {
                path: "$serviceType",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $group: {
                _id: "$serviceType.label",
                cumulatedAmount: { $sum: amountField },
            },
        },
    ]);
};

export const findAllActiveServiceTypes = async () => {
    return await ServiceTypeModel.find({ isActive: true }, { label: 1 }).lean();
};

export const findAllActiveDrs = async () => {
    return await DrModel.find({ isActive: true }, { name: 1 }).lean();
};

export const findAllActiveWilayas = async () => {
    return await WilayaModel.find({ isActive: true }, { name: 1 }).lean();
};

export const findAllActiveClientTypes = async () => {
    return await ClientTypeModel.find({ isActive: true }, { label: 1 }).lean();
};

export const aggregateTurnoverByWilaya = async (matchCriteria: any, amountType: "ht" | "ttc" = "ht"): Promise<AggregationResult[]> => {
    const amountField = amountType === "ttc" ? "$amountTTC" : "$amountHT";
    return await InvoiceModel.aggregate([
        {
            $match: matchCriteria,
        },
        {
            $lookup: {
                from: "projects",
                localField: "projectId",
                foreignField: "_id",
                as: "project",
            },
        },
        {
            $unwind: "$project",
        },
        {
            $lookup: {
                from: "clients",
                localField: "project.clientId",
                foreignField: "_id",
                as: "client",
            },
        },
        {
            $unwind: {
                path: "$client",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                wilayaCode: {
                    $cond: {
                        if: { $and: [{ $ifNull: ["$client.wilayaCodes", false] }, { $gt: [{ $size: "$client.wilayaCodes" }, 0] }] },
                        then: { $arrayElemAt: ["$client.wilayaCodes", 0] },
                        else: null,
                    },
                },
            },
        },
        {
            $lookup: {
                from: "wilayas",
                localField: "wilayaCode",
                foreignField: "code",
                as: "wilaya",
            },
        },
        {
            $unwind: {
                path: "$wilaya",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                wilayaName: {
                    $ifNull: ["$wilaya.name", "Other"],
                },
            },
        },
        {
            $group: {
                _id: "$wilayaName",
                amount: { $sum: amountField },
            },
        },
        {
            $sort: { amount: -1 },
        },
    ]);
};

export const aggregateCumulatedTurnoverByWilaya = async (
    matchCriteria: any,
    amountType: "ht" | "ttc" = "ht",
): Promise<CumulatedAggregationResult[]> => {
    const amountField = amountType === "ttc" ? "$amountTTC" : "$amountHT";
    return await InvoiceModel.aggregate([
        {
            $match: matchCriteria,
        },
        {
            $lookup: {
                from: "projects",
                localField: "projectId",
                foreignField: "_id",
                as: "project",
            },
        },
        {
            $unwind: "$project",
        },
        {
            $lookup: {
                from: "clients",
                localField: "project.clientId",
                foreignField: "_id",
                as: "client",
            },
        },
        {
            $unwind: {
                path: "$client",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                wilayaCode: {
                    $cond: {
                        if: { $and: [{ $ifNull: ["$client.wilayaCodes", false] }, { $gt: [{ $size: "$client.wilayaCodes" }, 0] }] },
                        then: { $arrayElemAt: ["$client.wilayaCodes", 0] },
                        else: null,
                    },
                },
            },
        },
        {
            $lookup: {
                from: "wilayas",
                localField: "wilayaCode",
                foreignField: "code",
                as: "wilaya",
            },
        },
        {
            $unwind: {
                path: "$wilaya",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                wilayaName: {
                    $ifNull: ["$wilaya.name", "Other"],
                },
            },
        },
        {
            $group: {
                _id: "$wilayaName",
                cumulatedAmount: { $sum: amountField },
            },
        },
    ]);
};

export const aggregateTurnoverByClientType = async (matchCriteria: any, amountType: "ht" | "ttc" = "ht"): Promise<AggregationResult[]> => {
    const amountField = amountType === "ttc" ? "$amountTTC" : "$amountHT";
    return await InvoiceModel.aggregate([
        {
            $match: matchCriteria,
        },
        {
            $lookup: {
                from: "projects",
                localField: "projectId",
                foreignField: "_id",
                as: "project",
            },
        },
        {
            $unwind: "$project",
        },
        {
            $lookup: {
                from: "clients",
                localField: "project.clientId",
                foreignField: "_id",
                as: "client",
            },
        },
        {
            $unwind: "$client",
        },
        {
            $lookup: {
                from: "clienttypes",
                localField: "client.clientTypeId",
                foreignField: "_id",
                as: "clientType",
            },
        },
        {
            $unwind: {
                path: "$clientType",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $group: {
                _id: "$clientType.label",
                amount: { $sum: amountField },
            },
        },
        {
            $sort: { amount: -1 },
        },
    ]);
};

export const aggregateCumulatedTurnoverByClientType = async (
    matchCriteria: any,
    amountType: "ht" | "ttc" = "ht",
): Promise<CumulatedAggregationResult[]> => {
    const amountField = amountType === "ttc" ? "$amountTTC" : "$amountHT";
    return await InvoiceModel.aggregate([
        {
            $match: matchCriteria,
        },
        {
            $lookup: {
                from: "projects",
                localField: "projectId",
                foreignField: "_id",
                as: "project",
            },
        },
        {
            $unwind: "$project",
        },
        {
            $lookup: {
                from: "clients",
                localField: "project.clientId",
                foreignField: "_id",
                as: "client",
            },
        },
        {
            $unwind: "$client",
        },
        {
            $lookup: {
                from: "clienttypes",
                localField: "client.clientTypeId",
                foreignField: "_id",
                as: "clientType",
            },
        },
        {
            $unwind: {
                path: "$clientType",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $group: {
                _id: "$clientType.label",
                cumulatedAmount: { $sum: amountField },
            },
        },
    ]);
};

export const aggregateTurnoverEvolutionByDr = async (drId?: Types.ObjectId, amountType: "ht" | "ttc" = "ht"): Promise<any[]> => {
    const amountField = amountType === "ttc" ? "$amountTTC" : "$amountHT";
    const matchStage: any = {
        isActive: true,
    };

    if (drId) {
        matchStage.drId = drId;
    }

    const results = await InvoiceModel.aggregate([
        {
            $match: matchStage,
        },
        {
            $lookup: {
                from: "drs",
                localField: "drId",
                foreignField: "_id",
                as: "dr",
            },
        },
        {
            $unwind: {
                path: "$dr",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $group: {
                _id: {
                    dr: "$dr.name",
                    year: { $year: "$invoiceDate" },
                },
                amount: { $sum: amountField },
            },
        },
        {
            $group: {
                _id: "$_id.dr",
                yearlyData: {
                    $push: {
                        year: "$_id.year",
                        amount: "$amount",
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                dr: "$_id",
                yearlyData: 1,
            },
        },
        {
            $sort: { dr: 1 },
        },
    ]);

    // If there are multiple DRs and no specific drId was requested, add combined "entreprise" totals
    if (!drId && results.length > 1) {
        // Collect all years across all DRs
        const yearAmountMap = new Map<number, number>();

        results.forEach((drData) => {
            drData.yearlyData.forEach((yearData: { year: number; amount: number }) => {
                const currentAmount = yearAmountMap.get(yearData.year) || 0;
                yearAmountMap.set(yearData.year, currentAmount + yearData.amount);
            });
        });

        // Convert map to array and sort by year
        const entrepriseYearlyData = Array.from(yearAmountMap.entries())
            .map(([year, amount]) => ({ year, amount }))
            .sort((a, b) => a.year - b.year);

        // Add the entreprise entry
        results.push({
            dr: "entreprise",
            yearlyData: entrepriseYearlyData,
        });
    }

    return results;
};

export const aggregatePerformanceBondsByDr = async (matchCriteria: any): Promise<any[]> => {
    return await ProjectModel.aggregate([
        {
            $match: matchCriteria,
        },
        {
            $lookup: {
                from: "drs",
                localField: "drId",
                foreignField: "_id",
                as: "dr",
            },
        },
        {
            $unwind: {
                path: "$dr",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $group: {
                _id: {
                    id: "$drId",
                    name: "$dr.name",
                },
                totalBonds: { $sum: 1 },
                totalAmount: { $sum: "$guarantee.amount" },
                cashedCount: {
                    $sum: {
                        $cond: [{ $eq: ["$guarantee.cashed", true] }, 1, 0],
                    },
                },
                cashedAmount: {
                    $sum: {
                        $cond: [{ $eq: ["$guarantee.cashed", true] }, "$guarantee.amount", 0],
                    },
                },
                uncashedAmount: {
                    $sum: {
                        $cond: [{ $eq: ["$guarantee.cashed", false] }, "$guarantee.amount", 0],
                    },
                },
            },
        },
        {
            $sort: { totalAmount: -1 },
        },
    ]);
};

export const aggregatePerformanceBondsByBank = async (matchCriteria: any): Promise<any[]> => {
    return await ProjectModel.aggregate([
        {
            $match: matchCriteria,
        },
        {
            $group: {
                _id: "$guarantee.bank",
                totalBonds: { $sum: 1 },
                totalAmount: { $sum: "$guarantee.amount" },
                cashedCount: {
                    $sum: {
                        $cond: [{ $eq: ["$guarantee.cashed", true] }, 1, 0],
                    },
                },
                cashedAmount: {
                    $sum: {
                        $cond: [{ $eq: ["$guarantee.cashed", true] }, "$guarantee.amount", 0],
                    },
                },
            },
        },
        {
            $sort: { totalAmount: -1 },
        },
    ]);
};

export const getPerformanceBondDetails = async (
    matchCriteria: any,
    page?: number,
    limit?: number,
): Promise<{ data: any[]; total: number; page: number; limit: number; totalPages: number }> => {
    const defaultLimit = 10;
    const currentPage = page && page > 0 ? page : 1;
    const currentLimit = limit && limit > 0 ? limit : defaultLimit;
    const skip = (currentPage - 1) * currentLimit;

    const pipeline: any[] = [
        {
            $match: matchCriteria,
        },
        {
            $lookup: {
                from: "drs",
                localField: "drId",
                foreignField: "_id",
                as: "dr",
            },
        },
        {
            $lookup: {
                from: "antennes",
                localField: "antenneId",
                foreignField: "_id",
                as: "antenne",
            },
        },
        {
            $unwind: {
                path: "$dr",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: "$antenne",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                dr: "$dr.name",
                antenne: "$antenne.label",
                projectTitle: "$title",
                conventionNumber: "$conventionNumber",
                bondNumber: "$guarantee.number",
                date: "$guarantee.date",
                bank: "$guarantee.bank",
                amount: "$guarantee.amount",
                cashed: "$guarantee.cashed",
            },
        },
        {
            $sort: { date: -1 },
        },
    ];

    // Get total count
    const countPipeline: any[] = [...pipeline, { $count: "total" }];
    const countResult = await ProjectModel.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Get paginated data
    const dataPipeline: any[] = [...pipeline, { $skip: skip }, { $limit: currentLimit }];
    const data = await ProjectModel.aggregate(dataPipeline);

    return {
        data,
        total,
        page: currentPage,
        limit: currentLimit,
        totalPages: Math.ceil(total / currentLimit),
    };
};

export const aggregateEmployeeExperienceByOuvrageType = async (matchCriteria: any): Promise<any[]> => {
    // First, get total project count per employee
    const employeeTotals = await ProjectModel.aggregate([
        {
            $match: matchCriteria,
        },
        {
            $unwind: "$projectManagerIds",
        },
        {
            $group: {
                _id: "$projectManagerIds",
                totalProjects: { $sum: 1 },
            },
        },
        {
            $sort: { totalProjects: -1 },
        },
        {
            $limit: 5,
        },
    ]);

    const topEmployeeIds = employeeTotals.map((e) => e._id);

    if (topEmployeeIds.length === 0) {
        return [];
    }

    // Now get breakdown by ouvrage type for top 5 employees
    return await ProjectModel.aggregate([
        {
            $match: {
                ...matchCriteria,
                projectManagerIds: { $in: topEmployeeIds },
            },
        },
        {
            $unwind: "$projectManagerIds",
        },
        {
            $match: {
                projectManagerIds: { $in: topEmployeeIds },
            },
        },
        {
            $lookup: {
                from: "employees",
                let: { empId: { $toObjectId: "$projectManagerIds" } },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$empId"] },
                        },
                    },
                    { $project: { passwordHash: 0 } },
                ],
                as: "employee",
            },
        },
        {
            $unwind: {
                path: "$employee",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "ouvragetypes",
                localField: "ouvrageTypeId",
                foreignField: "_id",
                as: "ouvrageType",
            },
        },
        {
            $unwind: {
                path: "$ouvrageType",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $group: {
                _id: {
                    ouvrageType: "$ouvrageType.label",
                    employeeId: "$projectManagerIds",
                    employeeName: "$employee.fullName",
                },
                projectCount: { $sum: 1 },
            },
        },
        {
            $group: {
                _id: "$_id.ouvrageType",
                stats: {
                    $push: {
                        employeeId: "$_id.employeeId",
                        employeeName: "$_id.employeeName",
                        projectCount: "$projectCount",
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                ouvrageType: "$_id",
                stats: 1,
            },
        },
        {
            $sort: { ouvrageType: 1 },
        },
    ]);
};

export const aggregateEmployeeExperienceByServiceType = async (matchCriteria: any): Promise<any[]> => {
    // First, get total project count per employee
    const employeeTotals = await ProjectModel.aggregate([
        {
            $match: matchCriteria,
        },
        {
            $unwind: "$projectManagerIds",
        },
        {
            $group: {
                _id: "$projectManagerIds",
                totalProjects: { $sum: 1 },
            },
        },
        {
            $sort: { totalProjects: -1 },
        },
        {
            $limit: 5,
        },
    ]);

    const topEmployeeIds = employeeTotals.map((e) => e._id);

    if (topEmployeeIds.length === 0) {
        return [];
    }

    // Now get breakdown by service type for top 5 employees
    return await ProjectModel.aggregate([
        {
            $match: {
                ...matchCriteria,
                projectManagerIds: { $in: topEmployeeIds },
            },
        },
        {
            $unwind: "$projectManagerIds",
        },
        {
            $match: {
                projectManagerIds: { $in: topEmployeeIds },
            },
        },
        {
            $lookup: {
                from: "employees",
                let: { empId: { $toObjectId: "$projectManagerIds" } },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$empId"] },
                        },
                    },
                    { $project: { passwordHash: 0 } },
                ],
                as: "employee",
            },
        },
        {
            $unwind: {
                path: "$employee",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "servicetypes",
                localField: "serviceTypeId",
                foreignField: "_id",
                as: "serviceType",
            },
        },
        {
            $unwind: {
                path: "$serviceType",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $group: {
                _id: {
                    serviceType: "$serviceType.label",
                    employeeId: "$projectManagerIds",
                    employeeName: "$employee.fullName",
                },
                projectCount: { $sum: 1 },
            },
        },
        {
            $group: {
                _id: "$_id.serviceType",
                stats: {
                    $push: {
                        employeeId: "$_id.employeeId",
                        employeeName: "$_id.employeeName",
                        projectCount: "$projectCount",
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                serviceType: "$_id",
                stats: 1,
            },
        },
        {
            $sort: { serviceType: 1 },
        },
    ]);
};

export const getEmployeeExperienceDetails = async (employeeId: string, matchCriteria: any): Promise<any> => {
    const results = await ProjectModel.aggregate([
        {
            $match: {
                projectManagerIds: new Types.ObjectId(employeeId),
                ...matchCriteria,
            },
        },
        {
            $lookup: {
                from: "employees",
                let: { empId: { $toObjectId: employeeId } },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$empId"] },
                        },
                    },
                    { $project: { passwordHash: 0 } },
                ],
                as: "employee",
            },
        },
        {
            $unwind: {
                path: "$employee",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "drs",
                localField: "drId",
                foreignField: "_id",
                as: "dr",
            },
        },
        {
            $unwind: {
                path: "$dr",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "antennes",
                localField: "antenneId",
                foreignField: "_id",
                as: "antenne",
            },
        },
        {
            $unwind: {
                path: "$antenne",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "ouvragetypes",
                localField: "ouvrageTypeId",
                foreignField: "_id",
                as: "ouvrageType",
            },
        },
        {
            $unwind: {
                path: "$ouvrageType",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "servicetypes",
                localField: "serviceTypeId",
                foreignField: "_id",
                as: "serviceType",
            },
        },
        {
            $unwind: {
                path: "$serviceType",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $group: {
                _id: {
                    dr: "$dr.name",
                    antenne: "$antenne.label",
                    ouvrageType: "$ouvrageType.label",
                    serviceType: "$serviceType.label",
                    employeeName: "$employee.fullName",
                },
                projectNumber: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                dr: "$_id.dr",
                antenne: "$_id.antenne",
                ouvrageType: "$_id.ouvrageType",
                serviceType: "$_id.serviceType",
                projectNumber: 1,
                employeeName: "$_id.employeeName",
            },
        },
        {
            $sort: { dr: 1, antenne: 1, ouvrageType: 1, serviceType: 1 },
        },
    ]);

    if (results.length === 0) {
        return null;
    }

    const totalProjects = results.reduce((sum, r) => sum + r.projectNumber, 0);

    return {
        employeeId,
        employeeName: results[0].employeeName || "Unknown",
        totalProjects,
        experiences: results.map((r) => ({
            dr: r.dr,
            antenne: r.antenne,
            ouvrageType: r.ouvrageType,
            serviceType: r.serviceType,
            projectNumber: r.projectNumber,
        })),
    };
};

// Ranking aggregations
export const aggregateRankingByDr = async (matchCriteria: any) => {
    return await InvoiceModel.aggregate([
        {
            $match: matchCriteria,
        },
        {
            $lookup: {
                from: "drs",
                localField: "drId",
                foreignField: "_id",
                as: "dr",
            },
        },
        {
            $unwind: {
                path: "$dr",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $group: {
                _id: "$dr.name",
                turnover: { $sum: "$amountHT" },
                collection: {
                    $sum: {
                        $cond: [{ $eq: ["$isRecovered", true] }, "$amountHT", 0],
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                dr: "$_id",
                antenne: "N/A",
                turnover: 1,
                collection: 1,
            },
        },
    ]);
};

export const aggregateRankingByAntenne = async (matchCriteria: any) => {
    return await InvoiceModel.aggregate([
        {
            $match: matchCriteria,
        },
        {
            $lookup: {
                from: "drs",
                localField: "drId",
                foreignField: "_id",
                as: "dr",
            },
        },
        {
            $unwind: {
                path: "$dr",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "antennes",
                localField: "antenneId",
                foreignField: "_id",
                as: "antenne",
            },
        },
        {
            $unwind: {
                path: "$antenne",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $group: {
                _id: {
                    dr: "$dr.name",
                    antenne: "$antenne.label",
                },
                turnover: { $sum: "$amountHT" },
                collection: {
                    $sum: {
                        $cond: [{ $eq: ["$isRecovered", true] }, "$amountHT", 0],
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                dr: "$_id.dr",
                antenne: "$_id.antenne",
                turnover: 1,
                collection: 1,
            },
        },
    ]);
};

// Dashboard Summary Repository Functions
export const getTotalClientsCount = async (): Promise<number> => {
    return await ClientModel.countDocuments({ isActive: true });
};

export const getTotalProjectsCount = async (): Promise<number> => {
    return await ProjectModel.countDocuments({ isActive: true });
};

export const getActiveProjectsCount = async (): Promise<number> => {
    // Projects are active if they don't have an invoice with 100% physical progress
    const completedProjectIds = await InvoiceModel.distinct("projectId", {
        isActive: true,
        physicalProgress: 100,
    });

    return await ProjectModel.countDocuments({
        isActive: true,
        _id: { $nin: completedProjectIds },
    });
};

export const getCompletedProjectsCount = async (): Promise<number> => {
    // Projects are completed if they have an invoice with 100% physical progress
    const completedProjectIds = await InvoiceModel.distinct("projectId", {
        isActive: true,
        physicalProgress: 100,
    });

    return await ProjectModel.countDocuments({
        isActive: true,
        _id: { $in: completedProjectIds },
    });
};

export const getTotalRevenue = async (): Promise<number> => {
    const result = await InvoiceModel.aggregate([
        {
            $match: { isActive: true },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$amountHT" },
            },
        },
    ]);
    return result.length > 0 ? result[0].total : 0;
};

export const getPendingInvoicesAmount = async (): Promise<number> => {
    const result = await InvoiceModel.aggregate([
        {
            $match: {
                isActive: true,
                isRecovered: false,
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$amountTTC" },
            },
        },
    ]);
    return result.length > 0 ? result[0].total : 0;
};

export const getTotalInvoicesCount = async (): Promise<number> => {
    return await InvoiceModel.countDocuments({ isActive: true });
};

export const getRevenueGrowth = async (): Promise<number> => {
    const now = new Date();
    const currentMonth = now.getUTCMonth();
    const currentYear = now.getUTCFullYear();

    // Current period (e.g., Jan 2026)
    const currentMonthStart = new Date(Date.UTC(currentYear, currentMonth, 1));
    const currentMonthEnd = new Date(Date.UTC(currentYear, currentMonth + 1, 1));

    // Same period last year (e.g., Jan 2025)
    const lastYearMonthStart = new Date(Date.UTC(currentYear - 1, currentMonth, 1));
    const lastYearMonthEnd = new Date(Date.UTC(currentYear - 1, currentMonth + 1, 1));

    const currentRevenue = await InvoiceModel.aggregate([
        {
            $match: {
                isActive: true,
                invoiceDate: { $gte: currentMonthStart, $lt: currentMonthEnd },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$amountHT" },
            },
        },
    ]);

    const lastYearRevenue = await InvoiceModel.aggregate([
        {
            $match: {
                isActive: true,
                invoiceDate: { $gte: lastYearMonthStart, $lt: lastYearMonthEnd },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$amountHT" },
            },
        },
    ]);

    const current = currentRevenue.length > 0 ? currentRevenue[0].total : 0;
    const lastYear = lastYearRevenue.length > 0 ? lastYearRevenue[0].total : 0;

    if (lastYear === 0) return current > 0 ? 100 : 0;

    return ((current - lastYear) / lastYear) * 100;
};

export const getTopPerformingDr = async (): Promise<{ name: string; revenue: number } | null> => {
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const yearStart = new Date(Date.UTC(currentYear, 0, 1));
    const yearEnd = new Date(Date.UTC(currentYear + 1, 0, 1)); // exclusive

    const result = await InvoiceModel.aggregate([
        {
            $match: {
                isActive: true,
                invoiceDate: { $gte: yearStart, $lt: yearEnd },
            },
        },
        {
            $lookup: {
                from: "drs",
                localField: "drId",
                foreignField: "_id",
                as: "dr",
            },
        },
        {
            $unwind: "$dr",
        },
        {
            $group: {
                _id: "$dr.name",
                revenue: { $sum: "$amountHT" },
            },
        },
        {
            $sort: { revenue: -1 },
        },
        {
            $limit: 1,
        },
    ]);

    if (result.length > 0) {
        return {
            name: result[0]._id,
            revenue: result[0].revenue,
        };
    }
    return null;
};

export const getNewClientsThisMonth = async (): Promise<number> => {
    const { ClientModel } = await import("../client/model");
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    return await ClientModel.countDocuments({
        isActive: true,
        createdAt: { $gte: monthStart },
    });
};

export const getNewProjectsThisMonth = async (): Promise<number> => {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    return await ProjectModel.countDocuments({
        isActive: true,
        createdAt: { $gte: monthStart },
    });
};

export const getAntenneOverview = async (antenneId: string, startDate: Date, endDate: Date): Promise<any> => {
    const antenneObjectId = new Types.ObjectId(antenneId);

    // Get turnover (total invoiced amount)
    const turnoverResult = await InvoiceModel.aggregate([
        {
            $match: {
                antenneId: antenneObjectId,
                invoiceDate: { $gte: startDate, $lt: endDate },
                isActive: true,
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$amountHT" },
            },
        },
    ]);

    // Get collection (recovered invoices amount)
    const collectionResult = await InvoiceModel.aggregate([
        {
            $match: {
                antenneId: antenneObjectId,
                invoiceDate: { $gte: startDate, $lt: endDate },
                isActive: true,
                isRecovered: true,
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$amountTTC" },
            },
        },
    ]);

    // Get pending invoices amount
    const pendingInvoicesResult = await InvoiceModel.aggregate([
        {
            $match: {
                antenneId: antenneObjectId,
                invoiceDate: { $gte: startDate, $lt: endDate },
                isActive: true,
                isRecovered: false,
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$amountTTC" },
            },
        },
    ]);

    return {
        turnover: turnoverResult.length > 0 ? turnoverResult[0].total : 0,
        collection: collectionResult.length > 0 ? collectionResult[0].total : 0,
        pendingInvoices: pendingInvoicesResult.length > 0 ? pendingInvoicesResult[0].total : 0,
    };
};

export const getInvoicesThisMonth = async (): Promise<number> => {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    return await InvoiceModel.countDocuments({
        isActive: true,
        invoiceDate: { $gte: monthStart },
    });
};

export const getInvoicesByStatus = async (): Promise<Array<{ status: string; count: number; amount: number; percentage: number }>> => {
    const totalInvoices = await InvoiceModel.countDocuments({ isActive: true });

    if (totalInvoices === 0) {
        return [];
    }

    const result = await InvoiceModel.aggregate([
        {
            $match: { isActive: true },
        },
        {
            $addFields: {
                status: {
                    $cond: [{ $eq: ["$isRecovered", true] }, "RECOVERED", "PENDING"],
                },
            },
        },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
                amount: { $sum: "$amountTTC" },
            },
        },
        {
            $sort: { amount: -1 },
        },
    ]);

    return result.map((item) => ({
        status: item._id,
        count: item.count,
        amount: item.amount,
        percentage: (item.count / totalInvoices) * 100,
    }));
};

export const getOldestUnrecoveredInvoices = async (): Promise<Array<any>> => {
    const now = new Date();
    const result = await InvoiceModel.aggregate([
        {
            $match: {
                isActive: true,
                isRecovered: false,
            },
        },
        {
            $lookup: {
                from: "projects",
                localField: "projectId",
                foreignField: "_id",
                as: "project",
            },
        },
        {
            $unwind: {
                path: "$project",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "clients",
                localField: "project.clientId",
                foreignField: "_id",
                as: "client",
            },
        },
        {
            $unwind: {
                path: "$client",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                daysOverdue: {
                    $divide: [{ $subtract: [now, "$invoiceDate"] }, 1000 * 60 * 60 * 24],
                },
            },
        },
        {
            $project: {
                invoiceNumber: 1,
                invoiceDate: 1,
                amountHT: 1,
                projectTitle: "$project.title",
                clientName: "$client.name",
                daysOverdue: { $floor: "$daysOverdue" },
            },
        },
        {
            $sort: { invoiceDate: 1 },
        },
        {
            $limit: 3,
        },
    ]);

    return result;
};

export const getRecentRecoveredInvoices = async (): Promise<Array<any>> => {
    const result = await InvoiceModel.aggregate([
        {
            $match: {
                isActive: true,
                isRecovered: true,
                recoveryDate: { $exists: true, $ne: null },
            },
        },
        {
            $lookup: {
                from: "projects",
                localField: "projectId",
                foreignField: "_id",
                as: "project",
            },
        },
        {
            $unwind: {
                path: "$project",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "clients",
                localField: "project.clientId",
                foreignField: "_id",
                as: "client",
            },
        },
        {
            $unwind: {
                path: "$client",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                invoiceNumber: 1,
                invoiceDate: 1,
                recoveryDate: 1,
                amountHT: 1,
                projectTitle: "$project.title",
                clientName: "$client.name",
            },
        },
        {
            $sort: { recoveryDate: -1 },
        },
        {
            $limit: 3,
        },
    ]);

    return result;
};

// Objectives-related functions
export const getObjectivesForPeriod = async (scopeType: string, year: number, drId?: Types.ObjectId, antenneId?: Types.ObjectId) => {
    const matchCriteria: any = {
        scopeType,
        year,
        isActive: true,
    };

    if (drId) {
        matchCriteria.drId = drId;
    }

    if (antenneId) {
        matchCriteria.antenneId = antenneId;
    }

    return await ObjectiveModel.find(matchCriteria).lean();
};

export const aggregateMonthlyTurnover = async (matchCriteria: any, amountType: "ht" | "ttc" = "ht", dateField: string = "invoiceDate") => {
    const amountField = amountType === "ttc" ? "$amountTTC" : "$amountHT";
    return await InvoiceModel.aggregate([
        {
            $match: matchCriteria,
        },
        {
            $group: {
                _id: {
                    month: { $month: `$${dateField}` },
                },
                amount: { $sum: amountField },
            },
        },
        {
            $sort: { "_id.month": 1 },
        },
    ]);
};
