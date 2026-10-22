import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { ViewToggle } from "../../components/ViewToggle";
import { Skeleton } from "../../components/Skeleton";
import { Table, TableColumn } from "../../components/Table";
import { CardGrid } from "../../components/CardGrid";
import { Modal } from "../../components/Modal";
import { Tabs, TabItem, useActiveTab } from "../../components/Tabs";
import { Plus, Users, Map, Building, Briefcase, FileBadge } from "lucide-react";
import { useLanguage } from "../../i18n";
import { Input } from "../../components/Input";
import { useWilayaStore } from "./wilaya/useWilayaStore";
import { useClientStore } from "./clients/clientsStore";
import { useDrStore } from "./drs/useDrStore";
import { drColumns, DrFormFields } from "./drs/drUtils";
import { useAntenneStore } from "./antennes/antenneStore";
import { antenneColumns, antenneFilterFields, AntenneFormFields } from "./antennes/anteneUtils";
import { useToastStore } from "@/store/useToastStore";
import { wilayaColumns, WilayaFormFields } from "./wilaya/wilayaUtils";
import { useRoleStore } from "./roles/useRoleStore";
import { roleColumns, RoleFormFields } from "./roles/roleUtils";
import { useEmployeeStore } from "./employees/employeesStore";
import { employeesColumns, EmployeeFormFields, employeeFilterFields } from "./employees/employeesUtils";
import { clientColumns, clientFilterFields, ClientFormFields, generatePublicClientCode, generatePublicClientName } from "./clients/clientsUtils";
import { useVatStore } from "./vat/vatStore";
import { vatColumns, VatFormFields } from "./vat/vatUtils";
import { useServiceTypeStore } from "./serviceTypes/serviceTypeStore";
import { serviceTypeColumns, ServiceTypeFormFields } from "./serviceTypes/serviceTypeUtils";
import { useOuvrageTypeStore } from "./ouvrageTypes/ouvrageTypeStore";
import { ouvrageTypeColumns, OuvrageTypeFormFields } from "./ouvrageTypes/ouvrageTypeUtils";
import { useClientTypeStore } from "./clientTypes/clientTypeStore";
import { clientTypeColumns, ClientTypeFormFields } from "./clientTypes/clientTypeUtils";
import { useCommuneStore } from "./communes/communeStore";
import { communeColumns, CommuneFormFields } from "./communes/communeUtils";
import { FieldConfig, FormBuilder } from "@/components/FormBuilder";
import { cleanQueryParams, handleFormChange, useQueryParams } from "@/utils/utils";
import { Pagination } from "@/components/Pagination";
import { useSearchParams } from "react-router-dom";
import { PaginationType } from "@/types";
import FilterQuery from "@/components/FilterQuery";

type AdminTab =
    | "wilayas"
    | "clients"
    | "vat"
    | "roles"
    | "employees"
    | "drs"
    | "antennes"
    | "serviceTypes"
    | "ouvrageTypes"
    | "clientTypes"
    | "communes";

