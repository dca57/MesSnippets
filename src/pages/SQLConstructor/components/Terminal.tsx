import React, { useMemo } from "react";
import { Icons } from "./icons";

interface TerminalProps {
  generatedSQL: string;
  tempError: string | null;
  orphanedTables: string[];
  copyFeedback: boolean;
  onToggleLinkManager: () => void;
  onCopy: () => void;
  height: number;
  onResizeStart: (e: React.MouseEvent) => void;
}

const HighlightedSQL = ({ sql }: { sql: string }) => {
  const parts = useMemo(() => {
    if (!sql) return [];
    // Split by whitespace but keep delimiters (parentheses, commas, semicolons)
    return sql.split(/(\s+|[(),;])/g);
  }, [sql]);

  // Blue: Main Structure & Control Flow + ASC/DESC
  const mainKeywords = new Set([
    "SELECT",
    "FROM",
    "WHERE",
    "GROUP",
    "BY",
    "HAVING",
    "ORDER",
    "LIMIT",
    "OFFSET",
    "UNION",
    "ALL",
    "RETURNING",
    "CASE",
    "END",
    "DISTINCT",
    "ASC",
    "DESC",
  ]);

  // Gray: Joins, Operators, Modifiers, Logical Connectors
  const secondaryKeywords = new Set([
    "JOIN",
    "INNER",
    "LEFT",
    "RIGHT",
    "FULL",
    "OUTER",
    "ON",
    "AS",
    "AND",
    "OR",
    "IN",
    "IS",
    "NULL",
    "NOT",
    "WHEN",
    "THEN",
    "ELSE",
    "CROSS",
    "LATERAL",
  ]);

  // Functions can be white or a specific color (keeping default white/slate-200 for now to let Blue/Gray pop)
  // const functions = new Set(['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE']);

  // Rainbow Parentheses Colors: Level 0 -> Yellow, Level 1 -> Pink, Level 2 -> Blue
  const parenColors = ["text-yellow-400", "text-pink-400", "text-blue-400"];
  let parenDepth = 0;

  return (
    <>
      {parts.map((part, i) => {
        const upper = part.toUpperCase();

        // 1. Handle Parentheses with Depth Logic
        if (part === "(") {
          const color = parenColors[parenDepth % parenColors.length];
          parenDepth++;
          return (
            <span key={i} className={`${color} font-bold`}>
              {part}
            </span>
          );
        }
        if (part === ")") {
          parenDepth = Math.max(0, parenDepth - 1); // Avoid negative depth
          const color = parenColors[parenDepth % parenColors.length];
          return (
            <span key={i} className={`${color} font-bold`}>
              {part}
            </span>
          );
        }

        // 2. Main Keywords (Blue)
        if (mainKeywords.has(upper)) {
          return (
            <span key={i} className="text-blue-400 font-bold">
              {part}
            </span>
          );
        }

        // 3. Secondary Keywords / Modifiers (Gray)
        if (secondaryKeywords.has(upper)) {
          return (
            <span key={i} className="text-slate-400 font-semibold">
              {part}
            </span>
          );
        }

        // 4. Strings (Green)
        if (part.startsWith("'") && part.endsWith("'")) {
          return (
            <span key={i} className="text-emerald-300">
              {part}
            </span>
          );
        }

        // 5. Numbers (Amber)
        if (!isNaN(Number(part)) && part.trim() !== "") {
          return (
            <span key={i} className="text-amber-300">
              {part}
            </span>
          );
        }

        // 6. Default (Columns, Tables, Functions, Punctuation)
        // Using slate-200 for better readability against dark bg
        return (
          <span key={i} className="text-slate-200">
            {part}
          </span>
        );
      })}
    </>
  );
};

export const Terminal: React.FC<TerminalProps> = ({
  generatedSQL,
  tempError,
  orphanedTables,
  copyFeedback,
  onToggleLinkManager,
  onCopy,
  height,
  onResizeStart,
}) => {
  return (
    <footer
      style={{ height }}
      className="bg-slate-950 border-t border-slate-800 flex flex-col shrink-0 relative shadow-[0_-5px_15px_rgba(0,0,0,0.3)] z-20 transition-[height] duration-75 ease-linear"
    >
      {/* Resize Handle */}
      <div
        onMouseDown={onResizeStart}
        className="absolute top-0 left-0 right-0 h-1.5 -mt-0.5 cursor-row-resize z-50 group flex justify-center items-center hover:bg-indigo-500/20 transition-colors"
        title="Drag to resize"
      >
        <div className="w-8 h-1 rounded-full bg-slate-700 group-hover:bg-indigo-500 transition-colors hidden group-hover:block" />
      </div>

      <div className="h-8 bg-slate-900/50 px-4 flex justify-between items-center border-b border-slate-800 select-none">
        <span className="text-[10px] font-mono text-green-400 font-bold tracking-wider flex items-center gap-2">
          TERMINAL // SQL OUTPUT
        </span>
        <div className="flex items-center gap-2">
          {orphanedTables.length > 0 && (
            <button
              onClick={onToggleLinkManager}
              className="flex items-center gap-1.5 text-[10px] uppercase font-bold px-2 py-0.5 rounded transition-all bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/50"
            >
              <Icons.Wrench className="w-3.5 h-3.5" /> Fix Joins
            </button>
          )}
          <button
            onClick={onCopy}
            className={`flex items-center gap-1.5 text-[10px] uppercase font-bold px-2 py-0.5 rounded transition-all ${
              copyFeedback
                ? "bg-green-500/20 text-green-400"
                : "bg-slate-800 hover:bg-slate-700 text-red-700 dark:text-red-400"
            }`}
          >
            {copyFeedback ? (
              <>Copied!</>
            ) : (
              <>
                <Icons.Copy className="w-3.5 h-3.5 text-red-700 dark:text-red-400" /> Copy SQL
              </>
            )}
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-auto p-4 font-mono text-sm leading-relaxed">
        <pre
          className={
            tempError
              ? "text-amber-400 font-bold"
              : "whitespace-pre-wrap break-all"
          }
        >
          {tempError ||
            (generatedSQL.startsWith("--") ? (
              <span className="text-slate-500 italic">{generatedSQL}</span>
            ) : (
              <HighlightedSQL sql={generatedSQL} />
            ))}
        </pre>
      </div>
    </footer>
  );
};
