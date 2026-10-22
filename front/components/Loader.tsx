import React from "react";

export const Loader: React.FC<{ className?: string }> = ({ className = "" }) => {
    return <span className={"loader " + className}></span>;
};
