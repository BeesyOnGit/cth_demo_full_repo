import React from "react";
import { useLanguage } from "@/i18n";

export const Facturation = () => {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">{t("facturation")}</h2>
            {/* Content will be added here */}
        </div>
    );
};
