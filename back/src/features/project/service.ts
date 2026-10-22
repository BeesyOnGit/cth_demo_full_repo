import * as projectRepo from "./repository";
import { GeneralProjectType, IProject, IVatRateSnapshot } from "./interface";
import { StdQueryOptions } from "../../utils/interface";
import { config } from "../../config/index";
import { PaginatedResult } from "../../utils/response";
import { findAllVatRates } from "../../features/vat-rate/service";
import { invoiceFindAll } from "../invoice/repository";

export const findAllProjects = async (params: StdQueryOptions): Promise<PaginatedResult<IProject>> => {
    const { pageginationDefaultLimit } = config;
    if (!params.limit) params.limit = pageginationDefaultLimit;
    if (!params.page) params.page = 1;
    params.page = (params.page - 1) * params.limit;
    return projectRepo.projectFindAll(params as any);
};

export const findProjectById = async (id: string): Promise<IProject> => {
    const p = await projectRepo.projectFindById(id);

    const projectSnapshot: any = {
        invoiced: 0,
        collected: 0,
        lastProgress: 0,
    };

    const invoices = await invoiceFindAll({ projectId: id, noPag: true } as any);

    if (invoices && invoices.data.length > 0) {
        for (const element of invoices.data) {
            projectSnapshot.invoiced += element.amountHT;
            projectSnapshot.collected += element.isRecovered ? element.amountTTC : 0;
            projectSnapshot.lastProgress =
                element.physicalProgress > projectSnapshot.lastProgress ? element.physicalProgress : projectSnapshot.lastProgress;
        }
    }
    //@ts-ignore
    return { ...p._doc, ...projectSnapshot } as IProject;
};

export const createProject = async (data: GeneralProjectType): Promise<IProject> => {
    const vat = await findAllVatRates({ noPag: true });
    let tmpVat = [];

    for (const rate of data.vatRates ?? []) {
        const found = vat.data.find((v) => v._id?.toString() === rate.toString());
        if (!found) {
            continue;
        }
        const newVatSnapshot: IVatRateSnapshot = {
            vatRateId: found._id.toString(),
            rateSnapshot: found.rate,
            labelSnapshot: found.label,
        };
        tmpVat.push(newVatSnapshot);
    }

    const p = await projectRepo.projectCreate({ ...data, vatRates: tmpVat });
    return p as IProject;
};

export const updateProject = async (data: any): Promise<IProject> => {
    // vatRates is optional on update: keep the stored snapshot when absent
    if (!Array.isArray(data.vatRates)) {
        const { vatRates, ...rest } = data;
        return (await projectRepo.projectUpdate(rest)) as IProject;
    }
    const vat = await findAllVatRates({ noPag: true });
    let tmpVat = [];

    for (const rate of data.vatRates) {
        const found = vat.data.find((v) => v._id?.toString() === rate.toString());
        if (!found) {
            continue;
        }
        const newVatSnapshot: IVatRateSnapshot = {
            vatRateId: found._id.toString(),
            rateSnapshot: found.rate,
            labelSnapshot: found.label,
        };
        tmpVat.push(newVatSnapshot);
    }
    const p = await projectRepo.projectUpdate({ ...data, vatRates: tmpVat });
    return p as IProject;
};

export const convertToOds = async (data: Partial<GeneralProjectType> & { id: string }): Promise<IProject> => {
    const p = await projectRepo.projectUpdate({
        ...data,
        convertedAt: new Date(),
        convertedBy: data.updatedBy,
        isConvertedToOds: true,
    });
    return p as IProject;
};

export const deleteProject = async (id: string, deletedBy: string): Promise<IProject> => {
    const p = await projectRepo.projectDelete(id, deletedBy);
    return p as IProject;
};
