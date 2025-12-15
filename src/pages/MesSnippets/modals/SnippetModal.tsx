import React, { useState } from 'react';
import { Icons } from '@/core/helpers/icons';
import { Snippet, Category } from '../types/index';

interface SnippetModalProps {
  isOpen: boolean;
  snippet: Snippet | null;
  categories: Category[];
  preSelectedCategoryId?: string | null;
  onClose: () => void;
  onSave: (snippet: Partial<Snippet>) => void;
}

export const SnippetModal: React.FC<SnippetModalProps> = ({
  isOpen,
  snippet,
  categories,
  preSelectedCategoryId,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState(snippet?.title || '');
  const [code, setCode] = useState(snippet?.code || '');
  const [categoryId, setCategoryId] = useState(snippet?.categoryId || preSelectedCategoryId || '');
  const [tagsInput, setTagsInput] = useState(snippet?.tags.join(', ') || '');

  React.useEffect(() => {
    if (snippet) {
      setTitle(snippet.title);
      setCode(snippet.code);
      setCategoryId(snippet.categoryId);
      setTagsInput(snippet.tags.join(', '));
    } else {
      setTitle('');
      setCode('');
      setCategoryId(preSelectedCategoryId || '');
      setTagsInput('');
    }
  }, [snippet, preSelectedCategoryId]);

  const handleSave = () => {
    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onSave({
      id: snippet?.id,
      title,
      code,
      categoryId,
      tags,

      updatedAt: new Date().toISOString()
    });

    onClose();
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col m-4">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {snippet ? 'Éditer le snippet' : 'Nouveau snippet'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: FCT_FSO_ExisteFichier"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>



          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Ex: fso, file, verification"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Code VBA
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Collez ou saisissez votre code VBA ici..."
              rows={20}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!title || !categoryId}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Icons.Save className="w-4 h-4" />
            <span>Sauvegarder</span>
          </button>
        </div>
      </div>
    </div>
  );
};
