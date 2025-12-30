import React, { useState, useEffect } from "react";
import { Icons } from "../../../core/helpers/icons";
import { FileUploadPayload } from "../types";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (payload: FileUploadPayload) => Promise<void>;
  existingCategories: string[];
  initialFile?: File | null;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  existingCategories,
  initialFile,
}) => {
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [titre, setTitre] = useState("");
  const [categorie, setCategorie] = useState("");
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && initialFile) {
        setFile(initialFile);
        // Default title to filename without extension
        setTitre(initialFile.name.split('.').slice(0, -1).join('.'));
    }
    if (!isOpen) {
        // Reset form
        setFile(null);
        setTitre("");
        setCategorie("");
        setIsNewCategory(false);
        setNewCategoryName("");
    }
  }, [isOpen, initialFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !titre || (!categorie && !newCategoryName)) return;

    const finalCategory = isNewCategory ? newCategoryName : categorie;
    
    try {
        setIsSubmitting(true);
        await onUpload({
            file,
            titre,
            categorie: finalCategory
        });
        onClose();
    } catch (error) {
        console.error("Upload failed", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Icons.Upload className="w-5 h-5 text-orange-600" />
            Ajouter un Fichier
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Info */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Fichier
                </label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded text-orange-600 dark:text-orange-400">
                        <Icons.FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                            {file?.name || "Aucun fichier sélectionné"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {file ? `${(file.size / 1024 / 1024).toFixed(2)} Mo` : ""}
                        </p>
                    </div>
                </div>
            </div>

            {/* Titre */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Titre
                </label>
                <input
                    type="text"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                    placeholder="Ex: Facture edf..."
                    required
                />
            </div>

            {/* Catégorie */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Catégorie
                </label>
                {!isNewCategory ? (
                    <div className="flex gap-2">
                        <select
                            value={categorie}
                            onChange={(e) => setCategorie(e.target.value)}
                            className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                            required={!isNewCategory}
                        >
                            <option value="">Sélectionner une catégorie...</option>
                            {existingCategories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => setIsNewCategory(true)}
                            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            title="Nouvelle catégorie"
                        >
                            <Icons.Plus className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                            placeholder="Nouvelle catégorie..."
                            required={isNewCategory}
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setIsNewCategory(false)}
                            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            title="Annuler"
                        >
                            <Icons.X className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    disabled={isSubmitting}
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Icons.Loader2 className="w-4 h-4 animate-spin" />
                            Envoi en cours...
                        </>
                    ) : (
                        <>
                            <Icons.Save className="w-4 h-4" />
                            Enregistrer
                        </>
                    )}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
