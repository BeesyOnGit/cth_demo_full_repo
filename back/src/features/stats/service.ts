import {
    TurnoverDrStats,
    TurnoverCompanyStats,
    CollectionDrStats,
    CollectionCompanyStats,
    InvoiceStats,
    PerformanceBondStats,
    GeneralTurnoverContent,
    RankingDrAntennesStats,
    DashboardSummary,
    AntenneOverviewStats,
} from "./interface";
import { InvoiceModel } from "../invoice/model";
import { Types } from "mongoose";
import {
    aggregateCumulatedTurnoverByDr,
    aggregateCumulatedTurnoverByServiceType,
    aggregateTurnoverByDr,
    aggregateTurnoverByServiceType,
    findAllActiveDrs,
    findAllActiveServiceTypes,
    aggregateTurnoverByWilaya,
    aggregateCumulatedTurnoverByWilaya,
    aggregateTurnoverByClientType,
    aggregateCumulatedTurnoverByClientType,
    findAllActiveClientTypes,
    aggregateTurnoverEvolutionByDr,
    aggregatePerformanceBondsByDr,
    aggregatePerformanceBondsByBank,
    getPerformanceBondDetails,
    aggregateEmployeeExperienceByOuvrageType,
    aggregateEmployeeExperienceByServiceType,
    getEmployeeExperienceDetails,
    aggregateRankingByDr,
    aggregateRankingByAntenne,
    getTotalClientsCount,
    getTotalProjectsCount,
    getActiveProjectsCount,
    getCompletedProjectsCount,
    getTotalRevenue,
    getPendingInvoicesAmount,
    getTotalInvoicesCount,
    getRevenueGrowth,
    getTopPerformingDr,
    getNewClientsThisMonth,
    getNewProjectsThisMonth,
    getInvoicesThisMonth,
    getInvoicesByStatus,
    getOldestUnrecoveredInvoices,
    getRecentRecoveredInvoices,
    getObjectivesForPeriod,
    aggregateMonthlyTurnover,
    getAntenneOverview,
} from "./repository";

