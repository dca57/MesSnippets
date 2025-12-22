import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Snippet, ViewMode } from '../types';

interface TabState {
  snippetId: string;
  snapshot: Snippet;
  viewMode: ViewMode;
  editedCode: string;
  collectionId?: string;
}

interface SnippetUiState {
  // Navigation State
  activeCollectionId: string | null;
  setActiveCollectionId: (id: string | null) => void;

  // Tabs State
  tabs: TabState[];
  activeTabId: string | null;
  addTab: (tab: TabState) => void;
  closeTab: (snippetId: string) => void;
  setActiveTabId: (id: string | null) => void;
  updateTab: (snippetId: string, updates: Partial<TabState>) => void;
  setTabs: (tabs: TabState[]) => void; // For reordering or bulk updates

  // Sidebar State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useSnippetUiStore = create<SnippetUiState>()(
  persist(
    (set) => ({
      activeCollectionId: null,
      setActiveCollectionId: (id) => set({ activeCollectionId: id }),

      tabs: [],
      activeTabId: null,
      
      addTab: (tab) => set((state) => {
        // Prevent duplicates
        if (state.tabs.some(t => t.snippetId === tab.snippetId)) {
            return { activeTabId: tab.snippetId };
        }
        return { 
            tabs: [...state.tabs, tab],
            activeTabId: tab.snippetId 
        };
      }),

      closeTab: (snippetId) => set((state) => {
        const newTabs = state.tabs.filter(t => t.snippetId !== snippetId);
        let newActiveId = state.activeTabId;
        
        if (state.activeTabId === snippetId) {
            newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].snippetId : null;
        }
        
        return {
            tabs: newTabs,
            activeTabId: newActiveId
        };
      }),

      setActiveTabId: (id) => set({ activeTabId: id }),

      updateTab: (snippetId, updates) => set((state) => ({
        tabs: state.tabs.map(t => t.snippetId === snippetId ? { ...t, ...updates } : t)
      })),

      setTabs: (tabs) => set({ tabs }),

      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
    }),
    {
      name: 'sni-mes-snippets-ui-storage', // Persist in localStorage to survive refresh if desired, or session
      partialize: (state) => ({ 
        activeCollectionId: state.activeCollectionId,
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        isSidebarOpen: state.isSidebarOpen
      }),
    }
  )
);
