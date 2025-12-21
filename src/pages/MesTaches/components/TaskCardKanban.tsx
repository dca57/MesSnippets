
import React, { useState } from 'react';
import { Icons } from '../helpers/icons';
import { cn, formatDuration, parseDurationInput } from '../helpers/utils';
import { Task } from '../types/types';
import { useTaskStore } from '../store/taskStore';
import { PriorityBadge } from './PriorityBadge';
import { EditableText } from './common/EditableText';
import { TimeEstimator } from './common/TimeEstimator';
import { DifficultyIcon } from './common/DifficultyIcon';
import { TaskNote } from './common/TaskNote';
import { TaskRecipes } from './common/TaskRecipes';
import { SubtaskList } from './common/SubtaskList';
import { useTaskTimer } from '../hooks/useTaskTimer';
import { useTaskHighlight } from '../hooks/useTaskHighlight';
import { ConfirmationModal } from './common/ConfirmationModal';

interface TaskCardKanbanProps {
    task: Task;
    modeGestionCharge: boolean;
    isQuickWinActive?: boolean;
    quickWinThresholdMinutes?: number;
}

export const TaskCardKanban: React.FC<TaskCardKanbanProps> = ({ 
    task, 
    modeGestionCharge, 
    isQuickWinActive, 
    quickWinThresholdMinutes = 0 
}) => {
  const { updateTask, deleteTask, toggleTaskTimer, toggleTaskPin, moveTaskToStatus, reorderTask, addSubtask, toggleSubtask, deleteSubtask, updateSubtask, enterFocusMode } = useTaskStore();
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Detect Highlight Event (Creation or Move)
  const isHighlighted = useTaskHighlight(task);

  // Using the hook handles interval and state updates efficiently
  const elapsed = useTaskTimer(task.isRunning, task.lastStartedAt, task.spentDuration);

  const estimatedSeconds = task.estimatedDuration * 60;
  const progress = estimatedSeconds > 0 ? Math.min((elapsed / estimatedSeconds) * 100, 100) : 0;
  const isOverBudget = estimatedSeconds > 0 && elapsed > estimatedSeconds;

  // Calcul progression sous-tâches
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const subtaskProgress = task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0;

  // Quick Win Logic
  let quickWinColor = "bg-amber-100 text-amber-700 border-amber-200";
  const taskRemainingMinutes = Math.max(0, task.estimatedDuration - (elapsed / 60));
  
  if (isQuickWinActive && quickWinThresholdMinutes > 0) {
      // Scale visual cues: 0-33% threshold = Green, 33-66% = Chartreuse, 66-100% = Amber
      const ratio = taskRemainingMinutes / quickWinThresholdMinutes;
      if (ratio < 0.33) quickWinColor = "bg-emerald-100 text-emerald-700 border-emerald-200 animate-pulse";
      else if (ratio < 0.66) quickWinColor = "bg-lime-100 text-lime-700 border-lime-200";
  }

  const handleSpentTimeSave = (str: string) => {
      const seconds = parseDurationInput(str);
      updateTask(task.id, { spentDuration: seconds });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
      if (isEditing) return;
      e.stopPropagation();
      enterFocusMode(task.id);
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent) => {
      if (isEditing) {
          e.preventDefault();
          return;
      }
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

      if (!sourceTaskId) return;

      if (sourceTaskId === task.id) return;

      if (sourceStatus === task.status) {
          e.stopPropagation(); // Stop bubbling to Column drop
          reorderTask(sourceTaskId, task.id);
      } else {
          e.stopPropagation();
          moveTaskToStatus(sourceTaskId, task.status);
      }
  };

  return (
    <div 
      draggable={!isEditing} 
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDoubleClick={handleDoubleClick}
      className={cn(
        "group p-2 rounded-lg shadow-sm hover:shadow-md transition-all animate-fade-in relative border",
        
        // Highlight Effect (Scale + Ring + Light BG)
        isHighlighted && "scale-[1.02] ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/30 z-10 shadow-lg duration-300",

        // Drag Interaction
        !isHighlighted && isDragOver ? "border-t-4 border-t-blue-500" : "",
        isEditing ? "cursor-auto" : "cursor-grab active:cursor-grabbing",

        // VISUAL STYLES (Urgent > Pinned > Normal) -- Only apply if not highlighted to avoid conflict
        !isHighlighted && (task.priority === 'urgent'
            ? "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 ring-1 ring-red-100 dark:ring-red-900/30"
            : task.isPinned 
                ? "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 ring-1 ring-blue-100 dark:ring-blue-900/30" 
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700")
      )}
    >
      {/* Top Row: Pin, Priority, Difficulty, Delete */}
      <div className="flex justify-between items-center mb-1.5">
         <div className="flex items-center gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleTaskPin(task.id); }} 
              className={cn(
                  "hover:text-blue-600 transition-transform active:scale-90", 
                  task.isPinned ? "text-blue-600 dark:text-blue-400" : "text-slate-300"
              )}
            >
              <Icons.Pin size={13} className={task.isPinned ? "fill-current" : ""} />
            </button>
            <PriorityBadge priority={task.priority} onChange={(p) => updateTask(task.id, { priority: p })} />
            <DifficultyIcon difficulty={task.difficulty} onChange={(d) => updateTask(task.id, { difficulty: d })} />
            <TaskNote notes={task.notes} onSave={(v) => updateTask(task.id, { notes: v })} size={16} />
            <TaskRecipes recettes={task.recettes} onSave={(v) => updateTask(task.id, { recettes: v })} size={16} />
            
             <button 
                onClick={(e) => { e.stopPropagation(); setShowSubtasks(!showSubtasks); }}
                className={cn(
                    "flex items-center justify-center hover:text-blue-600 transition-transform active:scale-90", 
                    (showSubtasks || task.subtasks.length > 0) ? "text-blue-500" : "text-slate-300"
                )}
                title="Checklist"
            >
                <Icons.CheckSquare size={16} className={showSubtasks ? "fill-current" : task.subtasks.length > 0 ? "fill-current/10" : ""} />
            </button>

         </div>
         <div className="flex items-center gap-0.5">
             {/* Quick Win Badge (Top Right) */}
             {isQuickWinActive && (
                 <div className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 mr-1", quickWinColor)}>
                     <Icons.Zap size={10} className="fill-current" />
                     {Math.ceil(taskRemainingMinutes)} min
                 </div>
             )}

             {task.status === 'done' && (
                 <button 
                    onClick={(e) => { e.stopPropagation(); moveTaskToStatus(task.id, 'archived'); }}
                    className="flex items-center justify-center text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300 p-1 transition-transform active:scale-90"
                    title="Archiver"
                 >
                     <Icons.Archive size={16} />
                 </button>
             )}
             <button 
                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all active:scale-90 p-1"
             >
                <Icons.X size={13} />
             </button>
         </div>
      </div>

      <EditableText 
        value={task.title} 
        onSave={(v) => updateTask(task.id, { title: v })}
        className="font-medium text-sm text-slate-900 dark:text-white mb-2 block leading-snug"
        onEditingChange={setIsEditing} 
      />

      {/* SUBTASKS SECTION */}
      
      {/* 1. Mode Réduit: Barre de progression (Visible seulement si non étendu et s'il y a des sous-tâches) */}
      {!showSubtasks && task.subtasks.length > 0 && (
          <div 
            onClick={(e) => { e.stopPropagation(); setShowSubtasks(true); }}
            className="mt-2 flex items-center gap-2 cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1 rounded transition-colors"
            title="Afficher la checklist"
          >
            <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                 <div 
                    className="h-full bg-blue-500 transition-all duration-300" 
                    style={{ width: `${subtaskProgress}%` }} 
                 />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
                {completedSubtasks}/{task.subtasks.length}
            </span>
          </div>
      )}

      {/* 2. Mode Étendu: Liste complète */}
      {showSubtasks && (
          <SubtaskList 
            taskId={task.id}
            subtasks={task.subtasks}
            onAdd={addSubtask}
            onToggle={toggleSubtask}
            onDelete={deleteSubtask}
            onUpdate={updateSubtask}
            onEditingChange={setIsEditing}
            compact={false}
            className="mt-2"
          />
      )}

      {/* TIMES FOOTER - ONLY SHOW IN AUTO MODE */}
      {modeGestionCharge && (
        <div className={cn("flex flex-col gap-1.5 mt-2 pt-2 border-t", task.isPinned || task.priority === 'urgent' ? "border-slate-200 dark:border-slate-700/50" : "border-slate-100 dark:border-slate-700/50")}>
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                 <button 
                    onClick={(e) => { e.stopPropagation(); toggleTaskTimer(task.id); }}
                    className={cn(
                      "p-1 rounded-full transition-all active:scale-90",
                      task.isRunning 
                        ? "bg-amber-100 text-amber-600 animate-pulse dark:bg-amber-900/30 dark:text-amber-400" 
                        : "bg-white/50 text-slate-500 hover:bg-green-100 hover:text-green-600 dark:bg-slate-700 dark:text-slate-400"
                    )}
                 >
                    {task.isRunning ? <Icons.Pause size={12} className="fill-current" /> : <Icons.Play size={12} className="fill-current" />}
                 </button>
                 
                 <EditableText 
                    value={formatDuration(elapsed)}
                    onSave={handleSpentTimeSave}
                    clearOnFocus={true}
                    onEditingChange={setIsEditing}
                    className={cn(
                        "font-mono font-bold text-xs", 
                        task.isRunning ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-400"
                    )}
                    inputClassName="text-xs font-mono font-bold w-[40px]"
                 />
              </div>
              <TimeEstimator value={task.estimatedDuration} onChange={(v) => updateTask(task.id, { estimatedDuration: v })} />
          </div>
          
          {estimatedSeconds > 0 && (
            <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className={cn("h-full transition-all duration-500", isOverBudget ? "bg-red-500" : "bg-gradient-to-r from-green-400 to-green-600")} style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Supprimer la tâche ?"
        message={`Êtes-vous sûr de vouloir supprimer "${task.title}" ? Cette action est irréversible.`}
        onConfirm={() => {
            deleteTask(task.id);
            setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
