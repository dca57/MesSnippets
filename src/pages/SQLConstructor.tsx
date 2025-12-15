import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  WorkspaceSchema,
  SavedQuery,
  TableSchema,
} from "./SQLConstructor/types/types";
import { Icons } from "./SQLConstructor/components/icons";
import { loadState, saveState } from "./SQLConstructor/utils/helpers";
import { DEFAULT_SCHEMAS } from "./SQLConstructor/constants/constants";
import { useQueryBuilder } from "./SQLConstructor/hooks/useQueryBuilder";
import { SchemaSidebar } from "./SQLConstructor/components/SchemaSidebar";
import { LinkManager } from "./SQLConstructor/components/LinkManager";
import { FieldRow } from "./SQLConstructor/components/FieldRow";
import { Terminal } from "./SQLConstructor/components/Terminal";
import { Card } from "./SQLConstructor/components/ui/Card";
import { SchemaDiagramModal } from "./SQLConstructor/components/SchemaDiagramModal";
import { Header } from "./SQLConstructor/components/Header";
import {
  ImportModal,
  SaveQueryModal,
  UnsavedModal,
  ExportTSModal,
} from "./SQLConstructor/components/ProjectModals";
import { Landing } from "./SQLConstructor/components/Landing";
import { generateTypeScriptInterfaces } from "./SQLConstructor/services/ts-generator";

type PendingAction =
  | { type: "NEW_QUERY" }
  | { type: "LOAD_QUERY"; queryId: string }
  | null;

