import mongoose from "mongoose";
import { config } from "../config/index";
import { DrModel } from "../features/dr/model";
import { AntenneModel } from "../features/antenne/model";
import { ProjectModel } from "../features/project/model";
import { InvoiceModel } from "../features/invoice/model";
import { ClientModel } from "../features/client/model";
import { ServiceTypeModel } from "../features/service-type/model";
import { OuvrageTypeModel } from "../features/ouvrage-type/model";
import { VatRateModel } from "../features/vat-rate/model";
import { EmployeeModel } from "../features/employee/model";
import { ClientTypeModel } from "../features/client-type/model";
import { WilayaModel } from "../features/wilaya/model";
import { RoleModel } from "../features/role/model";
import { ObjectiveModel } from "../features/objective/model";
import { BillingTypeEnum } from "../features/project/interface";

const SYSTEM_USER_ID = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");

// Helper function to get random number between min and max
const randomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to get random element from array
const randomElement = <T>(arr: T[]): T => {
    return arr[randomInt(0, arr.length - 1)];
};

// Helper function to get multiple random elements from array
const randomElements = <T>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, arr.length));
};

// Helper function to get random date within range
const randomDate = (start: Date, end: Date): Date => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

async function seedDatabase() {
    try {
        console.log("🌱 Starting database seeding...");

        // Connect to database
        await mongoose.connect(config.mongodbUri);
        console.log("✅ Connected to database");

        // Clear existing data (keep DRs, Antennes, ServiceTypes, OuvrageTypes)
        console.log("🗑️  Clearing existing projects, invoices, clients, and objectives...");
        await Promise.all([InvoiceModel.deleteMany({}), ProjectModel.deleteMany({}), ClientModel.deleteMany({}), ObjectiveModel.deleteMany({})]);
        console.log("✅ Cleared existing projects, invoices, clients, and objectives");

        // Get or create dependencies
        console.log("📦 Fetching dependencies...");

        // Ensure the specific employee exists
        const specificEmployeeId = new mongoose.Types.ObjectId("693f40df96b6bf165f1ca99f");
        let specificEmployee = await EmployeeModel.findById(specificEmployeeId);

        let allEmployees = await EmployeeModel.find({ isActive: true });
        if (allEmployees.length === 0) {
            console.log("⚠️  No employees found, using system user");
            allEmployees = [{ _id: SYSTEM_USER_ID } as any];
        } else {
            console.log(`✅ Found ${allEmployees.length} employees`);
            if (specificEmployee) {
                console.log(`✅ Specific employee ${specificEmployeeId} found`);
            }
        }

        let wilayas = await WilayaModel.find({ isActive: true });
        if (wilayas.length === 0) {
            console.log("⚠️  No wilayas found - please seed wilayas first!");
            process.exit(1);
        }

        let clients = await ClientModel.find({ isActive: true });
        let serviceTypes = await ServiceTypeModel.find({ isActive: true });
        let ouvrageTypes = await OuvrageTypeModel.find({ isActive: true });
        let vatRates = await VatRateModel.find({ isActive: true });
        let clientTypes = await ClientTypeModel.find({ isActive: true });

        // Create default dependencies if missing
        if (clientTypes.length === 0) {
            console.log("🔧 Creating default client types...");
            const defaultClientTypes = [
                { code: "PUBLIC", label: "Public", createdBy: allEmployees[0]._id, updatedBy: allEmployees[0]._id },
                { code: "PRIVE", label: "Privé", createdBy: allEmployees[0]._id, updatedBy: allEmployees[0]._id },
            ];
            const created = await ClientTypeModel.insertMany(defaultClientTypes);
            clientTypes = created;
        }

        if (clients.length === 0) {
            console.log("🔧 Creating default clients...");
            const clientNames = [
                { name: "Algérienne Des Eaux (ADE)", identifier: "CLI-ADE-001", type: 0, wilayas: 3 },
                { name: "Office National de l'Assainissement (ONA)", identifier: "CLI-ONA-002", type: 0, wilayas: 2 },
                { name: "Agence Nationale des Barrages et Transferts (ANBT)", identifier: "CLI-ANBT-003", type: 0, wilayas: 1 },
                { name: "Direction des Ressources en Eau - Alger", identifier: "CLI-DRE-016", type: 0, wilayas: 1 },
                { name: "Direction des Ressources en Eau - Oran", identifier: "CLI-DRE-031", type: 0, wilayas: 1 },
                { name: "Direction des Ressources en Eau - Constantine", identifier: "CLI-DRE-025", type: 0, wilayas: 1 },
                { name: "Sonatrach TRC", identifier: "CLI-SONATRACH-007", type: 1, wilayas: 1 },
                { name: "SEAAL - Société des Eaux et de l'Assainissement d'Alger", identifier: "CLI-SEAAL-008", type: 1, wilayas: 1 },
                { name: "Cosider Travaux Publics", identifier: "CLI-COSIDER-009", type: 1, wilayas: 1 },
                { name: "CNERU - Centre National d'Études et de Recherches en Urbanisme", identifier: "CLI-CNERU-010", type: 0, wilayas: 1 },
            ];

            const defaultClients = clientNames.map((client, index) => {
                const selectedWilayas = randomElements(wilayas, client.wilayas);
                return {
                    name: client.name,
                    identifier: client.identifier,
                    clientTypeId: clientTypes[client.type]._id,
                    wilayaCodes: selectedWilayas.map((w) => w.code),
                    communeCodes: [],
                    drId: [],
                    antenneId: [],
                    financial: {
                        nif: `${(index + 1).toString().padStart(15, "0")}`,
                        nis: `${(index + 1).toString().padStart(15, "0")}`,
                        rc: `${(index + 1).toString().padStart(2, "0")}/${(index + 1).toString().padStart(2, "0")}-${(index + 1).toString().padStart(7, "0")}`,
                    },
                    createdBy: allEmployees[0]._id,
                    updatedBy: allEmployees[0]._id,
                };
            });
            const created = await ClientModel.insertMany(defaultClients);
            clients = created;
        }

        if (serviceTypes.length === 0) {
            console.log("🔧 Creating default service types...");
            const defaultServiceTypes = [
                { code: "CONTROLE", label: "Contrôle", createdBy: allEmployees[0]._id, updatedBy: allEmployees[0]._id },
                { code: "EXPERTISE", label: "Expertise", createdBy: allEmployees[0]._id, updatedBy: allEmployees[0]._id },
                { code: "ETUDES", label: "Études", createdBy: allEmployees[0]._id, updatedBy: allEmployees[0]._id },
                { code: "SURVEILLANCE", label: "Surveillance des Travaux", createdBy: allEmployees[0]._id, updatedBy: allEmployees[0]._id },
            ];
            const created = await ServiceTypeModel.insertMany(defaultServiceTypes);
            serviceTypes = created;
        }

        if (ouvrageTypes.length === 0) {
            console.log("🔧 Creating default ouvrage types...");
            const defaultOuvrageTypes = [
                { code: "BARRAGE" as const, label: "Barrage", createdBy: allEmployees[0]._id, updatedBy: allEmployees[0]._id },
                { code: "TRANSFERT" as const, label: "Transfert", createdBy: allEmployees[0]._id, updatedBy: allEmployees[0]._id },
                { code: "AEP" as const, label: "AEP", createdBy: allEmployees[0]._id, updatedBy: allEmployees[0]._id },
                { code: "STEP" as const, label: "STEP", createdBy: allEmployees[0]._id, updatedBy: allEmployees[0]._id },
                { code: "CHATEAU_EAU" as const, label: "Château d'eau", createdBy: allEmployees[0]._id, updatedBy: allEmployees[0]._id },
            ];
            const created = await OuvrageTypeModel.insertMany(defaultOuvrageTypes);
            ouvrageTypes = created as any;
        }

        if (vatRates.length === 0) {
            console.log("🔧 Creating default VAT rates...");
            const defaultVatRates = [
                { rate: 19, label: "TVA 19%", createdBy: allEmployees[0]._id, updatedBy: allEmployees[0]._id },
                { rate: 9, label: "TVA 9%", createdBy: allEmployees[0]._id, updatedBy: allEmployees[0]._id },
            ];
            const created = await VatRateModel.insertMany(defaultVatRates);
            vatRates = created;
        }

        console.log("✅ Dependencies ready");

        // Fetch existing DRs and Antennes
        console.log("🏢 Fetching existing DRs...");
        const drs = await DrModel.find({ isActive: true });
        if (drs.length === 0) {
            console.log("⚠️  No DRs found - please create DRs first!");
            process.exit(1);
        }
        console.log(`✅ Found ${drs.length} DRs`);

        console.log("📍 Fetching existing Antennes...");
        const allAntennes = await AntenneModel.find({ isActive: true });
        if (allAntennes.length === 0) {
            console.log("⚠️  No Antennes found - please create Antennes first!");
            process.exit(1);
        }
        console.log(`✅ Found ${allAntennes.length} Antennes`);

        // Create employees for each DR/Antenne combination
        console.log("\n👥 Creating employees for DRs and Antennes...");
        let createdEmployeesCount = 0;
        const roles = await RoleModel.find({ isActive: true });
        const defaultRole = roles[0];

        if (!defaultRole) {
            console.log("⚠️  No roles found - please create roles first!");
            process.exit(1);
        }

        for (const dr of drs) {
            // Create 2-3 employees per DR
            const drEmployeeCount = randomInt(2, 3);
            for (let i = 0; i < drEmployeeCount; i++) {
                const employeeName = `Employee ${dr.code}-${i + 1}`;
                const employeeEmail = `employee.${dr.code.toLowerCase()}.${i + 1}@company.dz`;

                // Check if employee already exists
                const existing = await EmployeeModel.findOne({ email: employeeEmail });
                if (!existing) {
                    await EmployeeModel.create({
                        fullName: employeeName,
                        email: employeeEmail,
                        passwordHash: "$2b$10$abcdefghijklmnopqrstuv", // dummy hash
                        roleId: defaultRole._id,
                        drId: dr._id,
                        createdBy: allEmployees[0]._id,
                        updatedBy: allEmployees[0]._id,
                    });
                    createdEmployeesCount++;
                }
            }

            // Get antennes for this DR
            const drAntennes = allAntennes.filter((a: any) => a.drId.equals(dr._id));
            for (const antenne of drAntennes) {
                // Create 1-2 employees per Antenne
                const antenneEmployeeCount = randomInt(1, 2);
                for (let i = 0; i < antenneEmployeeCount; i++) {
                    const employeeName = `Employee ${antenne.code}-${i + 1}`;
                    const employeeEmail = `employee.${antenne.code.toLowerCase().replace(/[^a-z0-9]/g, "")}.${i + 1}@company.dz`;

                    // Check if employee already exists
                    const existing = await EmployeeModel.findOne({ email: employeeEmail });
                    if (!existing) {
                        await EmployeeModel.create({
                            fullName: employeeName,
                            email: employeeEmail,
                            passwordHash: "$2b$10$abcdefghijklmnopqrstuv", // dummy hash
                            roleId: defaultRole._id,
                            drId: dr._id,
                            antenneId: antenne._id,
                            createdBy: allEmployees[0]._id,
                            updatedBy: allEmployees[0]._id,
                        });
                        createdEmployeesCount++;
                    }
                }
            }
        }

        console.log(`✅ Created ${createdEmployeesCount} new employees`);

        // Refresh employees list
        allEmployees = await EmployeeModel.find({ isActive: true });
        console.log(`✅ Total active employees: ${allEmployees.length}`);

        let totalProjects = 0;
        let totalInvoices = 0;

        // For each existing Antenne, create projects and invoices
        for (const antenne of allAntennes) {
            const dr = drs.find((d) => d._id.equals(antenne.drId));
            if (!dr) {
                console.log(`⚠️  Skipping antenne ${antenne.label} - DR not found`);
                continue;
            }

            console.log(`\n📍 Creating projects for ${antenne.label} (${dr.name})...`);

            // Get employees for this DR/Antenne
            const antenneEmployees = allEmployees.filter(
                (emp: any) => emp.drId?.toString() === dr._id.toString() || emp.antenneId?.toString() === antenne._id.toString()
            );

            // If no employees found for this antenne/dr, use system user
            const projectEmployees = antenneEmployees.length > 0 ? antenneEmployees : [allEmployees[0]];
            console.log(`  ℹ️  Found ${projectEmployees.length} employees for this antenne`);

            // Create projects for this antenne - spread across 6 years (2020-2025)
            const projectCount = randomInt(8, 15); // More projects to cover 6 years
            const projects = [];

            for (let j = 0; j < projectCount; j++) {
                const billingMode = randomElement(["AVANCEMENT_TRAVAUX", "FACTURATION_MO"] as const);
                const contractMode = randomElement(["LC", "ODS"] as const);
                const billingType = randomElement([BillingTypeEnum.FACTURE, BillingTypeEnum.SITUATION]);

                // Spread projects across 6 years (2020-2025)
                const year = 2020 + Math.floor((j / projectCount) * 6);
                const signDate = randomDate(new Date(year, 0, 1), new Date(year, 11, 31));
                const workAmountMT = randomInt(500000, 8000000);
                const serviceRate = randomInt(3, 12) / 10; // 0.3% to 1.2%
                const amountHTSnapshot = Math.round(workAmountMT * serviceRate);

                const selectedVatRate = randomElement(vatRates);
                const vatRate = selectedVatRate.rate;

                const hasPerformanceBond = Math.random() > 0.4; // 60% chance of having a bond
                const bondBank = randomElement([
                    "BNA",
                    "CPA",
                    "BEA",
                    "BADR",
                    "BDL",
                    "Société Générale Algérie",
                    "Trust Bank Algeria",
                    "AGB",
                    "BNP Paribas El Djazaïr",
                ]);
                const bondAmount = hasPerformanceBond ? Math.round((amountHTSnapshot * randomInt(5, 15)) / 100) : 0; // 5-15% of project amount
                const bondDate = hasPerformanceBond ? randomDate(new Date(signDate.getTime() - 30 * 24 * 60 * 60 * 1000), signDate) : undefined;
                const bondCashed = hasPerformanceBond ? Math.random() > 0.6 : false; // 15% chance of being cashed

                const projectData = {
                    projectNumber: `${dr.code}-${antenne.code}-P${String(j + 1).padStart(3, "0")}-${year}`,
                    title: `${randomElement(["Contrôle Technique", "Expertise et Suivi", "Étude Technique", "Surveillance des Travaux"])} - ${randomElement(["Barrage", "Station de Transfert", "Réseau AEP", "Station d'Épuration", "Château d'Eau", "Forage"])} - ${randomElement(wilayas).name}`,
                    isAvenant: false,
                    avenants: 0,
                    signDate,
                    operationNumber: `OP-${year}-${randomInt(1000, 9999)}`,
                    conventionNumber: `CONV-${year}-${randomInt(10000, 99999)}`,
                    drId: dr._id,
                    antenneId: antenne._id,
                    clientId: randomElement(clients)._id,
                    projectManagerIds: randomElements(projectEmployees, randomInt(1, Math.min(2, projectEmployees.length))).map((e: any) => e._id),
                    ouvrageTypeId: randomElement(ouvrageTypes)._id,
                    serviceTypeId: randomElement(serviceTypes)._id,
                    billingMode,
                    billingType,
                    vatRates: [
                        {
                            vatRateId: selectedVatRate._id.toString(),
                            rateSnapshot: vatRate,
                            labelSnapshot: selectedVatRate.label,
                        },
                    ],
                    contractMode,
                    isConvertedToOds: contractMode === "ODS",
                    lcDate: contractMode === "LC" ? signDate : undefined,
                    odsStart: contractMode === "ODS" ? signDate : undefined,
                    odsEnd: contractMode === "ODS" ? randomDate(signDate, new Date(2026, 11, 31)) : undefined,
                    odsDurationDays: contractMode === "ODS" ? randomInt(180, 730) : undefined,
                    workAmountMT,
                    serviceRate,
                    amountHTSnapshot,
                    guarantee: {
                        hasPerformanceBond,
                        date: bondDate,
                        number: hasPerformanceBond ? `CAU-${new Date().getFullYear()}-${randomInt(100000, 999999)}` : undefined,
                        amount: bondAmount,
                        bank: hasPerformanceBond ? bondBank : undefined,
                        cashed: hasPerformanceBond ? bondCashed : undefined,
                    },
                    stats: {
                        totalInvoicedHT: 0,
                        totalInvoicedTTC: 0,
                        totalRecoveredTTC: 0,
                        lastPhysicalProgress: 0,
                    },
                    createdBy: allEmployees[0]._id,
                    updatedBy: allEmployees[0]._id,
                };

                const project = await ProjectModel.create(projectData);
                projects.push(project);
                totalProjects++;

                // Create invoices for this project - spread throughout project lifecycle
                const invoiceCount = randomInt(5, 15); // More invoices over 6 years
                const invoices = [];

                let cumulativeProgress = 0;
                let totalInvoicedHT = 0;
                let totalInvoicedTTC = 0;
                let totalRecoveredTTC = 0;

                // Calculate project end date (1-3 years after sign date)
                const projectDuration = randomInt(365, 1095); // 1 to 3 years in days
                const projectEndDate = new Date(signDate.getTime() + projectDuration * 24 * 60 * 60 * 1000);
                const now = new Date();
                const actualEndDate = projectEndDate < now ? projectEndDate : now;

                for (let k = 0; k < invoiceCount; k++) {
                    const progressIncrement = randomInt(6, 12);
                    cumulativeProgress = Math.min(cumulativeProgress + progressIncrement, 100);

                    // Calculate invoice amount based on progress
                    const progressAmount = (amountHTSnapshot * progressIncrement) / 100;
                    const amountHT = Math.round(progressAmount + randomInt(-5000, 5000)); // Add some variance
                    const vatAmount = Math.round(amountHT * (vatRate / 100));
                    const amountTTC = amountHT + vatAmount;

                    // Spread invoices throughout project lifecycle
                    const invoiceTimeRatio = k / invoiceCount;
                    const invoiceDate = new Date(signDate.getTime() + invoiceTimeRatio * (actualEndDate.getTime() - signDate.getTime()));

                    // Recovery chance based on invoice age
                    const daysSinceInvoice = Math.floor((now.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
                    const recoveryChance = Math.min(0.4 + (daysSinceInvoice / 365) * 0.5, 0.9); // 40% to 90% based on age
                    const isRecovered = Math.random() < recoveryChance;

                    let recoveredAmountTTC = 0;
                    let recoveryDate: Date | null = null;
                    if (isRecovered) {
                        recoveredAmountTTC = amountTTC;
                        // Recovery typically happens 30-120 days after invoice
                        const recoveryDelay = randomInt(30, 120);
                        recoveryDate = new Date(invoiceDate.getTime() + recoveryDelay * 24 * 60 * 60 * 1000);
                        // Make sure recovery date is not in the future
                        if (recoveryDate > now) {
                            recoveryDate = now;
                        }
                    }

                    const invoiceData = {
                        projectId: project._id,
                        invoiceNumber: `${project.projectNumber}-${billingType === BillingTypeEnum.SITUATION ? "SIT" : "FACT"}-${String(k + 1).padStart(3, "0")}`,
                        invoiceDate,
                        drId: dr._id,
                        antenneId: antenne._id,
                        invoiceType: billingType,
                        amountHT,
                        vatRateRef: [
                            {
                                vatRateId: selectedVatRate._id,
                                rateSnapshot: vatRate,
                            },
                        ],
                        amountTTC,
                        physicalProgress: cumulativeProgress,
                        isRecovered,
                        recoveryDate,
                        notes:
                            Math.random() > 0.8
                                ? `Observation: ${randomElement(["Conforme", "Révision demandée", "En attente validation", "Approuvé avec réserves"])}`
                                : undefined,
                        createdBy: allEmployees[0]._id,
                        updatedBy: allEmployees[0]._id,
                    };

                    const invoice = await InvoiceModel.create(invoiceData);
                    invoices.push(invoice);
                    totalInvoices++;

                    totalInvoicedHT += amountHT;
                    totalInvoicedTTC += amountTTC;
                    totalRecoveredTTC += recoveredAmountTTC;
                }

                // Update project stats
                await ProjectModel.findByIdAndUpdate(project._id, {
                    "stats.totalInvoicedHT": totalInvoicedHT,
                    "stats.totalInvoicedTTC": totalInvoicedTTC,
                    "stats.totalRecoveredTTC": totalRecoveredTTC,
                    "stats.lastPhysicalProgress": cumulativeProgress,
                });
            }

            console.log(`  ✅ Created ${projectCount} projects for ${antenne.label}`);
        }

        // Create objectives for 2024-2026
        console.log("\n🎯 Creating objectives...");
        const objectiveYears = [2024, 2025, 2026];
        let totalObjectives = 0;

        for (const year of objectiveYears) {
            // 1. Create NATIONAL objectives (yearly)
            const nationalYearlyCA = randomInt(50000000, 100000000); // 50M to 100M DA
            const nationalYearlyRecoveryRate = randomInt(75, 95);

            await ObjectiveModel.create({
                scopeType: "NATIONAL",
                year,
                targetCA: nationalYearlyCA,
                targetRecoveryRate: nationalYearlyRecoveryRate,
                createdBy: allEmployees[0]._id,
                updatedBy: allEmployees[0]._id,
            });
            totalObjectives++;

            // 2. Create DR-level objectives (yearly and monthly)
            for (const dr of drs) {
                const drYearlyCA = Math.round(nationalYearlyCA / drs.length + randomInt(-5000000, 5000000)); // Distribute with variance
                const drYearlyRecoveryRate = randomInt(70, 90);

                // Yearly objective for DR
                await ObjectiveModel.create({
                    scopeType: "DR",
                    drId: dr._id,
                    year,
                    targetCA: drYearlyCA,
                    targetRecoveryRate: drYearlyRecoveryRate,
                    createdBy: allEmployees[0]._id,
                    updatedBy: allEmployees[0]._id,
                });
                totalObjectives++;

                // Monthly objectives for DR (distribute yearly target)
                const baseMonthlyCA = Math.round(drYearlyCA / 12);
                for (let month = 1; month <= 12; month++) {
                    const monthlyVariance = randomInt(-10, 10); // +/- 10% variance
                    const monthlyCA = Math.round(baseMonthlyCA * (1 + monthlyVariance / 100));
                    const monthlyRecoveryRate = randomInt(65, 95);

                    await ObjectiveModel.create({
                        scopeType: "DR",
                        drId: dr._id,
                        year,
                        month,
                        targetCA: monthlyCA,
                        targetRecoveryRate: monthlyRecoveryRate,
                        createdBy: allEmployees[0]._id,
                        updatedBy: allEmployees[0]._id,
                    });
                    totalObjectives++;
                }

                // 3. Create ANTENNE-level objectives (yearly and monthly)
                const drAntennes = allAntennes.filter((a: any) => a.drId.equals(dr._id));
                for (const antenne of drAntennes) {
                    const antenneYearlyCA = Math.round(drYearlyCA / drAntennes.length + randomInt(-2000000, 2000000));
                    const antenneYearlyRecoveryRate = randomInt(65, 88);

                    // Yearly objective for Antenne
                    await ObjectiveModel.create({
                        scopeType: "ANTENNE",
                        drId: dr._id,
                        antenneId: antenne._id,
                        year,
                        targetCA: antenneYearlyCA,
                        targetRecoveryRate: antenneYearlyRecoveryRate,
                        createdBy: allEmployees[0]._id,
                        updatedBy: allEmployees[0]._id,
                    });
                    totalObjectives++;

                    // Monthly objectives for Antenne
                    const baseAntenneMonthlyCA = Math.round(antenneYearlyCA / 12);
                    for (let month = 1; month <= 12; month++) {
                        const monthlyVariance = randomInt(-15, 15); // +/- 15% variance
                        const monthlyCA = Math.round(baseAntenneMonthlyCA * (1 + monthlyVariance / 100));
                        const monthlyRecoveryRate = randomInt(60, 92);

                        await ObjectiveModel.create({
                            scopeType: "ANTENNE",
                            drId: dr._id,
                            antenneId: antenne._id,
                            year,
                            month,
                            targetCA: monthlyCA,
                            targetRecoveryRate: monthlyRecoveryRate,
                            createdBy: allEmployees[0]._id,
                            updatedBy: allEmployees[0]._id,
                        });
                        totalObjectives++;
                    }
                }
            }
        }

        console.log(`✅ Created ${totalObjectives} objectives for ${objectiveYears.join(", ")}`);

        console.log("\n\n🎉 Database seeding completed successfully!");
        console.log(`\n📊 Summary:`);
        console.log(`   - DRs (existing): ${drs.length}`);
        console.log(`   - Antennes (existing): ${allAntennes.length}`);
        console.log(`   - Projects (created): ${totalProjects}`);
        console.log(`   - Invoices (created): ${totalInvoices}`);
        console.log(`   - Objectives (created): ${totalObjectives}`);

        await mongoose.connection.close();
        console.log("\n✅ Database connection closed");
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
}

// Run the seeding
seedDatabase();