export const calculateCompanyTurnoverStats = async ({ year, month }: { year: number; month: number }): Promise<TurnoverCompanyStats> => {
    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 1));

    const yearStartDate = new Date(Date.UTC(year, 0, 1));
    const cumulatedEndDate = new Date(Date.UTC(year, month + 1, 1));

    try {
        const matchCriteria: any = {
            invoiceDate: { $gte: startDate, $lt: endDate },
            isActive: true,
        };

        const cumulatedMatchCriteria: any = {
            invoiceDate: { $gte: yearStartDate, $lt: cumulatedEndDate },
            isActive: true,
        };

        // Get byDr data
        const currentMonthByDr = await aggregateTurnoverByDr(matchCriteria);
        const cumulatedByDr = await aggregateCumulatedTurnoverByDr(cumulatedMatchCriteria);
        const allDrs = await findAllActiveDrs();

        const currentDrMap = new Map(currentMonthByDr.map((item) => [item._id?.id?.toString() || "Unknown", item.amount]));
        const cumulatedDrMap = new Map(cumulatedByDr.map((item) => [item._id?.id?.toString() || "Unknown", item.cumulatedAmount]));

        const totalTurnover = currentMonthByDr.reduce((sum, item) => sum + item.amount, 0);
        const totalCumulatedTurnover = cumulatedByDr.reduce((sum, item) => sum + item.cumulatedAmount, 0);

        const byDr = allDrs
            .map((dr) => {
                const drId = dr._id.toString();
                const drName = dr.name;
                const amount = currentDrMap.get(drId) || 0;
                const contibutionPercentage = Math.round(totalTurnover > 0 ? (amount / totalTurnover) * 100 : 0);
                const cumulatedAmount = cumulatedDrMap.get(drId) || 0;
                const cumulatedPercentage = Math.round(totalCumulatedTurnover > 0 ? (cumulatedAmount / totalCumulatedTurnover) * 100 : 0);

                return {
                    dr: drName,
                    drId: drId,
                    amount,
                    contibutionPercentage,
                    cumulatedAmount,
                    cumulatedPercentage,
                };
            })
            .sort((a, b) => b.amount - a.amount);

        // Get byServiceType data
        const currentMonthServiceTypes = await aggregateTurnoverByServiceType(matchCriteria);
        const cumulatedServiceTypes = await aggregateCumulatedTurnoverByServiceType(cumulatedMatchCriteria);
        const allServiceTypes = await findAllActiveServiceTypes();

        const currentServiceTypeMap = new Map(currentMonthServiceTypes.map((item) => [item._id || "Unknown", item.amount]));
        const cumulatedServiceTypeMap = new Map(cumulatedServiceTypes.map((item) => [item._id || "Unknown", item.cumulatedAmount]));

        const byServiceType = allServiceTypes
            .map((item) => {
                const key = item.label;
                const amount = currentServiceTypeMap.get(key) || 0;
                const contibutionPercentage = Math.round(totalTurnover > 0 ? (amount / totalTurnover) * 100 : 0);
                const cumulatedAmount = cumulatedServiceTypeMap.get(key) || 0;
                const cumulatedPercentage = Math.round(totalCumulatedTurnover > 0 ? (cumulatedAmount / totalCumulatedTurnover) * 100 : 0);

                return {
                    serviceType: key,
                    amount,
                    contibutionPercentage,
                    cumulatedAmount,
                    cumulatedPercentage,
                };
            })
            .sort((a, b) => b.amount - a.amount);

        // Get byClientType data
        const currentMonthClientTypes = await aggregateTurnoverByClientType(matchCriteria);
        const cumulatedClientTypes = await aggregateCumulatedTurnoverByClientType(cumulatedMatchCriteria);
        const allClientTypes = await findAllActiveClientTypes();

        const currentClientTypeMap = new Map(currentMonthClientTypes.map((item) => [item._id || "Unknown", item.amount]));
        const cumulatedClientTypeMap = new Map(cumulatedClientTypes.map((item) => [item._id || "Unknown", item.cumulatedAmount]));

        const byClientType = allClientTypes
            .map((item) => {
                const key = item.label;
                const amount = currentClientTypeMap.get(key) || 0;
                const contibutionPercentage = Math.round(totalTurnover > 0 ? (amount / totalTurnover) * 100 : 0);
                const cumulatedAmount = cumulatedClientTypeMap.get(key) || 0;
                const cumulatedPercentage = Math.round(totalCumulatedTurnover > 0 ? (cumulatedAmount / totalCumulatedTurnover) * 100 : 0);

                return {
                    clientType: key,
                    amount,
                    contibutionPercentage,
                    cumulatedAmount,
                    cumulatedPercentage,
                };
            })
            .sort((a, b) => b.amount - a.amount);

        // Get turnover evolution by DR
        const turnoverEvolution = await aggregateTurnoverEvolutionByDr();

        // Get objectives realization by DR for the selected period
        const realisationByDr = await Promise.all(
            allDrs.map(async (dr) => {
                const drId = dr._id.toString();
                const drName = dr.name;

                // Get DR objectives for the selected period
                const drObjectives = await getObjectivesForPeriod("DR", year, dr._id);

                // Sum up monthly objectives from January to the selected month (cumulative objective)
                const turnoverObjective = drObjectives
                    .filter((obj: any) => obj.month && obj.month <= month + 1)
                    .reduce((sum: number, obj: any) => sum + obj.targetCA, 0);
                console.log("🚀 ~ file: service.ts:171 ~ allDrs.map ~ turnoverObjective:", turnoverObjective);

                console.log("🚀 ~ file: service.ts:174 ~ allDrs.map ~ cumulatedDrMap:", cumulatedDrMap);
                const turnoverAchieved = cumulatedDrMap.get(drId) || 0;
                const realisationRate = turnoverObjective > 0 ? Math.round((turnoverAchieved / turnoverObjective) * 100) : 0;

                return {
                    dr: drName,
                    drId: drId,
                    turnoverObjective,
                    turnoverAchieved,
                    realisationRate,
                };
            }),
        );
        console.log("🚀 ~ file: service.ts:186 ~ calculateCompanyTurnoverStats ~ realisationByDr:", realisationByDr);

        return {
            totalTurnoverMonth: totalTurnover,
            totalTurnoverCumulated: totalCumulatedTurnover,
            period: {
                start: startDate,
                end: new Date(endDate.getTime() - 1),
            },
            byDr,
            byServiceType,
            byClientType,
            turnoverEvolution,
            realisationByDr,
        };
    } catch (error) {
        throw new Error(`Failed to calculate company turnover stats: ${error}`);
    }
};

