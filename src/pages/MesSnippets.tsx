import React, { useState } from "react";
import { ViewMode } from "./MesSnippets/types/index";
import { CollectionSelector } from "./MesSnippets/components/CollectionSelector";
import { SideBar } from "./MesSnippets/components/Sidebar";
import { SnippetHeader } from "./MesSnippets/components/SnippetHeader";
import { SnippetEditor } from "./MesSnippets/components/SnippetEditor";
import { SnippetModal } from "./MesSnippets/modals/SnippetModal";
import { CategoryModal } from "./MesSnippets/modals/CategoryModal";
import { CollectionModal } from "./MesSnippets/modals/CollectionModal";
import { DependenciesModal } from "./MesSnippets/modals/DependenciesModal";
import { TagsModal } from "./MesSnippets/modals/TagsModal";

// Custom Hooks
import { useCollections } from "./MesSnippets/hooks/useCollections";
import { useCategories } from "./MesSnippets/hooks/useCategories";
import { useSnippets } from "./MesSnippets/hooks/useSnippets";

const MesSnippets: React.FC = () => {
  // Custom hooks for data management
  const {
    collections,
    activeCollectionId,
    activeCollection,
    setActiveCollectionId,
    createCollection,
    updateCollection,
    deleteCollection,
  } = useCollections();

  const {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
  } = useCategories(activeCollectionId || undefined);

  const {
    snippets,
    createSnippet: createSnippetFn,
    updateSnippet: updateSnippetFn,
    deleteSnippet: deleteSnippetFn,
    moveSnippet,
  } = useSnippets(activeCollectionId || undefined);

  // UI State
  const [selectedSnippetId, setSelectedSnippetId] = useState<string | null>(
    null
  );
  const [viewMode, setViewMode] = useState<ViewMode>("view");
  const [editedCode, setEditedCode] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [preSelectedCategoryId, setPreSelectedCategoryId] = useState<
    string | null
  >(null);

  const [showSyntaxHighlighting, setShowSyntaxHighlighting] = useState(true);
  const [isWrappedMode, setIsWrappedMode] = useState(false);

  // Modal states
  const [isSnippetModalOpen, setIsSnippetModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isDependenciesModalOpen, setIsDependenciesModalOpen] = useState(false);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);

  // Computed values
  const selectedSnippet =
    snippets.find((s) => s.id === selectedSnippetId) || null;

  // Enforce compatibility logic: incompatible snippets cannot be wrapped
  // Also sync syntax highlighting preference
  React.useEffect(() => {
    if (selectedSnippet) {
      if (selectedSnippet.is_admin_compatible === false && isWrappedMode) {
        setIsWrappedMode(false);
      }
      setShowSyntaxHighlighting(
        selectedSnippet.is_coloration_compatible ?? true
      );
    }
  }, [
    selectedSnippet?.id,
    selectedSnippet?.is_admin_compatible,
    selectedSnippet?.is_coloration_compatible,
    isWrappedMode,
  ]);

  // Snippet handlers
  const handleSelectSnippet = (snippetId: string) => {
    setSelectedSnippetId(snippetId);
    setViewMode("view");
  };

  const handleEdit = () => {
    if (selectedSnippet) {
      setEditedCode(selectedSnippet.code);
      setViewMode("edit");
      if (isWrappedMode) setIsWrappedMode(false);
    }
  };

  const handleSaveEdit = async () => {
    if (selectedSnippet) {
      await updateSnippetFn(selectedSnippet.id, {
        code: editedCode,
        updatedAt: new Date().toISOString(),
      });
      setViewMode("view");
    }
  };

  const handleRenameSnippet = async (newName: string) => {
    if (selectedSnippet && newName.trim() !== selectedSnippet.title) {
      await updateSnippetFn(selectedSnippet.id, {
        title: newName.trim(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleMoveSnippet = async (
    snippetId: string,
    direction: "up" | "down"
  ) => {
    await moveSnippet(snippetId, direction);
  };

  const handleCancelEdit = () => {
    setEditedCode("");
    setViewMode("view");
  };

  const handleDelete = async () => {
    if (selectedSnippet) {
      await deleteSnippetFn(selectedSnippet.id);
      setSelectedSnippetId(null);
    }
  };

  const handleNewSnippet = () => {
    setEditingSnippet(null);
    setPreSelectedCategoryId(null);
    setIsSnippetModalOpen(true);
  };

  const handleAddSnippetToCategory = (categoryId: string) => {
    setEditingSnippet(null);
    setPreSelectedCategoryId(categoryId);
    setIsSnippetModalOpen(true);
  };

  const handleSaveSnippet = async (data: any) => {
    if (editingSnippet) {
      await updateSnippetFn(editingSnippet, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const newSnippet = await createSnippetFn({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      if (newSnippet) {
        setSelectedSnippetId(newSnippet.id);
      }
    }
    setIsSnippetModalOpen(false);
    setEditingSnippet(null);
    setPreSelectedCategoryId(null);
  };

  // Collection handlers
  const handleManageCollections = () => {
    setIsCollectionModalOpen(true);
  };

  const handleSaveCollection = async (data: any) => {
    if (data.id) {
      await updateCollection(data.id, data);
    } else {
      await createCollection(data);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    await deleteCollection(id);
  };

  // Category handlers
  const handleNewCategory = () => {
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (data: any) => {
    if (data.id) {
      await updateCategory(data.id, data);
    } else {
      await createCategory({
        ...data,
        collectionId: activeCollectionId || "",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
  };

  const handleMoveCategory = async (
    categoryId: string,
    direction: "up" | "down"
  ) => {
    await moveCategory(categoryId, direction);
  };

  // Dependencies handlers
  const handleManageDependencies = () => {
    setIsDependenciesModalOpen(true);
  };

  const handleSaveDependencies = async (dependencies: string[]) => {
    if (selectedSnippet) {
      await updateSnippetFn(selectedSnippet.id, {
        dependencies,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Wrapper for collection selection to reset state
  const handleSelectCollection = (collectionId: string) => {
    setActiveCollectionId(collectionId);
    setSelectedSnippetId(null);
    setPreSelectedCategoryId(null);
    setEditingSnippet(null);
    setIsWrappedMode(false);
    setViewMode("view");
  };

  // Tag handlers
  const handleManageTags = () => {
    setIsTagsModalOpen(true);
  };

  const handleSaveTags = async (tags: string[]) => {
    if (selectedSnippet) {
      await updateSnippetFn(selectedSnippet.id, {
        tags,
        updatedAt: new Date().toISOString(),
      });
      setIsTagsModalOpen(false);
    }
  };

  // Filter snippets for sidebar ensuring they belong to visible categories
  const sidebarSnippets = React.useMemo(() => {
    const categoryIds = new Set(categories.map((c) => c.id));
    return snippets.filter((s) => categoryIds.has(s.categoryId));
  }, [snippets, categories]);

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <CollectionSelector
          collections={collections}
          activeCollectionId={activeCollectionId}
          onSelectCollection={handleSelectCollection}
          onManageCollections={handleManageCollections}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Sidebar */}
        <div
          className={`${
            isSidebarOpen ? "w-120" : "w-0"
          } flex-shrink-0 transition-all duration-300 overflow-hidden lg:w-120`}
        >
          <SideBar
            collections={collections}
            activeCollectionId={activeCollectionId}
            onSelectCollection={handleSelectCollection}
            onManageCollections={handleManageCollections}
            categories={categories}
            snippets={sidebarSnippets}
            selectedSnippetId={selectedSnippetId}
            onSelectSnippet={handleSelectSnippet}
            onNewSnippet={handleNewSnippet}
            onAddSnippetToCategory={handleAddSnippetToCategory}
            onNewCategory={handleNewCategory}
            onMoveCategory={handleMoveCategory}
            onMoveSnippet={handleMoveSnippet}
            onUpdateSnippet={updateSnippetFn}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {selectedSnippet && (
            <SnippetHeader
              snippet={selectedSnippet}
              collection={activeCollection}
              isEditing={viewMode === "edit"}
              onEdit={handleEdit}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
              onDelete={handleDelete}
              onManageDependencies={handleManageDependencies}
              onRename={handleRenameSnippet}
              showSyntaxHighlighting={showSyntaxHighlighting}
              onToggleSyntaxHighlighting={async () => {
                const newValue = !showSyntaxHighlighting;
                setShowSyntaxHighlighting(newValue); // Optimistic update
                if (selectedSnippet) {
                  await updateSnippetFn(selectedSnippet.id, {
                    is_coloration_compatible: newValue,
                    updatedAt: new Date().toISOString(),
                  });
                }
              }}
              onManageTags={handleManageTags}
              isWrappedMode={isWrappedMode}
              onToggleWrappedMode={() => setIsWrappedMode(!isWrappedMode)}
            />
          )}
          <div className="flex-1 overflow-hidden">
            <SnippetEditor
              snippet={selectedSnippet}
              language={activeCollection?.language || "typescript"}
              isEditing={viewMode === "edit"}
              editedCode={editedCode}
              onCodeChange={setEditedCode}
              allSnippets={snippets} // Keep all for dependencies resolution
              categories={categories}
              showSyntaxHighlighting={showSyntaxHighlighting}
              isWrappedMode={isWrappedMode}
              isVBACollection={activeCollection?.name === "VBA"}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <SnippetModal
        isOpen={isSnippetModalOpen}
        onClose={() => {
          setIsSnippetModalOpen(false);
          setEditingSnippet(null);
          setPreSelectedCategoryId(null);
        }}
        onSave={handleSaveSnippet}
        snippet={
          editingSnippet ? snippets.find((s) => s.id === editingSnippet) : null
        }
        categories={categories}
        preSelectedCategoryId={preSelectedCategoryId}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        categories={categories}
        collectionId={activeCollectionId}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
      />

      <CollectionModal
        isOpen={isCollectionModalOpen}
        collections={collections}
        onClose={() => setIsCollectionModalOpen(false)}
        onSave={handleSaveCollection}
        onDelete={handleDeleteCollection}
      />

      {selectedSnippet && (
        <DependenciesModal
          isOpen={isDependenciesModalOpen}
          snippet={selectedSnippet}
          allSnippets={snippets}
          categories={categories}
          collections={collections}
          onClose={() => setIsDependenciesModalOpen(false)}
          onSave={handleSaveDependencies}
        />
      )}

      {selectedSnippet && (
        <TagsModal
          isOpen={isTagsModalOpen}
          snippet={selectedSnippet}
          onClose={() => setIsTagsModalOpen(false)}
          onSave={handleSaveTags}
        />
      )}
    </div>
  );
};

export default MesSnippets;
