import React from "react";
import { UIField, TableSchema, Operator } from "../types/types";
import { Select } from "./ui/Select";
import { Icons } from "./icons";
import {
  getAggregationOptions,
  getDataType,
  getOperators,
} from "../utils/helpers";
import {
  TypeBadge,
  IdentityBadge,
  FilterInput,
  HavingInput,
} from "./FieldRowParts";

interface FieldRowProps {
  field: UIField;
  idx: number;
  schema: TableSchema[];
  isGroupByActive: boolean;
  filterGroupCount: number;
  hasError: boolean;
  onUpdate: (idx: number, updates: Partial<UIField>) => void;
  onRemove: (idx: number) => void;
  onUpdateFilter: (
    fieldIdx: number,
    groupIdx: number,
    op?: string,
    val?: string
  ) => void;
  onUpdateHaving: (fieldIdx: number, op?: string, val?: string) => void;
  // Drag handlers
  dragRef: React.MutableRefObject<number | null>;
  onDragStart: (e: React.DragEvent, position: number) => void;
  onDragEnter: (e: React.DragEvent, position: number) => void;
  onDragEnd: () => void;
}

export const FieldRow: React.FC<FieldRowProps> = ({
  field,
  idx,
  schema,
  isGroupByActive,
  filterGroupCount,
  hasError,
  onUpdate,
  onRemove,
  onUpdateFilter,
  onUpdateHaving,
  dragRef,
  onDragStart,
  onDragEnter,
  onDragEnd,
}) => {
  const type = getDataType(schema, field.table, field.column) || "text";
  const isBoolean = type === "boolean";

  // Look up table definition for PK/FK check
  const tableDef = schema.find((t) => t.table_name === field.table);
  const isPK = tableDef?.primary_key?.includes(field.column);
  const isFK = tableDef?.foreign_keys?.some((k) => k.column === field.column);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, idx)}
      onDragEnter={(e) => onDragEnter(e, idx)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className={`flex items-stretch group bg-white dark:bg-slate-900/40 rounded border transition-colors overflow-hidden ${
        dragRef.current === idx ? "opacity-50" : ""
      } ${
        hasError
          ? "border-amber-600/50"
          : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700"
      }`}
      title={hasError ? "Table could not be joined automatically" : undefined}
    >
      {/* Static Left */}
      <div className="w-[30px] flex items-center justify-center gap-1 border-r border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/20 px-1">
        <div className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 flex items-center">
          <Icons.Drag className="w-3 h-3" />
        </div>
        <input
          type="checkbox"
          checked={field.isVisible}
          onChange={(e) => onUpdate(idx, { isVisible: e.target.checked })}
          className="rounded bg-slate-800 border-slate-600 text-indigo-500 focus:ring-indigo-500 cursor-pointer w-3.5 h-3.5"
        />
      </div>

      {/* PK / FK Column (Fixed Width) */}
      <div className="w-[24px] flex items-center justify-center border-r border-slate-200 dark:border-slate-800/50 bg-slate-100 dark:bg-slate-900/10">
        <IdentityBadge isPK={isPK} isFK={isFK} />
      </div>

      {/* Field & Alias */}
      <div className="w-[28%] flex items-center gap-1 p-1 border-r border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/5">
        <div className="w-[70%]">
          {field.groupByType === "Expression" ? (
            <input
              type="text"
              placeholder="SQL Expr (e.g. Upper(col))"
              className={`w-full bg-white dark:bg-slate-800 border rounded px-2 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors ${
                hasError
                  ? "border-amber-600/50 text-amber-500"
                  : "border-slate-300 dark:border-slate-700"
              }`}
              value={field.expression || ""}
              onChange={(e) => onUpdate(idx, { expression: e.target.value })}
            />
          ) : (
            <div
              className={`w-full bg-white dark:bg-slate-800/50 border rounded px-1 py-1.5 text-xs cursor-not-allowed flex items-center overflow-hidden whitespace-nowrap ${
                hasError
                  ? "border-amber-600/50 text-amber-500"
                  : "border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200"
              }`}
            >
              <TypeBadge sqlType={type} />
              <span
                className={`mr-0.5 ${
                  hasError ? "text-amber-500/70" : "text-slate-500"
                }`}
              >
                {field.table}.
              </span>
              <span className="font-bold truncate">{field.column}</span>
            </div>
          )}
        </div>
        <div className="w-[30%]">
          <input
            type="text"
            placeholder="as Alias"
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs text-slate-900 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            value={field.alias}
            onChange={(e) => onUpdate(idx, { alias: e.target.value })}
          />
        </div>
      </div>

      {/* Group Block */}
      {isGroupByActive && (
        <div className="w-[90px] p-1 border-r border-slate-200 dark:border-slate-800/50 bg-indigo-50/50 dark:bg-indigo-900/5 flex items-center">
          <Select
            value={field.groupByType || "Group By"}
            onChange={(e) => onUpdate(idx, { groupByType: e.target.value })}
            options={getAggregationOptions(type)}
            className="w-full"
          />
        </div>
      )}

      {/* Having Block */}
      {isGroupByActive && (
        <div className="w-[140px] p-1 border-r border-slate-200 dark:border-slate-800/50 bg-indigo-50/50 dark:bg-indigo-900/5 flex items-center">
          <HavingInput
            type={type}
            aggType={field.groupByType}
            op={field.having?.op || ""}
            val={field.having?.val || ""}
            isGroupByActive={isGroupByActive}
            onUpdateOp={(op) => onUpdateHaving(idx, op, undefined)}
            onUpdateVal={(val, autoOp) => onUpdateHaving(idx, autoOp, val)}
          />
        </div>
      )}

      {/* Sort Block */}
      <div className="w-[65px] p-1 border-r border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/5 items-center">
        <Select
          placeholder="None"
          value={field.sortDir}          
          onChange={(e) =>
            onUpdate(idx, { sortDir: e.target.value as "ASC" | "DESC" | "" })
          }
          options={[
            { value: "ASC", label: "Asc" },
            { value: "DESC", label: "Desc" },
          ]}
        />
      </div>

      {/* Filters Block */}
      <div className="flex-1 flex items-center p-1 gap-1">
        {Array.from({ length: filterGroupCount }).map((_, groupIdx) => {
          const filterState = field.filters?.[groupIdx] || { op: "", val: "" };
          return (
            <div
              key={groupIdx}
              className={`flex-1 flex gap-1 min-w-0 ${
                groupIdx > 0 ? "pl-1 border-l border-slate-200 dark:border-slate-800/50" : ""
              }`}
            >
              <div className="w-[60px] shrink-0">
                <Select
                  disabled={
                    isBoolean &&
                    filterState.op !== "IS NULL" &&
                    filterState.op !== "IS NOT NULL" &&
                    !filterState.val &&
                    !filterState.op
                  }
                  placeholder=""
                  value={filterState.op}
                  onChange={(e) =>
                    onUpdateFilter(
                      idx,
                      groupIdx,
                      e.target.value as Operator | ""
                    )
                  }
                  options={getOperators(type)}
                  className="px-0 text-center"
                />
              </div>
              <div className="flex-grow min-w-0">
                <FilterInput
                  type={type}
                  op={filterState.op}
                  val={filterState.val}
                  onChange={(newOp, newVal) =>
                    onUpdateFilter(idx, groupIdx, newOp, newVal)
                  }
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete */}
      <div className="w-[30px] flex justify-center items-center">
        <button
          onClick={() => onRemove(idx)}
          className="text-slate-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
        >
          <Icons.Trash className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