export const calculateDrTurnoverStats = async ({ drId, year, month }: { drId: string; year: number; month: number }): Promise<TurnoverDrStats> => {
    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 1));

    const yearStartDate = new Date(Date.UTC(year, 0, 1));
    const cumulatedEndDate = new Date(Date.UTC(year, month + 1, 1));

    try {
        const matchCriteria: any = {
            invoiceDate: { $gte: startDate, $lt: endDate },
            isActive: true,
            drId: new Types.ObjectId(drId),
        };

        const cumulatedMatchCriteria: any = {
            invoiceDate: { $gte: yearStartDate, $lt: cumulatedEndDate },
            isActive: true,
            drId: new Types.ObjectId(drId),
        };

        // Get byServiceType data
        const currentMonthServiceTypes = await aggregateTurnoverByServiceType(matchCriteria);
        const cumulatedServiceTypes = await aggregateCumulatedTurnoverByServiceType(cumulatedMatchCriteria);
        const allServiceTypes = await findAllActiveServiceTypes();

        const totalTurnover = currentMonthServiceTypes.reduce((sum, item) => sum + item.amount, 0);
        const totalCumulatedTurnover = cumulatedServiceTypes.reduce((sum, item) => sum + item.cumulatedAmount, 0);

        const currentServiceTypeMap = new Map(currentMonthServiceTypes.map((item) => [item._id || "Unknown", item.amount]));
        const cumulatedServiceTypeMap = new Map(cumulatedServiceTypes.map((item) => [item._id || "Unknown", item.cumulatedAmount]));

        const byServiceType = allServiceTypes
            .map((item) => {
                const key = item.label;
                const amount = currentServiceTypeMap.get(key) || 0;
                const contibutionPercentage = Math.round(totalTurnover > 0 ? (amount / totalTurnover) * 100 : 0);
                const cumulatedAmount = cumulatedServiceTypeMap.get(key) || 0;
                const cumulatedPercentage = Math.round(totalCumulatedTurnover > 0 ? (cumulatedAmount / totalCumulatedTurnover) * 100 : 0);

                return {
                    serviceType: key,
                    amount,
                    contibutionPercentage,
                    cumulatedAmount,
                    cumulatedPercentage,
                };
            })
            .sort((a, b) => b.amount - a.amount);

        // Get byWilaya data
        const currentMonthWilayas = await aggregateTurnoverByWilaya(matchCriteria);
        const cumulatedWilayas = await aggregateCumulatedTurnoverByWilaya(cumulatedMatchCriteria);

        const currentWilayaMap = new Map(currentMonthWilayas.map((item) => [item._id || "Unknown", item.amount]));
        const cumulatedWilayaMap = new Map(cumulatedWilayas.map((item) => [item._id || "Unknown", item.cumulatedAmount]));

        // Get all unique wilaya names from both current and cumulated data
        const allWilayaNames = new Set([...currentMonthWilayas.map((w) => w._id), ...cumulatedWilayas.map((w) => w._id)]);

        const byWilaya = Array.from(allWilayaNames)
            .filter((name) => name) // Remove null/undefined
            .map((wilayaName) => {
                const amount = currentWilayaMap.get(wilayaName) || 0;
                const contibutionPercentage = Math.round(totalTurnover > 0 ? (amount / totalTurnover) * 100 : 0);
                const cumulatedAmount = cumulatedWilayaMap.get(wilayaName) || 0;
                const cumulatedPercentage = Math.round(totalCumulatedTurnover > 0 ? (cumulatedAmount / totalCumulatedTurnover) * 100 : 0);

                return {
                    wilaya: wilayaName,
                    amount,
                    contibutionPercentage,
                    cumulatedAmount,
                    cumulatedPercentage,
                };
            })
            .sort((a, b) => b.amount - a.amount);

        // Get byClientType data
        const currentMonthClientTypes = await aggregateTurnoverByClientType(matchCriteria);
        const cumulatedClientTypes = await aggregateCumulatedTurnoverByClientType(cumulatedMatchCriteria);
        const allClientTypes = await findAllActiveClientTypes();

        const currentClientTypeMap3 = new Map(currentMonthClientTypes.map((item) => [item._id || "Unknown", item.amount]));
        const cumulatedClientTypeMap3 = new Map(cumulatedClientTypes.map((item) => [item._id || "Unknown", item.cumulatedAmount]));

        const byClientType = allClientTypes
            .map((item) => {
                const key = item.label;
                const amount = currentClientTypeMap3.get(key) || 0;
                const contibutionPercentage = Math.round(totalTurnover > 0 ? (amount / totalTurnover) * 100 : 0);
                const cumulatedAmount = cumulatedClientTypeMap3.get(key) || 0;
                const cumulatedPercentage = Math.round(totalCumulatedTurnover > 0 ? (cumulatedAmount / totalCumulatedTurnover) * 100 : 0);

                return {
                    clientType: key,
                    amount,
                    contibutionPercentage,
                    cumulatedAmount,
                    cumulatedPercentage,
                };
            })
            .sort((a, b) => b.amount - a.amount);

        // Get turnover evolution by DR
        const turnoverEvolution = await aggregateTurnoverEvolutionByDr(new Types.ObjectId(drId));

        // Get monthly objectives and turnover realization for the DR
        const objectives = await getObjectivesForPeriod("DR", year, new Types.ObjectId(drId));
        const monthlyTurnoverData = await aggregateMonthlyTurnover({
            invoiceDate: { $gte: yearStartDate, $lt: cumulatedEndDate },
            isActive: true,
            drId: new Types.ObjectId(drId),
        });
        console.log("monthlyTurnover", monthlyTurnoverData);

        const monthlyTurnoverMap = new Map(monthlyTurnoverData.map((item) => [item._id.month, item.amount]));
        console.log("🚀 ~ file: service.ts:319 ~ calculateDrTurnoverStats ~ monthlyTurnoverMap:", monthlyTurnoverMap);

        // Only include monthly objectives
        const DrTurnoverObjectivesRealisation = objectives
            .filter((obj: any) => obj.month) // Only monthly objectives
            .map((obj: any) => {
                const objMonth = obj.month;
                const turnover = monthlyTurnoverMap.get(objMonth) || 0;
                const realisationRate = obj.targetCA > 0 ? Math.round((turnover / obj.targetCA) * 100) : 0;

                return {
                    objective: obj.targetCA,
                    turnover,
                    realisationRate,
                    month: objMonth,
                };
            })
            .sort((a: any, b: any) => a.month - b.month);

        return {
            totalTurnoverMonth: totalTurnover,
            totalTurnoverCumulated: totalCumulatedTurnover,
            period: {
                start: startDate,
                end: new Date(endDate.getTime() - 1),
            },
            byServiceType,
            byWilaya,
            byClientType,
            turnoverEvolution,
            DrTurnoverObjectivesRealisation,
        };
    } catch (error) {
        throw new Error(`Failed to calculate DR turnover stats: ${error}`);
    }
};

