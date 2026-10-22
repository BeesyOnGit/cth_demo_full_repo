import React from "react";

// Structure Components
export const AITitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h1 className="text-3xl font-bold text-slate-900 mb-4 mt-6">{children}</h1>
);

export const AISection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-2xl font-semibold text-slate-800 mb-3 mt-5">{children}</h2>
);

export const AISubsection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-xl font-medium text-slate-700 mb-2 mt-4">{children}</h3>
);

export const AIPara: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="text-base text-slate-600 mb-3 leading-relaxed">{children}</p>
);

export const AISeparator: React.FC = () => <hr className="my-6 border-t border-slate-300" />;

// Emphasis Components
export const AIBold: React.FC<{ children: React.ReactNode }> = ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>;

export const AIMetric: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Convert children to string, handling all possible types
    const extractText = (node: React.ReactNode): string => {
        if (!node) return "";
        if (typeof node === "string") return node;
        if (typeof node === "number") return String(node);
        if (Array.isArray(node)) {
            return node.map(extractText).join("");
        }
        if (React.isValidElement(node)) {
            //@ts-ignore
            return extractText(node.props.children);
        }
        return "";
    };

    const text = extractText(children);
    const parts = text.split(":").map((s) => s.trim());

    // If no colon found, just display the value
    if (parts.length === 1) {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-lg mr-2 mb-2">
                <span className="text-sm font-bold text-accent">{parts[0]}</span>
            </div>
        );
    }

    const label = parts[0];
    const value = parts.slice(1).join(":");

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-lg mr-2 mb-2">
            <span className="text-sm font-medium text-slate-700">{label}:</span>
            <span className="text-sm font-bold text-accent">{value}</span>
        </div>
    );
};

export const AIInsight: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-4 rounded">
        <div className="flex">
            <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>
            <div className="ml-3">
                <p className="text-sm text-amber-800">{children}</p>
            </div>
        </div>
    </div>
);

// Container Components
export const AISummary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-gradient-to-r from-accent/5 to-sky-50 border border-accent/20 rounded-xl p-5 my-4 shadow-sm">
        <div className="flex items-start">
            <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
            </div>
            <div className="ml-4 flex-1 overflow-hidden">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Résumé</h4>
                <div className="text-sm text-slate-700">{children}</div>
            </div>
        </div>
    </div>
);

// Table Components
export const AITable: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="overflow-x-auto my-4 rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">{children}</table>
    </div>
);

export const AITableHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <thead className="bg-slate-50">
        <tr>{children}</tr>
    </thead>
);

export const AITableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">{children}</th>
);

export const AITableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <tbody className="bg-white divide-y divide-slate-200">{children}</tbody>
);

export const AITableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <tr className="hover:bg-slate-50">{children}</tr>;

export const AITableCell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <td className="px-4 py-3 text-sm text-slate-600">{children}</td>
);

// List Components
export const AIList: React.FC<{ children: React.ReactNode }> = ({ children }) => <ul className="space-y-2 my-4 ml-6">{children}</ul>;

export const AIListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="text-sm text-slate-600 flex items-start">
        <span className="text-accent mr-2 mt-1 flex-shrink-0">•</span>
        <span className="flex-1">{children}</span>
    </li>
);

// Main Renderer Component
interface AIResponseRendererProps {
    response: string;
}

