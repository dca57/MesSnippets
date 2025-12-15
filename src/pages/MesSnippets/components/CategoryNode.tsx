import React, { useState, useRef, useEffect } from "react";
import { Icons } from "@/core/helpers/icons";
import { Category, Snippet } from "../types/index";
import { getColorClasses } from "../constants/index";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface CategoryNodeProps {
  category: Category;
  snippets: Snippet[];
  allSnippets: Snippet[];
  selectedSnippetId: string | null;
  expandedCategories: Set<string>;
  sortMode: "name" | "dependents";
  onToggleCategory: (categoryId: string) => void;
  onSelectSnippet: (snippetId: string) => void;
  onAddSnippetToCategory: (categoryId: string) => void;
  onMoveCategory: (categoryId: string, direction: "up" | "down") => void;
  onMoveSnippet: (snippetId: string, direction: "up" | "down") => void;
  onUpdateSnippet: (snippetId: string, updates: Partial<Snippet>) => void;
  onDuplicateSnippet: (snippet: Snippet) => void;
  isVBACollection?: boolean;
}

interface SortableSnippetItemProps {
  id: string;
  children: React.ReactNode;
}

const SortableSnippetItem: React.FC<SortableSnippetItemProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : "auto",
    position: 'relative' as const,
    touchAction: 'none'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