export const calculateTurnoverStats = async ({
    drId,
    year,
    month,
}: {
    drId?: string;
    year?: number;
    month?: number;
}): Promise<TurnoverDrStats | TurnoverCompanyStats> => {
    const currentYear = new Date().getUTCFullYear();
    const currentMonth = new Date().getUTCMonth();

    const targetYear = year || currentYear;
    const targetMonth = month !== undefined ? month - 1 : currentMonth;
    if (drId) {
        return await calculateDrTurnoverStats({ drId, year: targetYear, month: targetMonth });
    }
    return await calculateCompanyTurnoverStats({ year: targetYear, month: targetMonth });
};

export const calculateCompanyCollectionStats = async ({ year, month }: { year: number; month: number }): Promise<CollectionCompanyStats> => {
    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 1));

    const yearStartDate = new Date(Date.UTC(year, 0, 1));
    const cumulatedEndDate = new Date(Date.UTC(year, month + 1, 1));

    try {
        const matchCriteria: any = {
            recoveryDate: { $gte: startDate, $lt: endDate },
            isActive: true,
            isRecovered: true,
        };

        const cumulatedMatchCriteria: any = {
            recoveryDate: { $gte: yearStartDate, $lt: cumulatedEndDate },
            isActive: true,
            isRecovered: true,
        };

        // Get byDr data
        const currentMonthByDr = await aggregateTurnoverByDr(matchCriteria, "ttc");
        const cumulatedByDr = await aggregateCumulatedTurnoverByDr(cumulatedMatchCriteria, "ttc");
        const allDrs = await findAllActiveDrs();

        const currentDrMap = new Map(currentMonthByDr.map((item) => [item._id?.id?.toString() || "Unknown", item.amount]));
        const cumulatedDrMap = new Map(cumulatedByDr.map((item) => [item._id?.id?.toString() || "Unknown", item.cumulatedAmount]));

        const totalTurnover = currentMonthByDr.reduce((sum, item) => sum + item.amount, 0);
        const totalCumulatedTurnover = cumulatedByDr.reduce((sum, item) => sum + item.cumulatedAmount, 0);

        const byDr = allDrs
            .map((dr) => {
                const drId = dr._id.toString();
                const drName = dr.name;
                const amount = currentDrMap.get(drId) || 0;
                const contibutionPercentage = Math.round(totalTurnover > 0 ? (amount / totalTurnover) * 100 : 0);
                const cumulatedAmount = cumulatedDrMap.get(drId) || 0;
                const cumulatedPercentage = Math.round(totalCumulatedTurnover > 0 ? (cumulatedAmount / totalCumulatedTurnover) * 100 : 0);

                return {
                    dr: drName,
                    drId: drId,
                    amount,
                    contibutionPercentage,
                    cumulatedAmount,
                    cumulatedPercentage,
                };
            })
            .sort((a, b) => b.amount - a.amount);

        // Get byServiceType data
        const currentMonthServiceTypes = await aggregateTurnoverByServiceType(matchCriteria, "ttc");
        const cumulatedServiceTypes = await aggregateCumulatedTurnoverByServiceType(cumulatedMatchCriteria, "ttc");
        const allServiceTypes = await findAllActiveServiceTypes();

        const currentServiceTypeMap = new Map(currentMonthServiceTypes.map((item) => [item._id || "Unknown", item.amount]));
        const cumulatedServiceTypeMap = new Map(cumulatedServiceTypes.map((item) => [item._id || "Unknown", item.cumulatedAmount]));

        const byServiceType = allServiceTypes
            .map((item) => {
                const key = item.label;
                const amount = currentServiceTypeMap.get(key) || 0;
                const contibutionPercentage = Math.round(totalTurnover > 0 ? (amount / totalTurnover) * 100 : 0);
                const cumulatedAmount = cumulatedServiceTypeMap.get(key) || 0;
                const cumulatedPercentage = Math.round(totalCumulatedTurnover > 0 ? (cumulatedAmount / totalCumulatedTurnover) * 100 : 0);

                return {
                    serviceType: key,
                    amount,
                    contibutionPercentage,
                    cumulatedAmount,
                    cumulatedPercentage,
                };
            })
            .sort((a, b) => b.amount - a.amount);

        // Get byClientType data
        const currentMonthClientTypes = await aggregateTurnoverByClientType(matchCriteria, "ttc");
        const cumulatedClientTypes = await aggregateCumulatedTurnoverByClientType(cumulatedMatchCriteria, "ttc");
        const allClientTypes = await findAllActiveClientTypes();

        const currentClientTypeMap = new Map(currentMonthClientTypes.map((item) => [item._id || "Unknown", item.amount]));
        const cumulatedClientTypeMap = new Map(cumulatedClientTypes.map((item) => [item._id || "Unknown", item.cumulatedAmount]));

        const byClientType = allClientTypes
            .map((item) => {
                const key = item.label;
                const amount = currentClientTypeMap.get(key) || 0;
                const contibutionPercentage = Math.round(totalTurnover > 0 ? (amount / totalTurnover) * 100 : 0);
                const cumulatedAmount = cumulatedClientTypeMap.get(key) || 0;
                const cumulatedPercentage = Math.round(totalCumulatedTurnover > 0 ? (cumulatedAmount / totalCumulatedTurnover) * 100 : 0);

                return {
                    clientType: key,
                    amount,
                    contibutionPercentage,
                    cumulatedAmount,
                    cumulatedPercentage,
                };
            })
            .sort((a, b) => b.amount - a.amount);

        // Get turnover evolution by DR
        // const turnoverEvolution = await aggregateTurnoverEvolutionByDr();

        // Get collection objectives and rates by DR
        const collectionByDr = await Promise.all(
            allDrs.map(async (dr) => {
                const drId = dr._id;
                const drName = dr.name;

                // Get objectives for this DR for the current year
                const objectives = await getObjectivesForPeriod("DR", year, drId);

                // Calculate objective rate for the month
                const monthObjective = objectives.find((obj) => obj.month === month + 1);
                const objectiveRate = monthObjective?.targetRecoveryRate || 0;

                // Get invoices for this DR for the month
                const drMatchCriteria = {
                    invoiceDate: { $gte: startDate, $lt: endDate },
                    isActive: true,
                    drId: drId,
                };

                const drInvoices = await InvoiceModel.find(drMatchCriteria).lean();
                const totalInvoiced = drInvoices.reduce((sum, inv) => sum + (inv.amountTTC || 0), 0);
                const totalCollected = drInvoices.filter((inv) => inv.isRecovered).reduce((sum, inv) => sum + (inv.amountTTC || 0), 0);

                const collectedRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

                return {
                    dr: drName,
                    drId: drId.toString(),
                    objectiveRate,
                    collectedRate,
                };
            }),
        );

        return {
            totalTurnoverMonth: totalTurnover,
            totalTurnoverCumulated: totalCumulatedTurnover,
            period: {
                start: startDate,
                end: new Date(endDate.getTime() - 1),
            },
            byDr,
            byServiceType,
            byClientType,
            collectionByDr,
            // turnoverEvolution,
        };
    } catch (error) {
        throw new Error(`Failed to calculate company collection stats: ${error}`);
    }
};

