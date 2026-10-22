import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Project, ContractMode } from "../../types";
// import { projectService } from "../projects/projectService";
import { Save, AlertTriangle } from "lucide-react";
import { ArrowBack } from "@/utils/rtl";
import { useLanguage } from "../../i18n";
import { FormBuilder } from "@/components/FormBuilder";
import { ProjectFormFields } from "../projects/projectUtils";
import { useAuthStore } from "../login/useAuthStore";
import { useAntenneStore } from "../admin-referentials/antennes/antenneStore";
import { useClientStore } from "../admin-referentials/clients/clientsStore";
import { handleFormChange, useQueryParams } from "@/utils/utils";
import { useToastStore } from "@/store/useToastStore";
import { useProjectsStore } from "../projects/projectsStore";
import { useEmployeeStore } from "../admin-referentials/employees/employeesStore";
import { useVatStore } from "../admin-referentials/vat/vatStore";
import { useOuvrageTypeStore } from "../admin-referentials/ouvrageTypes/ouvrageTypeStore";
import { useServiceTypeStore } from "../admin-referentials/serviceTypes/serviceTypeStore";

export const ProjectForm = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { user } = useAuthStore();

    const { addProject, isProjectCUD, updateProject, getOneProject, projectDetails, clearProject } = useProjectsStore();

    const { getAllAntennes, antennes } = useAntenneStore();
    const { getAllClients, clients } = useClientStore();
    const { getAllVatRates, vatRates } = useVatStore();
    const { getAllEmployees, employees } = useEmployeeStore();
    const { getAllProjects, projects } = useProjectsStore();
    const { getAllOuvrageTypes, ouvrageTypes } = useOuvrageTypeStore();
    const { getAllServiceTypes, serviceTypes } = useServiceTypeStore();

    const { addToast } = useToastStore();
    const { useQuery } = useQueryParams();
    const edit = useQuery("edit");
    const avenant = useQuery("avenantFor");

    const EmptyProject: Partial<Project> = {
        contractMode: ContractMode.LC,
        billingMode: "AVANCEMENT_TRAVAUX",
        // serviceTypeId: "693f38e6ff2a1861df0d229a",
        // ouvrageTypeId: "693f38e6ff2a1861df0d229a",
        isAvenant: false,
        vatRates: [],
        projectManagerIds: [],
        guarantee: { hasPerformanceBond: false },
        isActive: true,
    };
    const [formData, setFormData] = useState<Partial<Project>>(EmptyProject);
    const [editFormData, setEditFormData] = useState<Partial<Project>>({});

    useEffect(() => {
        if (!user) {
            return;
        }
        getAllAntennes(`_id=${user.antenneId}&noPag=true`);
        getAllClients(`antenneId=${user.antenneId},undefined&noPag=true`);
        getAllEmployees(`antenneId=${user.antenneId}&noPag=true`);
        getAllVatRates(`noPag=true`);
        getAllOuvrageTypes(`noPag=true`);
        getAllServiceTypes(`noPag=true`);
        getAllProjects(`antenneId=${user.antenneId}&noPag=true${avenant ? `&_id=${avenant}` : ""}`);
    }, [user]);

    useEffect(() => {
        if (antennes && formData.antenneId === undefined) {
            setFormData((prev) => ({
                ...prev,
                antenneId: antennes[0]?._id || "",
            }));
        }
        if (projects && projects.length === 1 && avenant && formData.parentProjectId === undefined) {
            setFormData((prev) => ({
                ...prev,
                parentProjectId: projects[0]?._id || "",
                // @ts-ignore
                clientId: projects[0]?.clientId?._id || "",
                // @ts-ignore
                projectManagerIds: projects[0]?.projectManagerIds.map((pm) => pm._id) || [],
                isAvenant: true,
            }));
        }
    }, [antennes, projects]);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            if (edit) {
                try {
                    await getOneProject(edit);
                } catch (error) {
                    addToast(error || "Failed to load project details", "error");
                    navigate("/projects");
                }
            }
        };
        fetchProjectDetails();
    }, [edit]);

    useEffect(() => clearProject, []);

    useEffect(() => {
        if (projectDetails && edit) {
            // @ts-ignore
            setFormData({ ...projectDetails, vatRates: projectDetails?.vatRates?.map((el) => el.vatRateId) || [] });
        }
    }, [projectDetails, edit]);

    const FormInputs = useMemo(() => {
        return ProjectFormFields(formData, clients, antennes, serviceTypes, employees, ouvrageTypes, vatRates, projects, !!avenant);
    }, [
        antennes,
        clients,
        employees,
        vatRates,
        projects,
        serviceTypes,
        ouvrageTypes,
        formData.contractMode,
        formData.guarantee,
        formData.isAvenant,
        avenant,
    ]);

    const handleChange = (name: string, value: any, path?: string) => {
        if (name === "contractMode" && value === "LC") {
            setFormData({ ...formData, odsEnd: null, odsStart: null });
        }
        if (name === "contractMode" && value === "ODS") {
            setFormData({ ...formData, lcDate: null });
        }
        if (name === "workAmountMT") {
            setFormData({
                ...formData,
                amountHTSnapshot: (Number(value) * Number(formData.serviceRate)) / 100,
            });
        }
        if (name === "serviceRate") {
            setFormData({
                ...formData,
                amountHTSnapshot: (Number(formData.workAmountMT) * Number(value)) / 100,
            });
        }
        if (name === "parentProjectId") {
            setFormData({
                ...formData,
                // @ts-ignore
                clientId: projects.find((p) => p._id === value)?.clientId?._id as string,
            });
        }
        handleFormChange(setFormData, name, value, path);
    };

    const handleSubmitCreate = useCallback(
        async (formData: any) => {
            try {
                let message = "";
                message = await addProject(formData);

                setFormData(EmptyProject);
                addToast(message, "success");
            } catch (error) {
                addToast(error || "Error submitting form", "error");
            }
        },
        [addProject, addToast],
    );
    const handleSubmitEdit = useCallback(
        async (formData: any) => {
            try {
                let message = "";
                message = await updateProject(formData);

                addToast(message, "success");
            } catch (error) {
                addToast(error || "Error submitting form", "error");
            }
        },
        [updateProject, addToast],
    );

    const handleBack = () => {
        // if (edit) navigate(`/projects/${edit}`);
        navigate("/projects");
    };

    // const handleVatToggle = (rateId: string, rateValue: number) => {
    //     const current = formData.vatRates || [];
    //     const exists = current.find((v) => v.vatRateId === rateId);

    //     if (exists) {
    //         setFormData({ ...formData, vatRates: current.filter((v) => v.vatRateId !== rateId) });
    //     } else {
    //         setFormData({ ...formData, vatRates: [...current, { vatRateId: rateId, rateSnapshot: rateValue }] });
    //     }
    // };

    const isLC = formData.contractMode === ContractMode.LC;

    // if (loading) return <div>{t("loading")}</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                    <ArrowBack size={20} />
                </button>
                <h1 className="text-2xl font-bold text-slate-900">{edit ? t("edit") + " Project" : t("newProject")}</h1>
            </div>
            <Card>
                <FormBuilder
                    fields={FormInputs}
                    formData={formData}
                    onChange={handleChange}
                    onSubmit={edit ? handleSubmitEdit : handleSubmitCreate}
                    formId="project-form"
                />
                <div className="flex justify-end items-end gap-2">
                    <Button type="button" variant="danger" onClick={handleBack} disabled={isProjectCUD}>
                        {t("cancel")}
                    </Button>
                    <Button type="reset" variant="secondary" form="project-form" disabled={isProjectCUD} onClick={() => setFormData(EmptyProject)}>
                        <AlertTriangle size={18} className="me-2" />
                        Reset
                    </Button>
                    <Button type="submit" form="project-form" loading={isProjectCUD} disabled={isProjectCUD}>
                        <Save size={18} className="me-2" />
                        {t("save")}
                    </Button>
                </div>
            </Card>
        </div>
    );
};
