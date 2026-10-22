export const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 10; i--) {
        years.push({ label: i.toString(), value: i.toString() });
    }
    return years;
};

export const getMonthOptions = (t: (key: string) => string) => {
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
