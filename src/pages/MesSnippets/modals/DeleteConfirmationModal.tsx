import React, { useState } from 'react';
import { Icons } from '@/core/helpers/icons';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  type: 'snippet' | 'category' | 'collection';
  itemName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  type,
  itemName,
  onClose,
  onConfirm
}) => {
  const [confirmName, setConfirmName] = useState('');
  
  const needsNameConfirmation = type === 'category' || type === 'collection';
  const canDelete = needsNameConfirmation ? confirmName === itemName : true;

  React.useEffect(() => {
    if (isOpen) {
      setConfirmName('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (canDelete) {
      onConfirm();
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canDelete) {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const getWarningMessage = () => {
    switch (type) {
      case 'collection':
        return (
          <>
            <p className="text-slate-700 dark:text-slate-300 mb-3">
              Vous êtes sur le point de supprimer la collection <strong className="font-semibold text-red-600 dark:text-red-400">"{itemName}"</strong>.
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <div className="flex gap-3">
                <Icons.AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="font-semibold mb-1">Action irréversible !</p>
                  <p>Toutes les catégories et tous les snippets de cette collection seront définitivement supprimés.</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Pour confirmer, veuillez saisir le nom exact de la collection :
            </p>
          </>
        );
      case 'category':
        return (
          <>
            <p className="text-slate-700 dark:text-slate-300 mb-3">
              Vous êtes sur le point de supprimer la catégorie <strong className="font-semibold text-red-600 dark:text-red-400">"{itemName}"</strong>.
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <div className="flex gap-3">
                <Icons.AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="font-semibold mb-1">Action irréversible !</p>
                  <p>Tous les snippets de cette catégorie seront définitivement supprimés.</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Pour confirmer, veuillez saisir le nom exact de la catégorie :
            </p>
          </>
        );
      case 'snippet':
        return (
          <p className="text-slate-700 dark:text-slate-300">
            Voulez-vous vraiment supprimer le snippet <strong className="font-semibold">"{itemName}"</strong> ?
          </p>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg m-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Confirmer la suppression
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {getWarningMessage()}
          
          {needsNameConfirmation && (
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Tapez "${itemName}" pour confirmer`}
              autoFocus
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canDelete}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Icons.Trash2 className="w-4 h-4" />
            <span>Supprimer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
