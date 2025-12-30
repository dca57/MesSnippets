import React from "react";
import { Icons } from "../../../core/helpers/icons";

interface CategorySidebarProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-64 bg-slate-100 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-700 h-full flex flex-col">
      <div className="p-4 border-b border-slate-300 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Icons.Folder className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          Catégories
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors mb-2 ${
            selectedCategory === null
              ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-medium"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50"
          }`}
        >
          <Icons.LayoutGrid className="w-4 h-4" />
          <span>Tout voir</span>
        </button>

        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-3 transition-colors text-sm ${
                selectedCategory === cat
                  ? "bg-white dark:bg-slate-700 shadow-sm text-orange-600 dark:text-orange-400 font-medium"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50"
              }`}
            >
              <Icons.Hash className="w-3 h-3 opacity-70" />
              <span className="truncate">{cat}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
