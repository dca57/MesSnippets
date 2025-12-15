import React, { createContext, useContext, useState, useCallback } from 'react';

interface HeaderActions {
  onMagicClean?: () => void;
  onManageCategories?: () => void;
  onAddBookmark?: () => void;
}

interface HeaderActionContextType {
  actions: HeaderActions;
  setActions: (actions: HeaderActions) => void;
}

const HeaderActionContext = createContext<HeaderActionContextType | undefined>(undefined);

export const HeaderActionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [actions, setActionsState] = useState<HeaderActions>({});

  const setActions = useCallback((newActions: HeaderActions) => {
    setActionsState(newActions);
  }, []);

  return (
    <HeaderActionContext.Provider value={{ actions, setActions }}>
      {children}
    </HeaderActionContext.Provider>
  );
};

export const useHeaderActions = () => {
  const context = useContext(HeaderActionContext);
  if (context === undefined) {
    throw new Error('useHeaderActions must be used within a HeaderActionProvider');
  }
  return context;
};
