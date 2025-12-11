import React, { useState, useMemo } from "react";
import { TableSchema, UIField, JoinClause } from "../types/types";
import { Icons } from "./icons";
import { formatDataType } from "../utils/helpers";

interface SchemaSidebarProps {
  schema: TableSchema[];
  schemaName: string;
  from: string;
  fields: UIField[];
  joins: JoinClause[];
  onAddField: (table: string, column: string) => void;
  onDragStart: (
    e: React.DragEvent,
    table: string,
    column: string,
    type: string
  ) => void;
}

export const SchemaSidebar: React.FC<SchemaSidebarProps> = ({
  schema,
  schemaName,
  from,
  fields,
  joins,
  onAddField,
  onDragStart,
}) => {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  // Derived logic
  const activeTableNames = useMemo(
    () =>
      Array.from(
        new Set(fields.filter((f) => f && f.table).map((f) => f.table))
      ).sort(),
    [fields]
  );
  const joinedTableNames = useMemo(
    () => (joins ? joins.map((j) => j.table2) : []),
    [joins]
  );

  const sortedTables = useMemo(() => {
    if (!schema) return [];
    return [...schema].sort((a, b) => {
      const isASelected =
        a.table_name === from || activeTableNames.includes(a.table_name);
      const isBSelected =
        b.table_name === from || activeTableNames.includes(b.table_name);
      if (isASelected && !isBSelected) return -1;
      if (!isASelected && isBSelected) return 1;
      return a.table_name.localeCompare(b.table_name);
    });
  }, [from, activeTableNames, schema]);

  const toggleTableExpand = (tableName: string) => {
    setExpandedTables((prev) => {
      const next = new Set(prev);
      if (next.has(tableName)) next.delete(tableName);
      else next.add(tableName);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedTables(new Set(schema.map((t) => t.table_name)));
  };

  const collapseAll = () => {
    setExpandedTables(new Set());
  };

  return (
    <aside className="w-64 xl:w-80 bg-slate-100 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-700 overflow-y-auto shrink-0 hidden md:block select-none flex-col">
      <div className="p-4 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="overflow-hidden mr-2">
            <h2
              className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate"
              title={schemaName}
            >
              {schemaName}
            </h2>
            <span className="text-[10px] 	text-red-700 dark:text-red-400 whitespace-nowrap">
              {schema?.length || 0} Tables
            </span>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={expandAll}
              className="px-1 text-slate-500 hover:text-indigo-400 hover:bg-slate-800 rounded"
              title="Expand All"
            >
              <Icons.ExpandAll className="w-4 h-4 text-red-700 dark:text-red-400" />
            </button>
            <button
              onClick={collapseAll}
              className="px-1 text-slate-500 hover:text-indigo-400 hover:bg-slate-800 rounded"
              title="Collapse All"
            >
              <Icons.CollapseAll className="w-4 h-4 text-red-700 dark:text-red-400" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {sortedTables.map((table) => {
            const isFrom = table.table_name === from;
            const isExpanded = expandedTables.has(table.table_name);
            const isActive =
              isFrom || joinedTableNames.includes(table.table_name);

            return (
              <div key={table.table_name}>
                <div
                  className="flex items-center gap-2 mb-2 hover:bg-slate-800 rounded px-1 -mx-1 py-1 cursor-pointer transition-colors"
                  onClick={() => toggleTableExpand(table.table_name)}
                >
                  <span
                    className={`text-slate-500 transition-transform duration-200 ${
                      isExpanded ? "rotate-0" : "-rotate-90"
                    }`}
                  >
                    <Icons.ChevronDown className="w-3.5 h-3.5 text-red-700 dark:text-red-400" />
                  </span>
                  <div
                    className={`flex items-center gap-2 font-semibold text-sm truncate ${
                      isActive ? "text-red-700 dark:text-red-400" : "text-slate-400"
                    }`}
                  >
                    <Icons.Table className="w-3.5 h-3.5" />
                    <span className="truncate">{table.table_name}</span>
                  </div>
                </div>

                {isExpanded && (
                  <ul className="pl-2 space-y-1 ml-1.5 border-l border-slate-800">
                    {table.columns?.map((col) => {
                      const isAdded = fields.some(
                        (f) =>
                          f.table === table.table_name &&
                          f.column === col.column_name
                      );
                      const isPK = table.primary_key?.includes(col.column_name);
                      const isFK = table.foreign_keys?.some(
                        (k) => k.column === col.column_name
                      );

                      return (
                        <li
                          key={col.column_name}
                          draggable
                          onDragStart={(e) =>
                            onDragStart(
                              e,
                              table.table_name,
                              col.column_name,
                              col.data_type
                            )
                          }
                          onDoubleClick={() =>
                            onAddField(table.table_name, col.column_name)
                          }
                          className={`text-xs flex items-center justify-between group py-1 px-1 rounded cursor-grab active:cursor-grabbing transition-colors ${
                            isAdded
                              ? "text-indigo-200 font-bold bg-indigo-900/20"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 overflow-hidden flex-1">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <Icons.Drag className="w-3 h-3 text-slate-600" />
                            </span>
                            {isPK && (
                              <Icons.Key className="w-3 h-3 text-yellow-500 shrink-0" />
                            )}
                            {isFK && !isPK && (
                              <div className="w-4 h-3 rounded-sm bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-[8px] text-indigo-300 font-bold shrink-0">
                                FK
                              </div>
                            )}
                            <span className="truncate">{col.column_name}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-[10px] text-slate-700 group-hover:hidden shrink-0 ml-1">
                              {formatDataType(col.data_type)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddField(table.table_name, col.column_name);
                              }}
                              className="hidden group-hover:flex items-center justify-center w-4 h-4 bg-indigo-600 text-white rounded hover:bg-indigo-500 ml-1 transition-colors"
                              title="Add field"
                            >
                              <Icons.Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
