import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Badge } from "../../components/Badge";
import { ViewToggle } from "../../components/ViewToggle";
import { Skeleton } from "../../components/Skeleton";
import { Table, TableColumn } from "../../components/Table";
import { CardGrid } from "../../components/CardGrid";
import { Project, ContractMode, Client } from "../../types";
import { useProjectsStore } from "./projectsStore";
import { Plus, Search, Filter } from "lucide-react";
import { useLanguage } from "../../i18n";
import { useToastStore } from "@/store/useToastStore";
import { useAuthStore } from "../login/useAuthStore";
import { projectColumns, projectFilterFields, projectFilterFormatters } from "./projectUtils";
import { arrayToMap, useQueryParams } from "@/utils/utils";
import { ProjectCard } from "./ProjectCard";
import FilterQuery from "@/components/FilterQuery";
import { Pagination } from "@/components/Pagination";
import { useEmployeeStore } from "../admin-referentials/employees/employeesStore";
import { useAntenneStore } from "../admin-referentials/antennes/antenneStore";
import { useDrStore } from "../admin-referentials/drs/useDrStore";
import { useClientStore } from "../admin-referentials/clients/clientsStore";
import { useOuvrageTypeStore } from "../admin-referentials/ouvrageTypes/ouvrageTypeStore";
import { useServiceTypeStore } from "../admin-referentials/serviceTypes/serviceTypeStore";
import { FiltersDisplay } from "@/components/FiltersDisplay";

export const Projects = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [searchParams] = useSearchParams();

    const { getAllProjects, getFullProjects, fullProjects, projects, projectPagination, isLoadingProjects } = useProjectsStore();
    const { getAllEmployees, employees } = useEmployeeStore();
    const { getAllAntennes, antennes } = useAntenneStore();
    const { getAllDrs, drs } = useDrStore();
    const { getAllClients, clients } = useClientStore();
    const { getAllOuvrageTypes, ouvrageTypes } = useOuvrageTypeStore();
    const { getAllServiceTypes, serviceTypes } = useServiceTypeStore();
    const { user } = useAuthStore();
    const { addToast } = useToastStore();

    const { setQueryParam, removeQueryParam, useQuery } = useQueryParams();

    const page = useQuery("page", "1");
    const deleteMode = useQuery("delete");

    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [view, setView] = useState<"grid" | "table">("table");
    const [search, setSearch] = useState("");
    const [openModal, setOpenModal] = useState<boolean>(false);

    useEffect(() => {
        loadData();
    }, [page]);

    useEffect(() => {
        loadData();
        const onError = (e: any) => addToast(e as string, "error");
        getAllEmployees(`noPag=true`).catch(onError);
        getAllAntennes(`noPag=true`).catch(onError);
        getAllDrs(`noPag=true`).catch(onError);
        getAllClients(`noPag=true`).catch(onError);
        getAllOuvrageTypes(`noPag=true`).catch(onError);
        getAllServiceTypes(`noPag=true`).catch(onError);
        getFullProjects().catch(onError);
    }, []);

    useEffect(() => {
        if (!search.trim()) {
            setFilteredProjects(projects);
        } else {
            const lower = search.toLowerCase();
            setFilteredProjects(projects.filter((p) => p.title.toLowerCase().includes(lower) || p.projectNumber.toLowerCase().includes(lower)));
        }
    }, [search, projects]);

    const closeModal = () => {
        setOpenModal(false);
        removeQueryParam("delete");
    };

    const loadData = async () => {
        try {
            await getAllProjects(searchParams.toString());
        } catch (error) {
            addToast(error as string, "error");
        }
    };

    const projectsColums = useCallback(() => {
        return projectColumns(
            (id: string) => {
                navigate(`/projects/new?edit=${id}`);
            },
            (id: string) => {
                setOpenModal(true);
                setQueryParam([{ name: "delete", value: id }]);
            },
        );
    }, []);

    // Filter Config Section

    const projectFilters = useCallback(() => {
        return projectFilterFields({
            users: employees,
            clients: clients,
            antennes: antennes,
            drs: drs,
            ouvrageTypes: ouvrageTypes,
            services: serviceTypes,
            projects: fullProjects,
        });
    }, [employees, clients, antennes, drs, ouvrageTypes, serviceTypes, fullProjects]);

    const filterFormatters = useMemo(() => {
        return projectFilterFormatters({
            clients: clients,
            antennes: antennes,
            drs: drs,
            employees: employees,
            ouvrageTypes: ouvrageTypes,
            serviceTypes: serviceTypes,
            projects: fullProjects,
        });
    }, [clients, antennes, drs, employees, ouvrageTypes, serviceTypes, fullProjects]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t("projects")}</h1>
                    <p className="text-sm text-slate-500">{t("manageEngineeringProjects")}</p>
                </div>
                <div className="flex items-center gap-3">
                    <ViewToggle view={view} onChange={setView} />

                    <Button onClick={() => navigate("/projects/new")}>
                        <Plus size={18} className="me-2" />
                        {t("newProject")}
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
                <FilterQuery
                    moreFilters
                    formId="project-filter"
                    fields={projectFilters()}
                    onSubmit={(data) => {
                        getAllProjects(data).catch((e) => addToast(e as string, "error"));
                    }}
                    queryName="search"
                    placeholder={t("searchProjectsByNameOrNumber") || "Search projects by name or number"}
                />
            </div>
            <FiltersDisplay excludeKeys={["page"]} formatters={filterFormatters} />

            {isLoadingProjects ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                                <Skeleton className="h-6 w-3/4" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <>
                    {view === "grid" ? (
                        <CardGrid
                            columns={projectsColums()}
                            data={projects || []}
                            keyExtractor={(project) => project._id}
                            onCardClick={(project) => navigate(`/projects/${project._id}`)}
                            CardComponent={ProjectCard}
                            emptyMessage="No projects found"
                        />
                    ) : (
                        <Card className="overflow-hidden p-0">
                            <Table
                                columns={projectsColums()}
                                data={projects || []}
                                keyExtractor={(project) => project._id}
                                onRowClick={(project) => navigate(`/projects/${project._id}`)}
                                emptyMessage="No projects found"
                            />
                            <Pagination totalItems={projectPagination?.total} itemsPerPage={projectPagination?.limit} showInfo />
                        </Card>
                    )}

                    {/* {!isLoadingProjects && filteredProjects.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                            <p className="text-slate-500">No projects found.</p>
                        </div>
                    )} */}
                </>
            )}
        </div>
    );
};
