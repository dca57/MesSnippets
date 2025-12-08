import React, { useState } from "react";
import { Icons } from "@/core/helpers/icons";
import { Category, Snippet } from "../types/index";
import { getColorClasses } from "../constants/index";

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
  isVBACollection?: boolean;
}

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
  isVBACollection,
}) => {
  const isExpanded = expandedCategories.has(category.id);
  const categorySnippets = snippets.filter((s) => s.categoryId === category.id);
  const hasSnippets = categorySnippets.length > 0;

  // Calculate dependents count for each snippet in this category
  const snippetDependentsCount = React.useMemo(() => {
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
    const sorted = [...categorySnippets];
    if (sortMode === "name") {
      // Manual order
      return sorted.sort((a, b) => (a.order || 0) - (b.order || 0));
    } else {
      // Popularity (dependents count) then order
      return sorted.sort((a, b) => {
        const countDiff =
          (snippetDependentsCount[b.id] || 0) -
          (snippetDependentsCount[a.id] || 0);
        if (countDiff !== 0) return countDiff;
        return (a.order || 0) - (b.order || 0);
      });
    }
  }, [categorySnippets, sortMode, snippetDependentsCount]);

  const getIcon = () => {
    const iconName = category.icon || "Folder";
    const IconComponent = (Icons as any)[iconName] || Icons.Folder;
    const colorClasses = getColorClasses(category.color || "blue");
    return (
      <IconComponent
        className={`w-4 h-4 ${colorClasses.text} dark:${colorClasses.textDark}`}
      />
    );
  };

  // Get color classes for this category
  const categoryColors = getColorClasses(category.color || "blue");

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddSnippetToCategory(category.id);
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveCategory(category.id, "up");
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveCategory(category.id, "down");
  };

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-semibold group"
        onClick={() => hasSnippets && onToggleCategory(category.id)}
      >
        {hasSnippets && (
          <Icons.ChevronRight
            className={`w-4 h-4 text-[#958FFE] transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        )}
        {!hasSnippets && <div className="w-4" />}
        <div>{getIcon()}</div>
        <span
          className={`text-sm font-semibold ${categoryColors.text} dark:${categoryColors.textDark}`}
        >
          {category.name}
        </span>

        {/* Snippet count */}
        {categorySnippets.length > 0 && (
          <span
            className={`text-xs text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-full ml-1 ${categoryColors.bg}`}
          >
            {categorySnippets.length}
          </span>
        )}

        {/* Add snippet button */}
        <button
          onClick={handleAddClick}
          className={`p-1 rounded ${categoryColors.text} dark:${categoryColors.textDark} hover:${categoryColors.bgLight}`}
          title="Ajouter un snippet"
        >
          <Icons.Plus className="w-4 h-4" />
        </button>

        {/* Reorder arrows */}
        <button
          onClick={handleMoveUp}
          className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 ${categoryColors.text} dark:${categoryColors.textDark}`}
          title="Déplacer vers le haut"
        >
          <Icons.ChevronRight className="w-4 h-4 text-[#958FFE] -rotate-90" />
        </button>
        <button
          onClick={handleMoveDown}
          className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 ${categoryColors.text} dark:${categoryColors.textDark}`}
          title="Déplacer vers le bas"
        >
          <Icons.ChevronRight className="w-4 h-4 text-[#958FFE] rotate-90" />
        </button>
      </div>

      {isExpanded && (
        <div className="mt-1">
          {sortedSnippets.map((snippet) => {
            const dependentsCount = snippetDependentsCount[snippet.id] || 0;
            return (
              <div
                key={snippet.id}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
                  selectedSnippetId === snippet.id
                    ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"
                    : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                }`}
                style={{ paddingLeft: `40px` }}
                onClick={() => onSelectSnippet(snippet.id)}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Icons.FileCode className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm truncate">{snippet.title}</span>
                </div>

                {/* Actions group for snippet sort, visible on hover */}
                <div
                  className={`flex items-center gap-1 ${
                    sortMode === "name"
                      ? "opacity-0 group-hover:opacity-100"
                      : "hidden"
                  } transition-opacity`}
                >
                  {/* Compatibility Toggle (only for VBA) */}
                  {isVBACollection && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateSnippet(snippet.id, {
                          is_admin_compatible: !snippet.is_admin_compatible,
                        });
                      }}
                      className={`p-0.5 rounded cursor-pointer transition-colors ${
                        snippet.is_admin_compatible !== false
                          ? "text-green-500 hover:bg-green-100"
                          : "text-red-500 hover:bg-red-100"
                      }`}
                      title={
                        snippet.is_admin_compatible !== false
                          ? "Compatible enrobage (Cliquer pour désactiver)"
                          : "Non compatible enrobage (Cliquer pour activer)"
                      }
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          snippet.is_admin_compatible !== false
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSnippet(snippet.id, "up");
                    }}
                    className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                    title="Monter"
                  >
                    <Icons.ChevronRight className="w-3 h-3 text-[#958FFE] -rotate-90" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSnippet(snippet.id, "down");
                    }}
                    className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                    title="Descendre"
                  >
                    <Icons.ChevronRight className="w-3 h-3 text-[#958FFE] rotate-90" />
                  </button>
                </div>

                {sortMode === "dependents" && dependentsCount > 0 && (
                  <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full bg-amber-600 dark:bg-amber-500 text-black dark:text-white text-xs font-semibold">
                    {dependentsCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
