import React from "react";
import { Icons } from "./icons";
import { Select } from "./ui/Select";
import { SavedQuery, WorkspaceSchema } from "../types/types";

interface HeaderProps {
  schemas: WorkspaceSchema[];
  currentSchemaName: string;
  onSchemaChange: (name: string) => void;

  // UI Toggles
  useQuotes: boolean;
  onToggleQuotes: () => void;
  showTerminal: boolean;
  onToggleTerminal: () => void;
  showLinkManager: boolean;
  onToggleLinkManager: () => void;

  // Actions
  onVisualize: () => void;
  onImportSchema: () => void;
  onEditSchema: () => void;
  onDeleteSchema: () => void;

  // Query Management
  savedQueries: SavedQuery[];
  loadedQueryId: string | null;
  isDirty: boolean;
  onLoadQuery: (id: string) => void;
  onDeleteQuery: () => void;
  onSaveQuery: () => void;
  onNewQuery: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  schemas,
  currentSchemaName,
  onSchemaChange,
  useQuotes,
  onToggleQuotes,
  showTerminal,
  onToggleTerminal,
  showLinkManager,
  onToggleLinkManager,
  onVisualize,
  onImportSchema,
  onEditSchema,
  onDeleteSchema,
  savedQueries,
  loadedQueryId,
  isDirty,
  onLoadQuery,
  onDeleteQuery,
  onSaveQuery,
  onNewQuery,
}) => {
  const relevantQueries = savedQueries.filter(
    (q) => q.schemaName === currentSchemaName
  );
  const loadedQueryName =
    relevantQueries.find((q) => q.id === loadedQueryId)?.name || "";

  return (
    <header className="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center shrink-0 z-10 px-4 gap-3">
      {/* Logo Area */}
      <div className="md:w-64 xl:w-80 flex items-center gap-3 shrink-0">
        <div className="text-[#756FDE]">
          <Icons.Database className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-[#756FDE]">SQL Constructor</h1>
        </div>
      </div>

      <div className="h-5 w-px bg-slate-700/50 mx-2" />

      {/* Toggles */}
      <div className="flex gap-1">
        <button
          onClick={onToggleQuotes}
          className={`p-2 rounded ${
            useQuotes
              ? "bg-amber-500/10 text-amber-400"
              : "text-slate-500 hover:bg-slate-800"
          }`}
          title="Toggle Quotes in SQL"
        >
          <Icons.Quote className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleTerminal}
          className={`p-2 rounded ${
            showTerminal
              ? "bg-emerald-500/10 text-emerald-400"
              : "text-slate-500 hover:bg-slate-800"
          }`}
          title="Toggle Terminal"
        >
          <Icons.Terminal className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleLinkManager}
          className={`p-2 rounded ${
            showLinkManager
              ? "bg-indigo-500/10 text-indigo-400"
              : "text-slate-500 hover:bg-slate-800"
          }`}
          title="Toggle Link Manager"
        >
          <Icons.Link className="w-4 h-4" />
        </button>
        <button
          onClick={onVisualize}
          className="p-2 rounded text-slate-500 hover:bg-slate-800 hover:text-indigo-400"
          title="Visualize Schema"
        >
          <Icons.Network className="w-4 h-4" />
        </button>
      </div>

      <div className="h-5 w-px bg-slate-700/50 mx-2" />

      {/* Schema Selector */}
      <div className="flex-1 flex gap-2 min-w-0">
        <div className="w-48">
          <Select
            value={currentSchemaName}
            onChange={(e) => onSchemaChange(e.target.value)}
            options={schemas.map((s) => ({ value: s.name, label: s.name }))}
            placeholder={!schemas.length ? "No schemas" : undefined}
            disabled={!schemas.length}
          />
        </div>
        {schemas.length > 0 && (
          <>
            <button
              onClick={onEditSchema}
              className="p-2 text-slate-400 hover:text-indigo-400"
            >
              <Icons.Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={onDeleteSchema}
              className="p-2 text-slate-400 hover:text-red-400"
            >
              <Icons.Trash className="w-4 h-4" />
            </button>
          </>
        )}
        <button
          onClick={onImportSchema}
          className="ml-2 text-slate-400 hover:text-indigo-400 p-2 flex gap-1.5"
        >
          <Icons.Upload className="w-4 h-4" />
          <span className="text-xs font-medium hidden lg:inline">Import</span>
        </button>
      </div>

      {/* Query Actions */}
      <div className="flex gap-3">
        <div className="w-40 relative flex gap-1">
          <div className="flex-1">
            <Select
              placeholder="Load Query..."
              value={loadedQueryId || ""}
              onChange={(e) => onLoadQuery(e.target.value)}
              options={relevantQueries.map((q) => ({
                value: q.id,
                label: q.name,
              }))}
              disabled={!schemas.length}
            />
          </div>
          {loadedQueryId && (
            <button
              onClick={onDeleteQuery}
              className="p-1.5 text-slate-500 hover:text-red-400"
            >
              <Icons.Trash className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={onSaveQuery}
          disabled={!schemas.length}
          className={`flex items-center gap-1.5 text-xs font-bold text-white px-3 py-2 rounded ${
            isDirty ? "bg-red-600" : "bg-slate-800 hover:bg-indigo-700"
          }`}
        >
          <Icons.Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Save</span>
        </button>
        <button
          onClick={onNewQuery}
          disabled={!schemas.length}
          className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded"
        >
          <Icons.Refresh className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New</span>
        </button>
      </div>
    </header>
  );
};
