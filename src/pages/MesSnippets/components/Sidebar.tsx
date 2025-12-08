import React, { useState } from "react";
import { Icons } from "@/core/helpers/icons";
import { Category, Snippet, Collection } from "../types/index";
import { CategoryNode } from "./CategoryNode";
import { CollectionSelector } from "./CollectionSelector";

interface SideBarProps {
  collections: Collection[];
  activeCollectionId: string | null;
  onSelectCollection: (collectionId: string) => void;
  onManageCollections: () => void;
  categories: Category[];
  snippets: Snippet[];
  selectedSnippetId: string | null;
  onSelectSnippet: (snippetId: string) => void;
  onNewSnippet: () => void;
  onAddSnippetToCategory: (categoryId: string) => void;
  onNewCategory: () => void;
  onMoveCategory: (categoryId: string, direction: "up" | "down") => void;
  onMoveSnippet: (snippetId: string, direction: "up" | "down") => void;
  onUpdateSnippet: (snippetId: string, updates: Partial<Snippet>) => void;
}

export const SideBar: React.FC<SideBarProps> = ({
  collections,
  activeCollectionId,
  onSelectCollection,
  onManageCollections,
  categories,
  snippets,
  selectedSnippetId,
  onSelectSnippet,
  onNewSnippet,
  onAddSnippetToCategory,
  onNewCategory,
  onMoveCategory,
  onMoveSnippet,
  onUpdateSnippet,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [sortMode, setSortMode] = useState<"name" | "dependents">("name"); // name=Manual Order(default), dependents=Popularity

  const handleToggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleExpandAll = () => {
    const allCategoryIds = new Set<string>();
    categories.forEach((cat) => {
      allCategoryIds.add(cat.id);
    });
    setExpandedCategories(allCategoryIds);
  };

  const handleCollapseAll = () => {
    setExpandedCategories(new Set());
  };

  // Auto-expand categories when searching
  React.useEffect(() => {
    if (searchQuery.trim()) {
      // Expand all categories when user is searching
      handleExpandAll();
    }
  }, [searchQuery]);

  // Filter snippets based on search query
  const filteredSnippets = searchQuery
    ? snippets.filter(
        (snippet) =>
          snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          snippet.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          snippet.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : snippets;

  // Filter categories to show only those with matching snippets
  const visibleCategories = searchQuery
    ? categories.filter((cat) => {
        const categorySnippets = filteredSnippets.filter(
          (s) => s.categoryId === cat.id
        );
        return categorySnippets.length > 0;
      })
    : categories;

  const totalSnippets = snippets.length;
  const totalCategories = categories.length;
  const visibleCategoriesCount = visibleCategories.length;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="p-2">
        {/* Stats and Actions */}
        <div className="ml-2 mr-2 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          {/* Left side: Categories info and actions */}
          <div className="flex items-center gap-2">
            <span>
              {searchQuery && visibleCategoriesCount !== totalCategories
                ? `${visibleCategoriesCount} / ${totalCategories}`
                : totalCategories}{" "}
              catégorie{totalCategories > 1 ? "s" : ""}
            </span>
            <button
              onClick={onNewCategory}
              className="p-1 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
              title="Nouvelle catégorie"
            >
              <Icons.Plus className="w-3 h-3" />
            </button>
            <button
              onClick={handleExpandAll}
              className="hover:text-blue-600 dark:hover:text-blue-400"
              title="Tout développer"
            >
              <Icons.ChevronsDown className="w-4 h-4 text-[#958FFE]" />
            </button>
            <button
              onClick={handleCollapseAll}
              className="hover:text-blue-600 dark:hover:text-blue-400"
              title="Tout replier"
            >
              <Icons.ChevronsUp className="w-4 h-4 text-[#958FFE]" />
            </button>
          </div>

          {/* Right side: Snippets info and sort */}
          <div className="flex items-center gap-2">
            <span>
              {searchQuery ? `${filteredSnippets.length} / ` : ""}
              {totalSnippets} snippet{totalSnippets > 1 ? "s" : ""}
            </span>
            {/* Sort toggle - Star icon */}
            <button
              onClick={() =>
                setSortMode((prev) => (prev === "name" ? "dependents" : "name"))
              }
              className="p-1 rounded-lg bg-transparent hover:bg-amber-100 dark:hover:bg-amber-900/20 text-amber-500 transition-colors"
              title={
                sortMode === "name"
                  ? "Trier par popularité"
                  : "Trier manuellement"
              }
            >
              {sortMode === "dependents" ? (
                <Icons.Star className="w-4 h-4 fill-amber-500" />
              ) : (
                <Icons.Star className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar - 1/3 width */}
        <div className="relative mt-2 flex items-center">
          <div className="relative w-1/2">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <Icons.X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Tree */}
      <div className="flex-1 overflow-y-auto px-2 py-0">
        {visibleCategories.map((category) => (
          <CategoryNode
            key={category.id}
            category={category}
            snippets={filteredSnippets}
            allSnippets={filteredSnippets}
            selectedSnippetId={selectedSnippetId}
            expandedCategories={expandedCategories}
            sortMode={sortMode}
            onToggleCategory={handleToggleCategory}
            onSelectSnippet={onSelectSnippet}
            onAddSnippetToCategory={onAddSnippetToCategory}
            onMoveCategory={onMoveCategory}
            onMoveSnippet={onMoveSnippet}
            onUpdateSnippet={onUpdateSnippet}
            isVBACollection={
              collections.find((c) => c.id === activeCollectionId)?.name ===
              "VBA"
            }
          />
        ))}

        {/* No results */}
        {searchQuery && filteredSnippets.length === 0 && (
          <div className="text-center py-12">
            <Icons.Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Aucun snippet trouvé
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
