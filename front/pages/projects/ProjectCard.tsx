import React from "react";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Project, ContractMode } from "../../types";
import { useLanguage } from "../../i18n";
import { formatMoney } from "@/utils/utils";
import { Tag } from "@/components/Tag";

type ProjectCardProps = {
    item: Project;
    onClick?: () => void;
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ item: project, onClick }) => {
    const { t } = useLanguage();

    return (
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex flex-col justify-between h-full">
                <div>
                    <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-mono text-slate-500">{project.projectNumber}</span>
                        <Badge variant={project.contractMode === ContractMode.ODS || project.isConvertedToOds ? "success" : "warning"}>
                            {project.isConvertedToOds ? "LC -> ODS" : project.contractMode}
                        </Badge>
                    </div>
                    <h3 className=" flex gap-3 font-semibold text-slate-900 line-clamp-2 mb-4">
                        <span>{project.title}</span>
                        <Tag variant="default">
                            {/* @ts-ignore */}
                            <span className="text-slate-600 text-xs font-mono"> {project.clientId.identifier} </span>
                        </Tag>
                    </h3>

                    <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex justify-between">
                            <span className="whitespace-nowrap">{t("workAmount")}:</span>
                            <span className="font-medium font-mono whitespace-nowrap">{formatMoney(project.workAmountMT)} DA</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="whitespace-nowrap">{t("amountHTSnapshot")}:</span>
                            <span className="font-medium font-mono whitespace-nowrap">{formatMoney(project.amountHTSnapshot)} DA</span>
                        </div>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                    <p>
                        {t("createdAt")}: {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </Card>
    );
};
