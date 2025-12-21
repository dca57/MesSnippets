import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../../helpers/icons';
import { cn } from '../../helpers/utils';

export const TaskRecipes = ({ recettes, onSave, size = 16 }: { recettes?: string, onSave: (val: string) => void, size?: number }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(recettes || '');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setText(recettes || '');
    }, [recettes]);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        onSave(text);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="absolute top-0 right-0 z-20 w-full p-2 bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-700 shadow-xl" onClick={e => e.stopPropagation()}>
                <textarea 
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full text-xs p-2 border rounded bg-slate-50 dark:bg-slate-700 dark:text-white dark:border-slate-600 min-h-[80px] outline-none focus:ring-1 focus:ring-purple-500 mb-2"
                    placeholder="Saisir des scénarios de test..."
                />
                <div className="flex justify-end gap-2">
                     <button onClick={() => setIsEditing(false)} className="text-xs px-2 py-1 text-slate-500 hover:bg-slate-100 rounded">Annuler</button>
                     <button onClick={handleSave} className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">Enregistrer</button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative group/recette flex items-center justify-center">
            <button 
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                className={cn(
                    "p-0.5 rounded transition-all hover:text-purple-600 active:scale-90",
                    recettes ? "text-purple-500" : "text-slate-300"
                )}
                title="Recettes"
            >
                <Icons.FlaskConical size={size} className={recettes ? "fill-current/10" : ""} />
            </button>
            
            {/* Tooltip on Hover - Shows BELOW (top-full) */}
            {recettes && (
                <div className="hidden group-hover/recette:block absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg z-30 pointer-events-none">
                    {recettes}
                    {/* Arrow pointing UP */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800" />
                </div>
            )}
        </div>
    );
};
