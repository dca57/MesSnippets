import React, { useState, useMemo } from "react";
import { Icons } from "@/core/helpers/icons";
import { Snippet, Category, Collection } from "../types/index";

interface DependenciesModalProps {
  isOpen: boolean;
  snippet: Snippet;
  allSnippets: Snippet[];
  categories: Category[];
  collections: Collection[];
  onClose: () => void;
  onSave: (dependencies: string[]) => void;
}

export const DependenciesModal: React.FC<DependenciesModalProps> = ({
  isOpen,
  snippet,
  allSnippets,
  categories,
  collections,
  onClose,
  onSave,
}) => {
  const [selectedDependencies, setSelectedDependencies] = useState<Set<string>>(
    new Set(snippet.dependencies || [])
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Reset state when opening
  React.useEffect(() => {
    if (isOpen) {
      setSelectedDependencies(new Set(snippet.dependencies || []));
      setSearchQuery("");
      // Auto-expand all by default or just collections? Let's expand collections by default
      setExpandedNodes(new Set(collections.map((c) => c.id)));
    }
  }, [isOpen, snippet, collections]);

  const toggleDependency = (snippetId: string) => {
    const newDeps = new Set(selectedDependencies);
    if (newDeps.has(snippetId)) {
      newDeps.delete(snippetId);
    } else {
      newDeps.add(snippetId);
    }
    setSelectedDependencies(newDeps);
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleSave = () => {
    onSave(Array.from(selectedDependencies));
    onClose();
  };

  // --- Data Preparation ---

  // 1. Available Snippets (exclude self)
  const validSnippets = useMemo(() => {
    return allSnippets.filter((s) => s.id !== snippet.id);
  }, [allSnippets, snippet.id]);

  // 2. Tree Structure for "Available" view (when no search)
  const treeData = useMemo(() => {
    return collections
      .map((col) => {
        const colCategories = categories.filter(
          (cat) => cat.collectionId === col.id
        );
        const categoriesWithSnippets = colCategories
          .map((cat) => {
            const catSnippets = validSnippets.filter(
              (s) => s.categoryId === cat.id
            );
            return { ...cat, snippets: catSnippets };
          })
          .filter((cat) => cat.snippets.length > 0);

        // Also handle snippets that might be directly under collection if that was allowed?
        // Assuming snippets are always in categories as per type def.

        return { ...col, categories: categoriesWithSnippets };
      })
      .filter((col) => col.categories.length > 0);
  }, [collections, categories, validSnippets]);

  // 3. Search Results (Flat list)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return validSnippets.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query) ||
        s.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [validSnippets, searchQuery]);

  // 4. Selected Snippets List (for Right Column)
  const selectedSnippetObjects = useMemo(() => {
    return Array.from(selectedDependencies)
      .map((id) => allSnippets.find((s) => s.id === id))
      .filter((s): s is Snippet => !!s);
  }, [selectedDependencies, allSnippets]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-5xl m-4 h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Gérer les dépendances
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {snippet.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content (Two Columns) */}
        <div className="flex-1 flex min-h-0">
          {/* LEFT COLUMN: Available Snippets */}
          <div className="w-1/2 flex flex-col border-r border-slate-200 dark:border-slate-700">
            {/* Search Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div className="relative">
                <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher à ajouter..."
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* List/Tree */}
            <div className="flex-1 overflow-y-auto p-4">
              {searchQuery.trim() ? (
                // SEARCH RESULTS
                <div className="space-y-2">
                  {searchResults.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      Aucun résultat
                    </div>
                  ) : (
                    searchResults.map((s) => {
                      const isSelected = selectedDependencies.has(s.id);
                      return (
                        <div
                          key={s.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                          }`}
                          onClick={() => toggleDependency(s.id)}
                        >
                          <div
                            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-blue-600 border-blue-600"
                                : "border-slate-300 dark:border-slate-500"
                            }`}
                          >
                            {isSelected && (
                              <Icons.Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
                              {s.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                {
                                  categories.find((c) => c.id === s.categoryId)
                                    ?.name
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                // TREE VIEW
                <div className="space-y-4">
                  {treeData.map((col) => (
                    <div key={col.id}>
                      {/* Collection Header */}
                      <button
                        onClick={() => toggleNode(col.id)}
                        className="flex items-center gap-2 w-full text-left font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 mb-2 group"
                      >
                        {expandedNodes.has(col.id) ? (
                          <Icons.ChevronDown className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                        ) : (
                          <Icons.ChevronRight className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                        )}
                        <span className="flex items-center gap-2 truncate">
                          {/* Use dynamic icon if we wanted, for now just name or generic */}
                          {col.name}
                        </span>
                      </button>

                      {expandedNodes.has(col.id) && (
                        <div className="ml-2 pl-2 border-l border-slate-200 dark:border-slate-700 space-y-3">
                          {col.categories.map((cat) => (
                            <div key={cat.id}>
                              <div className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1 pl-2">
                                {cat.name}
                              </div>
                              <div className="space-y-1">
                                {cat.snippets.map((s) => {
                                  const isSelected = selectedDependencies.has(
                                    s.id
                                  );
                                  return (
                                    <div
                                      key={s.id}
                                      onClick={() => toggleDependency(s.id)}
                                      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                                        isSelected
                                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                      }`}
                                    >
                                      <div
                                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                                          isSelected
                                            ? "bg-blue-600 border-blue-600"
                                            : "border-slate-300 dark:border-slate-500 group-hover:border-blue-400"
                                        }`}
                                      >
                                        {isSelected && (
                                          <Icons.Check className="w-3 h-3 text-white" />
                                        )}
                                      </div>
                                      <span className="text-sm truncate">
                                        {s.title}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Selected Snippets */}
          <div className="w-1/2 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                Sélectionnés ({selectedDependencies.size})
              </h3>
              {selectedDependencies.size > 0 && (
                <button
                  onClick={() => setSelectedDependencies(new Set())}
                  className="text-xs text-red-600 hover:underline"
                >
                  Tout retirer
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {selectedSnippetObjects.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Icons.Layers className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm">Aucune dépendance sélectionnée</p>
                </div>
              ) : (
                selectedSnippetObjects.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                        <Icons.FileCode className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {s.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <span className="truncate max-w-[150px]">
                            {
                              collections.find(
                                (col) =>
                                  col.id ===
                                  categories.find((c) => c.id === s.categoryId)
                                    ?.collectionId
                              )?.name
                            }
                            {" / "}
                            {
                              categories.find((c) => c.id === s.categoryId)
                                ?.name
                            }
                          </span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleDependency(s.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Retirer"
                    >
                      <Icons.X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3 flex-shrink-0 bg-white dark:bg-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2"
          >
            <Icons.Save className="w-4 h-4" />
            <span>Enregistrer ({selectedDependencies.size})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