export const AIResponseRenderer: React.FC<AIResponseRendererProps> = ({ response }) => {
    const parseContent = (text: string): React.ReactNode => {
        if (!text) return null;

        // Define all tag patterns
        const tagDefs = [
            { tag: "TITLE", Component: AITitle, block: true },
            { tag: "SECTION", Component: AISection, block: true },
            { tag: "SUBSECTION", Component: AISubsection, block: true },
            { tag: "PARA", Component: AIPara, block: true },
            { tag: "SUMMARY", Component: AISummary, block: true },
            { tag: "INSIGHT", Component: AIInsight, block: true },
            { tag: "BOLD", Component: AIBold, block: false },
            { tag: "METRIC", Component: AIMetric, block: false },
        ];

        // Handle self-closing tags first
        text = text.replace(/<SEPARATOR\s*\/>/g, "|||SEPARATOR|||");

        // Parse tables separately
        text = text.replace(/<TABLE>(.*?)<\/TABLE>/gs, (_, content) => {
            return `|||TABLE_START|||${content}|||TABLE_END|||`;
        });

        // Parse lists separately
        text = text.replace(/<LIST>(.*?)<\/LIST>/gs, (_, content) => {
            return `|||LIST_START|||${content}|||LIST_END|||`;
        });

        let elements: React.ReactNode[] = [];
        let remaining = text;
        let key = 0;

        while (remaining) {
            let earliestMatch: any = null;
            let earliestIndex = Infinity;

            // Find the earliest tag
            for (const def of tagDefs) {
                const regex = new RegExp(`<${def.tag}>(.*?)<\/${def.tag}>`, "s");
                const match = remaining.match(regex);
                if (match && match.index! < earliestIndex) {
                    earliestMatch = { ...def, match, index: match.index! };
                    earliestIndex = match.index!;
                }
            }

            // Check for separators
            const sepIndex = remaining.indexOf("|||SEPARATOR|||");
            if (sepIndex !== -1 && sepIndex < earliestIndex) {
                earliestMatch = { tag: "SEPARATOR", Component: AISeparator, match: null, index: sepIndex };
                earliestIndex = sepIndex;
            }

            // Check for tables
            const tableIndex = remaining.indexOf("|||TABLE_START|||");
            if (tableIndex !== -1 && tableIndex < earliestIndex) {
                const tableEndIndex = remaining.indexOf("|||TABLE_END|||", tableIndex);
                if (tableEndIndex !== -1) {
                    const tableContent = remaining.slice(tableIndex + "|||TABLE_START|||".length, tableEndIndex);
                    earliestMatch = {
                        tag: "TABLE",
                        Component: AITable,
                        match: { 0: remaining.slice(tableIndex, tableEndIndex + "|||TABLE_END|||".length), 1: tableContent },
                        index: tableIndex,
                    };
                    earliestIndex = tableIndex;
                }
            }

            // Check for lists
            const listIndex = remaining.indexOf("|||LIST_START|||");
            if (listIndex !== -1 && listIndex < earliestIndex) {
                const listEndIndex = remaining.indexOf("|||LIST_END|||", listIndex);
                if (listEndIndex !== -1) {
                    const listContent = remaining.slice(listIndex + "|||LIST_START|||".length, listEndIndex);
                    earliestMatch = {
                        tag: "LIST",
                        Component: AIList,
                        match: { 0: remaining.slice(listIndex, listEndIndex + "|||LIST_END|||".length), 1: listContent },
                        index: listIndex,
                    };
                    earliestIndex = listIndex;
                }
            }

            if (!earliestMatch) {
                // No more tags, add remaining text
                if (remaining.trim()) {
                    // Return plain text directly if it's the only element
                    if (elements.length === 0) {
                        return remaining;
                    }
                    elements.push(remaining);
                }
                break;
            }

            // Add text before the tag
            if (earliestMatch.index > 0) {
                const textBefore = remaining.slice(0, earliestMatch.index);
                if (textBefore.trim()) {
                    elements.push(textBefore);
                }
            }

            // Add the component
            if (earliestMatch.tag === "SEPARATOR") {
                elements.push(<earliestMatch.Component key={key++} />);
                remaining = remaining.slice(earliestMatch.index + "|||SEPARATOR|||".length);
            } else if (earliestMatch.tag === "TABLE") {
                elements.push(<React.Fragment key={key++}>{parseTable(earliestMatch.match[1])}</React.Fragment>);
                remaining = remaining.slice(earliestMatch.index + earliestMatch.match[0].length);
            } else if (earliestMatch.tag === "LIST") {
                elements.push(<React.Fragment key={key++}>{parseList(earliestMatch.match[1])}</React.Fragment>);
                remaining = remaining.slice(earliestMatch.index + earliestMatch.match[0].length);
            } else {
                const content = earliestMatch.match[1];
                const parsedContent = parseContent(content); // Recursively parse nested content
                elements.push(<earliestMatch.Component key={key++}>{parsedContent}</earliestMatch.Component>);
                remaining = remaining.slice(earliestMatch.index + earliestMatch.match[0].length);
            }
        }

        // Return properly
        if (elements.length === 0) return null;
        if (elements.length === 1) return elements[0];

        return <>{elements}</>;
    };

    const parseTable = (content: string): React.ReactNode => {
        const rows: React.ReactNode[] = [];
        let key = 0;

        // Parse THEAD
        const theadMatch = content.match(/<THEAD>(.*?)<\/THEAD>/s);
        if (theadMatch) {
            const headers = [...theadMatch[1].matchAll(/<TH>(.*?)<\/TH>/g)];
            rows.push(
                <AITableHead key={key++}>
                    {headers.map((h, i) => (
                        <AITableHeader key={i}>{h[1]}</AITableHeader>
                    ))}
                </AITableHead>,
            );
        }

        // Parse TROW (table rows)
        const trows = [...content.matchAll(/<TROW>(.*?)<\/TROW>/gs)];
        if (trows.length > 0) {
            rows.push(
                <AITableBody key={key++}>
                    {trows.map((row, rowIdx) => {
                        const cells = [...row[1].matchAll(/<TD>(.*?)<\/TD>/g)];
                        return (
                            <AITableRow key={rowIdx}>
                                {cells.map((cell, cellIdx) => (
                                    <AITableCell key={cellIdx}>{parseContent(cell[1])}</AITableCell>
                                ))}
                            </AITableRow>
                        );
                    })}
                </AITableBody>,
            );
        }

        return <AITable key={key++}>{rows}</AITable>;
    };

    const parseList = (content: string): React.ReactNode => {
        const items = [...content.matchAll(/<ITEM>(.*?)<\/ITEM>/gs)];

        return (
            <AIList>
                {items.map((item, idx) => (
                    <AIListItem key={idx}>{parseContent(item[1])}</AIListItem>
                ))}
            </AIList>
        );
    };

    return <div className="ai-response-container space-y-2 max-w-full overflow-x-hidden break-words">{parseContent(response)}</div>;
};
