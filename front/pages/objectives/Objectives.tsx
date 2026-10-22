import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Skeleton } from "../../components/Skeleton";
import { Table } from "../../components/Table";
import { Objective } from "../../types";
import { useObjectiveStore } from "./objectiveStore";
import { Plus, Search } from "lucide-react";
import { useLanguage } from "../../i18n";
import { useToastStore } from "@/store/useToastStore";
import { Modal } from "../../components/Modal";
import { FormBuilder } from "../../components/FormBuilder";
import { handleFormChange, useQueryParams } from "@/utils/utils";
import { objectiveColumns, ObjectiveFormFields, objectiveFilterFields } from "./objectiveUtils";
import { Pagination } from "@/components/Pagination";
import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "../login/useAuthStore";
import FilterQuery from "@/components/FilterQuery";
import { useDrStore } from "../admin-referentials/drs/useDrStore";
import { useAntenneStore } from "../admin-referentials/antennes/antenneStore";
import { FiltersDisplay } from "@/components/FiltersDisplay";

export const Objectives = () => {
    const { t } = useLanguage();
    const { user } = useAuthStore();
    const [searchParams] = useSearchParams();
    const { addToast } = useToastStore();
    const { setQueryParam, removeQueryParam, useQuery } = useQueryParams();

    const {
        objectives,
        objectivePagination,
        isLoadingObjectives,
        getAllObjectives,
        createObjective,
        updateObjective,
        deleteObjective,
        isObjectiveCUD,
    } = useObjectiveStore();
    const { drs, getAllDrs } = useDrStore();
    const { antennes, getAllAntennes } = useAntenneStore();

    const [formData, setFormData] = useState<Partial<Objective>>({});

    const modal: "create" | "edit" | "delete" = useQuery("modal");
    const targetId = useQuery("target");
    const page = useQuery("page");

    useEffect(() => {
        loadData();
    }, [page]);

    useEffect(() => {
        loadReferentials();
    }, []);

    useEffect(() => {
        if (modal && modal === "edit" && targetId && objectives) {
            const objective = objectives.find((o) => o._id === targetId);
            if (objective) {
                setFormData({
                    ...objective,
                    // @ts-ignore - handle hydrated drId/antenneId
                    drId: typeof objective.drId === "object" ? objective.drId._id : objective.drId,
                    // @ts-ignore
                    antenneId: typeof objective.antenneId === "object" ? objective.antenneId._id : objective.antenneId,
                });
            }
            return;
        }
        setFormData({});
    }, [targetId, objectives, modal]);

    const loadData = async () => {
        try {
            await getAllObjectives(searchParams.toString());
        } catch (error) {
            addToast(error as string, "error");
        }
    };

    const loadReferentials = async () => {
        try {
            await Promise.all([getAllDrs("noPag=true"), getAllAntennes("noPag=true")]);
        } catch (error) {
            console.log("Error loading referentials:", error);
        }
    };

    const handleEdit = (id: string) => {
        setQueryParam([
            { name: "modal", value: "edit" },
            { name: "target", value: id },
        ]);
    };

    const handleDelete = (id: string) => {
        setQueryParam([
            { name: "modal", value: "delete" },
            { name: "target", value: id },
        ]);
    };

    const handleCloseModal = () => {
        removeQueryParam(["modal", "target"]);
        setFormData({});
    };

    const handleChangeForm = (name: string, value: any, path?: string) => {
        handleFormChange(setFormData, name, value, path);
    };

    const handleSubmit = async () => {
        try {
            let message = "";

            // Clean up data based on scopeType
            const cleanedData = { ...formData };
            if (cleanedData.scopeType === "NATIONAL") {
                delete cleanedData.drId;
                delete cleanedData.antenneId;
            } else if (cleanedData.scopeType === "DR") {
                delete cleanedData.antenneId;
            }

            // Convert year and month to numbers
            if (cleanedData.year) cleanedData.year = Number(cleanedData.year);
            if (cleanedData.month) cleanedData.month = Number(cleanedData.month);
            if (cleanedData.targetCA) cleanedData.targetCA = Number(cleanedData.targetCA);
            if (cleanedData.targetRecoveryRate) cleanedData.targetRecoveryRate = Number(cleanedData.targetRecoveryRate);

            if (modal === "edit") {
                message = await updateObjective(cleanedData);
            } else {
                message = await createObjective(cleanedData);
            }
            addToast(message, "success");
            handleCloseModal();
            loadData();
        } catch (error) {
            addToast(error as string, "error");
        }
    };

    const handleDeleteConfirm = async () => {
        if (!targetId) return;
        try {
            const message = await deleteObjective(targetId);
            addToast(message, "success");
            handleCloseModal();
            loadData();
        } catch (error) {
            addToast(error as string, "error");
        }
    };

    const formFields = useMemo(() => {
        return ObjectiveFormFields(drs || [], antennes || [], formData);
    }, [drs, antennes, formData]);

    const filterFields = useMemo(() => {
        return objectiveFilterFields(drs || [], antennes || []);
    }, [drs, antennes]);

    const columns = useMemo(() => {
        return objectiveColumns(handleEdit, handleDelete);
    }, []);

    // Check if user is admin
    const isAdmin = user?.isAdmin;

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{t("objectives")}</h1>
                        <p className="text-sm text-slate-500 mt-1">{t("manageObjectives")}</p>
                    </div>
                    {isAdmin && (
                        <Button onClick={() => setQueryParam([{ name: "modal", value: "create" }])}>
                            <Plus size={18} />
                            {t("addObjective")}
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <FilterQuery
                    moreFilters
                    formId="objective-filter"
                    fields={filterFields}
                    onSubmit={(query) => {
                        getAllObjectives(query).catch((e) => addToast(e as string, "error"));
                    }}
                />
                <FiltersDisplay excludeKeys={["page"]} />
                {/* Table */}
                <Card>
                    {isLoadingObjectives && !objectives ? (
                        <div className="space-y-3">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : objectives && objectives.length > 0 ? (
                        <div className="space-y-4">
                            <Table columns={columns} data={objectives} keyExtractor={(k) => k._id} />
                            {objectivePagination && objectivePagination.total > objectivePagination.limit && (
                                <Pagination totalItems={objectivePagination.total} itemsPerPage={objectivePagination.limit} />
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Search className="mx-auto h-12 w-12 text-slate-400" />
                            <h3 className="mt-2 text-sm font-medium text-slate-900">{t("noObjectives")}</h3>
                            <p className="mt-1 text-sm text-slate-500">{t("getStartedByCreatingObjective")}</p>
                        </div>
                    )}
                </Card>
            </div>
            {/* Create/Edit Modal */}
            <Modal
                isOpen={modal === "create" || modal === "edit"}
                onClose={handleCloseModal}
                title={modal === "edit" ? t("editObjective") : t("createObjective")}
            >
                <div className="space-y-4">
                    <FormBuilder fields={formFields} formData={formData} onChange={handleChangeForm} onSubmit={handleSubmit} formId="objective-form" />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={handleCloseModal}>
                            {t("cancel")}
                        </Button>
                        <Button type="submit" form="objective-form" loading={isObjectiveCUD}>
                            {modal === "edit" ? t("update") : t("create")}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={modal === "delete"} onClose={handleCloseModal} title={t("deleteObjective")}>
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">{t("areYouSureDeleteObjective")}</p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleCloseModal}>
                            {t("cancel")}
                        </Button>
                        <Button variant="danger" onClick={handleDeleteConfirm} loading={isObjectiveCUD}>
                            {t("delete")}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};
