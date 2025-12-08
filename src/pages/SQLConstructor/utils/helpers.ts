import { TableSchema } from "../types/types";
import { SelectOption } from "../components/ui/Select";

export const loadState = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

export const saveState = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to save state", e);
  }
};

export const getOperators = (
  dataType: string
): { value: string; label: string; className?: string }[] => {
  const noneOpt = { value: "", label: "None" };
  const sqlOpt = {
    value: "SQL",
    label: "SQL / Expr",
    className: "text-pink-400 font-bold bg-pink-950/30",
  };

  if (!dataType) return [noneOpt, { value: "=", label: "=" }, sqlOpt];
  const lower = dataType.toLowerCase();

  // Helper to append SQL option at the end
  const withOps = (opts: { value: string; label: string }[]) => [
    noneOpt,
    ...opts,
    sqlOpt,
  ];

  // Array types
  if (lower.includes("array") || lower.endsWith("[]")) {
    return withOps([
      { value: "IN", label: "IN" },
      { value: "=", label: "=" },
      { value: "<>", label: "<>" },
      { value: "IS NULL", label: "IS NULL" },
      { value: "IS NOT NULL", label: "IS NOT NULL" },
    ]);
  }

  // Base operators for most types
  const base = [
    { value: "=", label: "=" },
    { value: "<>", label: "<>" },
    { value: "IS NULL", label: "IS NULL" },
    { value: "IS NOT NULL", label: "IS NOT NULL" },
  ];

  if (lower === "boolean")
    return withOps([
      { value: "=", label: "=" },
      { value: "IS NULL", label: "IS NULL" },
      { value: "IS NOT NULL", label: "IS NOT NULL" },
    ]);

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
    return withOps([
      ...base,
      { value: ">", label: ">" },
      { value: "<", label: "<" },
      { value: ">=", label: ">=" },
      { value: "<=", label: "<=" },
      { value: "IN", label: "IN" },
    ]);
  }

  if (lower.startsWith("timestamp") || lower === "date") {
    return withOps([
      ...base,
      { value: ">", label: ">" },
      { value: "<", label: "<" },
      { value: ">=", label: ">=" },
      { value: "<=", label: "<=" },
      { value: "IN", label: "IN" },
    ]);
  }

  // String types
  return withOps([
    ...base,
    { value: ">", label: ">" },
    { value: "<", label: "<" },
    { value: ">=", label: ">=" },
    { value: "LIKE", label: "LIKE" },
    { value: "NOT LIKE", label: "NOT LIKE" },
    { value: "IN", label: "IN" },
  ]);
};

export const getAggregationOptions = (dataType: string): SelectOption[] => {
  const base: SelectOption[] = [
    { value: "Group By", label: "Group By" },
    { value: "COUNT", label: "Count" },
    { value: "MIN", label: "Min" },
    { value: "MAX", label: "Max" },
    { value: "MIN", label: "First" },
    { value: "MAX", label: "Last" },
    {
      value: "Expression",
      label: "Expression (Warning)",
      className: "text-red-400 font-bold",
    },
    { value: "Where", label: "Where" },
  ];

  const lower = (dataType || "").toLowerCase();

  // Allow SUM for numeric types AND boolean (user request)
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
    return [
      base[0],
      { value: "SUM", label: "Sum" },
      { value: "AVG", label: "Avg" },
      ...base.slice(1),
    ];
  }

  if (lower === "boolean") {
    return [
      base[0], // Group By
      { value: "SUM", label: "Sum" },
      { value: "COUNT", label: "Count" },
      { value: "MIN", label: "Min" },
      { value: "MAX", label: "Max" },
      ...base.slice(4), // Skip Min/Max duplicates from base, keeping Expression/Where
    ];
  }

  return base;
};

/**
 * Determines the data type of the result after aggregation.
 * e.g. COUNT(text) -> bigint
 *      AVG(int) -> numeric
 */
export const getEffectiveTypeForAggregation = (
  originalType: string,
  aggregationType: string
): string => {
  if (
    !aggregationType ||
    aggregationType === "Group By" ||
    aggregationType === "Where"
  )
    return originalType;

  if (aggregationType === "COUNT") return "bigint";
  // SUM of boolean acts like integer/decimal
  if (["SUM", "AVG"].includes(aggregationType)) return "decimal";

  // MIN, MAX, FIRST, LAST preserve the original type
  return originalType;
};

export const getDataType = (
  schema: TableSchema[],
  tableName: string,
  columnName: string
) => {
  const table = schema.find((t) => t.table_name === tableName);
  const col = table?.columns?.find((c) => c.column_name === columnName);
  return col ? col.data_type : "text";
};

export const formatDataType = (type: string) => {
  if (!type) return "unknown";
  if (type.startsWith("timestamp")) return "date";
  if (type.startsWith("character")) return "text";
  return type;
};

export const getColumnsForTable = (
  schema: TableSchema[],
  tableName: string
) => {
  const table = schema.find((t) => t.table_name === tableName);
  return table ? table.columns : [];
};
