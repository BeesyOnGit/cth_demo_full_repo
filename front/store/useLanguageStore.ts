import { create } from "zustand";

type Language = "en" | "fr" | "ar";

const LANGUAGES: Language[] = ["en", "fr", "ar"];
const getStoredLanguage = (): Language => {
    const stored = window.localStorage.getItem("language") as Language;
    return LANGUAGES.includes(stored) ? stored : "fr";
};

interface LanguageState {
    language: Language;
    setLanguage: (lang?: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
    language: getStoredLanguage(),
    setLanguage: (language) => {
        const lang = language && LANGUAGES.includes(language) ? language : getStoredLanguage();
        window.localStorage.setItem("language", lang);
        const html = document.querySelector("html");
        if (html) {
            html.setAttribute("lang", lang);
            html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
        }
        set({ language: lang });
    },
}));
