import React, { useState, useEffect } from 'react';
import { Icons } from '../helpers/icons';
import { Project, Task } from '../types/types';

interface RecipesModalProps {
    project: Project;
    tasks: Task[];
    onClose: () => void;
}

export const RecipesModal = ({ project, tasks, onClose }: RecipesModalProps) => {
    const [content, setContent] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // GENERATION LOGIC
        const wikiRecettes = project.wiki?.['Cahier de Recettes'] || '';
        const reviewTasks = tasks.filter(t => t.status === 'review');

        // Check if there is anything to generate
        if (!wikiRecettes && reviewTasks.length === 0) {
            setContent("Aucune donnée à générer.\n\nLe wiki 'Cahier de Recettes' est vide et aucune tâche n'est en statut 'En Recettes'.");
            return;
        }

        let generated = "";

        // 1. General Info from Wiki
        if (wikiRecettes) {
            generated += "## Informations générales :\n\n";
            generated += wikiRecettes + "\n\n";
        } else {
             generated += "## Informations générales :\n\n(Aucune information générale dans le Wiki)\n\n";
        }

        // 2. Tasks loop
        if (reviewTasks.length > 0) {
            reviewTasks.forEach((task, index) => {
                generated += `## Ticket ${index + 1} : ${task.title}\n\n`;
                if (task.recettes) {
                    generated += task.recettes + "\n\n";
                } else {
                    generated += "(Pas de notes de recettes pour ce ticket)\n\n";
                }
            });
        }

        setContent(generated);
    }, [project, tasks]);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExport = () => {
        const now = new Date();
        const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
        const title = `InfosRecettes_${project.name.replace(/\s+/g, '_')}_${timestamp}.md`;
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = title;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 m-4" onClick={e => e.stopPropagation()}>
                
                {/* HEADER */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                            <Icons.FlaskConical size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cahier de Recettes</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Généré à partir du Wiki et des tâches en "Review"</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                        <Icons.X size={20} />
                    </button>
                </div>

                {/* CONTENT (EDITOR) */}
                <div className="flex-1 p-0 relative">
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-full p-6 bg-slate-50 dark:bg-slate-950 font-mono text-sm text-slate-700 dark:text-slate-300 resize-none outline-none leading-relaxed selection:bg-purple-200 dark:selection:bg-purple-900/30"
                        spellCheck={false}
                    />
                </div>

                {/* FOOTER actions */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end gap-3">
                    <button 
                         onClick={handleCopy}
                         className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 text-sm"
                    >
                        {copied ? <Icons.CheckCircle size={16} className="text-green-500" /> : <Icons.Files size={16} />}
                        {copied ? "Copié !" : "Copier le texte"}
                    </button>
                    
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-sm transition-all active:scale-95 text-sm"
                    >
                        <Icons.Download size={16} />
                        Exporter (.md)
                    </button>
                </div>
            </div>
        </div>
    );
};
