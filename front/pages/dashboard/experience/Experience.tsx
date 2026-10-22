import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useExperienceStore } from "./experienceStore";
import { ExperienceDataCard } from "./components/ExperienceDataCard";
import { experienceFilterFields, createExperienceDetailsTableColumns } from "./experienceUtils";
import { Card } from "@/components/Card";
import { Loader } from "@/components/Loader";
import { Skeleton } from "@/components/Skeleton";
import { formatDate } from "@/utils/utils";
import { useToastStore } from "@/store/useToastStore";
import { useEmployeeStore } from "@/pages/admin-referentials/employees/employeesStore";
import { useAuthStore } from "@/pages/login/useAuthStore";
import FilterQuery from "@/components/FilterQuery";
import { Award, User, Calendar, Briefcase } from "lucide-react";
import { Table } from "@/components/Table";
import { useLanguage } from "@/i18n";

export const Experience = () => {
    const { t } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const { experienceStats, isLoading, getExperienceStats } = useExperienceStore();
    const { employees, getAllEmployees } = useEmployeeStore();
    const { user } = useAuthStore();
    const { addToast } = useToastStore();

    useEffect(() => {
        getAllEmployees("noPag=true");
        loadData();
    }, []);

    const loadData = async () => {
        try {
            await getExperienceStats(searchParams.toString());
        } catch (error) {
            addToast(error, "error");
        }
    };

    const handleApplyFilters = (queryString: string) => {
        getExperienceStats(queryString).catch((e) => addToast(e, "error"));
    };

    const experienceFilters = useCallback(() => {
        return experienceFilterFields({ employees: employees || [] });
    }, [employees]);

    const ouvrageTypeData = useMemo(() => {
        if (!experienceStats?.generalStats?.byOuvrageType) return [];
        return experienceStats.generalStats.byOuvrageType.map((item) => ({
            typeName: item.ouvrageType,
            stats: item.stats,
        }));
    }, [experienceStats]);

    const serviceTypeData = useMemo(() => {
        if (!experienceStats?.generalStats?.byServiceType) return [];
        return experienceStats.generalStats.byServiceType.map((item) => ({
            typeName: item.serviceType,
            stats: item.stats,
        }));
    }, [experienceStats]);

    const employeeDetails = useMemo(() => {
        return experienceStats?.employeeDetails;
    }, [experienceStats]);

    return (
        <div className="space-y-6">
            {/* Filters */}
            <FilterQuery noSearch formId="form-fil" fields={experienceFilters()} moreFilters onSubmit={handleApplyFilters} />

            {isLoading ? (
                <>
                    {/* Skeleton for Summary Card */}
                    <div className="rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Skeleton className="h-6 w-6 rounded" />
                            <Skeleton className="h-6 w-48" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Skeleton for Data Visualizations */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-xl border border-slate-200 p-6 space-y-4">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-80 w-full" />
                        </div>
                        <div className="rounded-xl border border-slate-200 p-6 space-y-4">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-80 w-full" />
                        </div>
                    </div>
                </>
            ) : experienceStats ? (
                <>
                    {/* Summary Cards - Only show if employee is selected */}
                    {employeeDetails && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <StatCard
                                title={t("employee")}
                                value={employeeDetails.employeeName}
                                icon={<User className="text-accent" />}
                                description={t("employeeName")}
                            />
                            <StatCard
                                title={t("completedProjects")}
                                value={employeeDetails.totalProjects.toString()}
                                icon={<Briefcase className="text-emerald-500" />}
                                description={t("totalProjectsCount")}
                            />
                            <StatCard
                                title={t("period")}
                                value={experienceStats.period ? `${formatDate({ date: experienceStats.period.start })}` : t("allPeriod")}
                                icon={<Calendar className="text-blue-500" />}
                                description={experienceStats.period ? `${t("until")} ${formatDate({ date: experienceStats.period.end })}` : undefined}
                            />
                        </div>
                    )}
                    {/* Employee Details Table */}
                    {employeeDetails && employeeDetails.experiences && employeeDetails.experiences.length > 0 && (
                        <Card title={`${t("experienceDetails")} - ${employeeDetails.employeeName}`} className="p-0">
                            <Table
                                columns={createExperienceDetailsTableColumns()}
                                data={employeeDetails.experiences}
                                keyExtractor={(item) => item.projectNumber}
                            />
                        </Card>
                    )}
                    <div className="flex w-full gap-2">
                        {/* Experience by Ouvrage Type */}
                        {ouvrageTypeData.length > 0 && (
                            <ExperienceDataCard title={t("byOuvrageType")} data={ouvrageTypeData} labelKey={t("ouvrageType")} />
                        )}

                        {/* Experience by Service Type */}
                        {serviceTypeData.length > 0 && (
                            <ExperienceDataCard title={t("byServiceType")} data={serviceTypeData} labelKey={t("serviceType")} />
                        )}
                    </div>
                </>
            ) : (
                <div className="text-center py-12 text-slate-500">{t("noDataAvailable")}</div>
            )}
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; description?: string }> = ({ title, value, icon, description }) => (
    <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-white via-violet-100/70 to-purple-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-600">{title}</h3>
            <div className="p-2.5 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">{icon}</div>
        </div>
        <div className="mt-4">
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {description && <p className="text-xs font-medium text-slate-600 mt-1">{description}</p>}
        </div>
    </div>
);
