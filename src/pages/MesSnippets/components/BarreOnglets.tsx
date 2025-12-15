import React, { useRef, useEffect } from "react";
import { Icons } from "@/core/helpers/icons";

export interface Tab {
  id: string; // Typically the snippet ID
  title: string;
  isDirty: boolean; // Has unsaved changes
  collectionName?: string; // For visual context if needed
  isActive: boolean;
}

interface BarreOngletsProps {
  tabs: Tab[];
  onActivateTab: (tabId: string) => void;
  onCloseTab: (tabId: string, e: React.MouseEvent) => void;
  showLimitReached?: boolean;
}

export const BarreOnglets: React.FC<BarreOngletsProps> = ({
  tabs,
  onActivateTab,
  onCloseTab,
  showLimitReached,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to scroll active tab into view - simple version
  useEffect(() => {
    // You could implement logic to scroll the active tab into view here
  }, [tabs]);

  if (tabs.length === 0) return null;

  return (
    <div 
      className={`
        flex items-end gap-1 px-4 pt-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 
        overflow-x-auto overflow-y-hidden no-scrollbar transition-transform duration-200
        ${showLimitReached ? "animate-shake ring-2 ring-red-500/50 bg-red-50 dark:bg-red-900/20" : ""}
      `}
      ref={containerRef}
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => onActivateTab(tab.id)}
          className={`
            group relative flex items-center gap-2 px-4 py-2 rounded-t-lg border-t border-l border-r cursor-pointer select-none transition-all
            min-w-[120px] max-w-[200px]
            ${
              tab.isActive
                ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white mb-[-1px] z-10"
                : "bg-slate-200 dark:bg-slate-800/40 border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-800"
            }
          `}
          title={`${tab.title}${tab.isDirty ? ' (Modifié)' : ''}`}
        >
          {/* File Icon */}
          <Icons.FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${
              tab.isActive ? "text-blue-600 dark:text-blue-400" : "opacity-70"
          }`} />

          {/* Title */}
          <span className="text-xs font-medium truncate flex-1">
            {tab.title}
          </span>

          {/* Unsaved Indicator (Dot) */}
          {tab.isDirty && (
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
          )}

          {/* Close Button */}
          <button
            onClick={(e) => onCloseTab(tab.id, e)}
            className={`
              p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity
              hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500
              ${tab.isActive ? "opacity-100" : ""} 
            `}
          >
            <Icons.X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};
