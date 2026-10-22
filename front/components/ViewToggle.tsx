import React from "react";
import { LayoutGrid, List } from "lucide-react";

export const ViewToggle: React.FC<{ view: "grid" | "table"; onChange: (v: "grid" | "table") => void }> = ({ view, onChange }) => (
    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
        <button
            onClick={() => onChange("grid")}
            className={`p-1.5 rounded-md transition-all ${view === "grid" ? "bg-white shadow text-accent" : "text-slate-500 hover:text-slate-700"}`}
        >
            <LayoutGrid size={18} />
        </button>
        <button
            onClick={() => onChange("table")}
            className={`p-1.5 rounded-md transition-all ${view === "table" ? "bg-white shadow text-accent" : "text-slate-500 hover:text-slate-700"}`}
        >
            <List size={18} />
        </button>
    </div>
);
