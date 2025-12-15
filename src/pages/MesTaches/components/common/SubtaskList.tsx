
import React, { useState, useMemo } from 'react';
import { Icons } from '../../helpers/icons';
import { Subtask } from '../../types/types';
import { cn } from '../../helpers/utils';
import { EditableText } from './EditableText';

interface SubtaskListProps {
  taskId: string;
  subtasks: Subtask[];
  onAdd: (taskId: string, title: string) => void;
  onToggle: (taskId: string, subtaskId: string) => void;
  onDelete: (taskId: string, subtaskId: string) => void;
  onUpdate: (taskId: string, subtaskId: string, title: string) => void;
  onEditingChange?: (isEditing: boolean) => void;
  compact?: boolean;
  className?: string; // Container class
  listClassName?: string; // Specific class for the list of items (e.g. for columns)
  inputPosition?: 'top' | 'bottom';
}

export const SubtaskList: React.FC<SubtaskListProps> = ({ 
  taskId, 
  subtasks, 
  onAdd, 
  onToggle, 
  onDelete,
  onUpdate,
  onEditingChange,
  compact = false,
  className,
  listClassName,
  inputPosition = 'bottom'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const completedCount = subtasks.filter(s => s.completed).length;
  const progress = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  // Sort subtasks: Uncompleted first, Completed last
  const sortedSubtasks = useMemo(() => {
    return [...subtasks].sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [subtasks]);

  const handleAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSubtaskTitle.trim()) {
      onAdd(taskId, newSubtaskTitle);
      setNewSubtaskTitle('');
    }
  };

  const handleInputFocus = () => {
    if (onEditingChange) onEditingChange(true);
  };

  const handleInputBlur = () => {
    if (onEditingChange) onEditingChange(false);
  };

  const InputComponent = (
    <div className="relative break-inside-avoid">
        <input 
            type="text" 
            placeholder="Ajouter une étape..." 
            className="w-full text-xs px-2 py-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded outline-none focus:border-blue-400 dark:text-slate-200 placeholder:text-slate-400"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={handleAdd}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2">
            <Icons.Plus size={12} className="text-slate-400" />
        </div>
    </div>
  );

  // Compact View (e.g., Progress Bar only, expand on click)
  if (compact && !isExpanded) {
    if (subtasks.length === 0) return null; // Don't show if empty in compact mode until manually added

    return (
      <div 
        onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
        className="mt-2 flex items-center gap-2 cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1 rounded transition-colors"
      >
        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
             <div 
                className="h-full bg-blue-500 transition-all duration-300" 
                style={{ width: `${progress}%` }} 
             />
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
            {completedCount}/{subtasks.length}
        </span>
      </div>
    );
  }

  // Expanded View
  return (
    <div className={cn("flex flex-col animate-fade-in", className)} onClick={e => e.stopPropagation()}>
        
        {/* Input at TOP */}
        {inputPosition === 'top' && <div className="shrink-0 mb-3">{InputComponent}</div>}

        {/* Header / Progress (Click to collapse if compact mode was trigger) */}
        <div 
            onClick={() => compact && setIsExpanded(false)}
            className={cn("flex items-center justify-between mb-2 shrink-0", compact && "cursor-pointer")}
        >
            <h4 className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                <Icons.CheckSquare size={12} /> Sous-tâches
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
                {completedCount}/{subtasks.length}
            </span>
        </div>

        {/* List Items - Flex-1 to take available space in h-full scenarios */}
        <div className={cn("space-y-1 mb-2 flex-1 min-h-0", listClassName)}>
            {sortedSubtasks.map(st => (
                <div key={st.id} className="flex items-start gap-2 group/subtask break-inside-avoid mb-1">
                    <button 
                        onClick={() => onToggle(taskId, st.id)}
                        className={cn(
                            "mt-0.5 transition-all shrink-0 active:scale-90", 
                            st.completed ? "text-blue-500" : "text-slate-300 hover:text-blue-400"
                        )}
                    >
                        {st.completed ? <Icons.CheckSquare size={14} /> : <Icons.Square size={14} />}
                    </button>
                    
                    {/* Inline Editable Title */}
                    <div className="flex-1 min-w-0">
                        <EditableText
                            value={st.title}
                            onSave={(val) => onUpdate(taskId, st.id, val)}
                            onEditingChange={onEditingChange}
                            className={cn(
                                "text-xs block w-full", 
                                st.completed ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200"
                            )}
                            inputClassName="text-xs py-0"
                        />
                    </div>

                    <button 
                        onClick={() => onDelete(taskId, st.id)}
                        className="opacity-0 group-hover/subtask:opacity-100 text-slate-300 hover:text-red-500 transition-all active:scale-90 shrink-0"
                    >
                        <Icons.X size={12} />
                    </button>
                </div>
            ))}
        </div>

        {/* Input at BOTTOM */}
        {inputPosition === 'bottom' && <div className="shrink-0 mt-2">{InputComponent}</div>}
    </div>
  );
};
