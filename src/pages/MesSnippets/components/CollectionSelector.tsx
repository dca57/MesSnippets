import React from "react";
import { Icons } from "@/core/helpers/icons";
import { Collection } from "../types/index";
import { getColorClasses } from "../constants";

interface CollectionSelectorProps {
  collections: Collection[];
  activeCollectionId: string | null;
  onSelectCollection: (collectionId: string) => void;
  onManageCollections: () => void;
}

export const CollectionSelector: React.FC<CollectionSelectorProps> = ({
  collections,
  activeCollectionId,
  onSelectCollection,
  onManageCollections,
}) => {
  const getIcon = (collection: Collection) => {
    const iconName = collection.icon || "Code2";
    const IconComponent = (Icons as any)[iconName] || Icons.Code2;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="flex px-0">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xl font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
          COLLECTIONS :
        </h3>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          {collections.map((collection) => {
            const isActive = collection.id === activeCollectionId;
            const colors = getColorClasses(collection.color || "blue");

            return (
              <button
                key={collection.id}
                onClick={() => onSelectCollection(collection.id)}
                className={`
                flex items-center gap-1 px-2 py-1 rounded-lg border transition-all
                ${
                  isActive
                    ? `${colors.bgLight} ${colors.text} ${colors.border} border-2 font-semibold`
                    : `border-slate-200 dark:border-slate-600 ${colors.hoverBg} text-slate-700 dark:text-slate-300`
                }
              `}
              >
                <span className={isActive ? colors.text : "text-slate-500"}>
                  {getIcon(collection)}
                </span>
                <span className="text-sm">{collection.name}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onManageCollections}
          className="flex items-center gap-1 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="Gérer les collections"
        >
          <Icons.Settings className="w-5 h-5 text-green-700" />
        </button>
      </div>
    </div>
  );
};
