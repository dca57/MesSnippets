import React, { useState } from "react";
import { Icons } from "@/core/helpers/icons";
import { Category } from "../types/index";
import {
  COLOR_OPTIONS,
  ICON_OPTIONS,
  getColorClasses,
} from "../constants/index";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

interface CategoryModalProps {
  isOpen: boolean;
  categories: Category[];
  collectionId: string | null;
  onClose: () => void;
  onSave: (category: Partial<Category>) => void;
  onDelete: (categoryId: string) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  categories,
  collectionId,
  onClose,
  onSave,
  onDelete,
}) => {
  const [mode, setMode] = useState<"list" | "new" | "edit">("list");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Folder");
  const [color, setColor] = useState("blue");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setMode("list");
      setSelectedCategory(null);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (selectedCategory) {
      setName(selectedCategory.name);
      setDescription(selectedCategory.description || "");
      setIcon(selectedCategory.icon || "Folder");
      setColor(selectedCategory.color || "blue");
    } else {
      setName("");
      setDescription("");
      setIcon("Folder");
      setColor("blue");
    }
  }, [selectedCategory]);

  const handleCreateNew = () => {
    setSelectedCategory(null);
    setMode("new");
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setMode("edit");
  };

  const handleBack = () => {
    setMode("list");
    setSelectedCategory(null);
  };

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        id: selectedCategory?.id,
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        color,
      });
      handleBack();
    }
  };

  const handleDelete = () => {
    if (selectedCategory) {
      onDelete(selectedCategory.id);
      setShowDeleteModal(false);
      handleBack();
    }
  };

  if (!isOpen) return null;

  const IconPreview = (Icons as any)[icon] || Icons.Folder;
  const previewColorClasses = getColorClasses(color);

  // List mode - Select category to edit or create new
  if (mode === "list") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Gérer les catégories
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <button
              onClick={handleCreateNew}
              className="w-full p-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 mb-4"
            >
              <Icons.Plus className="w-5 h-5" />
              <span className="font-medium">Nouvelle catégorie</span>
            </button>

            <div className="space-y-2">
              {categories.length === 0 && (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                  Aucune catégorie. Créez-en une nouvelle !
                </p>
              )}
              {categories.map((category) => {
                const CatIcon =
                  (Icons as any)[category.icon || "Folder"] || Icons.Folder;
                const colorClasses = getColorClasses(category.color || "blue");
                return (
                  <button
                    key={category.id}
                    onClick={() => handleEdit(category)}
                    className="w-full p-4 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-green-500 dark:hover:border-green-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all flex items-center gap-3 text-left group"
                  >
                    <div
                      className={`p-2 rounded-lg ${colorClasses.bgLight} dark:bg-slate-700`}
                    >
                      <CatIcon
                        className={`w-5 h-5 ${colorClasses.text} dark:${colorClasses.textDark}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {category.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {category.description || "Pas de description"}
                      </p>
                    </div>
                    <Icons.ChevronRight className="w-5 h-5 text-[#958FFE] group-hover:text-green-600 dark:group-hover:text-green-400" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end sticky bottom-0 bg-white dark:bg-slate-800">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form mode - Create or Edit
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Icons.ChevronLeft className="w-5 h-5 text-[#958FFE]" />
            </button>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {mode === "edit" ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nom *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Database Utils, API Helpers"
              autoFocus
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Utilitaires pour bases de données"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Icône
            </label>
            <div className="grid grid-cols-11 gap-2">
              {ICON_OPTIONS.map((iconOption) => {
                const IconComp =
                  (Icons as any)[iconOption.value] || Icons.Code2;
                return (
                  <button
                    key={iconOption.value}
                    type="button"
                    onClick={() => setIcon(iconOption.value)}
                    className={`p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                      icon === iconOption.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                        : "border-slate-200 dark:border-slate-600 hover:border-slate-300"
                    }`}
                    title={iconOption.label}
                  >
                    <IconComp className="w-4 h-4 mx-auto text-slate-700 dark:text-slate-300" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Couleur
            </label>
            <div className="grid grid-cols-14 gap-2">
              {COLOR_OPTIONS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`h-6 rounded-lg border-0.5 transition-all hover:scale-105 ${
                    color === colorOption.value
                      ? "border-slate-900 dark:border-white ring-1 ring-offset-1 ring-slate-900 dark:ring-white"
                      : "border-slate-200 dark:border-slate-600"
                  } ${colorOption.class}`}
                  title={colorOption.label}
                />
              ))}
            </div>
          </div>

          <div className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
              Aperçu
            </p>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${previewColorClasses.bgLight}`}>
                <IconPreview
                  className={`w-5 h-5 ${previewColorClasses.text}`}
                />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {name || "Nom de la catégorie"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {description || "Description"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between sticky bottom-0 bg-white dark:bg-slate-800">
          <div>
            {selectedCategory && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
              >
                <Icons.Trash2 className="w-4 h-4" />
                <span>Supprimer</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Icons.Save className="w-4 h-4" />
              <span>{mode === "edit" ? "Mettre à jour" : "Créer"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        type="category"
        itemName={selectedCategory?.name || ""}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
