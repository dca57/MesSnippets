import { TableSchema } from "../types/types";

const toCamelCase = (str: string) => {
  return str.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace("-", "").replace("_", "");
  });
};

const toPascalCase = (str: string) => {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
};

const mapPostgresToTs = (type: string) => {
  const t = (type || "").toLowerCase();
  if (
    [
      "integer",
      "int",
      "smallint",
      "bigint",
      "serial",
      "bigserial",
      "decimal",
      "numeric",
      "real",
      "double precision",
      "money",
    ].some((x) => t.includes(x))
  )
    return "number";
  if (t.includes("boolean")) return "boolean";
  if (["json", "jsonb"].some((x) => t.includes(x))) return "any";
  return "string";
};

export const generateTypeScriptInterfaces = (schema: TableSchema[]): string => {
  if (!schema || schema.length === 0) return "// No schema definitions found";

  return schema
    .map((table) => {
      const interfaceName = toPascalCase(table.table_name);
      const props = table.columns
        .map((col) => {
          const propName = toCamelCase(col.column_name);
          const tsType = mapPostgresToTs(col.data_type);
          const isOptional = col.is_nullable === "YES";
          return `  ${propName}${isOptional ? "?" : ""}: ${tsType};`;
        })
        .join("\n");

      return `export interface ${interfaceName} {\n${props}\n}`;
    })
    .join("\n\n");
};
