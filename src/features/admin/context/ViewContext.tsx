import React, { createContext, useContext, useState, useEffect } from "react";

interface ViewContextType {
  showContent: boolean;
  setShowContent: (show: boolean) => void;
  viewMode: "grid" | "compact";
  setViewMode: (mode: "grid" | "compact") => void;
  globalFavoritesOnly: boolean;
  setGlobalFavoritesOnly: (only: boolean) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Show Content State (Persisted)
  const [showContent, setShowContent] = useState(() => {
    const saved = localStorage.getItem("MesSnippets_showContent");
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("MesSnippets_showContent", String(showContent));
  }, [showContent]);

  // View Mode State (Persisted)
  const [viewMode, setViewMode] = useState<"grid" | "compact">(() => {
    const saved = localStorage.getItem("MesSnippets_viewMode");
    return saved === "compact" ? "compact" : "grid";
  });

  useEffect(() => {
    localStorage.setItem("MesSnippets_viewMode", viewMode);
  }, [viewMode]);

  // Global Favorites Toggle (Not persisted, resets on reload)
  const [globalFavoritesOnly, setGlobalFavoritesOnly] = useState(false);

  return (
    <ViewContext.Provider
      value={{
        showContent,
        setShowContent,
        viewMode,
        setViewMode,
        globalFavoritesOnly,
        setGlobalFavoritesOnly,
      }}
    >
      {children}
    </ViewContext.Provider>
  );
};

export const useViewContext = () => {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error("useViewContext must be used within a ViewProvider");
  }
  return context;
};