export const calculateDrCollectionStats = async ({
    drId,
    year,
    month,
}: {
    drId: string;
    year: number;
    month: number;
}): Promise<CollectionDrStats> => {
    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 1));

    const yearStartDate = new Date(Date.UTC(year, 0, 1));
    const cumulatedEndDate = new Date(Date.UTC(year, month + 1, 1));

    try {
        const matchCriteria: any = {
            recoveryDate: { $gte: startDate, $lt: endDate },
            isActive: true,
            isRecovered: true,
            drId: new Types.ObjectId(drId),
        };

        const cumulatedMatchCriteria: any = {
            recoveryDate: { $gte: yearStartDate, $lt: cumulatedEndDate },
            isActive: true,
            isRecovered: true,
            drId: new Types.ObjectId(drId),
        };

        // Get byServiceType data
        const currentMonthServiceTypes = await aggregateTurnoverByServiceType(matchCriteria, "ttc");
        const cumulatedServiceTypes = await aggregateCumulatedTurnoverByServiceType(cumulatedMatchCriteria, "ttc");
        const allServiceTypes = await findAllActiveServiceTypes();

        const totalTurnover = currentMonthServiceTypes.reduce((sum, item) => sum + item.amount, 0);
        const totalCumulatedTurnover = cumulatedServiceTypes.reduce((sum, item) => sum + item.cumulatedAmount, 0);

        const currentServiceTypeMap = new Map(currentMonthServiceTypes.map((item) => [item._id || "Unknown", item.amount]));
        const cumulatedServiceTypeMap = new Map(cumulatedServiceTypes.map((item) => [item._id || "Unknown", item.cumulatedAmount]));

        const byServiceType = allServiceTypes
            .map((item) => {
                const key = item.label;
                const amount = currentServiceTypeMap.get(key) || 0;
                const contibutionPercentage = Math.round(totalTurnover > 0 ? (amount / totalTurnover) * 100 : 0);
                const cumulatedAmount = cumulatedServiceTypeMap.get(key) || 0;
                const cumulatedPercentage = Math.round(totalCumulatedTurnover > 0 ? (cumulatedAmount / totalCumulatedTurnover) * 100 : 0);

                return {
                    serviceType: key,
                    amount,
                    contibutionPercentage,
                    cumulatedAmount,
                    cumulatedPercentage,
                };
            })
            .sort((a, b) => b.amount - a.amount);

        // Get byWilaya data
        const currentMonthWilayas = await aggregateTurnoverByWilaya(matchCriteria, "ttc");
        const cumulatedWilayas = await aggregateCumulatedTurnoverByWilaya(cumulatedMatchCriteria, "ttc");

        const currentWilayaMap = new Map(currentMonthWilayas.map((item) => [item._id || "Unknown", item.amount]));
        const cumulatedWilayaMap = new Map(cumulatedWilayas.map((item) => [item._id || "Unknown", item.cumulatedAmount]));

        // Get all unique wilaya names from both current and cumulated data
        const allWilayaNames = new Set([...currentMonthWilayas.map((w) => w._id), ...cumulatedWilayas.map((w) => w._id)]);

        const byWilaya = Array.from(allWilayaNames)
            .filter((name) => name) // Remove null/undefined
            .map((wilayaName) => {
                const amount = currentWilayaMap.get(wilayaName) || 0;
                const contibutionPercentage = Math.round(totalTurnover > 0 ? (amount / totalTurnover) * 100 : 0);
                const cumulatedAmount = cumulatedWilayaMap.get(wilayaName) || 0;
                const cumulatedPercentage = Math.round(totalCumulatedTurnover > 0 ? (cumulatedAmount / totalCumulatedTurnover) * 100 : 0);

                return {
                    wilaya: wilayaName,
                    amount,
                    contibutionPercentage,
                    cumulatedAmount,
                    cumulatedPercentage,
                };
            })
            .sort((a, b) => b.amount - a.amount);

        // Get byClientType data
        const currentMonthClientTypes = await aggregateTurnoverByClientType(matchCriteria, "ttc");
        const cumulatedClientTypes = await aggregateCumulatedTurnoverByClientType(cumulatedMatchCriteria, "ttc");
        const allClientTypes = await findAllActiveClientTypes();

        const currentClientTypeMap3 = new Map(currentMonthClientTypes.map((item) => [item._id || "Unknown", item.amount]));
        const cumulatedClientTypeMap3 = new Map(cumulatedClientTypes.map((item) => [item._id || "Unknown", item.cumulatedAmount]));

        const byClientType = allClientTypes
            .map((item) => {
                const key = item.label;
                const amount = currentClientTypeMap3.get(key) || 0;
                const contibutionPercentage = Math.round(totalTurnover > 0 ? (amount / totalTurnover) * 100 : 0);
                const cumulatedAmount = cumulatedClientTypeMap3.get(key) || 0;
                const cumulatedPercentage = Math.round(totalCumulatedTurnover > 0 ? (cumulatedAmount / totalCumulatedTurnover) * 100 : 0);

                return {
                    clientType: key,
                    amount,
                    contibutionPercentage,
                    cumulatedAmount,
                    cumulatedPercentage,
                };
            })
            .sort((a, b) => b.amount - a.amount);

        // Get turnover evolution by DR
        // const turnoverEvolution = await aggregateTurnoverEvolutionByDr(new Types.ObjectId(drId));

        // Get monthly collection objectives realization for DR
        const objectives = await getObjectivesForPeriod("DR", year, new Types.ObjectId(drId));
        const monthlyRecoveryData = await aggregateMonthlyTurnover(
            {
                recoveryDate: { $gte: yearStartDate, $lt: cumulatedEndDate },
                isActive: true,
                isRecovered: true,
                drId: new Types.ObjectId(drId),
            },
            "ttc",
            "recoveryDate",
        );

        const monthlyRecoveryMap = new Map(monthlyRecoveryData.map((item) => [item._id.month, item.amount]));

        // Get monthly turnover for comparison
        const monthlyTurnoverData = await aggregateMonthlyTurnover(
            {
                invoiceDate: { $gte: yearStartDate, $lt: cumulatedEndDate },
                isActive: true,
                drId: new Types.ObjectId(drId),
            },
            "ttc",
        );

        const monthlyTurnoverMap = new Map(monthlyTurnoverData.map((item) => [item._id.month, item.amount]));

        // Only include monthly objectives
        const DrCollectionObjectivesRealisation = objectives
            .filter((obj: any) => obj.month) // Only monthly objectives
            .map((obj: any) => {
                const objMonth = obj.month;
                const collected = monthlyRecoveryMap.get(objMonth) || 0;
                const turnover = monthlyTurnoverMap.get(objMonth) || 0;
                const objectiveRate = obj.targetRecoveryRate;
                const collectedRate = turnover > 0 ? Math.round((collected / turnover) * 100) : 0;

                return {
                    objectiveRate,
                    collectedRate,
                    month: objMonth,
                };
            })
            .sort((a: any, b: any) => a.month - b.month);

        return {
            totalTurnoverMonth: totalTurnover,
            totalTurnoverCumulated: totalCumulatedTurnover,
            period: {
                start: startDate,
                end: new Date(endDate.getTime() - 1),
            },
            byServiceType,
            byWilaya,
            byClientType,
            DrCollectionObjectivesRealisation,
            // turnoverEvolution,
        };
    } catch (error) {
        throw new Error(`Failed to calculate DR collection stats: ${error}`);
    }
};

