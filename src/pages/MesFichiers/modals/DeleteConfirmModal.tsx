import React from "react";
import { Icons } from "../../../core/helpers/icons";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fileName?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fileName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm p-6 m-4 animate-in fade-in zoom-in-95 duration-200 border border-red-200 dark:border-red-900/30">
        <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 text-red-600 dark:text-red-500">
                <Icons.AlertTriangle className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Confirmer la suppression
            </h3>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Êtes-vous sûr de vouloir supprimer <span className="font-medium text-slate-800 dark:text-slate-200">"{fileName}"</span> ? 
                Cette action est irréversible.
            </p>

            <div className="flex gap-3 w-full">
                <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                >
                    Annuler
                </button>
                <button
                    onClick={onConfirm}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                >
                    Supprimer
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
