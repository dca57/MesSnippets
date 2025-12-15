import React from "react";
import { Icons } from "@/core/helpers/icons";
import { Collection } from "../types/index";
import { getColorClasses } from "../constants";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CollectionSelectorProps {
  collections: Collection[];
  activeCollectionId: string | null;
  onSelectCollection: (collectionId: string) => void;
  onManageCollections: () => void;
  onReorderCollections?: (collections: Collection[]) => void;
}

interface SortableCollectionItemProps {
  collection: Collection;
  isActive: boolean;
  onSelect: () => void;
}

const SortableCollectionItem: React.FC<SortableCollectionItemProps> = ({
  collection,
  isActive,
  onSelect,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: collection.id });

  const style = {
    transform: CSS.Transform.toString(transform ? { ...transform, y: 0 } : null),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getIcon = (collection: Collection) => {
    const iconName = collection.icon || "Code2";
    const IconComponent = (Icons as any)[iconName] || Icons.Code2;
    return <IconComponent className="w-4 h-4" />;
  };

  const colors = getColorClasses(collection.color || "blue");

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <button
        onClick={onSelect}
        className={`
          flex items-center gap-1 px-2 py-1 rounded-lg border transition-all cursor-grab active:cursor-grabbing
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
    </div>
  );
};

export const CollectionSelector: React.FC<CollectionSelectorProps> = ({
  collections,
  activeCollectionId,
  onSelectCollection,
  onManageCollections,
  onReorderCollections,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8, // Avoid accidental drags when clicking
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
       if (onReorderCollections) {
          const oldIndex = collections.findIndex((c) => c.id === active.id);
          const newIndex = collections.findIndex((c) => c.id === over?.id);
          onReorderCollections(arrayMove(collections, oldIndex, newIndex));
       }
    }
  };

  return (
    <div className="flex px-0">
      <div className="flex items-center justify-between gap-2 overflow-x-auto overflow-y-hidden no-scrollbar">
        <h3 className="text-xl font-semibold text-slate-500 dark:text-slate-400 tracking-wider flex-shrink-0">
          COLLECTIONS :
        </h3>

        {/* Tabs with DnD */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={collections.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex items-center gap-2">
              {collections.map((collection) => (
                <SortableCollectionItem
                  key={collection.id}
                  collection={collection}
                  isActive={collection.id === activeCollectionId}
                  onSelect={() => onSelectCollection(collection.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <button
          onClick={onManageCollections}
          className="flex items-center gap-1 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
          title="Gérer les collections"
        >
          <Icons.Settings className="w-5 h-5 text-green-700" />
        </button>
      </div>
    </div>
  );
};
