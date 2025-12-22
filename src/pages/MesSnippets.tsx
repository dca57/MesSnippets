import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ViewMode, Snippet } from "./MesSnippets/types/index";
import { CollectionSelector } from "./MesSnippets/components/CollectionSelector";
import { SideBar } from "./MesSnippets/components/Sidebar";
import { SnippetHeader } from "./MesSnippets/components/SnippetHeader";
import { SnippetEditor } from "./MesSnippets/components/SnippetEditor";
import { SnippetModal } from "./MesSnippets/modals/SnippetModal";
import { CategoryModal } from "./MesSnippets/modals/CategoryModal";
import { CollectionModal } from "./MesSnippets/modals/CollectionModal";
import { DependenciesModal } from "./MesSnippets/modals/DependenciesModal";
import { TagsModal } from "./MesSnippets/modals/TagsModal";
import { BarreOnglets, Tab } from "./MesSnippets/components/BarreOnglets";
import { ConfirmModal } from "./MesSnippets/modals/ConfirmModal";
import { Icons } from '@/core/helpers/icons';
import { useSnippetUiStore } from './MesSnippets/store/snippetUiStore';

// Custom Hooks
import { useCollections } from "./MesSnippets/hooks/useCollections";
import { useCategories } from "./MesSnippets/hooks/useCategories";
import { useSnippets } from "./MesSnippets/hooks/useSnippets";

const MAX_TABS = 6;

