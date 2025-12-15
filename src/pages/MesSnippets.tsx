import React, { useState, useEffect } from "react";
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
import { Icons } from '@/core/helpers/icons';

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

  // Tab State
  const [tabs, setTabs] = useState<TabState[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [showLimitEffect, setShowLimitEffect] = useState(false);

  const triggerLimitEffect = () => {
    setShowLimitEffect(true);
    setTimeout(() => setShowLimitEffect(false), 300);
  };

  // UI State
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
      setTabs(prev => prev.map(t => 
        t.snippetId === activeSnippetLive.id 
          ? { ...t, snapshot: activeSnippetLive }
          : t
      ));
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
      // NOTE: snippet might not be in 'snippets' if it belongs to another collection?
      // But handleSelectSnippet is usually called from SideBar which displays 'snippets'.
      // So it should be there.
      const snippet = snippets.find(s => s.id === snippetId);
      if (!snippet) return; 

      setTabs(prev => [...prev, {
        snippetId: snippet.id,
        snapshot: snippet,
        viewMode: "view",
        editedCode: "",
        collectionId: activeCollectionId || undefined
      }]);
      setActiveTabId(snippetId);
    }
  };

  const handleCloseTab = (tabId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const tab = tabs.find(t => t.snippetId === tabId);
    if (!tab) return;

    if (tab.viewMode === "edit" && tab.editedCode !== tab.snapshot.code) {
       // Check if there are actual changes
       const wantToSave = window.confirm("Le snippet a été modifié. Voulez-vous sauvegarder les modifications ?\n\nOK = Sauvegarder\nAnnuler = Fermer sans sauvegarder");
       
       if (wantToSave) {
          // Save and close
          handleSaveEdit().then(() => {
             closeTabInternal(tabId);
          });
          return;
       } else {
         // Discard and close is implicit if they clicked Cancel on "Save?" usually,
         // BUT window.confirm is boolean.
         // If I want "Cancel = Cancel Closing", I need 3 options. Standard alert doesn't provide 3.
         // Given "validation rapide du Oui avec Entrée", confirm is "OK to Save?". 
         // If Cancel, we should probably Ask "Discard changes?".
         // Let's keep it simple: "Sauvegarder ?" -> OK=Save&Close. Cancel->Proceed to close? Or Cancel=Abort?
         // User requirement: "modale pour proposer la sauvegarde 'oui'/'non'"
         // If I use confirm: "Do you want to save?"
         // Yes -> Save -> Close.
         // No -> Close (Discard).
         // This seems to fit "Oui/Non". "Cancel" acts as No.
         // So I will just proceed to close if they say No.
         closeTabInternal(tabId);
         return;
       }
    }

    closeTabInternal(tabId);
  };

  const closeTabInternal = (tabId: string) => {
    const newTabs = tabs.filter(t => t.snippetId !== tabId);
    setTabs(newTabs);
    
    // If we closed the active tab, activate another one
    if (activeTabId === tabId) {
      // Logic: Go to the one to the right, or left if last.
      // Filtered tabs are already without the closed one.
      // Let's pick the last one in the list (most recently active or added? usually one next to it).
      // Simple logic: pick the last one.
      if (newTabs.length > 0) {
        setActiveTabId(newTabs[newTabs.length - 1].snippetId);
      } else {
        setActiveTabId(null);
      }
    }
  };

  const handleActivateTab = (tabId: string) => {
    setActiveTabId(tabId);
  };


  const handleEdit = () => {
    if (selectedSnippet) {
      setTabs(prev => prev.map(t => 
        t.snippetId === selectedSnippet.id 
          ? { ...t, viewMode: "edit", editedCode: selectedSnippet.code }
          : t
      ));
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
      setTabs(prev => prev.map(t => 
        t.snippetId === selectedSnippet.id 
          ? { ...t, viewMode: "view", snapshot: { ...t.snapshot, code: activeTab.editedCode } }
          : t
      ));
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
      setTabs(prev => prev.map(t => 
        t.snippetId === activeTab.snippetId
          ? { ...t, viewMode: "view", editedCode: "" }
          : t
      ));
    }
  };

  const handleDelete = async () => {
    if (selectedSnippet) {
      await deleteSnippetFn(selectedSnippet.id);
      closeTabInternal(selectedSnippet.id);
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
          setTabs(prev => [...prev, {
             snippetId: newSnippet.id,
             snapshot: newSnippet,
             viewMode: "view",
             editedCode: "",
             collectionId: activeCollectionId || undefined
           }]);
           setActiveTabId(newSnippet.id);
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
         setTabs(prev => [...prev, {
            snippetId: newSnippet.id,
            snapshot: newSnippet,
            viewMode: "view",
            editedCode: "",
            collectionId: activeCollectionId || undefined
          }]);
          setActiveTabId(newSnippet.id);
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
                     setTabs(prev => prev.map(t => 
                        t.snippetId === activeTabId 
                           ? { ...t, editedCode: code }
                           : t
                     ));
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
    </div>
  );
};

export default MesSnippets;
