import React, { useState } from 'react';
import { Icons } from '@/core/helpers/icons';
import { Snippet, Collection } from '../types/index';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';

interface SnippetHeaderProps {
  snippet: Snippet | null;
  collection?: Collection;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onManageDependencies: () => void;
  onRename: (newName: string) => void;
  showSyntaxHighlighting: boolean;
  onToggleSyntaxHighlighting: () => void;
  onManageTags: () => void;
  isWrappedMode?: boolean;
  onToggleWrappedMode?: () => void;
}

const colorClasses: Record<string, { bg: string; text: string; border: string; activeBg: string }> = {
  blue: { bg: 'hover:bg-blue-50 dark:hover:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500', activeBg: 'bg-blue-100 dark:bg-blue-900/30' },
  green: { bg: 'hover:bg-green-50 dark:hover:bg-green-900/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-500', activeBg: 'bg-green-100 dark:bg-green-900/30' },
  purple: { bg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500', activeBg: 'bg-purple-100 dark:bg-purple-900/30' },
  orange: { bg: 'hover:bg-orange-50 dark:hover:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500', activeBg: 'bg-orange-100 dark:bg-orange-900/30' },
  red: { bg: 'hover:bg-red-50 dark:hover:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-500', activeBg: 'bg-red-100 dark:bg-red-900/30' },
  pink: { bg: 'hover:bg-pink-50 dark:hover:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-500', activeBg: 'bg-pink-100 dark:bg-pink-900/30' },
  yellow: { bg: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500', activeBg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  indigo: { bg: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500', activeBg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  teal: { bg: 'hover:bg-teal-50 dark:hover:bg-teal-900/20', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-500', activeBg: 'bg-teal-100 dark:bg-teal-900/30' },
  cyan: { bg: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500', activeBg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  slate: { bg: 'hover:bg-slate-50 dark:hover:bg-slate-700', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500', activeBg: 'bg-slate-100 dark:bg-slate-700' },
  gray: { bg: 'hover:bg-gray-50 dark:hover:bg-gray-700', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-500', activeBg: 'bg-gray-100 dark:bg-gray-700' },
  white: { bg: 'hover:bg-slate-50', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300', activeBg: 'bg-slate-50' },
  black: { bg: 'hover:bg-slate-800', text: 'text-slate-900 dark:text-white', border: 'border-slate-900', activeBg: 'bg-slate-800 dark:bg-slate-900' }
};

export const SnippetHeader: React.FC<SnippetHeaderProps> = ({
  snippet,
  collection,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onManageDependencies,
  onRename,
  showSyntaxHighlighting,
  onToggleSyntaxHighlighting,
  onManageTags,
  isWrappedMode,
  onToggleWrappedMode
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState('');

  const handleDelete = () => {
    onDelete();
    setShowDeleteModal(false);
  };

  const handleStartRename = () => {
    setTempName(snippet?.title || '');
    setIsRenaming(true);
  };

  const handleSaveRename = () => {
    if (tempName.trim()) {
      onRename(tempName);
    }
    setIsRenaming(false);
  };

  const handleCancelRename = () => {
    setIsRenaming(false);
  };

  if (!snippet) return null;

  return (
    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {isRenaming ? (
               <div className="flex items-center gap-2">
                 <input 
                   type="text" 
                   value={tempName}
                   onChange={(e) => setTempName(e.target.value)}
                   className="text-2xl font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 rounded px-2 py-1 outline-none border border-transparent focus:border-blue-500 max-w-md"
                   autoFocus
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') handleSaveRename();
                     if (e.key === 'Escape') handleCancelRename();
                   }}
                 />
                 <button onClick={handleSaveRename} className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded">
                   <Icons.Check className="w-5 h-5" />
                 </button>
                 <button onClick={handleCancelRename} className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                   <Icons.X className="w-5 h-5" />
                 </button>
               </div>
            ) : (
               <div className="flex items-center gap-2 group">
                 <h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate">
                   {snippet.title}
                 </h1>
                 <button 
                   onClick={handleStartRename}
                   className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity"
                   title="Renommer"
                 >
                   <Icons.Edit className="w-4 h-4" />
                 </button>
               </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">  
            

            {/* View Mode Actions */}
            {!isEditing && (
              <div className="flex items-center gap-2">
                 {/* Edit */}
                  <button
                    onClick={onEdit}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                    title="Éditer"
                  >
                    <Icons.Edit className="w-4 h-4" />
                    <span>Éditer</span>
                  </button>

                 {/* Dependencies */}
                 {collection?.name === 'VBA' && (
                  <button
                    onClick={onManageDependencies}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 relative"
                    title="Gérer les dépendances"
                  >
                    <Icons.Layers className="w-4 h-4" />
                    <span>Dépendances</span>
                    {snippet.dependencies && snippet.dependencies.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {snippet.dependencies.length}
                      </span>
                    )}
                  </button>
                 )}


            {/* Separator */}
            {!isEditing && <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>}

                 {/* Syntax Highlight Toggle */}
                 <button
                   onClick={onToggleSyntaxHighlighting}
                   className={`p-1.5 rounded-lg border transition-colors ${
                     showSyntaxHighlighting
                       ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                       : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500'
                   }`}
                   title={showSyntaxHighlighting ? "Désactiver la coloration syntaxique" : "Activer la coloration syntaxique"}
                 >
                   <Icons.Code2 className="w-4 h-4" />
                 </button>

                 {/* VBA Wrapper Toggle */}
                 {collection?.name === 'VBA' && onToggleWrappedMode && (
                   <button
                     onClick={snippet.is_admin_compatible !== false ? onToggleWrappedMode : undefined}
                     disabled={snippet.is_admin_compatible === false}
                     className={`p-1.5 rounded-lg border transition-colors ${
                       isWrappedMode
                         ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400'
                         : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500'
                     } ${snippet.is_admin_compatible === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                     title={snippet.is_admin_compatible === false ? "Non compatible avec l'enrobage" : (isWrappedMode ? "Vue Enrobée" : "Vue Nue")}
                   >
                     <Icons.Package className="w-4 h-4" />
                   </button>
                 )}

                 {/* Trash */}
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="p-1.5 rounded-lg border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Supprimer"
                  >
                    <Icons.Trash2 className="w-4 h-4" />
                  </button>
              </div>
            )}

            {/* Edit Mode Actions */}
            {isEditing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                  <Icons.X className="w-4 h-4" />
                  <span>Annuler</span>
                </button>
                <button
                  onClick={onSave}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2"
                >
                  <Icons.Save className="w-4 h-4" />
                  <span>Sauvegarder</span>
                </button>
              </div>
            )}


            {/* Separator */}
            {!isEditing && <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>}

            {collection && (() => {
               const colors = colorClasses[collection.color || 'blue'] || colorClasses.blue;
               const IconName = collection.icon as keyof typeof Icons;
               const Icon = Icons[IconName] || Icons.Code2;
               
               return (
                 <div className="flex items-center gap-1.5">
                   <Icon className={`w-5 h-5 ${colors.text}`} />
                   <span className={`uppercase tracking-wide font-medium ${colors.text}`}>
                     {collection.name}
                   </span>
                 </div>
               );
            })()}

            
            {/* Separator */}
            {!isEditing && <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>}

            <div className="flex items-center gap-2 group/tags">
                <div className="flex items-center gap-2">
                    {snippet.tags.length > 0 ? (
                        <>
                            {snippet.tags.slice(0, 3).map(tag => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs"
                            >
                                {tag}
                            </span>
                            ))}
                            {snippet.tags.length > 3 && (
                            <span className="text-xs">+{snippet.tags.length - 3}</span>
                            )}
                        </>
                    ) : (
                        <span className="text-xs italic opacity-50">Aucun tag</span>
                    )}
                </div>
                <button
                    onClick={onManageTags}
                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Gérer les tags"
                >
                    <Icons.Tag className="w-3 h-3" />
                </button>
            </div>

            
            {/* Separator */}
            {!isEditing && <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>}

            <div className="flex items-center gap-1.5">
              <Icons.Calendar className="w-4 h-4" />
              <span>
                {new Date(snippet.updatedAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>

          </div>
        </div>

        {/* Edit Mode Actions (Save/Cancel) - Floating Right */}

      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        type="snippet"
        itemName={snippet.title}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