export const calculateInvoiceCollectionStats = async ({
    drId,
    year,
    month,
}: {
    drId?: string;
    year?: number;
    month?: number;
}): Promise<CollectionDrStats | CollectionCompanyStats> => {
    const currentYear = new Date().getUTCFullYear();
    const currentMonth = new Date().getUTCMonth();

    const targetYear = year || currentYear;
    const targetMonth = month !== undefined ? month - 1 : currentMonth;
    if (drId) {
        return await calculateDrCollectionStats({ drId, year: targetYear, month: targetMonth });
    }
    return await calculateCompanyCollectionStats({ year: targetYear, month: targetMonth });
};

export const calculatePerformanceBondStats = async ({
    drId,
    year,
    month,
    includeDetails,
    page,
    limit,
}: {
    drId?: string;
    year?: number;
    month?: number;
    includeDetails?: string;
    page?: string;
    limit?: string;
}): Promise<PerformanceBondStats> => {
    const defaultStartYear = 1960;
    const defaultEndYear = new Date().getUTCFullYear();
    const defaultStartMonth = 0; // January
    const defaultEndMonth = 11; // December

    const targetYear = year || defaultEndYear;
    const targetMonth = month !== undefined ? month - 1 : defaultEndMonth;

    const start = !year ? new Date(Date.UTC(defaultStartYear, defaultStartMonth, 1)) : new Date(Date.UTC(targetYear, 0, 1));
    const end = new Date(Date.UTC(targetYear, targetMonth + 1, 1)); // exclusive
    const withDetails = includeDetails === "true";

    try {
        const matchCriteria: any = {
            "guarantee.hasPerformanceBond": true,
            "guarantee.date": { $gte: start, $lt: end },
            isActive: true,
        };

        if (drId) {
            matchCriteria.drId = new Types.ObjectId(drId);
        }

        // Get aggregated data by DR
        const byDrData = await aggregatePerformanceBondsByDr(matchCriteria);
        const byBankData = await aggregatePerformanceBondsByBank(matchCriteria);

        // Calculate totals
        const totalBonds = byDrData.reduce((sum, item) => sum + item.totalBonds, 0);
        const totalAmount = byDrData.reduce((sum, item) => sum + item.totalAmount, 0);
        const totalCashed = byDrData.reduce((sum, item) => sum + item.cashedCount, 0);
        const cashedAmount = byDrData.reduce((sum, item) => sum + item.cashedAmount, 0);
        const uncashedAmount = byDrData.reduce((sum, item) => sum + item.uncashedAmount, 0);
        const cashedPercentage = totalBonds > 0 ? Math.round((totalCashed / totalBonds) * 100) : 0;

        const byDr = byDrData.map((item) => ({
            dr: item._id?.name || "Unknown",
            drId: item._id?.id?.toString() || "",
            totalBonds: item.totalBonds,
            totalAmount: item.totalAmount,
            cashedCount: item.cashedCount,
            cashedAmount: item.cashedAmount,
            uncashedAmount: item.uncashedAmount,
        }));

        const byBank = byBankData.map((item) => ({
            bank: item._id || "Unknown",
            totalBonds: item.totalBonds,
            totalAmount: item.totalAmount,
            cashedCount: item.cashedCount,
            cashedAmount: item.cashedAmount,
        }));

        const result: PerformanceBondStats = {
            totalBonds,
            totalAmount,
            totalCashed,
            cashedAmount,
            uncashedAmount,
            cashedPercentage,
            period: {
                start,
                end: new Date(end.getTime() - 1),
            },
            byDr: drId ? undefined : byDr,
            byBank,
        };

        // Include details if requested
        if (withDetails) {
            const pageNum = page ? parseInt(page, 10) : 1;
            const limitNum = limit ? parseInt(limit, 10) : 15;
            const paginatedDetails = await getPerformanceBondDetails(matchCriteria, pageNum, limitNum);
            result.details = paginatedDetails.data;
            result.pagination = {
                total: paginatedDetails.total,
                page: paginatedDetails.page,
                limit: paginatedDetails.limit,
                totalPages: paginatedDetails.totalPages,
            };
        }

        return result;
    } catch (error) {
        throw new Error(`Failed to calculate performance bond stats: ${error}`);
    }
};

