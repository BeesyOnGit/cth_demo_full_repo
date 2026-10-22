import React from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguageStore } from "@/store/useLanguageStore";

/**
 * Direction-aware arrow component that automatically flips based on language direction
 */
export const ArrowBack: React.FC<{ size?: number; className?: string }> = ({ size, className }) => {
    const { language } = useLanguageStore();
    const isRtl = language === "ar";
    return isRtl ? <ArrowRight size={size} className={className} /> : <ArrowLeft size={size} className={className} />;
};

export const ArrowForward: React.FC<{ size?: number; className?: string }> = ({ size, className }) => {
    const { language } = useLanguageStore();
    const isRtl = language === "ar";
    return isRtl ? <ArrowLeft size={size} className={className} /> : <ArrowRight size={size} className={className} />;
};

export const ChevronBack: React.FC<{ size?: number; className?: string }> = ({ size, className }) => {
    const { language } = useLanguageStore();
    const isRtl = language === "ar";
    return isRtl ? <ChevronRight size={size} className={className} /> : <ChevronLeft size={size} className={className} />;
};

export const ChevronForward: React.FC<{ size?: number; className?: string }> = ({ size, className }) => {
    const { language } = useLanguageStore();
    const isRtl = language === "ar";
    return isRtl ? <ChevronLeft size={size} className={className} /> : <ChevronRight size={size} className={className} />;
};

/**
 * Hook to get current direction
 */
export const useDirection = () => {
    const { language } = useLanguageStore();
    return {
        isRtl: language === "ar",
        dir: language === "ar" ? "rtl" : "ltr",
    };
};
