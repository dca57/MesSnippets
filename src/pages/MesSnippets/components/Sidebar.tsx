import React, { useState } from "react";
import { Icons } from "@/core/helpers/icons";
import { Category, Snippet, Collection } from "../types/index";
import { CategoryNode } from "./CategoryNode";
import { CollectionSelector } from "./CollectionSelector";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

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
  onDuplicateSnippet: (snippet: Snippet) => void;
  onReorderSnippets?: (snippets: Snippet[]) => void;
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

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
  onDuplicateSnippet,
  onReorderSnippets,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [sortMode, setSortMode] = useState<"name" | "dependents">("name"); // name=Manual Order(default), dependents=Popularity
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

    // --- DnD Logic ---

    const handleDragStart = (event: DragStartEvent) => {
      setActiveDragId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
      // Optimistically move items between lists (categories) during drag
      // Not strictly necessary if we only reorder on Drop, but standard for Sortable.
      // However, we rely on parent 'snippets' list which is flat.
      // Changing it here requires updating the prop or local state.
      // Since props are immutable, we rely on onReorderSnippets at the end.
      // BUT to see the effect, we might need a local copy of snippets or rely on handleDragEnd only?
      // handleDragOver is crucial for cross-container sorting to look right.
      // But implementing correctly without local state is hard.
      // We will perform the logic in DragEnd to simplify state management 
      // AND we will trust dnd-kit visual placeholder in correct container.
      // Actually, dnd-kit needs to know items are in different containers.
      // If we don't update list during drag, the item stays in old container visually until drop.
      // For now, let's Stick to DragEnd. If UX is poor, we add local state.
    };

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragId(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId !== overId) {
          // Find source and destination
          const activeSnippet = snippets.find(s => s.id === activeId);
          // overId could be a snippet OR a category (if we made categories droppable.. which we didn't yet explicitly)
          // Actually CategoryNode wraps snippets in SortableContext.
          // If we drop on another snippet, we get that snippet's ID.
          // If we drop on a category? We haven't made category Droppable.
          // We should rely on dropping on snippets.
          // What if category is empty?
          // We need access to empty categories too.
          
          if (!activeSnippet) return;

          // Check if overId is a snippet
          const overSnippet = snippets.find(s => s.id === overId);
          
          let newSnippets = [...snippets];

          if (overSnippet) {
              // We are dropping over another snippet
              const activeIndex = snippets.findIndex(s => s.id === activeId);
              const overIndex = snippets.findIndex(s => s.id === overId);

              // If different categories?
              if (activeSnippet.categoryId !== overSnippet.categoryId) {
                   // Update category of active snippet
                   activeSnippet.categoryId = overSnippet.categoryId;
                   // Logic: move activeSnippet to the position relative to overSnippet
                   // We need to construct a new array where activeSnippet is removed from old pos and inserted at new pos
                   // AND updated categoryId.
                   
                   // Remove first
                   newSnippets.splice(activeIndex, 1);
                   // Calculate new index. Note: indices changed after splice.
                   // Find index of overId again in newSnippets
                   const newOverIndex = newSnippets.findIndex(s => s.id === overId);

                   // Insert. If we drag downwards (index >), usually after. But here it's cross list.
                   // dnd-kit usually implies placement.
                   // Let's assume insert BEFORE if we are above, AFTER if below.. 
                   // Simplified: Insert at overIndex.
                   // But wait, sortable strategy?
                   
                   // Let's try to just use arrayMove if we can linearly map them?
                   // Problem: snippets might not be contiguous in the flat list.
                   // Strategy:
                   // 1. Get all snippets for target category.
                   // 2. Insert activeSnippet into that list at correct sorted index.
                   // 3. Reconstruct full snippets list.
              } else {
                   // Same category
                   newSnippets = arrayMove(newSnippets, activeIndex, overIndex);
              }
          } 
          
          // Re-assign orders based on new list sequence within categories?
          // Or just use the flat list order?
          // Our snippets are flat.
          // Safe way: Update categoryId if needed. Then Re-index orders for the affected category(ies).
          
          // Simpler approach compatible with dnd-kit Sortable:
          // 1. Identify Valid Lists.
          // 2. perform move.
          
          // Let's use the onReorderSnippets to pass the NEW STATE.
          // Since implementing full cross-container drag logic in one go is error-prone without local state,
          // I will implement a simpler version:
          // If same category: arrayMove.
          // If diff category: Just change categoryId and append to end? User asked for "well ordered depending on drop location".
          
          // Re-evaluating: To support "Drop into empty" and "Drop between items", 
          // I REALLY need to make Categories Droppable containers.
          // But I only used SortableContext.
          
          // If I drop on a snippet in Cat B, `over` is that snippet.
          // I can update `activeSnippet.categoryId` to `overSnippet.categoryId`.
          // And I also swap/move orders.
          
          
          // Implementation for Cross-Category (Naive but working for list-to-list):
          // Check if dropping on a Category directly
          if (overId.startsWith("category-")) {
              const targetCategoryId = overId.replace("category-", "");
              if (activeSnippet.categoryId !== targetCategoryId) {
                   const updatedSnippet = { ...activeSnippet, categoryId: targetCategoryId };
                   const withoutActive = snippets.filter(s => s.id !== activeId);
                   
                   // Add to the end of the target category
                   // Find last index of that category? Or just push?
                   // If we are appending to a category, we likely want it at the end.
                   // But wait, order? order should be max(order)+1
                   // We don't recalculate order here, we rely on finalSnippets logic below?
                   // Just pushing to array is enough for now, user will reorder if needed.
                   // We insert it at the end of the array, effectively.
                   
                   // However, for the UI to be consistent, let's look where it should be.
                   // If we drop on the category HEADER, it usually means "add to this category".
                   // Putting it at the beginning or end is a design choice. End is standard.
                   
                   newSnippets = [...withoutActive, updatedSnippet];
              }
          } else if (overSnippet && activeSnippet.categoryId !== overSnippet.categoryId) {
             const updatedSnippet = { ...activeSnippet, categoryId: overSnippet.categoryId };
             // We need to place it relative to overSnippet.
             // Remove from list
             const withoutActive = snippets.filter(s => s.id !== activeId);
             // Find index of overSnippet
             const overIndex = withoutActive.findIndex(s => s.id === overId);
             
             // Insert at overIndex (this puts it before the hovered item, generally fine)
             withoutActive.splice(overIndex, 0, updatedSnippet);
             
             newSnippets = withoutActive;
          } else if (overSnippet) {
              // Same category reordering
              // 1. Get snippets for this category
              const categoryId = activeSnippet.categoryId;
              const categorySnippets = snippets
                  .filter(s => s.categoryId === categoryId)
                  .sort((a, b) => (a.order || 0) - (b.order || 0));
              
              // 2. Find indices in this sorted subset
              const oldIndex = categorySnippets.findIndex(s => s.id === activeId);
              const newIndex = categorySnippets.findIndex(s => s.id === overId);

              if (oldIndex !== -1 && newIndex !== -1) {
                  // 3. Move in the subset
                  const reorderedSubset = arrayMove(categorySnippets, oldIndex, newIndex);
                  
                  // 4. Update orders for this subset
                  reorderedSubset.forEach((s, idx) => {
                      s.order = idx;
                  });

                  // 5. Merge back into main list
                  // We create a map for fast lookup of updated snippets
                  const updatedMap = new Map(reorderedSubset.map(s => [s.id, s]));
                  
                  newSnippets = snippets.map(s => updatedMap.get(s.id) || s);
              }
          }

          // Trigger update if we have new snippets
          if (onReorderSnippets && newSnippets !== snippets) {
             // If we did cross-category move, we might still need to normalize orders for the target category
             // But the above logic handles reordering for same-category.
             // For cross-category (previous block), we blindly pushed to end.
             // Let's ensure strict order normalization for ALL categories just to be safe and clean.
             // This ensures no gaps or duplicates in order values.
             
             const grouped = new Map<string, Snippet[]>();
             // Sort by existing order first to maintain relative order before renormalization
             const sortedForNormalization = [...newSnippets].sort((a, b) => (a.order || 0) - (b.order || 0));
             
             sortedForNormalization.forEach(s => {
                if(!grouped.has(s.categoryId)) grouped.set(s.categoryId, []);
                grouped.get(s.categoryId)!.push(s);
             });
             
             const finalSnippets: Snippet[] = [];
             grouped.forEach((groupSnippets) => {
                 groupSnippets.forEach((s, idx) => {
                    finalSnippets.push({ ...s, order: idx });
                 });
             });
             
             onReorderSnippets(finalSnippets);
          }
      }
    };


  const activeSnippet = activeDragId ? snippets.find(s => s.id === activeDragId) : null;

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
              <Icons.ChevronsDown className="w-4 h-4 text-purple-700 dark:text-purple-400" />
            </button>
            <button
              onClick={handleCollapseAll}
              className="hover:text-blue-600 dark:hover:text-blue-400"
              title="Tout replier"
            >
              <Icons.ChevronsUp className="w-4 h-4 text-purple-700 dark:text-purple-400" />
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

        {/* Search Bar */}
        <div className="relative mt-2 flex items-center">
          <div className="relative w-full">
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
        <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
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
                onDuplicateSnippet={onDuplicateSnippet}
                isVBACollection={
                  collections.find((c) => c.id === activeCollectionId)?.name ===
                  "VBA"
                }
              />
            ))}
            
             {createPortal(
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeSnippet ? (
                        <div className="p-2 bg-white dark:bg-slate-800 shadow-lg rounded-lg border border-blue-500 opacity-90 w-64 flex items-center gap-2">
                             <Icons.FileCode className="w-4 h-4 text-slate-500" />
                             <span className="font-medium truncate">{activeSnippet.title}</span>
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>

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