export const getPerformanceBondDetailsService = async ({
    drId,
    year,
    month,
    page,
    limit,
}: {
    drId?: string;
    year?: number;
    month?: number;
    page?: string;
    limit?: string;
}) => {
    const defaultStartYear = 1960;
    const defaultEndYear = new Date().getUTCFullYear();
    const defaultStartMonth = 0; // January
    const defaultEndMonth = 11; // December

    const targetYear = year || defaultEndYear;
    const targetMonth = month !== undefined ? month - 1 : defaultEndMonth;

    const start = !year ? new Date(Date.UTC(defaultStartYear, defaultStartMonth, 1)) : new Date(Date.UTC(targetYear, 0, 1));
    const end = new Date(Date.UTC(targetYear, targetMonth + 1, 1)); // exclusive

    try {
        const matchCriteria: any = {
            "guarantee.hasPerformanceBond": true,
            "guarantee.date": { $gte: start, $lt: end },
            isActive: true,
        };

        if (drId) {
            matchCriteria.drId = new Types.ObjectId(drId);
        }

        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 15;
        const paginatedDetails = await getPerformanceBondDetails(matchCriteria, pageNum, limitNum);

        return {
            data: paginatedDetails.data,
            pagination: {
                total: paginatedDetails.total,
                page: paginatedDetails.page,
                limit: paginatedDetails.limit,
                totalPages: paginatedDetails.totalPages,
            },
            period: {
                start,
                end: new Date(end.getTime() - 1),
            },
        };
    } catch (error) {
        throw new Error(`Failed to get performance bond details: ${error}`);
    }
};

