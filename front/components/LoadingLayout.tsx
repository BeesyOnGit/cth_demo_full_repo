import React from "react";
import { Skeleton } from "./Skeleton";

export const LoadingLayout = () => {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white shadow-xl flex flex-col">
                {/* Logo Area */}
                <div className="flex h-16 items-center justify-between px-6 bg-slate-950 shrink-0">
                    <Skeleton className="h-6 w-20 bg-slate-700" />
                </div>

                {/* Navigation Items */}
                <nav className="mt-6 px-3 space-y-1 flex-1 overflow-y-auto">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                            <Skeleton className="h-5 w-5 bg-slate-700 rounded" />
                            <Skeleton className="h-4 w-24 bg-slate-700" />
                        </div>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900 space-y-4">
                    {/* Language & Scope Section */}
                    <div className="space-y-3 px-1">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-16 bg-slate-700" />
                            <Skeleton className="h-6 w-12 bg-slate-700 rounded" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-20 bg-slate-700" />
                            <Skeleton className="h-4 w-12 bg-slate-700" />
                        </div>
                    </div>

                    {/* Profile Section */}
                    <div className="pt-3 border-t border-slate-800">
                        <div className="flex items-center gap-3 mb-3">
                            <Skeleton className="h-8 w-8 rounded-full bg-slate-700" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-24 bg-slate-700" />
                                <Skeleton className="h-3 w-16 bg-slate-700" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2">
                            <Skeleton className="h-4 w-4 bg-slate-700 rounded" />
                            <Skeleton className="h-4 w-16 bg-slate-700" />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
                <div className="flex-1 overflow-auto p-6 md:p-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>

                    {/* Content Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div key={item} className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
                                <Skeleton className="h-6 w-32 mb-4" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};
