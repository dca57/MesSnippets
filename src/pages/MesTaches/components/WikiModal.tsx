
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../helpers/icons';
import { cn } from '../helpers/utils';
import { Project } from '../types/types';

interface WikiModalProps {
  project: Project;
  onClose: () => void;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
}

const WIKI_SECTIONS = [
  "Généralités",
  "Chemin Accès",
  "Collaborateurs",
  "Astuces Métiers",
  "Audit Application",
  "Points Bloquants",
  "Cahier de Recettes",
  "Check List Livraison",
  "Historique Versions",
  "Doc User Guide",
  "Doc Specs",
  "How To",
  "Autres"
];

export const WikiModal = ({ project, onClose, onUpdateProject }: WikiModalProps) => {
  const [activeSection, setActiveSection] = useState<string>(WIKI_SECTIONS[0]);
  const [content, setContent] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Initialize content when modal opens or section changes
  const activeSectionRef = useRef(activeSection);
  const contentRef = useRef(content);

  // Sync refs
  useEffect(() => { activeSectionRef.current = activeSection; }, [activeSection]);
  useEffect(() => { contentRef.current = content; }, [content]);

  // Load content when section changes
  useEffect(() => {
    const savedContent = project.wiki?.[activeSection] || '';
    setContent(savedContent);
  }, [activeSection, project.wiki]);

  const handleSave = (section: string, text: string) => {
    const currentSaved = project.wiki?.[section] || '';
    if (text === currentSaved) return;

    onUpdateProject(project.id, {
      wiki: {
        ...(project.wiki || {}),
        [section]: text
      }
    });
  };

  const handleSectionChange = (newSection: string) => {
    handleSave(activeSection, content);
    setActiveSection(newSection);
  };

  const handleClose = () => {
    handleSave(activeSection, content);
    onClose();
  };
  
  const handleCopy = async () => {
      try {
          await navigator.clipboard.writeText(content);
          setCopyFeedback(true);
          setTimeout(() => setCopyFeedback(false), 2000);
      } catch (err) {
          console.error('Failed to copy', err);
      }
  };

  const handleScroll = () => {
      if (textareaRef.current && preRef.current) {
          preRef.current.scrollTop = textareaRef.current.scrollTop;
      }
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, content]);

  // Highlight Logic
  const renderHighlightedContent = (text: string) => {
      // We need to preserve trailing newlines for the overlay to match the textarea exactly
      const lines = text.split('\n');
      return lines.map((line, i) => {
          let className = "text-slate-700 dark:text-slate-300";
          
          if (line.startsWith('#')) {
              className = "text-blue-600 dark:text-blue-400 font-bold";
              // We just use the simple class to avoid layout shifts (borders/margins) that break alignment
          } else if (line.trim().startsWith('-')) {
              return (
                  <div key={i} className="relative">
                      <span className="text-blue-500 font-bold">- </span>
                      <span className="text-slate-700 dark:text-slate-300">{line.trim().substring(2) || ' '}</span>
                   </div>
              );
          }

          // Return standard line
          return (
             <div key={i} className={className}>
                 {line || ' '} 
             </div>
          );
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col border border-slate-200 dark:border-slate-700 overflow-hidden">
            
            {/* HEADER */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                        <Icons.BookOpen size={18} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Wiki du Projet</h2>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">{project.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                         onClick={handleCopy}
                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                         title="Copier le contenu"
                    >
                         {copyFeedback ? <Icons.CheckCircle size={14} className="text-green-500" /> : <Icons.FileText size={14} />}
                         {copyFeedback ? "Copié !" : "Copier"}
                    </button>
                    
                    <button 
                        onClick={handleClose}
                        className="ml-2 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors"
                    >
                        <Icons.X size={18} />
                    </button>
                </div>
            </div>

            {/* BODY */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* SIDEBAR */}
                <div className="w-56 flex flex-col border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/20 overflow-y-auto">
                    <div className="p-2 space-y-0.5">
                        {WIKI_SECTIONS.map((section) => {
                            const isActive = activeSection === section;
                            const hasContent = !!project.wiki?.[section]?.trim();
                            
                            return (
                                <button
                                    key={section}
                                    onClick={() => handleSectionChange(section)}
                                    className={cn(
                                        "w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center justify-between group",
                                        isActive 
                                            ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700" 
                                            : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                                    )}
                                >
                                    <span>{section}</span>
                                    {hasContent && (
                                        <span className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            isActive ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600"
                                        )} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* CONTENT AREA (OVERLAY EDITOR) */}
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 relative">
                     {/* Editor Container - Compact Mode */}
                     <div className="flex-1 relative font-mono text-sm leading-snug">
                         {/* Backdrop (Highlighter) */}
                         <pre
                            ref={preRef}
                            className="absolute inset-0 p-4 m-0 whitespace-pre-wrap break-words overflow-hidden pointer-events-none"
                            aria-hidden="true"
                         >
                             {renderHighlightedContent(content)}
                             {/* Extra space for scroll matching */}
                             <br /> 
                         </pre>

                         {/* Foreground (Input) */}
                         <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onScroll={handleScroll}
                            onBlur={() => handleSave(activeSection, content)}
                            placeholder={`Saisissez vos notes pour la section "${activeSection}" ici...`}
                            className="absolute inset-0 w-full h-full p-4 resize-none outline-none bg-transparent text-transparent caret-slate-900 dark:caret-white whitespace-pre-wrap break-words overflow-y-auto"
                            spellCheck={false}
                            autoFocus
                         />
                     </div>
                    
                    {/* FOOTER STATUS */}
                    <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between items-center z-20 relative">
                        <span>
                            {content.length} caractères • {activeSection}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Sauvegarde locale active
                        </span>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};