export const calculateEmployeeExperienceStats = async (query: any): Promise<any> => {
    try {
        const { employeeId, year } = query;

        // Build match criteria
        const matchCriteria: any = {
            isActive: true,
        };

        let period;
        if (year) {
            const targetYear = parseInt(year, 10);
            const start = new Date(Date.UTC(targetYear, 0, 1)); // January 1st
            const end = new Date(Date.UTC(targetYear + 1, 0, 1)); // exclusive
            matchCriteria.signDate = { $gte: start, $lt: end };
            period = { start, end: new Date(end.getTime() - 1) };
        }

        // Get general stats
        const byOuvrageType = await aggregateEmployeeExperienceByOuvrageType(matchCriteria);
        const byServiceType = await aggregateEmployeeExperienceByServiceType(matchCriteria);

        // Get employee details if employeeId is provided
        let employeeDetails;
        if (employeeId) {
            employeeDetails = await getEmployeeExperienceDetails(employeeId, matchCriteria);
        }

        return {
            generalStats: {
                byOuvrageType,
                byServiceType,
            },
            employeeDetails: employeeDetails || undefined,
            period,
        };
    } catch (error) {
        throw new Error(`Failed to calculate employee experience stats: ${error}`);
    }
};

export const calculateRankingStats = async (query: {
    year?: number;
    type: "dr" | "antenne";
    metric: "turnover" | "collection";
    drId?: string;
}): Promise<RankingDrAntennesStats> => {
    const { year, type = "dr", metric, drId } = query;

    const currentYear = new Date().getUTCFullYear();
    const targetYear = year || currentYear;

    const startDate = new Date(Date.UTC(Number(targetYear), 0, 1));
    const endDate = new Date(Date.UTC(Number(targetYear) + 1, 0, 1)); // exclusive

    try {
        const matchCriteria: any = {
            invoiceDate: { $gte: startDate, $lt: endDate },
            isActive: true,
        };

        // Add DR filter if provided
        if (drId) {
            matchCriteria.drId = new Types.ObjectId(drId);
        }

        let rankings: Array<{
            dr: string;
            antenne: string;
            turnover: number;
            collection: number;
        }> = [];

        if (type === "dr") {
            // Get rankings for all DRs
            rankings = await aggregateRankingByDr(matchCriteria);
        } else if (type === "antenne") {
            // Get rankings for antennes (filtered by DR if drId is provided)
            rankings = await aggregateRankingByAntenne(matchCriteria);
        }

        // Sort based on the selected metric
        rankings.sort((a, b) => {
            const aValue = metric === "turnover" ? a.turnover : a.collection;
            const bValue = metric === "turnover" ? b.turnover : b.collection;
            return bValue - aValue; // Sort descending (most to least)
        });

        return {
            period: {
                start: startDate,
                end: new Date(endDate.getTime() - 1),
            },
            rankings,
        };
    } catch (error) {
        throw new Error(`Failed to calculate ranking stats: ${error}`);
    }
};

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
    try {
        const [
            totalClients,
            totalProjects,
            activeProjects,
            completedProjects,
            totalRevenue,
            pendingInvoicesAmount,
            totalInvoices,
            revenueGrowth,
            topPerformingDr,
            newClientsThisMonth,
            newProjectsThisMonth,
            invoicesThisMonth,
            invoicesByStatus,
            oldestUnrecovered,
            recentRecovered,
        ] = await Promise.all([
            getTotalClientsCount(),
            getTotalProjectsCount(),
            getActiveProjectsCount(),
            getCompletedProjectsCount(),
            getTotalRevenue(),
            getPendingInvoicesAmount(),
            getTotalInvoicesCount(),
            getRevenueGrowth(),
            getTopPerformingDr(),
            getNewClientsThisMonth(),
            getNewProjectsThisMonth(),
            getInvoicesThisMonth(),
            getInvoicesByStatus(),
            getOldestUnrecoveredInvoices(),
            getRecentRecoveredInvoices(),
        ]);

        return {
            totalClients,
            totalProjects,
            activeProjects,
            completedProjects,
            totalRevenue,
            pendingInvoicesAmount,
            totalInvoices,
            revenueGrowth: Math.round(revenueGrowth * 100) / 100,
            topPerformingDr: topPerformingDr || undefined,
            recentActivity: {
                newClientsThisMonth,
                newProjectsThisMonth,
                invoicesThisMonth,
            },
            invoicesByStatus,
            recoveryDetails: {
                oldestUnrecovered,
                recentRecovered,
            },
        };
    } catch (error) {
        throw new Error(`Failed to get dashboard summary: ${error}`);
    }
};

export const getAntenneOverviewStats = async (query: { antenneId: string; year?: number; month?: number }): Promise<AntenneOverviewStats> => {
    try {
        const { antenneId, year, month } = query;

        if (!antenneId) {
            throw new Error("Antenne ID is required");
        }

        const currentYear = new Date().getUTCFullYear();
        const currentMonth = new Date().getUTCMonth();

        const targetYear = year || currentYear;
        const targetMonth = month !== undefined ? month - 1 : currentMonth;

        const startDate = new Date(Date.UTC(targetYear, targetMonth, 1));
        const endDate = new Date(Date.UTC(targetYear, targetMonth + 1, 1)); // exclusive

        const stats = await getAntenneOverview(antenneId, startDate, endDate);

        return {
            period: {
                start: startDate,
                end: new Date(endDate.getTime() - 1),
            },
            turnover: stats.turnover,
            collection: stats.collection,
            pendingInvoices: stats.pendingInvoices,
        };
    } catch (error) {
        throw new Error(`Failed to get antenne overview stats: ${error}`);
    }
};