const SQLConstructor: React.FC = () => {
  // --- Workspace State ---
  const [schemas, setSchemas] = useState<WorkspaceSchema[]>(() => {
    const loaded = loadState<WorkspaceSchema[]>("sql_constructor_schemas", []);
    let currentSchemas = Array.isArray(loaded) ? loaded : [];

    // Ensure the default schema is present if not already there (by name)
    const defaultSchema = DEFAULT_SCHEMAS[0];
    if (
      defaultSchema &&
      !currentSchemas.some((s) => s.name === defaultSchema.name)
    ) {
      currentSchemas = [defaultSchema, ...currentSchemas];
    }

    return currentSchemas;
  });

  const [currentSchemaName, setCurrentSchemaName] = useState(() =>
    loadState("sql_constructor_active_schema", "")
  );
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>(() => {
    const loaded = loadState<SavedQuery[]>("sql_constructor_queries", []);
    return Array.isArray(loaded) ? loaded : [];
  });

  // Auto-select first schema
  useEffect(() => {
    if (
      schemas.length > 0 &&
      !schemas.find((s) => s.name === currentSchemaName)
    ) {
      setCurrentSchemaName(schemas[0].name);
    }
    saveState("sql_constructor_active_schema", currentSchemaName);
  }, [schemas, currentSchemaName]);

  const activeSchema = useMemo(
    () => schemas.find((s) => s.name === currentSchemaName)?.tables || [],
    [schemas, currentSchemaName]
  );

  // --- Query Builder Hook ---
  const { queryState, actions, refs } = useQueryBuilder(
    activeSchema,
    savedQueries
  );
  const {
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
  } = queryState;

  // --- UI State ---
  const [showTerminal, setShowTerminal] = useState(true);
  const [showLinkManager, setShowLinkManager] = useState(false);
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [showLanding, setShowLanding] = useState(false);

  // Modal States
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importName, setImportName] = useState("");
  const [isEditingSchema, setIsEditingSchema] = useState(false);
  const [showSaveQueryModal, setShowSaveQueryModal] = useState(false);
  const [saveQueryName, setSaveQueryName] = useState("");
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  // Export TS
  const [showExportTSModal, setShowExportTSModal] = useState(false);
  const [tsCode, setTsCode] = useState("");

  // --- Terminal Resizing State ---
  const DEFAULT_TERMINAL_HEIGHT = 192; // h-48 equivalent
  const [terminalHeight, setTerminalHeight] = useState(DEFAULT_TERMINAL_HEIGHT);
  const isResizingTerminal = useRef(false);

  // --- Resizing Logic ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingTerminal.current) return;
      const newHeight = window.innerHeight - e.clientY;
      const minHeight = DEFAULT_TERMINAL_HEIGHT;
      const maxHeight = DEFAULT_TERMINAL_HEIGHT * 4;
      const clampedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
      setTerminalHeight(clampedHeight);
    };

    const handleMouseUp = () => {
      if (isResizingTerminal.current) {
        isResizingTerminal.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleTerminalResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingTerminal.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  // --- Dirty Check ---
  const isDirty = useMemo(() => {
    if (!loadedQueryId) return fields.length > 0;
    const saved = savedQueries.find((q) => q.id === loadedQueryId);
    if (!saved) return true;
    const current = { from, joins, fields, isGroupByActive, filterGroupCount };
    const original = saved.state;
    return JSON.stringify(current) !== JSON.stringify(original);
  }, [
    from,
    joins,
    fields,
    loadedQueryId,
    savedQueries,
    isGroupByActive,
    filterGroupCount,
  ]);

  // --- Handlers (Schema & Query Persistence) ---
  const handleImportSchema = () => {
    if (!importName.trim() || !importJson.trim())
      return alert("Name and JSON required");
    try {
      const parsed = JSON.parse(importJson);
      let tables: TableSchema[] = [];
      if (Array.isArray(parsed) && parsed[0]?.schema) tables = parsed[0].schema;
      else if (parsed.schema) tables = parsed.schema;
      else if (Array.isArray(parsed)) tables = parsed;
      else throw new Error("Invalid format");

      let updatedSchemas: WorkspaceSchema[];
      if (isEditingSchema) {
        updatedSchemas = schemas.map((s) =>
          s.name === currentSchemaName ? { name: importName, tables } : s
        );
        if (importName !== currentSchemaName) {
          const uq = savedQueries.map((q) =>
            q.schemaName === currentSchemaName
              ? { ...q, schemaName: importName }
              : q
          );
          setSavedQueries(uq);
          saveState("sql_constructor_queries", uq);
        }
        setCurrentSchemaName(importName);
      } else {
        updatedSchemas = [...schemas, { name: importName, tables }];
        setCurrentSchemaName(importName);
        actions.performReset(tables);
      }
      setSchemas(updatedSchemas);
      saveState("sql_constructor_schemas", updatedSchemas);
      setShowImportModal(false);
      setImportName("");
      setImportJson("");
    } catch (e: any) {
      alert("Invalid JSON: " + e.message);
    }
  };

  const handleDeleteSchema = () => {
    if (!window.confirm(`Delete schema "${currentSchemaName}"?`)) return;
    const nextSchemas = schemas.filter((s) => s.name !== currentSchemaName);
    const nextQueries = savedQueries.filter(
      (q) => q.schemaName !== currentSchemaName
    );
    setSchemas(nextSchemas);
    setSavedQueries(nextQueries);
    saveState("sql_constructor_schemas", nextSchemas);
    saveState("sql_constructor_queries", nextQueries);
    if (nextSchemas.length > 0) {
      setCurrentSchemaName(nextSchemas[0].name);
      actions.performReset(nextSchemas[0].tables);
    } else {
      setCurrentSchemaName("");
      actions.performReset([]);
    }
  };

  const handleExportTS = () => {
    const code = generateTypeScriptInterfaces(activeSchema);
    setTsCode(code);
    setShowExportTSModal(true);
  };

  const executeSave = (name: string) => {
    const newId = loadedQueryId || Math.random().toString(36).substr(2, 9);
    const newQuery: SavedQuery = {
      id: newId,
      name,
      schemaName: currentSchemaName,
      state: { from, joins, fields, isGroupByActive, filterGroupCount },
      lastModified: Date.now(),
    };
    const updated = savedQueries.some((q) => q.id === newId)
      ? savedQueries.map((q) => (q.id === newId ? newQuery : q))
      : [...savedQueries, newQuery];
    setSavedQueries(updated);
    saveState("sql_constructor_queries", updated);
    actions.setLoadedQueryId(newId);
    setShowSaveQueryModal(false);
    setSaveQueryName("");
    if (pendingAction) setTimeout(executePendingAction, 0);
  };

  const executePendingAction = () => {
    if (!pendingAction) return;
    if (pendingAction.type === "NEW_QUERY") actions.performReset();
    else if (pendingAction.type === "LOAD_QUERY")
      actions.performLoad(pendingAction.queryId);
    setPendingAction(null);
    setShowUnsavedModal(false);
  };

  const checkDirtyAndRun = (action: () => void, pending: PendingAction) => {
    if (isDirty) {
      setPendingAction(pending);
      setShowUnsavedModal(true);
    } else action();
  };

  const relevantQueries = savedQueries.filter(
    (q) => q.schemaName === currentSchemaName
  );

  return (
    <div className="h-screen flex flex-col bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-slate-300 font-sans overflow-hidden">
      {/* Modals */}
      {showSchemaModal && (
        <SchemaDiagramModal
          schema={activeSchema}
          onClose={() => setShowSchemaModal(false)}
        />
      )}

      <ImportModal
        isOpen={showImportModal}
        isEditing={isEditingSchema}
        name={importName}
        json={importJson}
        onNameChange={setImportName}
        onJsonChange={setImportJson}
        onClose={() => setShowImportModal(false)}
        onSave={handleImportSchema}
      />

      <ExportTSModal
        isOpen={showExportTSModal}
        code={tsCode}
        onClose={() => setShowExportTSModal(false)}
      />

      <SaveQueryModal
        isOpen={showSaveQueryModal}
        name={saveQueryName}
        onNameChange={setSaveQueryName}
        onClose={() => setShowSaveQueryModal(false)}
        onSave={() => executeSave(saveQueryName)}
      />

      <UnsavedModal
        isOpen={showUnsavedModal}
        onClose={() => {
          setPendingAction(null);
          setShowUnsavedModal(false);
        }}
        onSave={() => {
          if (loadedQueryId)
            executeSave(
              relevantQueries.find((q) => q.id === loadedQueryId)?.name || ""
            );
          else {
            setSaveQueryName("");
            setShowSaveQueryModal(true);
            setShowUnsavedModal(false);
          }
        }}
        onDiscard={executePendingAction}
      />

      {/* Header */}
      <Header
        schemas={schemas}
        currentSchemaName={currentSchemaName}
        onSchemaChange={(n) => {
          if (n === currentSchemaName) return;
          checkDirtyAndRun(() => {
            setCurrentSchemaName(n);
            actions.performReset(schemas.find((s) => s.name === n)?.tables);
          }, null);
        }}
        useQuotes={useQuotes}
        onToggleQuotes={() => actions.setUseQuotes(!useQuotes)}
        showTerminal={showTerminal}
        onToggleTerminal={() => setShowTerminal(!showTerminal)}
        showLinkManager={showLinkManager}
        onToggleLinkManager={() => setShowLinkManager(!showLinkManager)}
        showLanding={showLanding}
        onToggleLanding={() => setShowLanding(!showLanding)}
        onVisualize={() => setShowSchemaModal(true)}
        onImportSchema={() => {
          setIsEditingSchema(false);
          setImportName("");
          setImportJson("");
          setShowImportModal(true);
        }}
        onExportTS={handleExportTS}
        onEditSchema={() => {
          setIsEditingSchema(true);
          setImportName(currentSchemaName);
          setImportJson(JSON.stringify([{ schema: activeSchema }], null, 2));
          setShowImportModal(true);
        }}
        onDeleteSchema={handleDeleteSchema}
        savedQueries={savedQueries}
        loadedQueryId={loadedQueryId}
        isDirty={isDirty}
        onLoadQuery={(id) =>
          checkDirtyAndRun(() => actions.performLoad(id), {
            type: "LOAD_QUERY",
            queryId: id,
          })
        }
        onDeleteQuery={() => {
          if (window.confirm("Delete query?")) {
            actions.performReset();
            const u = savedQueries.filter((q) => q.id !== loadedQueryId);
            setSavedQueries(u);
            saveState("sql_constructor_queries", u);
          }
        }}
        onSaveQuery={() => {
          setSaveQueryName(
            loadedQueryId
              ? relevantQueries.find((q) => q.id === loadedQueryId)?.name || ""
              : ""
          );
          setShowSaveQueryModal(true);
        }}
        onNewQuery={() =>
          checkDirtyAndRun(actions.performReset, { type: "NEW_QUERY" })
        }
      />

      <div className="flex-1 flex overflow-hidden">
        {showLanding ? (
          <Landing onClose={() => setShowLanding(false)} />
        ) : !schemas.length ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 mb-6">
              <Icons.Database className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-200 mb-2">
              No Schemas Loaded
            </h2>
            <button
              onClick={() => {
                setIsEditingSchema(false);
                setShowImportModal(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold mt-4"
            >
              <Icons.Upload className="w-5 h-5" /> Import Schema
            </button>
          </div>
        ) : (
          <>
            <SchemaSidebar
              schema={activeSchema}
              schemaName={currentSchemaName}
              from={from}
              fields={fields}
              joins={joins}
              onAddField={actions.addField}
              onDragStart={(e, t, c, ty) => {
                e.dataTransfer.setData(
                  "application/json",
                  JSON.stringify({ table: t, column: c, type: ty })
                );
                e.dataTransfer.effectAllowed = "copy";
              }}
            />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
              <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900 p-6 md:p-10 scroll-smooth">
                <div className="max-w-full mx-auto pb-6">
                  {showLinkManager && (
                    <LinkManager
                      joins={joins}
                      onChange={actions.setJoins}
                      schema={activeSchema}
                    />
                  )}
                  <Card
                    title="Columns & Filters"
                    onDrop={(item) => actions.addField(item.table, item.column)}
                    action={
                      <div className="flex items-center gap-3">
                        
                        <div className="flex items-center bg-slate-200 dark:bg-slate-800 rounded-md overflow-hidden border border-slate-700">
                          <button
                            onClick={() =>
                              actions.setFilterGroupCount((p) =>
                                Math.max(1, p - 1)
                              )
                            }
                            className="px-2 py-1.5 hover:bg-slate-700 text-slate-400"
                            disabled={filterGroupCount <= 1}
                          >
                            <Icons.Minus className="w-3.5 h-3.5" />
                          </button>
                          <div className="px-1 text-[10px] text-slate-500 font-bold border-l border-r border-slate-700/50">
                            OR
                          </div>
                          <button
                            onClick={() =>
                              actions.setFilterGroupCount((p) =>
                                Math.min(3, p + 1)
                              )
                            }
                            className="px-2 py-1.5 hover:bg-slate-700 text-slate-400"
                            disabled={filterGroupCount >= 3}
                          >
                            <Icons.Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() =>
                            actions.setIsGroupByActive(!isGroupByActive)
                          }
                          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md font-medium border ${
                            isGroupByActive
                              ? "bg-indigo-600 text-white border-transparent"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          <Icons.Sigma className="w-3.5 h-3.5" />{" "}
                          {isGroupByActive ? "Group On" : "Group"}
                        </button>

                        {fields.length > 0 && (
                          <button
                            onClick={() => {
                              if (window.confirm("Remove all selected fields?"))
                                actions.setFields([]);
                            }}
                            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-red-400 bg-slate-200 dark:bg-slate-800 hover:bg-slate-700 px-2 py-1.5 ml-8 rounded-md border border-slate-700"
                          >
                            <Icons.Trash className="w-3 h-3" /> Clear
                          </button>
                        )}
                      </div>
                    }
                  >
                    {!fields.length ? (
                      <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-lg">
                        <p className="text-slate-500 text-sm">
                          Drag columns here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Sticky Header with Backdrop Blur */}
                        <div className="sticky top-0 z-10 bg-slate-850/95 backdrop-blur-sm shadow-md border-b border-slate-800 -mx-4 px-5 py-2 mb-2 flex text-[10px] font-bold text-slate-500 uppercase tracking-wide items-center">
                          <div className="w-[30px] flex justify-center text-green-400">
                            <Icons.Eye className="w-3 h-3" />
                          </div>
                          {/* New Spacer Column for PK/FK */}
                          <div className="w-[24px] border-r border-slate-800/80"></div>
                          <div className="w-[28%] flex border-r border-slate-800/80 pr-2 text-green-400">
                            <div className="w-[70%] text-center">Field</div>
                            <div className="w-[30%] text-center ">Alias</div>
                          </div>
                          {isGroupByActive && (
                            <div className="w-[90px] flex justify-center items-center gap-1 border-r border-slate-800/80 px-1 text-indigo-400">
                              <Icons.Sigma className="w-3 h-3" /> Group
                            </div>
                          )}
                          {isGroupByActive && (
                            <div className="w-[140px] flex justify-center items-center gap-1 border-r border-slate-800/80 px-1 text-indigo-400">
                              <Icons.Filter className="w-3 h-3" /> Having
                            </div>
                          )}
                          <div className="w-[65px] flex justify-center gap-1 border-r border-slate-800/80 px-1 text-orange-400">
                            <Icons.Sort className="w-3 h-3" /> Sort
                          </div>
                          <div className="flex-1 flex items-center px-1 gap-1 text-red-400">
                            {Array.from({ length: filterGroupCount }).map(
                              (_, i) => (
                                <div
                                  key={i}
                                  className={`flex-1 flex items-center justify-center ${
                                    i > 0 ? "border-l border-slate-800/50" : ""
                                  }`}
                                >
                                  {i === 0 && (
                                    <Icons.Filter className="mr-1 w-3 h-3" />
                                  )}
                                  <span>{i === 0 ? "Where" : "Or"}</span>
                                </div>
                              )
                            )}
                          </div>
                          <div className="w-[30px]"></div>
                        </div>
                        <div className="pb-1">
                          {fields.map((field, idx) => (
                            <FieldRow
                              key={field.id}
                              idx={idx}
                              field={field}
                              schema={activeSchema}
                              isGroupByActive={isGroupByActive}
                              filterGroupCount={filterGroupCount}
                              hasError={joinErrors.some((e) =>
                                e.includes(`'${field.table}'`)
                              )}
                              onUpdate={actions.updateField}
                              onRemove={actions.removeField}
                              onUpdateFilter={actions.updateFieldFilter}
                              onUpdateHaving={actions.updateFieldHaving}
                              dragRef={refs.dragRowItem}
                              onDragStart={(e) => {
                                refs.dragRowItem.current = idx;
                                e.dataTransfer.effectAllowed = "move";
                              }}
                              onDragEnter={(e) => {
                                e.preventDefault();
                                refs.dragOverRowItem.current = idx;
                              }}
                              onDragEnd={actions.handleRowDragEnd}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </main>
              {showTerminal && (
                <Terminal
                  generatedSQL={generatedSQL}
                  tempError={tempError}
                  orphanedTables={orphanedTables}
                  copyFeedback={copyFeedback}
                  onToggleLinkManager={() => setShowLinkManager(true)}
                  onCopy={actions.copyToClipboard}
                  height={terminalHeight}
                  onResizeStart={handleTerminalResizeStart}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SQLConstructor;
