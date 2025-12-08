import {
  QueryDefinition,
  TableSchema,
  JoinClause,
  WhereClause,
} from "../types/types";

/**
 * Returns the identifier, optionally quoted.
 * e.g., table -> "table" or table -> table
 */
function escapeId(identifier: string, useQuotes: boolean): string {
  if (identifier === "*") return "*";
  return useQuotes ? `"${identifier}"` : identifier;
}

/**
 * Escapes a value based on its type.
 */
function escapeValue(
  value: string | number | boolean | null,
  dataType?: string
): string {
  if (value === null) return "NULL";

  const strVal = value.toString();
  const lowerType = (dataType || "").toLowerCase();

  // 1. Handle Boolean
  if (lowerType === "boolean") {
    return strVal.toLowerCase() === "true" ? "true" : "false";
  }

  // 2. Handle Numeric
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
  ) {
    if (!isNaN(Number(strVal)) || strVal.match(/^-?\d+(\.\d+)?$/)) {
      return strVal;
    }
    return strVal || "0";
  }

  // 3. Handle Date / Timestamp
  if (lowerType.startsWith("timestamp") || lowerType === "date") {
    // Check for ISO format YYYY-MM-DD (matches input type="date" output)
    const isoMatch = strVal.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return `'${isoMatch[0]}'`; // Return strict date literal (ignoring time if present)
    }

    // Check for manual DD/MM/YYYY
    const dateMatch = strVal.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (dateMatch) {
      const [_, day, month, year] = dateMatch;
      // Convert to ISO 'YYYY-MM-DD' for SQL standard compliance
      return `'${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}'`;
    }

    // Fallback keywords
    if (
      strVal.toUpperCase() === "NOW()" ||
      strVal.toUpperCase() === "CURRENT_DATE"
    ) {
      return strVal;
    }
  }

  // 4. Handle Arrays for IN operator
  if (
    strVal.includes(",") &&
    !strVal.startsWith("'") &&
    !strVal.startsWith("#")
  ) {
    return `(${strVal
      .split(",")
      .map((v) => `'${v.trim().replace(/'/g, "''")}'`)
      .join(", ")})`;
  }

  // 5. Default String Handling
  const safeStr = strVal.replace(/'/g, "''");
  return `'${safeStr}'`;
}

/**
 * Helper to build condition strings from groups (WHERE or HAVING)
 */
function buildConditionString(
  groups: WhereClause[][],
  schema: TableSchema[],
  useQuotes: boolean
): string {
  const groupStrings = groups
    .map((group) => {
      if (group.length === 0) return null;

      const conditions = group.map((w) => {
        const tableSchema = schema.find((t) => t.table_name === w.table);
        const colSchema = tableSchema?.columns.find(
          (c) => c.column_name === w.column
        );

        let identifier = "";

        // 1. Use Custom Expression if available (Priority)
        if (w.expression) {
          identifier = w.expression;
        } else {
          // 2. Default: Table.Column
          identifier = `${escapeId(w.table, useQuotes)}.${escapeId(
            w.column,
            useQuotes
          )}`;

          // 3. Apply aggregation wrapper if not an expression type
          if (w.aggregation && w.aggregation !== "Expression") {
            // Handle SUM(boolean) special case by casting to int
            if (w.aggregation === "SUM" && colSchema?.data_type === "boolean") {
              identifier = `SUM(${identifier}::int)`;
            } else {
              identifier = `${w.aggregation}(${identifier})`;
            }
          }
        }

        // --- RAW SQL / IIF Handling ---
        if (w.operator === "SQL") {
          let raw = w.value;
          // Transpile IIF(cond, true, false) -> CASE WHEN cond THEN true ELSE false END
          // Simple regex for non-nested IIF. Complex nested IIF should use standard CASE WHEN.
          // Matches: IIF ( capture1, capture2, capture3 )
          raw = raw.replace(
            /IIF\s*\(([^,]+),([^,]+),([^)]+)\)/gi,
            "CASE WHEN $1 THEN $2 ELSE $3 END"
          );

          // The user input is appended directly to the identifier.
          // Example input: "= 5" -> "col = 5"
          // Example input: "> IIF(x, 10, 0)" -> "col > CASE WHEN x THEN 10 ELSE 0 END"
          return `${identifier} ${raw}`;
        }

        // Handle Unary Operators (IS NULL / IS NOT NULL)
        if (w.operator === "IS NULL" || w.operator === "IS NOT NULL") {
          return `${identifier} ${w.operator}`;
        }

        // Handle LIKE / NOT LIKE wildcards
        let valueToEscape = w.value;
        if (
          (w.operator === "LIKE" || w.operator === "NOT LIKE") &&
          typeof w.value === "string"
        ) {
          valueToEscape = `%${w.value}%`;
        }

        const val =
          w.operator === "IN"
            ? w.value
            : escapeValue(valueToEscape, colSchema?.data_type);

        if (w.operator === "IN" && !val.startsWith("(")) {
          return `${identifier} IN (${val})`;
        }

        return `${identifier} ${w.operator} ${val}`;
      });

      return `(${conditions.join(" AND ")})`;
    })
    .filter(Boolean);

  if (groupStrings.length > 0) {
    return groupStrings.join("\n  OR ");
  }
  return "";
}

export function findJoinPath(
  sourceTables: string[],
  targetTable: string,
  schema: TableSchema[]
): JoinClause[] | null {
  // ... existing implementation remains the same ...
  // Since findJoinPath logic doesn't generate SQL strings, just returns internal structures, no changes needed here.

  // Defensive checks
  if (!targetTable || !sourceTables || sourceTables.length === 0 || !schema)
    return null;

  // If target is already in source, no path needed
  if (sourceTables.includes(targetTable)) return [];

  const queue: { table: string; path: JoinClause[] }[] = [];
  const visited = new Set<string>();

  // Initialize queue with all source tables as potential starting points
  for (const t of sourceTables) {
    if (t) {
      queue.push({ table: t, path: [] });
      visited.add(t);
    }
  }

  // BFS to find shortest path to targetTable
  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) continue;

    const { table: currentTable, path } = item;

    // Check if we found a direct link to target from currentTable
    const currentSchema = schema.find((t) => t.table_name === currentTable);
    if (!currentSchema) continue;

    // 1. Forward: Current -> Target (Current has FK to Target)
    if (currentSchema.foreign_keys) {
      const fk = currentSchema.foreign_keys.find(
        (k) => k.ref_table === targetTable
      );
      if (fk) {
        // Found it
        const newJoin: JoinClause = {
          id: Math.random().toString(36).substr(2, 9),
          type: "INNER JOIN",
          table1: currentTable,
          column1: fk.column,
          table2: targetTable,
          column2: fk.ref_column,
          isAuto: true,
        };
        return [...path, newJoin];
      }
    }

    // 2. Reverse: Target -> Current (Target has FK to Current)
    const targetSchema = schema.find((t) => t.table_name === targetTable);
    if (targetSchema && targetSchema.foreign_keys) {
      const fk = targetSchema.foreign_keys.find(
        (k) => k.ref_table === currentTable
      );
      if (fk) {
        // Found it
        const newJoin: JoinClause = {
          id: Math.random().toString(36).substr(2, 9),
          type: "INNER JOIN",
          table1: currentTable,
          column1: fk.ref_column,
          table2: targetTable,
          column2: fk.column,
          isAuto: true,
        };
        return [...path, newJoin];
      }
    }

    // If not found, look for intermediate neighbors
    // Forward neighbors
    if (currentSchema.foreign_keys) {
      for (const fk of currentSchema.foreign_keys) {
        if (!visited.has(fk.ref_table)) {
          visited.add(fk.ref_table);
          const newJoin: JoinClause = {
            id: Math.random().toString(36).substr(2, 9),
            type: "INNER JOIN",
            table1: currentTable,
            column1: fk.column,
            table2: fk.ref_table,
            column2: fk.ref_column,
            isAuto: true,
          };
          // Recurse / Add to queue
          if (fk.ref_table === targetTable) return [...path, newJoin];
          queue.push({ table: fk.ref_table, path: [...path, newJoin] });
        }
      }
    }

    // Reverse neighbors (Tables that point to Current)
    for (const t of schema) {
      if (t.table_name === currentTable) continue;
      if (t.foreign_keys) {
        const fkToCurrent = t.foreign_keys.find(
          (k) => k.ref_table === currentTable
        );
        if (fkToCurrent && !visited.has(t.table_name)) {
          visited.add(t.table_name);
          const newJoin: JoinClause = {
            id: Math.random().toString(36).substr(2, 9),
            type: "INNER JOIN",
            table1: currentTable,
            column1: fkToCurrent.ref_column,
            table2: t.table_name,
            column2: fkToCurrent.column,
            isAuto: true,
          };
          if (t.table_name === targetTable) return [...path, newJoin];
          queue.push({ table: t.table_name, path: [...path, newJoin] });
        }
      }
    }
  }

  // Return null if no path found instead of throwing error to prevent UI crashes
  return null;
}

/**
 * Main function to build the SQL query.
 */
export function buildSelectQuery(
  queryDef: QueryDefinition,
  schema: TableSchema[],
  useQuotes: boolean = false
): string {
  // 1. Validation
  if (!queryDef.from) {
    throw new Error("Query definition must have a 'from' table specified.");
  }
  const mainTableSchema = schema.find((t) => t.table_name === queryDef.from);
  if (!mainTableSchema) {
    throw new Error(`Main table '${queryDef.from}' not found in schema.`);
  }

  // 2. Build SELECT Clause
  let selectClause = "";
  if (queryDef.select.length === 0) {
    selectClause = `${escapeId(queryDef.from, useQuotes)}.*`;
  } else {
    selectClause = queryDef.select
      .map((field) => {
        const tableSchema = schema.find((t) => t.table_name === field.table);
        const colSchema = tableSchema?.columns.find(
          (c) => c.column_name === field.column
        );

        const colPart = `${escapeId(field.table, useQuotes)}.${escapeId(
          field.column,
          useQuotes
        )}`;
        let expr = colPart;

        if (field.aggregation) {
          if (field.aggregation === "Expression") {
            // Use custom expression if present, default to column otherwise
            expr = field.expression || colPart;
          } else if (
            field.aggregation === "SUM" &&
            colSchema?.data_type === "boolean"
          ) {
            // Cast boolean to int for SUM aggregation
            expr = `SUM(${colPart}::int)`;
          } else {
            expr = `${field.aggregation}(${colPart})`;
          }
        }

        return field.alias
          ? `${expr} AS ${escapeId(field.alias, useQuotes)}`
          : expr;
      })
      .join(",\n  ");
  }

  // 3. Build JOINS (From Explicit List)
  let joinClause = "";
  if (queryDef.joins && queryDef.joins.length > 0) {
    joinClause =
      "\n" +
      queryDef.joins
        .map((j) => {
          return `${j.type} ${escapeId(j.table2, useQuotes)} ON ${escapeId(
            j.table1,
            useQuotes
          )}.${escapeId(j.column1, useQuotes)} = ${escapeId(
            j.table2,
            useQuotes
          )}.${escapeId(j.column2, useQuotes)}`;
        })
        .join("\n");
  }

  // 4. Build WHERE Clause (With Groups for OR logic)
  let whereClause = "";
  if (queryDef.whereGroups && queryDef.whereGroups.length > 0) {
    const conditions = buildConditionString(
      queryDef.whereGroups,
      schema,
      useQuotes
    );
    if (conditions) {
      whereClause = "\nWHERE " + conditions;
    }
  }

  // 5. Build GROUP BY Clause
  let groupByClause = "";
  if (queryDef.groupBy && queryDef.groupBy.length > 0) {
    // NOTE: We don't escape expressions in groupBy if they are custom expressions,
    // but we should escape table.column references.
    // Logic inside useQueryBuilder ensures groupBy contains properly formatted strings,
    // but simple mapping here might be safer if we re-escape.
    // However, current implementation passes pre-formatted strings for GROUP BY from hook.
    // To support quoting correctly, we should ideally rebuild this.
    // For now, assuming standard column refs need quotes.

    const formattedGroupBy = queryDef.groupBy.map((g) => {
      if (g.includes(".")) {
        const [t, c] = g.split(".");
        // Naive check, but works for table.column pattern
        return `${escapeId(t, useQuotes)}.${escapeId(c, useQuotes)}`;
      }
      return g; // Custom expression
    });

    groupByClause = "\nGROUP BY " + formattedGroupBy.join(", ");
  }

  // 6. Build HAVING Clause
  let havingClause = "";
  if (queryDef.havingGroups && queryDef.havingGroups.length > 0) {
    const conditions = buildConditionString(
      queryDef.havingGroups,
      schema,
      useQuotes
    );
    if (conditions) {
      havingClause = "\nHAVING " + conditions;
    }
  }

  // 7. Build ORDER BY
  let orderByClause = "";
  if (queryDef.orderBy && queryDef.orderBy.length > 0) {
    const orders = queryDef.orderBy.map((o) => {
      // Find if this field in SELECT has aggregation
      const selectField = queryDef.select.find(
        (s) => s.table === o.table && s.column === o.column
      );
      const tableSchema = schema.find((t) => t.table_name === o.table);
      const colSchema = tableSchema?.columns.find(
        (c) => c.column_name === o.column
      );

      let colRef = `${escapeId(o.table, useQuotes)}.${escapeId(
        o.column,
        useQuotes
      )}`;

      if (selectField && selectField.aggregation) {
        if (selectField.aggregation === "Expression") {
          // Priority: Custom Expression -> Alias -> Column
          // Ideally standard SQL allows Alias in Order By
          colRef = selectField.expression || colRef;
        } else if (
          selectField.aggregation === "SUM" &&
          colSchema?.data_type === "boolean"
        ) {
          colRef = `SUM(${colRef}::int)`;
        } else {
          colRef = `${selectField.aggregation}(${colRef})`;
        }
      }

      return `${colRef} ${o.direction}`;
    });
    orderByClause = "\nORDER BY " + orders.join(", ");
  }

  // 8. Assembly
  return `SELECT
  ${selectClause}
FROM ${escapeId(
    queryDef.from,
    useQuotes
  )}${joinClause}${whereClause}${groupByClause}${havingClause}${orderByClause};`;
}
