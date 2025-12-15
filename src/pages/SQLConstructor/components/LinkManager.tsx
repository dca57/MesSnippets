import React from "react";
import { JoinClause, JoinType, TableSchema } from "../types/types";
import { Select } from "./ui/Select";
import { Card } from "./ui/Card";
import { Icons } from "./icons";

interface LinkManagerProps {
  joins: JoinClause[];
  onChange: (joins: JoinClause[]) => void;
  schema: TableSchema[];
}

export const LinkManager: React.FC<LinkManagerProps> = ({
  joins,
  onChange,
  schema,
}) => {
  const updateJoin = (idx: number, updates: Partial<JoinClause>) => {
    const newJoins = [...joins];
    newJoins[idx] = { ...newJoins[idx], ...updates };
    onChange(newJoins);
  };

  const removeJoin = (idx: number) => {
    onChange(joins.filter((_, i) => i !== idx));
  };

  const addManualJoin = () => {
    if (!schema || schema.length < 2) return;
    const t1 = schema[0]?.table_name;
    const t2 = schema[1]?.table_name || t1;

    const newJoin: JoinClause = {
      id: Math.random().toString(36).substr(2, 9),
      type: "INNER JOIN",
      table1: t1,
      column1:
        schema.find((t) => t.table_name === t1)?.columns?.[0]?.column_name ||
        "",
      table2: t2,
      column2:
        schema.find((t) => t.table_name === t2)?.columns?.[0]?.column_name ||
        "",
      isAuto: false,
    };
    onChange([...joins, newJoin]);
  };

  const swapTables = (idx: number) => {
    const j = joins[idx];
    updateJoin(idx, {
      table1: j.table2,
      column1: j.column2,
      table2: j.table1,
      column2: j.column1,
    });
  };

  return (
    <Card
      title="Link Manager (Joins)"
      className="border-indigo-900/50"
      action={
        <button
          onClick={addManualJoin}
          className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-md transition-colors font-medium"
        >
          <Icons.Plus className="w-3.5 h-3.5" /> Add Link
        </button>
      }
    >
      {joins.length === 0 ? (
        <div className="text-center py-4 text-slate-600 text-xs italic">
          No joins active. Drag fields to the canvas or add links manually.
        </div>
      ) : (
        <div className="space-y-2">
          {joins.map((join, idx) => (
            <div
              key={join.id}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-800"
            >



              <div className="flex-1 flex gap-1">
                {join.isAuto ? (
                  <div className="w-full bg-slate-200 dark:bg-slate-700 border border-slate-700/30 rounded px-2 py-1.5 text-xs flex items-center gap-0.5 text-slate-400 cursor-not-allowed">
                    <span className="font-semibold text-slate-400 dark:text-slate-400">
                      {join.table1}
                    </span>
                    <span className="text-slate-400 dark:text-slate-400">.</span>
                    <span className="text-slate-600 dark:text-slate-200">{join.column1}</span>
                  </div>
                ) : (
                  <>
                    <Select
                      value={join.table1}
                      onChange={(e) =>
                        updateJoin(idx, {
                          table1: e.target.value,
                          column1:
                            schema.find((t) => t.table_name === e.target.value)
                              ?.columns?.[0]?.column_name || "",
                        })
                      }
                      options={
                        schema?.map((t) => ({
                          value: t.table_name,
                          label: t.table_name,
                        })) || []
                      }
                    />
                    <Select
                      value={join.column1}
                      onChange={(e) =>
                        updateJoin(idx, { column1: e.target.value })
                      }
                      options={
                        schema
                          .find((t) => t.table_name === join.table1)
                          ?.columns?.map((c) => ({
                            value: c.column_name,
                            label: c.column_name,
                          })) || []
                      }
                    />
                  </>
                )}
              </div>

              <div className="w-[120px]">
                <Select
                  value={join.type}
                  onChange={(e) =>
                    updateJoin(idx, { type: e.target.value as JoinType })
                  }
                  options={[
                    { value: "INNER JOIN", label: "INNER JOIN" },
                    { value: "LEFT JOIN", label: "LEFT JOIN" },
                    { value: "RIGHT JOIN", label: "RIGHT JOIN" },
                    { value: "FULL JOIN", label: "FULL JOIN" },
                  ]}
                  className="text-center font-bold text-indigo-300"
                />
              </div>

              <div className="flex-1 flex gap-1 ">
                {join.isAuto ? (
                  <div className="w-full bg-slate-200 dark:bg-slate-700 border border-slate-700/30 rounded px-2 py-1.5 text-xs flex items-center gap-0.5 text-slate-400 cursor-not-allowed">
                    <span className="font-semibold text-slate-400 dark:text-slate-400">
                      {join.table2}
                    </span>
                    <span className="text-slate-400 dark:text-slate-400">.</span>
                    <span className="text-slate-600 dark:text-slate-200">{join.column2}</span>
                  </div>
                ) : (
                  <>
                    <Select
                      value={join.table2}
                      onChange={(e) =>
                        updateJoin(idx, {
                          table2: e.target.value,
                          column2:
                            schema.find((t) => t.table_name === e.target.value)
                              ?.columns?.[0]?.column_name || "",
                        })
                      }
                      options={
                        schema?.map((t) => ({
                          value: t.table_name,
                          label: t.table_name,
                        })) || []
                      }
                    />
                    <Select
                      value={join.column2}
                      onChange={(e) =>
                        updateJoin(idx, { column2: e.target.value })
                      }
                      options={
                        schema
                          .find((t) => t.table_name === join.table2)
                          ?.columns?.map((c) => ({
                            value: c.column_name,
                            label: c.column_name,
                          })) || []
                      }
                    />
                  </>
                )}
              </div>

              <div className="flex items-center gap-1 pl-2 border-l border-slate-800 ml-1">
                <button
                  onClick={() => swapTables(idx)}
                  className="text-slate-500 hover:text-indigo-400 p-1.5 transition-colors rounded hover:bg-slate-800"
                  title="Swap tables"
                >
                  <Icons.Swap className="w-3.5 h-3.5" />
                </button>
                {join.isAuto ? (
                  <div className="w-[26px]"></div>
                ) : (
                  <button
                    onClick={() => removeJoin(idx)}
                    className="text-slate-600 hover:text-red-400 p-1.5 transition-colors rounded hover:bg-slate-800"
                    title="Remove link"
                  >
                    <Icons.Trash className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
