import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Icons } from '@/core/helpers/icons';
import { Snippet, Category } from '../types/index';
import { wrapVBACode } from '@/core/helpers/vbaWrapper';

interface SnippetEditorProps {
  snippet: Snippet | null;
  language: string;
  isEditing: boolean;
  editedCode: string;
  onCodeChange: (code: string) => void;
  allSnippets?: Snippet[];
  categories?: Category[];
  showSyntaxHighlighting?: boolean;
  isWrappedMode?: boolean;
  isVBACollection?: boolean;
  collectionName?: string;
}

export const SnippetEditor: React.FC<SnippetEditorProps> = ({
  snippet,
  language,
  isEditing,
  editedCode,
  onCodeChange,
  allSnippets = [],
  categories = [],
  showSyntaxHighlighting = true,
  isWrappedMode = false,
  isVBACollection = false,
  collectionName
}) => {
  const [copied, setCopied] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
  const [copiedDepId, setCopiedDepId] = useState<string | null>(null);
  const [expandedDependencies, setExpandedDependencies] = useState<Set<string>>(new Set());
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains('dark')
  );

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const displayCode = React.useMemo(() => {
    if (!snippet) return '';
    return isWrappedMode ? wrapVBACode(snippet.code) : snippet.code;
  }, [snippet, isWrappedMode]);

  const handleCopy = async () => {
    const code = isEditing ? editedCode : displayCode;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyDependency = async (depSnippet: Snippet) => {
    const code = isWrappedMode ? wrapVBACode(depSnippet.code) : depSnippet.code;
    await navigator.clipboard.writeText(code);
    setCopiedDepId(depSnippet.id);
    setTimeout(() => setCopiedDepId(null), 2000);
  };

  const toggleDependencies = () => {
    setShowDependencies(!showDependencies);
  };

  const toggleDependencyExpansion = (snippetId: string) => {
    setExpandedDependencies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(snippetId)) {
        newSet.delete(snippetId);
      } else {
        newSet.add(snippetId);
      }
      return newSet;
    });
  };

  // Get dependency snippets
  const getDependencySnippets = (snippetId: string): Snippet[] => {
    const snippet = allSnippets.find(s => s.id === snippetId);
    if (!snippet || !snippet.dependencies || snippet.dependencies.length === 0) return [];
    return snippet.dependencies
      .map(depId => allSnippets.find(s => s.id === depId))
      .filter(Boolean) as Snippet[];
  };

  const dependencySnippets = React.useMemo(() => {
    if (!snippet || !snippet.dependencies || snippet.dependencies.length === 0) return [];
    return getDependencySnippets(snippet.id);
  }, [snippet, allSnippets]);

  const hasDependencies = dependencySnippets.length > 0;

  // Get category name for a snippet
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  // Recursive component to render dependencies
  const DependencyItem: React.FC<{
    depSnippet: Snippet;
    level: number;
    visitedIds: Set<string>;
  }> = ({ depSnippet, level, visitedIds }) => {
    const isExpanded = expandedDependencies.has(depSnippet.id);
    const subDependencies = getDependencySnippets(depSnippet.id);
    const hasSubDependencies = subDependencies.length > 0;
    
    // Prevent circular dependencies
    const newVisitedIds = new Set(visitedIds);
    newVisitedIds.add(depSnippet.id);
    
    const filteredSubDependencies = subDependencies.filter(
      sub => !newVisitedIds.has(sub.id)
    );

    const indentClass = level === 0 ? '' : `ml-${Math.min(level * 8, 16)}`;
    
    const depDisplayCode = isWrappedMode ? wrapVBACode(depSnippet.code) : depSnippet.code;

    return (
      <div className={indentClass}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-slate-900 dark:text-slate-100 font-semibold">
              {depSnippet.title}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-sm">
              ({getCategoryName(depSnippet.categoryId)})
            </span>
            {hasSubDependencies && (
              <button
                onClick={() => toggleDependencyExpansion(depSnippet.id)}
                className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                title={isExpanded ? "Masquer les sous-dépendances" : "Afficher les sous-dépendances"}
              >
                {isExpanded ? (
                  <Icons.EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Icons.Eye className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
          <button
            onClick={() => handleCopyDependency(depSnippet)}
            className={`px-3 py-1.5 rounded-lg transition-all shadow flex items-center gap-2 text-sm ${
              copiedDepId === depSnippet.id
                ? 'bg-green-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
            title="Copier ce snippet"
          >
            {copiedDepId === depSnippet.id ? (
              <>
                <Icons.Check className="w-3.5 h-3.5" />
                <span>Copié</span>
              </>
            ) : (
              <>
                <Icons.Copy className="w-3.5 h-3.5" />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>
        <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 mb-4">
          {showSyntaxHighlighting ? (
            <SyntaxHighlighter
              language={language}
              style={isDark ? vscDarkPlus : oneLight}
              showLineNumbers
              customStyle={{
                margin: 0,
                fontSize: '13px',
                backgroundColor: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 0.5)'
              }}
              codeTagProps={{
                style: {
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
                }
              }}
            >
              {depDisplayCode}
            </SyntaxHighlighter>
          ) : (
            <pre className="p-4 bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 font-mono text-[13px] overflow-x-auto whitespace-pre-wrap">
              {depDisplayCode}
            </pre>
          )}
        </div>

        {/* Recursive sub-dependencies */}
        {isExpanded && filteredSubDependencies.length > 0 && (
          <div className="ml-8 border-l-2 border-blue-200 dark:border-blue-800 pl-4 mb-4">
            {filteredSubDependencies.map(subDep => (
              <DependencyItem
                key={subDep.id}
                depSnippet={subDep}
                level={level + 1}
                visitedIds={newVisitedIds}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!snippet) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Icons.FileCode className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Aucun snippet sélectionné
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sélectionnez un snippet dans la barre latérale ou créez-en un nouveau
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800">
      <div className="flex-1 overflow-hidden relative">
        {isEditing ? (
          <textarea
            value={editedCode}
            onChange={(e) => onCodeChange(e.target.value)}
            className="w-full h-full p-4 font-mono text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-none outline-none resize-none"
            spellCheck={false}
          />
        ) : (
          <div className="h-full overflow-auto">
            {showSyntaxHighlighting ? (
              <SyntaxHighlighter
                language={language}
                style={isDark ? vscDarkPlus : oneLight}
                showLineNumbers
                customStyle={{
                  margin: 0,
                  fontSize: '13px',
                  backgroundColor: 'transparent',
                  paddingBottom: showDependencies && hasDependencies ? '2rem' : '1rem',
                  whiteSpace: language === 'markdown' ? 'pre-wrap' : 'pre',
                  wordBreak: language === 'markdown' ? 'break-word' : 'normal',
                }}
                wrapLines={language === 'markdown'}
                wrapLongLines={language === 'markdown'}
                codeTagProps={{
                  style: {
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    whiteSpace: language === 'markdown' ? 'pre-wrap' : 'inherit',
                  }
                }}
              >
                {displayCode}
              </SyntaxHighlighter>
            ) : (
              <pre className={`p-4 font-mono text-[13px] text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap ${
                 showDependencies && hasDependencies ? 'pb-8' : ''
              } ${language === 'markdown' ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'}`}>
                {displayCode}
              </pre>
            )}

            {/* Dependencies Code */}
            {showDependencies && hasDependencies && (
              <div className="px-4 pb-8">
                <div className="flex items-center gap-3 mb-6 mt-8">
                  <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700"></div>
                  <span className="text-slate-600 dark:text-slate-400 font-semibold text-sm uppercase tracking-wider">
                    Dépendance{dependencySnippets.length > 1 ? 's' : ''}
                  </span>
                  <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700"></div>
                </div>

                {dependencySnippets.map(depSnippet => (
                  <DependencyItem
                    key={depSnippet.id}
                    depSnippet={depSnippet}
                    level={0}
                    visitedIds={new Set([snippet.id])}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Floating Action Buttons */}
        {!isEditing && (
          <div className="absolute top-4 right-4 flex gap-2">
            {isVBACollection && hasDependencies && (
              <button
                onClick={toggleDependencies}
                className={`px-3 py-2 rounded-lg shadow-lg transition-all ${
                  showDependencies
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
                title={showDependencies ? "Masquer les dépendances" : "Afficher les dépendances"}
              >
                <div className="flex items-center gap-2">
                  {showDependencies ? (
                    <Icons.EyeOff className="w-4 h-4" />
                  ) : (
                    <Icons.Eye className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">Dépendances</span>
                </div>
              </button>
            )}
            <button
              onClick={handleCopy}
              className={`px-3 py-2 rounded-lg shadow-lg transition-all ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                {copied ? (
                  <>
                    <Icons.Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Copié !</span>
                  </>
                ) : (
                  <>
                    <Icons.Copy className="w-4 h-4" />
                    <span className="text-sm font-medium">Copier</span>
                  </>
                )}
              </div>
            </button>
            {collectionName === 'VBS' && (
              <button
                onClick={() => {
                  const blob = new Blob([displayCode], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${snippet?.title || 'snippet'}.vbs`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-2 rounded-lg shadow-lg transition-all bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                title="Télécharger en .vbs"
              >
                <div className="flex items-center gap-2">
                  <Icons.Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Télécharger .vbs</span>
                </div>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
