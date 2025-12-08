import { useState, useEffect, useRef, useMemo } from "react";
import {
  JoinClause,
  UIField,
  TableSchema,
  SavedQuery,
  QueryDefinition,
  Operator,
  WhereClause,
  JoinType,
} from "../types/types";
import { loadState, getColumnsForTable } from "../utils/helpers";
import { buildSelectQuery, findJoinPath } from "../services/sql-builder";

export const useQueryBuilder = (
  activeSchema: TableSchema[],
  savedQueries: SavedQuery[]
) => {
  // --- State ---
  const [from, setFrom] = useState(() => loadState("sql_builder_from", ""));
  const [joins, setJoins] = useState<JoinClause[]>(() =>
    loadState("sql_builder_joins", [])
  );
  const [fields, setFields] = useState<UIField[]>(() =>
    loadState("sql_builder_fields", [])
  );
  const [isGroupByActive, setIsGroupByActive] = useState(() =>
    loadState("sql_builder_group_by_active", false)
  );
  const [filterGroupCount, setFilterGroupCount] = useState(() =>
    loadState("sql_builder_filter_group_count", 1)
  );
  const [useQuotes, setUseQuotes] = useState(() =>
    loadState("sql_builder_use_quotes", false)
  );
  const [loadedQueryId, setLoadedQueryId] = useState<string | null>(null);

  // Derived / Temp State
  const [generatedSQL, setGeneratedSQL] = useState("");
  const [joinErrors, setJoinErrors] = useState<string[]>([]);
  const [tempError, setTempError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Refs for Drag & Drop
  const dragRowItem = useRef<number | null>(null);
  const dragOverRowItem = useRef<number | null>(null);

  // --- Persistence Effect ---
  useEffect(() => {
    localStorage.setItem("sql_builder_from", JSON.stringify(from));
    localStorage.setItem("sql_builder_joins", JSON.stringify(joins));
    localStorage.setItem("sql_builder_fields", JSON.stringify(fields));
    localStorage.setItem(
      "sql_builder_group_by_active",
      JSON.stringify(isGroupByActive)
    );
    localStorage.setItem(
      "sql_builder_filter_group_count",
      JSON.stringify(filterGroupCount)
    );
    localStorage.setItem("sql_builder_use_quotes", JSON.stringify(useQuotes));
  }, [from, joins, fields, isGroupByActive, filterGroupCount, useQuotes]);

  // --- Computed Tables ---
  const activeTableNames = useMemo(
    () =>
      Array.from(
        new Set(fields.filter((f) => f && f.table).map((f) => f.table))
      ).sort(),
    [fields]
  );

  const orphanedTables = useMemo(() => {
    const connected = new Set<string>();
    if (from) connected.add(from);
    joins.forEach((j) => {
      connected.add(j.table1);
      connected.add(j.table2);
    });
    return activeTableNames.filter((t) => !connected.has(t));
  }, [from, joins, activeTableNames]);

  // --- Auto-Join Logic (Strict Topology) ---
  useEffect(() => {
    // 1. Determine Root strictly based on fields[0]
    let rootTable = "";

    if (fields.length > 0) {
      rootTable = fields[0].table;
    } else {
      // Fallback: Current from if valid, or first in schema
      if (from && activeSchema.find((t) => t.table_name === from)) {
        rootTable = from;
      } else if (activeSchema.length > 0) {
        rootTable = activeSchema[0].table_name;
      }
    }

    // Sync 'from' state with Root immediately
    if (rootTable && from !== rootTable) {
      setFrom(rootTable);
    }

    if (fields.length === 0) {
      if (joins.length > 0) setJoins([]);
      if (joinErrors.length > 0) setJoinErrors([]);
      return;
    }

    // 2. Discover needed joins based on Root
    const manualJoins = joins.filter((j) => !j.isAuto);
    const existingAutoJoins = joins.filter((j) => j.isAuto);
    const newAutoJoins: JoinClause[] = [];
    const errors: string[] = [];

    // Tables currently reachable from Root (starts with Root)
    const connectedTables = new Set<string>([rootTable]);

    // Expand connectivity via Manual Joins (undirected) to allow pathfinding to use them
    let changes = true;
    while (changes) {
      changes = false;
      manualJoins.forEach((j) => {
        const has1 = connectedTables.has(j.table1);
        const has2 = connectedTables.has(j.table2);
        if (has1 && !has2) {
          connectedTables.add(j.table2);
          changes = true;
        }
        if (!has1 && has2) {
          connectedTables.add(j.table1);
          changes = true;
        }
      });
    }

    const targetTablesInOrder = Array.from(new Set(fields.map((f) => f.table)));

    for (const target of targetTablesInOrder) {
      if (connectedTables.has(target)) continue;

      // Find path from ANY table connected to Root -> Target
      const path = findJoinPath(
        Array.from(connectedTables),
        target,
        activeSchema
      );

      if (path) {
        path.forEach((pathJoin) => {
          // Check if covered by manual
          const isManual = manualJoins.some(
            (m) =>
              (m.table1 === pathJoin.table1 && m.table2 === pathJoin.table2) ||
              (m.table1 === pathJoin.table2 && m.table2 === pathJoin.table1)
          );

          if (!isManual) {
            // Check if already added in this pass
            const alreadyAdded = newAutoJoins.some(
              (aj) =>
                (aj.table1 === pathJoin.table1 &&
                  aj.table2 === pathJoin.table2) ||
                (aj.table1 === pathJoin.table2 && aj.table2 === pathJoin.table1)
            );

            if (!alreadyAdded) {
              // Reuse existing ID/Type if available
              const existing = existingAutoJoins.find(
                (ea) =>
                  (ea.table1 === pathJoin.table1 &&
                    ea.table2 === pathJoin.table2) ||
                  (ea.table1 === pathJoin.table2 &&
                    ea.table2 === pathJoin.table1)
              );

              let joinToUse = pathJoin;
              if (existing) {
                // If the existing join was oriented differently (swapped), we must respect the new path's direction (Source->Target)
                // and update the JoinType accordingly (e.g. Left -> Right)
                const isSwapped = existing.table1 === pathJoin.table2;
                let type = existing.type;

                if (isSwapped) {
                  if (type === "LEFT JOIN") type = "RIGHT JOIN";
                  else if (type === "RIGHT JOIN") type = "LEFT JOIN";
                }

                joinToUse = {
                  ...pathJoin,
                  id: existing.id,
                  type,
                  isAuto: true,
                };
              }

              newAutoJoins.push(joinToUse);
              connectedTables.add(pathJoin.table1);
              connectedTables.add(pathJoin.table2);
            }
          } else {
            connectedTables.add(pathJoin.table1);
            connectedTables.add(pathJoin.table2);
          }
        });
      } else {
        errors.push(`Could not join table '${target}': No relationship found.`);
      }
    }

    // 3. Topological Sort & Final Orientation
    // We construct the final list by strictly adding joins only when their source table is already "Defined" (in FROM or previous JOIN).
    const allPool = [...manualJoins, ...newAutoJoins];
    const sortedJoins: JoinClause[] = [];
    const definedTables = new Set<string>([rootTable]);

    let processedCount = -1;
    // Loop until we can't add any more joins
    while (allPool.length > 0 && allPool.length !== processedCount) {
      processedCount = allPool.length;
      const nextPool: JoinClause[] = [];

      for (const j of allPool) {
        const has1 = definedTables.has(j.table1);
        const has2 = definedTables.has(j.table2);

        if (has1 && !has2) {
          // Forward Join: T1 (defined) -> T2 (new). Valid.
          sortedJoins.push(j);
          definedTables.add(j.table2);
        } else if (!has1 && has2) {
          // Reverse Join: T2 (defined) <- T1 (new).
          // We must swap tables to make SQL valid: JOIN T1 ON T2.c = T1.c
          const type =
            j.type === "LEFT JOIN"
              ? "RIGHT JOIN"
              : j.type === "RIGHT JOIN"
              ? "LEFT JOIN"
              : j.type;
          sortedJoins.push({
            ...j,
            table1: j.table2,
            column1: j.column2,
            table2: j.table1,
            column2: j.column1,
            type,
          });
          definedTables.add(j.table1);
        } else if (has1 && has2) {
          // Loop / Extra constraint. Both defined. Valid.
          sortedJoins.push(j);
        } else {
          // Neither defined yet. Wait for next pass.
          nextPool.push(j);
        }
      }
      allPool.length = 0;
      allPool.push(...nextPool);
    }

    // If orphaned manual joins remain, append them (or they would disappear from UI)
    if (allPool.length > 0) {
      sortedJoins.push(...allPool);
    }

    // 4. Update State (only if changed to avoid loop)
    const getJoinHash = (l: JoinClause[]) =>
      l.map((j) => `${j.table1}-${j.type}-${j.table2}`).join("|");
    if (getJoinHash(sortedJoins) !== getJoinHash(joins)) {
      setJoins(sortedJoins);
    }

    if (JSON.stringify(errors) !== JSON.stringify(joinErrors)) {
      setJoinErrors(errors);
    }
  }, [fields, activeSchema, joins]);

  // --- SQL Generation Effect ---
  useEffect(() => {
    if (orphanedTables.length > 0) {
      setTempError(
        `-- ❌ Error: Table(s) not joined: ${orphanedTables.join(
          ", "
        )}. Add a manual link to include them in the query.`
      );
      const timer = setTimeout(() => setTempError(null), 3000);
      return () => clearTimeout(timer);
    }
    setTempError(null);

    // Validation
    if (isGroupByActive) {
      const hasHaving = fields.some((f) => f.having && f.having.op);
      const hasGroupField = fields.some((f) => f.groupByType === "Group By");
      if (hasHaving && !hasGroupField) {
        setGeneratedSQL(
          `-- ⚠️ Error: HAVING requires at least one field to be grouped (set Group Type to 'Group By').`
        );
        return;
      }
      const invalidOrder = fields.find((f) => {
        if (!f.sortDir) return false;
        const isGrouped = f.groupByType === "Group By";
        const isAggregated =
          f.groupByType &&
          ["SUM", "AVG", "MIN", "MAX", "COUNT"].includes(f.groupByType);
        // Expressions are also valid for sorting
        const isExpression = f.groupByType === "Expression";
        return !isGrouped && !isAggregated && !isExpression;
      });
      if (invalidOrder) {
        setGeneratedSQL(
          `-- ⚠️ Error: Cannot sort by '${invalidOrder.column}' because it is neither grouped nor aggregated.`
        );
        return;
      }
    }

    try {
      if (!from) {
        setGeneratedSQL(
          "-- Select a schema and a column to begin building your query"
        );
        return;
      }

      const whereGroups: WhereClause[][] = [];
      const havingGroups: WhereClause[][] = [];
      const filterGroupIndices = Array.from(
        { length: filterGroupCount },
        (_, i) => i
      );

      filterGroupIndices.forEach((groupIndex) => {
        const whereClauses: WhereClause[] = [];
        fields.forEach((f) => {
          const filter = f.filters && f.filters[groupIndex];
          if (filter && filter.op) {
            whereClauses.push({
              id: `${f.id}-where-${groupIndex}`,
              table: f.table,
              column: f.column,
              operator: filter.op as Operator,
              value: filter.val,
              // Pass expression if type is 'Expression' so SQL Builder knows to use it as identifier
              expression:
                isGroupByActive && f.groupByType === "Expression"
                  ? f.expression
                  : undefined,
            });
          }
        });
        if (whereClauses.length > 0) whereGroups.push(whereClauses);
      });

      const activeHavingClauses: WhereClause[] = [];
      fields.forEach((f) => {
        const isAggregate =
          isGroupByActive &&
          f.groupByType &&
          ["SUM", "AVG", "MIN", "MAX", "COUNT", "Expression"].includes(
            f.groupByType
          );
        if (isAggregate && f.having && f.having.op) {
          activeHavingClauses.push({
            id: `${f.id}-having`,
            table: f.table,
            column: f.column,
            operator: f.having.op as Operator,
            value: f.having.val,
            aggregation: f.groupByType,
            // Pass expression for HAVING as well
            expression:
              f.groupByType === "Expression" ? f.expression : undefined,
          });
        }
      });
      if (activeHavingClauses.length > 0)
        havingGroups.push(activeHavingClauses);

      const selectList: any[] = [];
      const groupByList: string[] = [];

      fields.forEach((f) => {
        if (isGroupByActive && f.groupByType === "Where") return;
        if (f.isVisible) {
          selectList.push({
            table: f.table,
            column: f.column,
            alias: f.alias || undefined,
            aggregation:
              isGroupByActive && f.groupByType !== "Group By"
                ? f.groupByType
                : undefined,
            expression: f.expression, // Pass custom expression
          });
        }

        // --- Group By Logic ---
        if (isGroupByActive) {
          if (f.groupByType === "Group By" || !f.groupByType) {
            // Standard column grouping
            groupByList.push(`${f.table}.${f.column}`);
          } else if (f.groupByType === "Expression" && f.expression) {
            // Heuristic: If it's a scalar expression (like UPPER(col)), it must be in GROUP BY.
            // If it's an aggregate expression (like COUNT(col) + 1), it must NOT be in GROUP BY.
            const isAggregate = /^(COUNT|SUM|AVG|MIN|MAX)\s*\(/.test(
              f.expression.toUpperCase()
            );
            if (!isAggregate) {
              groupByList.push(f.expression);
            }
          }
        }
      });

      const queryDef: QueryDefinition = {
        from,
        joins,
        select: selectList,
        groupBy: isGroupByActive ? groupByList : undefined,
        whereGroups,
        havingGroups,
        orderBy: fields
          .filter((f) => f.sortDir !== "")
          .map((f) => ({
            table: f.table,
            column: f.column,
            direction: f.sortDir as "ASC" | "DESC",
          })),
      };

      let sql = buildSelectQuery(queryDef, activeSchema, useQuotes);
      if (joinErrors.length > 0)
        sql += `\n\n/*\nWARNINGS:\n${joinErrors.join("\n")}\n*/`;
      setGeneratedSQL(sql);
    } catch (error: any) {
      setGeneratedSQL(`-- Error: ${error.message}`);
    }
  }, [
    from,
    joins,
    fields,
    joinErrors,
    orphanedTables,
    activeSchema,
    isGroupByActive,
    filterGroupCount,
    useQuotes,
  ]);

  // --- Actions ---
  const addField = (tableName?: string, columnName?: string) => {
    const t = tableName || from;
    const cols = getColumnsForTable(activeSchema, t);
    const c =
      columnName || (cols && cols.length > 0 ? cols[0].column_name : "");

    if (c) {
      const newField: UIField = {
        id: Math.random().toString(36).substr(2, 9),
        table: t,
        column: c,
        alias: "",
        isVisible: true,
        groupByType: "Group By",
        filters: [
          { op: "", val: "" },
          { op: "", val: "" },
          { op: "", val: "" },
        ],
        having: { op: "", val: "" },
        sortDir: "",
      };
      setFields((prev) => [...prev, newField]);
    }
  };

  const updateField = (idx: number, updates: Partial<UIField>) => {
    setFields((prev) => {
      const newFields = [...prev];
      newFields[idx] = { ...newFields[idx], ...updates };
      return newFields;
    });
  };

  const removeField = (idx: number) => {
    setFields((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateFieldFilter = (
    fieldIdx: number,
    groupIdx: number,
    op?: string,
    val?: string
  ) => {
    setFields((prev) => {
      const newFields = [...prev];
      const field = { ...newFields[fieldIdx] };
      const newFilters = [...(field.filters || [])];
      while (newFilters.length <= groupIdx)
        newFilters.push({ op: "", val: "" });
      newFilters[groupIdx] = {
        op: op !== undefined ? op : newFilters[groupIdx].op,
        val: val !== undefined ? val : newFilters[groupIdx].val,
      };
      field.filters = newFilters;
      newFields[fieldIdx] = field;
      return newFields;
    });
  };

  const updateFieldHaving = (fieldIdx: number, op?: string, val?: string) => {
    setFields((prev) => {
      const newFields = [...prev];
      const field = { ...newFields[fieldIdx] };
      field.having = {
        op: op !== undefined ? op : field.having?.op || "",
        val: val !== undefined ? val : field.having?.val || "",
      };
      newFields[fieldIdx] = field;
      return newFields;
    });
  };

  const handleRowDragEnd = () => {
    const dragIndex = dragRowItem.current;
    const hoverIndex = dragOverRowItem.current;
    if (dragIndex !== null && hoverIndex !== null && dragIndex !== hoverIndex) {
      setFields((prev) => {
        const updated = [...prev];
        const itemToMove = updated[dragIndex];
        updated.splice(dragIndex, 1);
        updated.splice(hoverIndex, 0, itemToMove);
        return updated;
      });
    }
    dragRowItem.current = null;
    dragOverRowItem.current = null;
  };

  const performReset = (targetTables?: TableSchema[]) => {
    const tables = targetTables !== undefined ? targetTables : activeSchema;
    setLoadedQueryId(null);
    setJoins([]);
    setFields([]);
    setJoinErrors([]);
    setIsGroupByActive(false);
    setFilterGroupCount(1);
    setFrom(tables && tables.length > 0 ? tables[0].table_name : "");
  };

  const performLoad = (queryId: string) => {
    const query = savedQueries.find((q) => q.id === queryId);
    if (query) {
      setFrom(query.state.from);
      setJoins(query.state.joins);
      setFields(query.state.fields);
      setIsGroupByActive(query.state.isGroupByActive || false);
      setFilterGroupCount(query.state.filterGroupCount || 1);
      setLoadedQueryId(query.id);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSQL);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return {
    queryState: {
      from,
      joins,
      fields,
      isGroupByActive,
      filterGroupCount,
      loadedQueryId,
      generatedSQL,
      joinErrors,
      tempError,
      copyFeedback,
      orphanedTables,
      useQuotes,
    },
    actions: {
      setJoins,
      setFields,
      setIsGroupByActive,
      setFilterGroupCount,
      setLoadedQueryId,
      addField,
      updateField,
      removeField,
      updateFieldFilter,
      updateFieldHaving,
      handleRowDragEnd,
      performReset,
      performLoad,
      copyToClipboard,
      setUseQuotes,
    },
    refs: { dragRowItem, dragOverRowItem },
  };
};
