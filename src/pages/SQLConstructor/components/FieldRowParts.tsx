import React from "react";
import { Icons } from "./icons";
import { Select } from "./ui/Select";
import { Operator } from "../types/types";
import { getEffectiveTypeForAggregation, getOperators } from "../utils/helpers";

// --- Badges ---

export const TypeBadge: React.FC<{ sqlType: string }> = ({ sqlType }) => {
  const lower = sqlType.toLowerCase();
  let content;
  let className =
    "text-[9px] font-mono px-1 rounded border mr-1 w-[34px] flex justify-center shrink-0";

  if (
    [
      "integer",
      "bigint",
      "decimal",
      "numeric",
      "real",
      "double precision",
      "smallint",
      "money",
    ].includes(lower)
  ) {
    className += " bg-blue-500/20 text-blue-400 border-blue-500/30";
    content = "NUM";
  } else if (lower.startsWith("timestamp") || lower === "date") {
    className += " bg-orange-500/20 text-orange-400 border-orange-500/30";
    content = "DATE";
  } else if (lower === "boolean") {
    className += " bg-purple-500/20 text-purple-400 border-purple-500/30";
    content = "BOOL";
  } else {
    className += " bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    content = "STR";
  }

  return <span className={className}>{content}</span>;
};

export const IdentityBadge: React.FC<{ isPK?: boolean; isFK?: boolean }> = ({
  isPK,
  isFK,
}) => {
  if (isPK) {
    return (
      <div title="Primary Key">
        <Icons.Key className="w-3 h-3 text-yellow-500" />
      </div>
    );
  }
  if (isFK) {
    return (
      <div className="w-[18px] flex justify-center" title="Foreign Key">
        <span className="text-[8px] font-bold text-indigo-400 border border-indigo-500/40 bg-indigo-500/10 rounded-[2px] px-0.5">
          FK
        </span>
      </div>
    );
  }
  return null;
};

// --- Inputs ---

interface FilterInputProps {
  type: string;
  op: string;
  val: string;
  onChange: (op: string | undefined, val: string) => void;
}

export const FilterInput: React.FC<FilterInputProps> = ({
  type,
  op,
  val,
  onChange,
}) => {
  // 1. SQL / Expression Mode
  if (op === "SQL") {
    return (
      <input
        type="text"
        placeholder="= IIF(x, 1, 0) or > 100"
        className="w-full bg-slate-900 border border-pink-500/30 rounded px-1.5 py-1.5 text-xs text-pink-300 font-mono focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors placeholder-pink-500/30"
        value={val}
        onChange={(e) => onChange(undefined, e.target.value)}
      />
    );
  }

  const lowerType = type.toLowerCase();
  const isBoolean = lowerType === "boolean";
  const isDate = lowerType.startsWith("timestamp") || lowerType === "date";
  const isArray = lowerType.includes("array") || lowerType.endsWith("[]");

  // Determine Input Type
  let htmlInputType = "text";
  if (
    [
      "integer",
      "bigint",
      "decimal",
      "numeric",
      "real",
      "double precision",
      "smallint",
      "money",
    ].includes(lowerType)
  )
    htmlInputType = "number";

  const isNullOp = op === "IS NULL" || op === "IS NOT NULL";

  // 2. Boolean Logic
  if (isBoolean) {
    if (isNullOp) {
      return (
        <input
          type="text"
          disabled
          className="w-full bg-slate-800/50 border border-slate-800 rounded px-1.5 py-1.5 text-xs cursor-not-allowed"
        />
      );
    }
    return (
      <Select
        value={val}
        onChange={(e) => {
          const newVal = e.target.value;
          onChange(newVal ? "=" : "", newVal);
        }}
        options={[
          { value: "", label: "None" },
          { value: "true", label: "True" },
          { value: "false", label: "False" },
        ]}
        className="w-full"
      />
    );
  }

  // 3. Standard Logic
  let placeholder = "Val";
  if (op === "IN") placeholder = "v1,v2";
  else if (isDate) placeholder = "JJ/MM/AAAA";
  else if (isArray) placeholder = "{v}";

  return (
    <input
      type={op === "IN" || isArray ? "text" : htmlInputType}
      placeholder={placeholder}
      disabled={isNullOp}
      className={`w-full bg-slate-800 border border-slate-700 rounded px-1.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-900 disabled:border-slate-800`}
      value={isNullOp ? "" : val}
      onChange={(e) => {
        const v = e.target.value;
        // Auto-select operator if user types but no operator selected
        let newOp = undefined;
        if (v && !op) newOp = "=";
        onChange(newOp, v);
      }}
    />
  );
};

interface HavingInputProps {
  type: string;
  aggType: string;
  op: string;
  val: string;
  isGroupByActive: boolean;
  onUpdateOp: (op: Operator | "") => void;
  onUpdateVal: (val: string, autoOp?: string) => void;
}

export const HavingInput: React.FC<HavingInputProps> = ({
  type,
  aggType,
  op,
  val,
  isGroupByActive,
  onUpdateOp,
  onUpdateVal,
}) => {
  const isAggregate =
    isGroupByActive &&
    aggType &&
    ["SUM", "AVG", "MIN", "MAX", "COUNT"].includes(aggType);

  if (!isAggregate) {
    return (
      <div className="w-full h-7 flex items-center justify-center text-[10px] text-slate-700 italic bg-transparent border border-transparent rounded select-none">
        No Agg.
      </div>
    );
  }

  const effectiveType = getEffectiveTypeForAggregation(type, aggType);

  // Reuse FilterInput logic for the input part, but we need to handle the Operator Select separately here
  // because Having layout splits them differently in the main row.

  // ... Actually, let's reuse the logic but render the specialized two-column layout here.

  const effectiveIsBoolean = effectiveType === "boolean";
  const isNullOp = op === "IS NULL" || op === "IS NOT NULL";

  if (effectiveIsBoolean && !isNullOp) {
    return (
      <div className="w-full">
        <Select
          value={val || ""}
          onChange={(e) => {
            const newVal = e.target.value;
            // We combine op update and val update here for boolean
            onUpdateVal(newVal, newVal ? "=" : "");
          }}
          options={[
            { value: "", label: "None" },
            { value: "true", label: "True" },
            { value: "false", label: "False" },
          ]}
          className="w-full"
        />
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      <div className="w-[60px] shrink-0">
        <Select
          placeholder=""
          value={op || ""}
          onChange={(e) => onUpdateOp(e.target.value as Operator | "")}
          options={getOperators(effectiveType)}
          className="px-0 text-center"
        />
      </div>
      <div className="flex-grow min-w-0">
        {/* We use FilterInput but force it to behave like a controlled input without internal Operator logic if we want, 
                 but FilterInput is robust enough. Let's just use a direct input for simplicity here as Having is slightly specific. */}
        <input
          type={
            [
              "integer",
              "bigint",
              "decimal",
              "numeric",
              "real",
              "double precision",
              "smallint",
              "money",
            ].includes(effectiveType)
              ? "number"
              : "text"
          }
          placeholder="Val"
          disabled={isNullOp}
          className="w-full bg-slate-800 border border-slate-700 rounded px-1.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-900 disabled:border-slate-800"
          value={isNullOp ? "" : val}
          onChange={(e) => {
            const v = e.target.value;
            const newOp = v && !op ? "=" : undefined;
            onUpdateVal(v, newOp);
          }}
        />
      </div>
    </div>
  );
};
