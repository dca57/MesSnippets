import React from 'react';
import { Icons } from '@/core/helpers/icons';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  onDiscard?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  discardLabel?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  title = "Confirmation", 
  message, 
  onConfirm, 
  onCancel,
  onDiscard,
  confirmLabel = "Oui",
  cancelLabel = "Annuler",
  discardLabel = "Non"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden border border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 text-amber-500 dark:text-amber-400">
             <Icons.AlertTriangle className="w-8 h-8" />
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
          </div>
          
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            {message}
          </p>

          <div className="flex justify-end gap-3">
             {/* Cancel Button */}
             <button
              onClick={onCancel}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium border border-transparent"
             >
                {cancelLabel}
             </button>

             {/* Discard Button (Non) */}
             {onDiscard && (
                <button
                    onClick={onDiscard}
                    className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium border border-transparent"
                >
                    {discardLabel}
                </button>
             )}

             {/* Confirm Button (Oui) */}
             <button
              onClick={onConfirm}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-bold shadow-sm"
             >
                {confirmLabel}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
