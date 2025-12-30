import React from "react";
import { Icons } from "../../../core/helpers/icons";
import { SniFichier } from "../types";

interface FileListProps {
  files: SniFichier[];
  onDownload: (file: SniFichier) => void;
  onDelete: (file: SniFichier) => void;
  isLoading: boolean;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onDownload,
  onDelete,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Icons.Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
        <Icons.FileText className="w-12 h-12 mb-4 opacity-30" />
        <p>Aucun fichier trouvé dans cette catégorie.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Icons.FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {file.categorie}
                  </span>
                </div>
                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onDownload(file)}
                        className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md transition-colors"
                        title="Télécharger"
                    >
                        <Icons.Download className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(file)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Supprimer"
                    >
                        <Icons.Trash className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            <h3 className="font-medium text-slate-800 dark:text-slate-200 truncate mb-1" title={file.titre}>
              {file.titre}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-3" title={file.nom_fichier}>
              {file.nom_fichier}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400">
            <span>{new Date(file.created_at).toLocaleDateString()}</span>
            <span>{file.taille} Mo</span>
          </div>
        </div>
      ))}
    </div>
  );
};
