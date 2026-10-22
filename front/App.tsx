import "./App.css";
import React, { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { LoadingLayout } from "./components/LoadingLayout";
import { Login } from "./pages/login/Login";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { Overview } from "./pages/dashboard/overview/Overview";
import { ChiffreAffaire } from "./pages/dashboard/chiffre-affaire/ChiffreAffaire";
import { Encaissement } from "./pages/dashboard/encaissement/Encaissement";
import { Facturation } from "./pages/dashboard/facturation/Facturation";
import { Caution } from "./pages/dashboard/caution/Caution";
import { Experience } from "./pages/dashboard/experience/Experience";
import { Classement } from "./pages/dashboard/classement/Classement";
import { Projects } from "./pages/projects/Projects";
import { ProjectForm } from "./pages/project-form/ProjectForm";
import { ProjectDetails } from "./pages/project-details/ProjectDetails";
import { Invoices } from "./pages/invoices/Invoices";
import { InvoiceDetails } from "./pages/invoice-details/InvoiceDetails";
import { Objectives } from "./pages/objectives/Objectives";
import { AdminReferentials } from "./pages/admin-referentials/AdminReferentials";
import { AIChat } from "./pages/ai-chat/AIChat";
import { AntenneOverview } from "./pages/antenne-overview/AntenneOverview";
import { useAuthStore } from "./pages/login/useAuthStore";
import { Toast } from "./components/Toast";
import { useToastStore } from "./store/useToastStore";
import { useLanguage } from "./i18n";
import { useLanguageStore } from "./store/useLanguageStore";

function PrivateRoute({ children }: { children?: React.ReactNode }) {
    const { user, isLoading } = useAuthStore();

    const location = useLocation();

    if (isLoading) {
        return <LoadingLayout />;
    }
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}

// Mirrors the nav visibility rules in Layout
function RoleRoute({ allow, children }: { allow: (user: any) => boolean; children?: React.ReactNode }) {
    const { user } = useAuthStore();
    return allow(user) ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
    const { checkAuth, isLoading } = useAuthStore();
    const { setLanguage } = useLanguageStore();

    // const navigate = useNavigate();

    useEffect(() => {
        const fetchAuth = async () => {
            try {
                await checkAuth(); // Wait for this to complete
            } catch (error) {
                // addToast(error || "Session expired. Please log in again.", "error");
            }
        };
        setLanguage();

        fetchAuth(); // Always run this, don't check cookie first
    }, []); // Add dependencies

    return (
        <HashRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <Layout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />}>
                        <Route index element={<Overview />} />
                        <Route path="chiffre-affaire" element={<ChiffreAffaire />} />
                        <Route path="encaissement" element={<Encaissement />} />
                        <Route path="facturation" element={<Facturation />} />
                        <Route path="caution" element={<Caution />} />
                        <Route path="experience" element={<Experience />} />
                        <Route path="classement" element={<Classement />} />
                    </Route>
                    <Route path="projects" element={<Projects />} />
                    <Route path="projects/new" element={<ProjectForm />} />
                    <Route path="projects/:id" element={<ProjectDetails />} />
                    <Route path="projects/:id/edit" element={<ProjectForm />} />
                    <Route path="invoices" element={<Invoices />} />
                    <Route path="invoices/:id" element={<InvoiceDetails />} />
                    <Route
                        path="objectives"
                        element={
                            <RoleRoute allow={(u) => u?.roleId === "DT" || u?.isAdmin}>
                                <Objectives />
                            </RoleRoute>
                        }
                    />
                    <Route
                        path="admin"
                        element={
                            <RoleRoute allow={(u) => !!u?.isAdmin}>
                                <AdminReferentials />
                            </RoleRoute>
                        }
                    />
                    <Route
                        path="ai-chat"
                        element={
                            <RoleRoute allow={(u) => !u?.drId && !u?.antenneId}>
                                <AIChat />
                            </RoleRoute>
                        }
                    />
                    <Route path="antenne-overview" element={<AntenneOverview />} />
                </Route>
            </Routes>
            <Toast />
        </HashRouter>
    );
}
