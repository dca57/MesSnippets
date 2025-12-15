
import React, { useState } from 'react';
import { Icons } from '../helpers/icons';
import { cn, formatDuration, parseDurationInput } from '../helpers/utils';
import { Task, Status, STATUS_LABELS } from '../types/types';
import { useTaskStore } from '../store/taskStore';
import { PriorityBadge } from './PriorityBadge';
import { EditableText } from './common/EditableText';
import { TimeEstimator } from './common/TimeEstimator';
import { DifficultyIcon } from './common/DifficultyIcon';
import { TaskNote } from './common/TaskNote';
import { SubtaskList } from './common/SubtaskList';
import { useTaskTimer } from '../hooks/useTaskTimer';
import { useTaskHighlight } from '../hooks/useTaskHighlight';

interface TaskCardListProps {
    task: Task;
    modeGestionCharge: boolean;
    isQuickWinActive?: boolean;
    quickWinThresholdMinutes?: number;
}

export const TaskCardList: React.FC<TaskCardListProps> = ({ 
    task, 
    modeGestionCharge, 
    isQuickWinActive, 
    quickWinThresholdMinutes = 0 
}) => {
  const { updateTask, deleteTask, toggleTaskTimer, toggleTaskPin, moveTaskToStatus, reorderTask, addSubtask, toggleSubtask, deleteSubtask, updateSubtask, enterFocusMode } = useTaskStore();
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Detect Highlight Event (Creation or Move)
  const isHighlighted = useTaskHighlight(task);

  // Hook for timer logic
  const elapsed = useTaskTimer(task.isRunning, task.lastStartedAt, task.spentDuration);

  // Quick Win Logic
  let quickWinColor = "bg-amber-100 text-amber-700 border-amber-200";
  const taskRemainingMinutes = Math.max(0, task.estimatedDuration - (elapsed / 60));
  
  if (isQuickWinActive && quickWinThresholdMinutes > 0) {
      const ratio = taskRemainingMinutes / quickWinThresholdMinutes;
      if (ratio < 0.33) quickWinColor = "bg-emerald-100 text-emerald-700 border-emerald-200 animate-pulse";
      else if (ratio < 0.66) quickWinColor = "bg-lime-100 text-lime-700 border-lime-200";
  }

  const handleStatusClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleTaskTimer(task.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      enterFocusMode(task.id);
  };

  const cycleStatus = () => {
      if (task.status === 'archived') {
          moveTaskToStatus(task.id, 'done');
          return;
      }
      const statuses: Status[] = ['todo', 'analysis', 'doing', 'blocked', 'review', 'done'];
      const currentIdx = statuses.indexOf(task.status);
      const nextIdx = (currentIdx + 1) % statuses.length;
      moveTaskToStatus(task.id, statuses[nextIdx]);
  };

  const handleSpentTimeSave = (str: string) => {
      const seconds = parseDurationInput(str);
      updateTask(task.id, { spentDuration: seconds });
  };

  // --- DRAG & DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent) => {
      e.dataTransfer.setData('taskId', task.id);
      e.dataTransfer.setData('sourceStatus', task.status);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); 
      setIsDragOver(true);
  };

  const handleDragLeave = () => {
      setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      
      const sourceTaskId = e.dataTransfer.getData('taskId');
      const sourceStatus = e.dataTransfer.getData('sourceStatus');

      if (!sourceTaskId || sourceTaskId === task.id) return;

      if (sourceStatus === task.status) {
          reorderTask(sourceTaskId, task.id);
      } else {
          console.warn("Cannot move tasks between different statuses in List View");
      }
  };

  return (
    <div 
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDoubleClick={handleDoubleClick}
        className={cn(
            "flex flex-col border-b border-slate-100 dark:border-slate-800 transition-all group text-sm relative",
            
            // Highlight Effect
            isHighlighted && "scale-[1.01] ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/30 z-10 shadow-lg duration-300 rounded",

            !isHighlighted && isDragOver && "border-t-2 border-t-blue-500",
            
            // VISUAL STYLES (Urgent > Pinned > Normal) -- Only if not highlighted
            !isHighlighted && (task.priority === 'urgent'
                ? "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                : task.isPinned
                    ? "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50")
    )}>
        {/* GRID LAYOUT FOR ROW */}
        <div className="grid grid-cols-[20px_30px_30px_minmax(0,1fr)_100px_80px_30px_30px_30px_30px_auto_30px] items-center gap-4 p-2 min-h-[44px]">
            
            {/* 0. Drag Handle */}
            <div className="flex justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500">
                <Icons.GripVertical size={14} />
            </div>

            {/* 1. Pin */}
            <div className="flex justify-center">
                <button 
                    onClick={(e) => { e.stopPropagation(); toggleTaskPin(task.id); }} 
                    className={cn(
                        "shrink-0 transition-transform active:scale-90", 
                        task.isPinned ? "text-blue-500" : "text-slate-300 hover:text-blue-400"
                    )}
                >
                    <Icons.Pin size={14} className={task.isPinned ? "fill-current" : ""} />
                </button>
            </div>

            {/* 2. Play/Pause */}
            <div className="flex justify-center">
                {modeGestionCharge ? (
                <button 
                    onClick={handleStatusClick}
                    className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 active:scale-90",
                        task.isRunning 
                            ? "bg-amber-100 text-amber-600 animate-pulse" 
                            : task.status === 'done' 
                                ? "bg-green-100 text-green-600"
                                : "bg-white dark:bg-slate-700 text-slate-400 hover:bg-blue-100 hover:text-blue-600"
                    )}
                >
                    {task.isRunning ? <Icons.Pause size={12} className="fill-current" /> : task.status === 'done' ? <Icons.CheckCircle size={14} /> : <Icons.Play size={12} className="ml-0.5" />}
                </button>
                ) : (
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    {task.status === 'done' && <Icons.CheckCircle size={14} className="text-green-600" />}
                </div>
                )}
            </div>

            {/* 3. Title */}
            <div className="min-w-0 flex items-center gap-2">
                <EditableText 
                    value={task.title} 
                    onSave={(v) => updateTask(task.id, { title: v })}
                    className="font-medium text-slate-900 dark:text-white truncate block"
                    inputClassName="text-sm py-0"
                />
                
                {/* Quick Win Badge Inline */}
                {isQuickWinActive && (
                    <div className={cn("shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1", quickWinColor)}>
                        <Icons.Zap size={10} className="fill-current" />
                        {Math.ceil(taskRemainingMinutes)}m
                    </div>
                )}
            </div>

            {/* 4. Status */}
            <div className="flex justify-center">
                <button 
                    onClick={cycleStatus} 
                    className="uppercase font-bold tracking-wider text-[10px] hover:text-blue-600 transition-colors w-full text-center truncate text-slate-500"
                >
                    {STATUS_LABELS[task.status]}
                </button>
            </div>

            {/* 5. Priority */}
            <div className="flex justify-center">
                <PriorityBadge priority={task.priority} onChange={(p) => updateTask(task.id, { priority: p })} className="shrink-0" />
            </div>

            {/* 6. Difficulty */}
            <div className="flex justify-center">
                <DifficultyIcon difficulty={task.difficulty} onChange={(d) => updateTask(task.id, { difficulty: d })} />
            </div>
            
            {/* 7. Note */}
            <div className="flex justify-center">
                <TaskNote notes={task.notes} onSave={(v) => updateTask(task.id, { notes: v })} size={14} />
            </div>

            {/* 8. Checklist */}
            <div className="flex justify-center">
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowSubtasks(!showSubtasks); }}
                    className={cn(
                        "shrink-0 hover:text-blue-600 transition-transform active:scale-90", 
                        (task.subtasks.length > 0) ? "text-blue-500" : "text-slate-300"
                    )}
                    title="Checklist"
                >
                    <Icons.CheckSquare size={14} className={task.subtasks.length > 0 ? "fill-current/10" : ""} />
                </button>
            </div>

             {/* 9. Archive */}
             <div className="flex justify-center">
                 {task.status !== 'archived' ? (
                     <button 
                        onClick={() => moveTaskToStatus(task.id, 'archived')}
                        className="text-purple-400 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-300 transition-transform active:scale-90"
                        title="Archiver"
                     >
                         <Icons.Archive size={14} />
                     </button>
                 ) : (
                    <button 
                        onClick={() => moveTaskToStatus(task.id, 'done')}
                        className="text-purple-500 hover:text-purple-600 transition-transform active:scale-90"
                        title="Désarchiver"
                     >
                         <Icons.ArchiveRestore size={14} />
                     </button>
                 )}
            </div>

            {/* 10. Times */}
            <div className="flex justify-end min-w-[120px]">
                {modeGestionCharge && (
                    <div className={cn("flex items-center gap-3 shrink-0 pl-2 border-l ml-2", task.isPinned || task.priority === 'urgent' ? "border-slate-200 dark:border-slate-700/50" : "border-slate-100 dark:border-slate-700/50")}>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 uppercase hidden xl:inline">Réalisé:</span>
                            <EditableText 
                                value={formatDuration(elapsed)}
                                onSave={handleSpentTimeSave}
                                clearOnFocus={true} 
                                className={cn(
                                    "font-mono font-medium text-xs w-[45px] text-center", 
                                    task.isRunning ? "text-amber-600" : "text-slate-600 dark:text-slate-400"
                                )}
                                inputClassName="w-[50px] text-xs font-mono"
                            />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 uppercase hidden xl:inline">Sur:</span>
                            <TimeEstimator value={task.estimatedDuration} onChange={(v) => updateTask(task.id, { estimatedDuration: v })} compact />
                        </div>
                    </div>
                )}
            </div>

            {/* 11. Delete */}
            <div className="flex justify-center">
                <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all active:scale-90">
                    <Icons.Trash2 size={14} />
                </button>
            </div>
        </div>

        {/* Subtasks */}
        {(showSubtasks || (task.subtasks.length > 0 && showSubtasks)) && (
            <div className={cn("px-10 pb-2 border-t border-dashed ml-8", task.isPinned || task.priority === 'urgent' ? "border-slate-200 dark:border-slate-700/50" : "border-slate-100 dark:border-slate-800")}>
                <SubtaskList 
                    taskId={task.id}
                    subtasks={task.subtasks}
                    onAdd={addSubtask}
                    onToggle={toggleSubtask}
                    onDelete={deleteSubtask}
                    onUpdate={updateSubtask}
                    compact={false}
                    className="mt-2"
                />
            </div>
        )}
    </div>
  );
};
