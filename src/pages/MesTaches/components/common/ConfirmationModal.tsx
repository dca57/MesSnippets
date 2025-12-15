
import React from 'react';
import { Icons } from '../../helpers/icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-sm mx-4 overflow-hidden border border-slate-200 dark:border-slate-800 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
            <Icons.AlertTriangle size={20} />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">
            {title}
          </h3>
        </div>
        
        <div className="p-4">
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Icons.Trash2 size={14} />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};