export const CategoryNode: React.FC<CategoryNodeProps> = ({
  category,
  snippets,
  allSnippets,
  selectedSnippetId,
  expandedCategories,
  sortMode,
  onToggleCategory,
  onSelectSnippet,
  onAddSnippetToCategory,
  onMoveCategory,
  onMoveSnippet,
  onUpdateSnippet,
  onDuplicateSnippet,
  isVBACollection,
}) => {
  const isExpanded = expandedCategories.has(category.id);
  const categorySnippets = snippets.filter((s) => s.categoryId === category.id);
  const hasSnippets = categorySnippets.length > 0;
  
  // Make the category itself droppable
  const { setNodeRef: setCategoryRef, isOver } = useDroppable({
    id: `category-${category.id}`,
    data: {
        type: 'category',
        categoryId: category.id
    }
  });

  // Calculate dependents count for each snippet in this category
  const snippetDependentsCount = React.useMemo(() => {
    // ... same logic
    const counts: Record<string, number> = {};
    categorySnippets.forEach((s) => {
      counts[s.id] = 0;
    });
    allSnippets.forEach((s) => {
      if (s.dependencies) {
        s.dependencies.forEach((depId) => {
          if (counts[depId] !== undefined) {
            counts[depId]++;
          }
        });
      }
    });
    return counts;
  }, [categorySnippets, allSnippets]);

  // Sort snippets based on current sort mode
  const sortedSnippets = React.useMemo(() => {
    // ... same logic
    const sorted = [...categorySnippets];
    if (sortMode === "name") {
      return sorted.sort((a, b) => (a.order || 0) - (b.order || 0));
    } else {
      return sorted.sort((a, b) => {
        const countDiff =
          (snippetDependentsCount[b.id] || 0) -
          (snippetDependentsCount[a.id] || 0);
        if (countDiff !== 0) return countDiff;
        return (a.order || 0) - (b.order || 0);
      });
    }
  }, [categorySnippets, sortMode, snippetDependentsCount]);


  // Helper component... (omitted)

  // Define logic for inline editing, etc...
  const [editingSnippetId, setEditingSnippetId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingSnippetId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingSnippetId]);

  const handleStartRename = (e: React.MouseEvent, snippet: Snippet) => {
    e.stopPropagation();
    setEditingSnippetId(snippet.id);
    setEditTitle(snippet.title);
  };

  const handleSaveRename = (snippetId: string) => {
    if (editTitle.trim()) {
      onUpdateSnippet(snippetId, { title: editTitle.trim() });
    }
    setEditingSnippetId(null);
  };
  
  const handleCopyClick = async (e: React.MouseEvent, snippet: Snippet) => {
      e.stopPropagation();
      await navigator.clipboard.writeText(snippet.code);
  };

  return (
    <div ref={setCategoryRef} className={`mb-2 rounded-lg transition-colors ${isOver ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
      <div
        className={`
          group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors
          ${
            hasSnippets
              ? "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50"
              : "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }
        `}
        onClick={() => onToggleCategory(category.id)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div
            className={`transition-transform duration-200 ${
              isExpanded ? "rotate-90" : ""
            }`}
          >
            <Icons.ChevronRight className="w-4 h-4" />
          </div>
          {/* ... Category Icon ... */}
          {(() => {
               const iconName = category.icon || "Folder";
               const IconComponent = (Icons as any)[iconName] || Icons.Folder;
               const colorClasses = getColorClasses(category.color || "blue");
               return (
                  <IconComponent
                     className={`w-4 h-4 ${colorClasses.text} dark:${colorClasses.textDark}`}
                  />
               );
          })()}
          <span className="font-medium truncate text-sm">{category.name}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
            ({categorySnippets.length})
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           {/* Actions like Move Up/Down, Add Snippet */}
            <button
                onClick={(e) => {
                e.stopPropagation();
                onMoveCategory(category.id, "up");
                }}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                title="Monter la catégorie"
            >
                <Icons.ArrowUp className="w-3 h-3" />
            </button>
            <button
                onClick={(e) => {
                e.stopPropagation();
                onMoveCategory(category.id, "down");
                }}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                title="Descendre la catégorie"
            >
                <Icons.ArrowDown className="w-3 h-3" />
            </button>
            <button
                onClick={(e) => {
                e.stopPropagation();
                onAddSnippetToCategory(category.id);
                }}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                title="Ajouter un snippet"
            >
                <Icons.Plus className="w-3 h-3" />
            </button>
        </div>
      </div>

      {isExpanded && hasSnippets && (
        <div className="ml-4 mt-1 border-l border-slate-200 dark:border-slate-700 pl-2 space-y-0.5">
          <SortableContext 
              items={sortedSnippets.map(s => s.id)} 
              strategy={verticalListSortingStrategy}
          >
          {sortedSnippets.map((snippet) => {
             const dependentsCount = snippetDependentsCount[snippet.id] || 0;
             return (
             <SortableSnippetItem key={snippet.id} id={snippet.id}>
                <div
                className={`
                    group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-sm mb-0.5
                    ${
                    selectedSnippetId === snippet.id
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    }
                `}
                onClick={() => onSelectSnippet(snippet.id)}
                >
                <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                    <Icons.FileCode className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                    {editingSnippetId === snippet.id ? (
                    <input
                        ref={editInputRef}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleSaveRename(snippet.id)}
                        onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveRename(snippet.id);
                        if (e.key === "Escape") setEditingSnippetId(null);
                        }}
                        className="flex-1 bg-white dark:bg-slate-800 border border-blue-500 rounded px-1 py-0.5 text-xs outline-none min-w-0"
                        onClick={(e) => e.stopPropagation()}
                    />
                    ) : (
                    <span className="truncate">{snippet.title}</span>
                    )}
                </div>

                {!editingSnippetId && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                            onClick={(e) => handleCopyClick(e, snippet)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            title="Copier le code"
                        >
                            <Icons.Copy className="w-3 h-3" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDuplicateSnippet(snippet);
                            }}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            title="Dupliquer"
                        >
                            <Icons.CopyPlus className="w-3 h-3" />
                        </button>

                        <button
                            onClick={(e) => handleStartRename(e, snippet)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            title="Renommer"
                        >
                            <Icons.Edit2 className="w-3 h-3" />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onMoveSnippet(snippet.id, "up");
                            }}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            title="Monter"
                        >
                            <Icons.ArrowUp className="w-3 h-3" />
                         </button>
                         <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onMoveSnippet(snippet.id, "down");
                            }}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            title="Descendre"
                        >
                            <Icons.ArrowDown className="w-3 h-3" />
                        </button>
                    </div>
                )}

                {sortMode === "dependents" && dependentsCount > 0 && (
                   <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full bg-amber-600 dark:bg-amber-500 text-black dark:text-white text-xs font-semibold ml-2">
                     {dependentsCount}
                   </span>
                )}
                </div>
            </SortableSnippetItem>
            );
          })}
          </SortableContext>
        </div>
      )}
    </div>
  );
};