interface TabState {
  snippetId: string;
  snapshot: Snippet; // Store the full snippet data here so we can render it even if not in 'snippets' list
  viewMode: ViewMode;
  editedCode: string; // Store unsaved edits here
  collectionId?: string; // Track which collection it came from
}

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
    reorderCollections
  } = useCollections();

  const location = useLocation();

  // Sync state with URL for deep linking
  useEffect(() => {
    const match = location.pathname.match(/\/MesSnippets\/collection\/([^/]+)/);
    if (match && match[1] && match[1] !== activeCollectionId) {
      setActiveCollectionId(match[1]);
    }
  }, [location.pathname, setActiveCollectionId, activeCollectionId]);

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
    reorderSnippets
  } = useSnippets(activeCollectionId || undefined);

  // UI Store
  const { 
     tabs, 
     activeTabId, 
     isSidebarOpen,
     addTab,
     closeTab,
     setActiveTabId,
     updateTab,
     setTabs, // Careful, store handles array replacement
     toggleSidebar
  } = useSnippetUiStore();

  const [showLimitEffect, setShowLimitEffect] = useState(false);

  const triggerLimitEffect = () => {
    setShowLimitEffect(true);
    setTimeout(() => setShowLimitEffect(false), 300);
  };

  // UI State - specific local ones (modals etc)
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

  // Confirm Modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingTabCloseId, setPendingTabCloseId] = useState<string | null>(null);

  // Derive active tab data
  const activeTab = tabs.find((t) => t.snippetId === activeTabId);
  
  // Resolve the snippet data for the active tab
  // Priority: 1. Live 'snippets' list (if present, ensures updates) 2. Snapshot
  const activeSnippetLive = snippets.find(s => s.id === activeTabId);
  const selectedSnippet = activeSnippetLive || activeTab?.snapshot || null;

  // View state comes from the Tab
  const viewMode = activeTab?.viewMode || "view";
  const editedCode = activeTab?.editedCode || "";

  // Enforce compatibility logic: incompatible snippets cannot be wrapped
  // Also sync syntax highlighting preference
  useEffect(() => {
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

  // Update snapshot when live snippet changes
  useEffect(() => {
    if (activeSnippetLive) {
      // Update store tab snapshot
      const existing = tabs.find(t => t.snippetId === activeSnippetLive.id);
      if (existing) {
         updateTab(activeSnippetLive.id, { snapshot: activeSnippetLive });
      }
    }
  }, [activeSnippetLive]);


  // Tab Handlers
  const handleSelectSnippet = (snippetId: string) => {
    const existingTab = tabs.find(t => t.snippetId === snippetId);
    
    if (existingTab) {
      setActiveTabId(snippetId);
    } else {
      if (tabs.length >= MAX_TABS) {
        triggerLimitEffect();
        return;
      }

      // Find the snippet data to create the tab
      const snippet = snippets.find(s => s.id === snippetId);
      if (!snippet) return; 

      addTab({
        snippetId: snippet.id,
        snapshot: snippet,
        viewMode: "view",
        editedCode: "",
        collectionId: activeCollectionId || undefined
      });
    }
  };

  const handleCloseTab = (tabId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const tab = tabs.find(t => t.snippetId === tabId);
    if (!tab) return;

    if (tab.viewMode === "edit" && tab.editedCode !== tab.snapshot.code) {
       // Open modal instead of confirm
       setPendingTabCloseId(tabId);
       setIsConfirmModalOpen(true);
       return;
    }

    closeTab(tabId);
  };

  const handleConfirmSaveAndClose = async () => {
     if (pendingTabCloseId) {
        // We need to trigger save for the specific tab.
        // handleSaveEdit saves ACTIVE snippet. We must verify if pendingTabCloseId is active?
        // Or refactor handleSaveEdit to accept ID.
        // For now, let's assume we can save only if it's the active one or switch to it?
        // Simpler: switch to it, save, then close.
        // Actually, handleSaveEdit relies on selectedSnippet which depends on ActiveTab.
        // So we might need to temporarily activate it or handle update manually.
        
        // Find the tab data
        const tab = tabs.find(t => t.snippetId === pendingTabCloseId);
        if (tab) {
             await updateSnippetFn(tab.snippetId, {
                code: tab.editedCode,
                updatedAt: new Date().toISOString(),
             });
             // No need to update viewMode since we close it right after
             closeTab(pendingTabCloseId);
        }
     }
     setIsConfirmModalOpen(false);
     setPendingTabCloseId(null);
  };

  const handleDiscardClose = () => {
    if (pendingTabCloseId) {
        closeTab(pendingTabCloseId);
    }
    setIsConfirmModalOpen(false);
    setPendingTabCloseId(null);
  };

  const handleActivateTab = (tabId: string) => {
    setActiveTabId(tabId);
  };

  // ... (rest of component until return)




  const handleEdit = () => {
    if (selectedSnippet) {
       updateTab(selectedSnippet.id, { viewMode: "edit", editedCode: selectedSnippet.code });
       if (isWrappedMode) setIsWrappedMode(false);
    }
  };

  const handleSaveEdit = async () => {
    if (selectedSnippet && activeTab) {
      await updateSnippetFn(selectedSnippet.id, {
        code: activeTab.editedCode,
        updatedAt: new Date().toISOString(),
      });
      // Update local tab state and switch to view
      updateTab(selectedSnippet.id, { viewMode: "view", snapshot: { ...activeTab.snapshot, code: activeTab.editedCode } });
    }
  };

  const handleRenameSnippet = async (newName: string) => {
    if (selectedSnippet && newName.trim() !== selectedSnippet.title) {
      await updateSnippetFn(selectedSnippet.id, {
        title: newName.trim(),
        updatedAt: new Date().toISOString(),
      });
      // Snapshot update will happen via useEffect when snippets list updates
    }
  };

  const handleMoveSnippet = async (
    snippetId: string,
    direction: "up" | "down"
  ) => {
    await moveSnippet(snippetId, direction);
  };

  const handleCancelEdit = () => {
    if (activeTab) {
       updateTab(activeTab.snippetId, { viewMode: "view", editedCode: "" });
    }
  };

  const handleDelete = async () => {
    if (selectedSnippet) {
      await deleteSnippetFn(selectedSnippet.id);
      closeTab(selectedSnippet.id);
    }
  };

  const handleDuplicateSnippet = async (snippet: any) => {
    const { id, created_at, updated_at, ...snippetData } = snippet;
    const newSnippetData = {
      ...snippetData,
      title: `${snippet.title} - Copie`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newSnippet = await createSnippetFn(newSnippetData);
    
    if (newSnippet) {
       // Open new snippet in a tab
       if (tabs.length < MAX_TABS) {
          addTab({
             snippetId: newSnippet.id,
             snapshot: newSnippet,
             viewMode: "view",
             editedCode: "",
             collectionId: activeCollectionId || undefined
           });
           // setActiveTabId is handled by addTab but explicit set might be safer if checks failed?
           // Store implementation sets it.
       } else {
          triggerLimitEffect();
       }
    }
  };

  const handleNewSnippet = () => {
    if (tabs.length >= MAX_TABS) {
       triggerLimitEffect();
       return;
    }
    setEditingSnippet(null);
    setPreSelectedCategoryId(null);
    setIsSnippetModalOpen(true);
  };

  const handleAddSnippetToCategory = (categoryId: string) => {
     if (tabs.length >= MAX_TABS) {
       triggerLimitEffect();
       return;
    }
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
      // The update will reflect via live snippets or manual snapshot update might be needed if not in current collection?
      // For now assume updateSnippetFn handles backend and we get fresh data or sidebar updates.
    } else {
      const newSnippet = await createSnippetFn({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      if (newSnippet) {
        // Open the new snippet
         addTab({
            snippetId: newSnippet.id,
            snapshot: newSnippet,
            viewMode: "view",
            editedCode: "",
            collectionId: activeCollectionId || undefined
          });
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
  // MODIFIED: Do NOT reset tabs when switching collections as per requirement
  const handleSelectCollection = (collectionId: string) => {
    setActiveCollectionId(collectionId);
    setPreSelectedCategoryId(null);
    setEditingSnippet(null);
    // Do NOT clear tabs or activeTabId
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

  // Transform tabs for the UI component
  const uiTabs: Tab[] = tabs.map(t => ({
     id: t.snippetId,
     title: t.snapshot.title,
     isDirty: t.viewMode === 'edit' && t.editedCode !== t.snapshot.code,
     isActive: t.snippetId === activeTabId
  }));

  // Resolve collection for syntax highlighting
  const snippetCollection = selectedSnippet 
    ? (activeCollection?.id === selectedSnippet.categoryId 
        ? activeCollection 
        : collections.find(c => {
             const tab = tabs.find(t => t.snippetId === selectedSnippet.id);
             return c.id === tab?.collectionId;
          }))
    : null;

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <CollectionSelector
          collections={collections}
          activeCollectionId={activeCollectionId}
          onSelectCollection={handleSelectCollection}
          onManageCollections={handleManageCollections}
          onReorderCollections={reorderCollections}
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
            selectedSnippetId={activeTabId} 
            onSelectSnippet={handleSelectSnippet}
            onNewSnippet={handleNewSnippet}
            onAddSnippetToCategory={handleAddSnippetToCategory}
             onNewCategory={handleNewCategory}
            onMoveCategory={handleMoveCategory}
            onMoveSnippet={handleMoveSnippet}
            onUpdateSnippet={updateSnippetFn}
            onDuplicateSnippet={handleDuplicateSnippet}
            onReorderSnippets={reorderSnippets}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          
          {/* Tab Bar */}
          <BarreOnglets 
             tabs={uiTabs}
             onActivateTab={handleActivateTab}
             onCloseTab={handleCloseTab}
             showLimitReached={showLimitEffect}
          />
          
          {selectedSnippet ? (
           <>
              <SnippetHeader
                snippet={selectedSnippet}
                collection={snippetCollection || activeCollection} 
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
              <div className="flex-1 overflow-hidden">
                <SnippetEditor
                  snippet={selectedSnippet}
                  language={snippetCollection?.language || activeCollection?.language || "typescript"}
                  isEditing={viewMode === "edit"}
                  editedCode={editedCode}
                  onCodeChange={(code) => {
                     if (activeTabId) {
                        updateTab(activeTabId, { editedCode: code });
                     }
                  }}
                  allSnippets={snippets} 
                  categories={categories}
                  showSyntaxHighlighting={showSyntaxHighlighting}
                  isWrappedMode={isWrappedMode}
                  isVBACollection={snippetCollection?.name === "VBA" || activeCollection?.name === "VBA"}
                  collectionName={snippetCollection?.name || activeCollection?.name}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
               <div className="text-center">
                  <Icons.Layout className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Aucun onglet ouvert</p>
               </div>
            </div>
          )}
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

      <ConfirmModal 
        isOpen={isConfirmModalOpen}
        title="Modifications non enregistrées"
        message="Le snippet a été modifié. Voulez-vous sauvegarder les modifications ?"
        confirmLabel="Oui"
        discardLabel="Non"
        cancelLabel="Annuler"
        onConfirm={handleConfirmSaveAndClose}
        onDiscard={handleDiscardClose}
        onCancel={() => {
            setIsConfirmModalOpen(false);
            setPendingTabCloseId(null);
        }}
      />
    </div>
  );
};

export default MesSnippets;
