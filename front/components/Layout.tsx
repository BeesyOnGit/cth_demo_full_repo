import React, { useMemo, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../pages/login/useAuthStore";
import { useLanguage } from "../i18n";
import { LayoutDashboard, Briefcase, FileText, Settings, LogOut, Menu, X, Globe, MapPin, Target, Bot } from "lucide-react";

export const Layout = () => {
    const { user, logout } = useAuthStore();
    const { t, language, setLanguage } = useLanguage();
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = React.useState(true);

    // Handle responsive sidebar visibility
    useEffect(() => {
        const handleResize = () => {
            // Show sidebar on desktop (lg breakpoint: 1024px)
            if (window.innerWidth >= 1024) {
                setSidebarOpen(true);
            }
        };

        // Add event listener
        window.addEventListener("resize", handleResize);

        // Initial check
        handleResize();

        // Cleanup
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // const isAdmin = user?.roleCode === RoleCode.ADMIN;
    const isAdmin = user?.isAdmin;

    const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as any);
        location.reload();
    };

    const navItems = useMemo(
        () => [
            !user?.antenneId && { label: t("dashboard"), path: "/", icon: LayoutDashboard },
            user?.antenneId && { label: t("antenneOverview") || "Aperçu Antenne", path: "/antenne-overview", icon: LayoutDashboard },
            { label: t("projects"), path: "/projects", icon: Briefcase },
            { label: t("invoices"), path: "/invoices", icon: FileText },
            (user?.roleId === "DT" || user?.isAdmin) && { label: t("objectives"), path: "/objectives", icon: Target },
            // AI Chat - Only show for users without DR and Antenne ID
            !user?.drId && !user?.antenneId && { label: "Assistant IA", path: "/ai-chat", icon: Bot },
        ],
        [user, t],
    ).filter(Boolean);

    if (isAdmin) {
        navItems.push({ label: t("admin"), path: "/admin", icon: Settings });
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Mobile Menu Button (Floating) */}
            {!isSidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden fixed top-4 start-4 z-40 p-2 bg-slate-900 text-white rounded-md shadow-lg"
                >
                    <Menu size={24} />
                </button>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 start-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full"
                } lg:relative lg:translate-x-0 shadow-xl flex flex-col`}
            >
                <div className="flex h-16 items-center justify-between px-6 bg-slate-950 shrink-0">
                    <span className="text-xl font-bold tracking-tight text-accent">CTH TCOM</span>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <nav className="mt-6 px-3 space-y-1 flex-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive ? "bg-accent text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`
                            }
                        >
                            <item.icon size={18} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Sidebar Footer: Settings & Profile */}
                <div className="p-4 border-t border-slate-800 bg-slate-900 space-y-4">
                    {/* Language & Scope (Moved from Header) */}
                    <div className="space-y-3 px-1">
                        <div className="flex items-center justify-between text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <Globe size={14} />
                                <span>Lang</span>
                            </div>
                            <select
                                value={language}
                                onChange={handleLangChange}
                                className="bg-slate-800 text-xs text-white border border-slate-700 rounded px-2 py-1 focus:outline-none"
                            >
                                <option value="en">EN</option>
                                <option value="fr">FR</option>
                                <option value="ar">AR</option>
                            </select>
                        </div>

                        {/* <div className="flex items-center gap-2 text-xs text-slate-400">
                            <MapPin size={14} />
                            <span>Scope:</span>
                            <span className="font-semibold text-white">{user?.antenneId ? "AC-1" : "Global"}</span>
                        </div> */}
                    </div>

                    {/* Profile */}
                    <div className="pt-3 border-t border-slate-800">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                                {user?.fullName?.charAt(0)?.toLocaleUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate capitalize">{user?.fullName}</p>
                                <p className="text-xs text-slate-400 truncate capitalize">{user?.roleCode}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-danger transition-colors"
                        >
                            <LogOut size={16} />
                            {t("signOut")}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
                <div className="flex-1 overflow-auto p-6 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
