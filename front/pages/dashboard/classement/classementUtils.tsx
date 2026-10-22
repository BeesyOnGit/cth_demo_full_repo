import { TableColumn } from "@/components/Table";
import { formatMoney, formatDate } from "@/utils/utils";
import { FieldConfig } from "@/components/FormBuilder";
import { getTranslation } from "@/i18n";
import { Trophy, TrendingUp, DollarSign } from "lucide-react";

const t = getTranslation();

export const createRankingTableColumns = (metric: string, type: string): TableColumn<any>[] => {
    return [
        {
            key: "rank",
            label: t("rank"),
            align: "center",
            render: ({ rank }) => (
                <div className="flex items-center justify-center">
                    {rank === 1 && <Trophy className="text-yellow-500 me-1" size={20} />}
                    {rank === 2 && <Trophy className="text-slate-400 me-1" size={18} />}
                    {rank === 3 && <Trophy className="text-amber-600 me-1" size={18} />}
                    <span className="font-bold text-lg">{rank}</span>
                </div>
            ),
        },
        {
            key: type === "dr" ? "dr" : "antenne",
            label: type === "dr" ? t("regionalDirectorate") : t("antenne"),
            render: (item) => <span className="font-medium">{type === "dr" ? item.dr : item.antenne || "-"}</span>,
        },
        {
            key: metric === "turnover" ? "turnover" : "collection",
            label: metric === "turnover" ? t("turnover") : t("collection"),
            align: "right",
            render: (item) => (
                <span className="font-mono text-accent font-bold">{formatMoney(metric === "turnover" ? item.turnover : item.collection)}</span>
            ),
        },
    ];
};

export const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 10; i--) {
        years.push({ label: i.toString(), value: i.toString() });
    }
    return years;
};

export const getMonthOptions = () => {
    const t = getTranslation();
    const months = [
        { label: t("january"), value: "1" },
        { label: t("february"), value: "2" },
        { label: t("march"), value: "3" },
        { label: t("april"), value: "4" },
        { label: t("may"), value: "5" },
        { label: t("june"), value: "6" },
        { label: t("july"), value: "7" },
        { label: t("august"), value: "8" },
        { label: t("september"), value: "9" },
        { label: t("october"), value: "10" },
        { label: t("november"), value: "11" },
        { label: t("december"), value: "12" },
    ];
    return months;
};

export const rankingFilterFields = ({ drs = [], userDrId }: { drs?: Array<{ _id: string; name: string }>; userDrId?: string }): FieldConfig[] => {
    const t = getTranslation();
    const fields: any[] = [
        {
            type: "select",
            name: "type",
            label: t("rankingType"),
            placeholder: t("selectType"),
            options: [
                { label: t("byRegionalDirectorate"), value: "dr" },
                { label: t("byAntenne"), value: "antenne" },
            ],
            defaultValue: "dr",
        },
    ];

    // Only add DR filter if user doesn't have a DR assigned
    if (!userDrId) {
        fields.push({
            type: "select",
            name: "drId",
            label: t("dr"),
            placeholder: t("allDrs"),
            options: [{ label: t("allDrs"), value: "" }, ...(drs?.map((dr) => ({ label: dr.name, value: dr._id })) || [])],
        });
    }

    fields.push(
        {
            type: "select",
            name: "metric",
            label: t("rankingCriteria"),
            placeholder: t("selectCriteria"),
            options: [
                { label: t("turnover"), value: "turnover" },
                { label: t("collection"), value: "collection" },
            ],
            defaultValue: "turnover",
        },
        {
            type: "select",
            name: "year",
            label: t("year"),
            placeholder: t("year"),
            options: getYearOptions(),
        },
        {
            type: "select",
            name: "month",
            label: t("month"),
            placeholder: t("month"),
            options: getMonthOptions(),
        },
    );

    return [
        {
            type: "group",
            className: "flex-wrap",
            fields,
        },
    ];
};