export const AdminReferentials = () => {
    const { t } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();

    const { wilayas, getAllWilayas, addWilaya, deleteWilaya, updateWilaya, isLoadingWilaya, isWilayaCUD, wilayaPagination } = useWilayaStore();
    const { clients, getAllClients, addClient, updateClient, deleteClient, isLoadingClient, isClientCUD, clientsPagination } = useClientStore();
    const { drs, getAllDrs, addDr, deleteDr, updateDr, isLoadingDr, isDrCUD, drsPagination } = useDrStore();
    const { antennes, getAllAntennes, addAntenne, deleteAntenne, updateAntenne, isLoadingAntenne, isAntenneCUD, antennePagination } =
        useAntenneStore();
    const { roles, getAllRoles, addRole, updateRole, deleteRole, isLoadingRole, isRoleCUD, rolesPagination } = useRoleStore();
    const { employees, getAllEmployees, addEmployee, updateEmployee, deleteEmployee, isLoadingEmployee, isEmployeeCUD, employeesPagination } =
        useEmployeeStore();
    const { vatRates, getAllVatRates, addVatRate, updateVatRate, deleteVatRate, isLoadingVat, isVatCUD, vatPagination } = useVatStore();
    const {
        serviceTypes,
        getAllServiceTypes,
        addServiceType,
        updateServiceType,
        deleteServiceType,
        isLoadingServiceType,
        isServiceTypeCUD,
        serviceTypePagination,
    } = useServiceTypeStore();
    const {
        ouvrageTypes,
        getAllOuvrageTypes,
        addOuvrageType,
        updateOuvrageType,
        deleteOuvrageType,
        isLoadingOuvrageType,
        isOuvrageTypeCUD,
        ouvrageTypePagination,
    } = useOuvrageTypeStore();
    const {
        clientTypes,
        getAllClientTypes,
        addClientType,
        updateClientType,
        deleteClientType,
        isLoadingClientType,
        isClientTypeCUD,
        clientTypePagination,
    } = useClientTypeStore();
    const { communes, getAllCommunes, addCommune, updateCommune, deleteCommune, isLoadingCommune, isCommuneCUD, communePagination } =
        useCommuneStore();

    const { addToast } = useToastStore();
    const { setQueryParam, removeQueryParam, useQuery, resetQueryParams } = useQueryParams();

    const activeTab = useActiveTab<AdminTab>("tab", "clients");

    const editMode = useQuery("edit");
    const deleteMode = useQuery("delete");
    const page = useQuery("page");
    // const search = useQuery("search");
    const drFilter = useQuery("drId");

    const [data, setData] = useState<any>({});
    const [view, setView] = useState<"grid" | "table">("table");
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!activeTab || fetchMap[activeTab] === undefined) {
            return;
        }
        Promise.resolve(fetchMap[activeTab]()).catch((error) => addToast(error || "Error loading data", "error"));
    }, [activeTab, page]);

    useEffect(() => {
        if (activeTab !== "employees") {
            return;
        }
        if (data.drId) {
            getAllAntennes(`drId=${data.drId}&noPag=true`);
        }
    }, [data.drId]);

    useEffect(() => {
        if (activeTab !== "clients") {
            return;
        }
        // Load antennes when DR is selected for clients
        if (data.drId || drFilter) {
            getAllAntennes(`drId=${data.drId || drFilter}&noPag=true`);
        }
        // Load communes when wilaya is selected for clients
        const wilayaCodes = [];
        if (data.wilayaCodes) wilayaCodes.push(data.wilayaCodes);
        if (data.addresses?.wilayaCode) wilayaCodes.push(data.addresses.wilayaCode);

        if (data.isPublic && data.clientTypeId && data.addresses?.wilayaCode) {
            const selectedClientType = clientTypes.find((ct) => ct._id === data.clientTypeId);
            const selectedWilaya = data.addresses?.wilayaCode ? wilayas.find((w) => w.code === data.addresses?.wilayaCode) : null;
            const selectedCommune = data.addresses?.communeCode ? communes.find((c) => c._id === data.addresses?.communeCode) : null;

            setData((prev: any) => ({
                ...prev,
                identifier: generatePublicClientCode(selectedClientType, selectedWilaya, selectedCommune),
                name: generatePublicClientName(selectedClientType, selectedWilaya, selectedCommune),
            }));
        }
        if (wilayaCodes.length > 0) {
            getAllCommunes(`wilayaCode=${wilayaCodes.join(",")}&noPag=true`);
        }
    }, [data.drId, data.wilayaCodes, data.addresses?.wilayaCode, data.clientTypeId, data.addresses?.communeCode, data.isPublic, drFilter]);

    const fetchMap: Record<AdminTab, any> = {
        wilayas: () => getAllWilayas(`${searchParams}`),
        clients: () => {
            getAllClients(`${searchParams}`);
            getAllWilayas("noPag=true");
            // getAllCommunes("noPag=true");
            getAllDrs("noPag=true");
            // getAllAntennes("noPag=true");
            getAllClientTypes("noPag=true");
        },
        vat: () => getAllVatRates(`${searchParams}`),
        roles: () => getAllRoles(`${searchParams}`),
        employees: () => {
            getAllEmployees(`${searchParams}`);
            getAllRoles("noPag=true");
            getAllDrs("noPag=true");
            getAllWilayas("noPag=true");
        },
        drs: () => getAllDrs(`${searchParams}`),
        antennes: () => {
            getAllAntennes(cleanQueryParams(["tab"], searchParams));
            getAllDrs("noPag=true");
            getAllWilayas("noPag=true");
        },
        serviceTypes: () => getAllServiceTypes(`${searchParams}`),
        ouvrageTypes: () => getAllOuvrageTypes(`${searchParams}`),
        clientTypes: () => getAllClientTypes(`${searchParams}`),
        communes: () => {
            getAllCommunes(`${searchParams}`);
            getAllWilayas("noPag=true");
        },
    };

    const filterMap: Record<AdminTab, any> = {
        wilayas: (params: string) => getAllWilayas(`${params}`),
        clients: (params: string) => getAllClients(`${params}`),
        vat: (params: string) => getAllVatRates(`${params}`),
        roles: (params: string) => getAllRoles(`${params}`),
        employees: (params: string) => getAllEmployees(`${params}`),
        drs: (params: string) => getAllDrs(`${params}`),
        antennes: (params: string) => getAllAntennes(`${params}`),
        serviceTypes: (params: string) => getAllServiceTypes(`${params}`),
        ouvrageTypes: (params: string) => getAllOuvrageTypes(`${params}`),
        clientTypes: (params: string) => getAllClientTypes(`${params}`),
        communes: (params: string) => getAllCommunes(`${params}`),
    };

    const loadingMap: Record<AdminTab, boolean> = {
        wilayas: isLoadingWilaya || isWilayaCUD,
        clients: isLoadingClient || isClientCUD,
        vat: isLoadingVat || isVatCUD,
        roles: isLoadingRole || isRoleCUD,
        employees: isLoadingEmployee || isEmployeeCUD,
        drs: isLoadingDr || isDrCUD,
        antennes: isLoadingAntenne || isAntenneCUD,
        serviceTypes: isLoadingServiceType || isServiceTypeCUD,
        ouvrageTypes: isLoadingOuvrageType || isOuvrageTypeCUD,
        clientTypes: isLoadingClientType || isClientTypeCUD,
        communes: isLoadingCommune || isCommuneCUD,
    };

    const columnsMap: Record<AdminTab, () => TableColumn<any>[]> = {
        wilayas: () => wilayaColumns(openEdit, openDelete),
        clients: () => clientColumns(openEdit, openDelete),
        vat: () => vatColumns(openEdit, openDelete),
        roles: () => roleColumns(openEdit, openDelete),
        employees: () => employeesColumns(openEdit, openDelete),
        drs: () => drColumns(openEdit, openDelete),
        antennes: () => antenneColumns(openEdit, openDelete),
        serviceTypes: () => serviceTypeColumns(openEdit, openDelete),
        ouvrageTypes: () => ouvrageTypeColumns(openEdit, openDelete),
        clientTypes: () => clientTypeColumns(openEdit, openDelete),
        communes: () => communeColumns(openEdit, openDelete),
    };

    const dataMap: Record<AdminTab, any[]> = {
        wilayas: wilayas || [],
        clients: clients || [],
        vat: vatRates || [],
        roles: roles || [],
        employees: employees || [],
        drs: drs || [],
        antennes: antennes || [],
        serviceTypes: serviceTypes || [],
        ouvrageTypes: ouvrageTypes || [],
        clientTypes: clientTypes || [],
        communes: communes || [],
    };

    const paginationMap: Record<AdminTab, PaginationType | null> = {
        wilayas: wilayaPagination,
        clients: clientsPagination,
        vat: vatPagination,
        roles: rolesPagination,
        employees: employeesPagination,
        drs: drsPagination,
        antennes: antennePagination,
        serviceTypes: serviceTypePagination,
        ouvrageTypes: ouvrageTypePagination,
        clientTypes: clientTypePagination,
        communes: communePagination,
    };

    const formInputs: Record<AdminTab, FieldConfig[]> = useMemo(
        () => ({
            wilayas: WilayaFormFields(),
            clients: ClientFormFields(wilayas, communes, drs, antennes, clientTypes, data),
            vat: VatFormFields(),
            roles: RoleFormFields(),
            employees: EmployeeFormFields(roles, drs, wilayas, data.drId ? antennes : [{ label: "choose dr first", value: "" }]),
            drs: DrFormFields(),
            antennes: AntenneFormFields(drs, wilayas),
            serviceTypes: ServiceTypeFormFields(),
            ouvrageTypes: OuvrageTypeFormFields(),
            clientTypes: ClientTypeFormFields(),
            communes: CommuneFormFields(wilayas),
        }),
        [isModalOpen, roles, drs, wilayas, antennes, communes, clientTypes, data],
    );

    const filterInputs: Record<AdminTab, FieldConfig[]> = useMemo(
        () => ({
            wilayas: [],
            clients: clientFilterFields({ clientType: clientTypes, drId: drs, antenneId: antennes }),
            vat: [],
            roles: [],
            employees: employeeFilterFields({ roles, drs, antennes, wilayas }),
            drs: [],
            antennes: antenneFilterFields({ drs }),
            serviceTypes: [],
            ouvrageTypes: [],
            clientTypes: [],
            communes: [],
        }),
        [clientTypes, drs, antennes, wilayas, roles],
    );

    const getDeleteMessage = useCallback(
        (tab: AdminTab, id?: string | null) => {
            const nameFor = (label?: string) => (
                <span>
                    {t("confirmDeletePrefix")} <span className="text-red-600 font-bold uppercase">{t("delete")}</span>
                    <span className="font-bold px-2">{label}</span>?
                </span>
            );

            switch (tab) {
                case "wilayas": {
                    const item = (wilayas || []).find((w) => w._id === id);
                    return nameFor(`${item?.name || id}`);
                }
                case "clients": {
                    const item = (clients || []).find((c) => c._id === id);
                    return nameFor(`${t("client")} ${item?.name || id}`);
                }
                case "vat": {
                    const item = (vatRates || data.vatRates || []).find((v) => v._id === id);
                    return nameFor(`${item?.label || id}`);
                }
                case "roles": {
                    const item = (roles || []).find((r) => r._id === id);
                    return nameFor(`${item?.label || id}`);
                }
                case "employees": {
                    const item = (employees || []).find((e) => e._id === id);
                    return nameFor(` ${item?.fullName || id}`);
                }
                case "drs": {
                    const item = (drs || []).find((d) => d._id === id);
                    return nameFor(`${item?.name || id}`);
                }
                case "antennes": {
                    const item = (antennes || []).find((a) => a._id === id);
                    return nameFor(`${item?.label || id}`);
                }
                case "serviceTypes": {
                    const item = (serviceTypes || []).find((st) => st._id === id);
                    return nameFor(`${item?.label || id}`);
                }
                case "ouvrageTypes": {
                    const item = (ouvrageTypes || []).find((ot) => ot._id === id);
                    return nameFor(`${item?.label || id}`);
                }
                case "clientTypes": {
                    const item = (clientTypes || []).find((ct) => ct._id === id);
                    return nameFor(`${item?.label || id}`);
                }
                case "communes": {
                    const item = (communes || []).find((c) => c._id === id);
                    return nameFor(`${item?.communeLt || id}`);
                }
                default:
                    return nameFor(id);
            }
        },
        [wilayas, clients, vatRates, data, roles, employees, drs, antennes, t],
    );

    const tabs: TabItem<AdminTab>[] = [
        { id: "clients", label: t("client") + "s", icon: Users },
        { id: "employees", label: "Employees", icon: Users },
        { id: "drs", label: "DRs", icon: Building },
        { id: "antennes", label: "Antennes", icon: Building },
        { id: "vat", label: t("vatRates"), icon: FileBadge },
        { id: "roles", label: "Roles", icon: Briefcase },
        { id: "wilayas", label: t("wilayas"), icon: Map },
        { id: "serviceTypes", label: t("serviceTypes"), icon: Briefcase },
        { id: "ouvrageTypes", label: t("ouvrageTypes"), icon: Building },
        { id: "clientTypes", label: t("clientTypes"), icon: Users },
        { id: "communes", label: t("communes"), icon: Map },
    ];

    const openCreate = () => {
        // setEditingItem(null);
        setIsModalOpen(true);
    };

    const openEdit = (id: any) => {
        setQueryParam([{ name: "edit", value: id }]);
        switch (activeTab) {
            case "wilayas":
                setData((wilayas || []).find((w) => w._id === id));
                break;
            case "drs":
                setData((drs || []).find((d) => d._id === id));
                break;
            case "antennes":
                let foundAntenne = (antennes || []).find((a) => a._id === id);
                // @ts-ignore
                setData({
                    ...foundAntenne,
                    // @ts-ignore
                    drId: foundAntenne?.drId?._id,
                    // @ts-ignore
                    wilayaCode: foundAntenne?.wilayaCode?.code || foundAntenne?.wilayaCode.map((w) => w.code),
                });
                break;
            case "roles":
                setData((roles || []).find((r) => r._id === id));
                break;
            case "employees":
                let foundEmployee = (employees || []).find((e) => e._id === id);
                // map nested objects to expected form values
                // @ts-ignore
                setData({
                    ...foundEmployee,
                    // @ts-ignore
                    roleId: foundEmployee?.roleId?._id || foundEmployee?.roleId,
                    // @ts-ignore
                    drId: foundEmployee?.drId?._id || foundEmployee?.drId,
                    // @ts-ignore
                    antenneId: foundEmployee?.antenneId?._id || foundEmployee?.antenneId,
                    // @ts-ignore
                    wilayaCode: foundEmployee?.wilayaCode?.code,
                });
                break;
            case "clients":
                const foundClient = (clients || []).find((c) => c._id === id);
                setData({
                    ...foundClient,
                    // @ts-ignore
                    wilayaCodes: foundClient?.wilayaCodes?.map((w: any) => w.code || w) || [],
                    // @ts-ignore
                    drId: foundClient?.drId?.map((dr: any) => dr._id || dr) || [],
                    // @ts-ignore
                    antenneId: foundClient?.antenneId?.map((ant: any) => ant._id || ant) || [],
                    // @ts-ignore
                    communeCodes: foundClient?.communeCodes?.map((c: any) => c._id || c) || [],
                    // @ts-ignore
                    clientTypeId: foundClient?.clientTypeId?._id || foundClient?.clientTypeId,
                    addresses: {
                        ...foundClient.addresses,
                        // @ts-ignore
                        wilayaCode: foundClient.addresses?.wilayaCode?.code || foundClient.addresses?.wilayaCode,
                        // @ts-ignore
                        communeCode: foundClient.addresses?.communeCode?._id || foundClient.addresses?.communeCode,
                    },
                });
                break;
            case "vat":
                setData((vatRates || []).find((v) => v._id === id));
                break;
            case "serviceTypes":
                setData((serviceTypes || []).find((st) => st._id === id));
                break;
            case "ouvrageTypes":
                setData((ouvrageTypes || []).find((ot) => ot._id === id));
                break;
            case "clientTypes":
                setData((clientTypes || []).find((ct) => ct._id === id));
                break;
            case "communes":
                const foundCommune = (communes || []).find((c) => c._id === id);
                setData({ ...foundCommune });
                break;
        }
        setIsModalOpen(true);
    };

    const openDelete = (id: any) => {
        setQueryParam([{ name: "delete", value: id }]);
        setIsModalOpen(true);
    };

    const handleChange = useCallback((name: string, value: any, path?: string) => {
        handleFormChange(setData, name, value, path);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setData({});
        removeQueryParam(["edit", "delete"]);
        // removeQueryParam("delete");
    }, [removeQueryParam]);

    const handleTabChange = useCallback(
        (tab: string) => {
            resetQueryParams(["tab"]);

            setQueryParam([
                { name: "page", value: "1" },
                { name: "tab", value: tab },
            ]);
        },
        [page, resetQueryParams, setQueryParam],
    );

    const handleSubmitCreate = useCallback(
        async (formData: any) => {
            try {
                let message = "";
                switch (activeTab) {
                    case "clients":
                        message = await addClient(formData);
                        break;
                    case "wilayas":
                        message = await addWilaya(formData);
                        break;

                    case "drs":
                        message = await addDr(formData);
                        break;
                    case "antennes":
                        message = await addAntenne(formData);
                        break;
                    case "vat":
                        message = await addVatRate(formData);
                        break;
                    case "roles":
                        message = await addRole(formData);
                        break;
                    case "employees":
                        message = await addEmployee(formData);
                        break;
                    case "serviceTypes":
                        message = await addServiceType(formData);
                        break;
                    case "ouvrageTypes":
                        message = await addOuvrageType(formData);
                        break;
                    case "clientTypes":
                        message = await addClientType(formData);
                        break;
                    case "communes":
                        message = await addCommune(formData);
                        break;
                }
                closeModal();
                addToast(message, "success");
            } catch (error) {
                addToast(error || "Error submitting form", "error");
            }
        },
        [activeTab, addWilaya, addDr, addAntenne, addRole, addEmployee, addToast, closeModal],
    );

    const handleSubmitEdit = useCallback(
        async (formData: any) => {
            try {
                let message = "";
                switch (activeTab) {
                    case "clients":
                        message = await updateClient(formData);
                        break;
                    case "vat":
                        message = await updateVatRate(formData);
                        break;
                    case "wilayas":
                        message = await updateWilaya(formData);
                        break;
                    case "drs":
                        message = await updateDr(formData);
                        break;
                    case "antennes":
                        message = await updateAntenne(formData);
                        break;
                    case "roles":
                        message = await updateRole(formData);
                        break;
                    case "employees":
                        message = await updateEmployee(formData);
                        break;
                    case "serviceTypes":
                        message = await updateServiceType(formData);
                        break;
                    case "ouvrageTypes":
                        message = await updateOuvrageType(formData);
                        break;
                    case "clientTypes":
                        message = await updateClientType(formData);
                        break;
                    case "communes":
                        message = await updateCommune(formData);
                        break;
                }
                closeModal();
                addToast(message, "success");
            } catch (error) {
                addToast(error || "Error submitting form", "error");
            }
        },
        [activeTab, updateWilaya, updateDr, updateAntenne, updateRole, updateEmployee, addToast, closeModal],
    );

    const handleSubmitDelete = useCallback(
        async (id: any) => {
            try {
                let message = "";

                switch (activeTab) {
                    case "clients":
                        message = await deleteClient(id);
                        break;
                    case "vat":
                        message = await deleteVatRate(id);
                        break;
                    case "wilayas":
                        message = await deleteWilaya(id);
                        break;
                    case "drs":
                        message = await deleteDr(id);
                        break;
                    case "antennes":
                        message = await deleteAntenne(id);
                        break;
                    case "roles":
                        message = await deleteRole(id);
                        break;
                    case "employees":
                        message = await deleteEmployee(id);
                        break;
                    case "serviceTypes":
                        message = await deleteServiceType(id);
                        break;
                    case "ouvrageTypes":
                        message = await deleteOuvrageType(id);
                        break;
                    case "clientTypes":
                        message = await deleteClientType(id);
                        break;
                    case "communes":
                        message = await deleteCommune(id);
                        break;
                }
                closeModal();
                addToast(message, "success");
            } catch (error) {
                addToast(error || "Error deleting form", "error");
            }
        },
        [activeTab, deleteWilaya, deleteDr, deleteAntenne, deleteRole, deleteEmployee, addToast, closeModal],
    );

    // const handleApplyFilters = useCallback(() => {
    //     filterMap[activeTab]();
    // }, [activeTab]);

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 text-accent rounded-lg">
                            <SettingsIcon tab={activeTab} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-primary">{t("admin")}</h1>
                            <p className="text-sm text-secondary">{t("manageSystemReferentials")}</p>
                        </div>
                    </div>
                    <div className="flex gap-3 items-center self-end md:self-auto">
                        <ViewToggle view={view} onChange={setView} />
                        <Button onClick={openCreate}>
                            <Plus size={18} className="me-2" />
                            {t("newItem")}
                        </Button>
                    </div>
                </div>

                <Tabs tabs={tabs} defaultTab="clients" queryParamName="tab" onChange={handleTabChange} />

                <FilterQuery
                    moreFilters={filterInputs[activeTab].length > 0}
                    fields={filterInputs[activeTab] || []}
                    onSubmit={filterMap[activeTab]}
                    formId="admin-filter"
                    noClearParams={["tab"]}
                />
                <div className="min-h-[25rem]">
                    {!activeTab ? (
                        <div></div>
                    ) : loadingMap[activeTab] ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <DataView view={view} data={dataMap[activeTab]} columns={columnsMap[activeTab]()} />
                            <Pagination
                                className="mt-6 justify-end"
                                totalItems={paginationMap[activeTab]?.total || 0}
                                itemsPerPage={paginationMap[activeTab]?.limit || 10}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* {isModalOpen && ( */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                // @ts-ignore
                title={editMode ? t("editItem") : deleteMode ? t("deleteItem") : `${t("new")} ${t(activeTab)}`}
                size="md"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant={deleteMode ? "outline" : "danger"} type="button" onClick={closeModal} disabled={loadingMap[activeTab]}>
                            Annuler
                        </Button>
                        <Button
                            variant={deleteMode ? "danger" : "primary"}
                            loading={loadingMap[activeTab]}
                            type="submit"
                            disabled={loadingMap[activeTab]}
                            form={`admin-referential-${activeTab}`}
                            onClick={() => {
                                deleteMode && handleSubmitDelete(deleteMode);
                            }}
                        >
                            {editMode ? t("save") : deleteMode ? t("delete") : t("create")}
                        </Button>
                    </div>
                }
            >
                {deleteMode ? (
                    <div>{getDeleteMessage(activeTab, deleteMode)}</div>
                ) : (
                    <FormBuilder
                        fields={formInputs[activeTab]}
                        formData={data}
                        formId={`admin-referential-${activeTab}`}
                        onChange={handleChange}
                        onSubmit={editMode ? handleSubmitEdit : deleteMode ? handleSubmitDelete : handleSubmitCreate}
                    />
                )}
            </Modal>
            {/* )} */}
        </>
    );
};

const SettingsIcon = ({ tab }: { tab: string }) => {
    switch (tab) {
        case "wilayas":
            return <Map size={24} />;
        case "clients":
            return <Users size={24} />;
        case "employees":
            return <Users size={24} />;
        case "drs":
            return <Building size={24} />;
        case "antennes":
            return <Building size={24} />;
        case "roles":
            return <Briefcase size={24} />;
        default:
            return <FileBadge size={24} />;
    }
};

const DataView: React.FC<{
    view: "grid" | "table";
    data: any[];
    columns: TableColumn<any>[];
}> = ({ view, data, columns }) => {
    if (view === "grid") {
        return <CardGrid columns={columns} data={data} keyExtractor={(item) => item.id} emptyMessage="No data available" />;
    }

    return (
        <Card className="overflow-hidden p-0">
            <Table columns={columns} data={data} keyExtractor={(row) => row.id} emptyMessage="No data available" />
        </Card>
    );
};
