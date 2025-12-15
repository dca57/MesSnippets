
import React, { useMemo } from 'react';
import { useTaskStore } from '../store/taskStore';
import { Icons } from '../helpers/icons';
import { cn, formatDuration } from '../helpers/utils';
import { EditableText } from './common/EditableText';
import { SubtaskList } from './common/SubtaskList';
import { useTaskTimer } from '../hooks/useTaskTimer';
import { STATUS_ORDER, STATUS_LABELS } from '../types/types';

export const FocusOverlay = () => {
    const { tasks, projects, isFocusMode, toggleFocusMode, enterFocusMode, toggleTaskTimer, updateTask, addSubtask, toggleSubtask, deleteSubtask, updateSubtask, focusedTaskId } = useTaskStore();
    
    // Find the currently active task
    const activeTask = tasks.find(t => t.id === focusedTaskId) || tasks.find(t => t.isRunning);
    
    // Safe values for the hook, if no task active, it returns 0 or updates based on nothing
    const elapsed = useTaskTimer(
        activeTask?.isRunning ?? false, 
        activeTask?.lastStartedAt ?? null, 
        activeTask?.spentDuration ?? 0
    );

    // Compute sorted tasks for the selector (Same logic as List View)
    const projectTasks = useMemo(() => {
        if (!activeTask) return [];
        return tasks
            .filter(t => t.projectId === activeTask.projectId)
            .sort((a, b) => {
                // 1. Pinned first
                if (a.isPinned !== b.isPinned) return Number(b.isPinned) - Number(a.isPinned);
                // 2. Status Order
                const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
                if (statusDiff !== 0) return statusDiff;
                // 3. User Order
                return a.order - b.order;
            });
    }, [tasks, activeTask]);

    if (!isFocusMode) return null;

    if (!activeTask) {
        return (
             <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center text-slate-900 dark:text-white animate-fade-in">
                <button onClick={toggleFocusMode} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors active:scale-95">
                    <Icons.Minimize2 size={32} />
                </button>
                <div className="text-center p-8 max-w-md">
                    <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full inline-block mb-6 shadow-sm">
                        <Icons.Target size={48} className="text-blue-500" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Mode Focus</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg mb-8">
                        Aucune tâche n'est en cours. Lancez un chronomètre sur une tâche pour entrer en immersion.
                    </p>
                    <button 
                        onClick={toggleFocusMode}
                        className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-medium transition-all shadow-sm active:scale-95"
                    >
                        Retour au Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Determine if we show the timer box (Only in Auto Mode)
    const activeProject = projects.find(p => p.id === activeTask.projectId);
    const showTimerBox = activeProject ? activeProject.modeGestionCharge : true;

    const isOverBudget = activeTask.estimatedDuration > 0 && elapsed > (activeTask.estimatedDuration * 60);
    
    // Default (Paused) = Amber, Running = Green/Red
    let timeColorClass = "text-amber-500"; 
    if (activeTask.isRunning) {
        timeColorClass = isOverBudget ? "text-red-500" : "text-green-500";
    }

    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const minutesStr = minutes.toString().padStart(2, '0');

    // Logic for columns:
    // If few tasks (< 8), use single column to "Fill first column".
    // If many tasks, use 2 columns (balanced) and allow vertical scroll.
    const useTwoColumns = activeTask.subtasks.length > 20;

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex animate-fade-in">
            {/* LEFT COLUMN: CONTROLS */}
            <div className="w-full md:w-1/4 min-w-[320px] bg-white dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-xl z-10">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-500 font-bold uppercase tracking-wider text-sm animate-pulse">
                            <Icons.Target size={18} /> Mode Focus
                        </div>
                        <button 
                            onClick={toggleFocusMode} 
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                        >
                            <span className="flex items-center gap-1">
                                <Icons.Minimize2 size={14} /> Quitter
                            </span>
                        </button>
                    </div>

                    {/* Task Selector */}
                    <div className="relative">
                        <select
                            value={activeTask.id}
                            onChange={(e) => enterFocusMode(e.target.value)}
                            className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer truncate"
                        >
                            {projectTasks.map(task => (
                                <option key={task.id} value={task.id}>
                                    {task.isPinned ? "📌 " : ""}[{STATUS_LABELS[task.status]}] {task.title}
                                </option>
                            ))}
                        </select>
                        <Icons.ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                     <div className="mb-2">
                        <EditableText 
                            value={activeTask.title}
                            onSave={(v) => updateTask(activeTask.id, { title: v })}
                            className="text-xl font-bold leading-tight text-slate-900 dark:text-white"
                            inputClassName="text-xl font-bold bg-transparent border-b-2 border-slate-300 dark:border-slate-700 focus:border-blue-500 text-slate-900 dark:text-white"
                        />
                    </div>

                    {showTimerBox && (
                        <div className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50">
                             <div className={cn(
                                 "font-mono font-bold tracking-tighter mb-2 flex items-center justify-center gap-0.5 transition-all duration-300", 
                                 activeTask.isRunning ? "text-6xl" : "text-4xl opacity-80",
                                 timeColorClass
                             )}>
                                <span>{hours}</span>
                                <span className={activeTask.isRunning ? "animate-[pulse_1s_ease-in-out_infinite]" : ""}>:</span>
                                <span>{minutesStr}</span>
                            </div>
                            {activeTask.estimatedDuration > 0 && (
                                <div className="text-slate-400 dark:text-slate-500 text-sm font-medium">
                                    / {formatDuration(activeTask.estimatedDuration * 60)} estimé
                                </div>
                            )}
                            <div className="mt-6">
                                <button 
                                    onClick={() => toggleTaskTimer(activeTask.id)}
                                    className={cn(
                                        "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm border active:scale-95",
                                        activeTask.isRunning 
                                            ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-500/20 border-amber-200 dark:border-amber-500/50"
                                            : "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-500 hover:bg-green-100 dark:hover:bg-green-500/20 border-green-200 dark:border-green-500/50"
                                    )}
                                >
                                    {activeTask.isRunning ? (
                                        <>
                                            <Icons.Pause size={20} className="fill-current" /> Mettre en pause
                                        </>
                                    ) : (
                                        <>
                                            <Icons.Play size={20} className="fill-current" /> Reprendre
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 flex flex-col">
                        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                            <Icons.FileText size={14} /> Notes
                        </h3>
                        <textarea 
                            value={activeTask.notes || ''}
                            onChange={(e) => updateTask(activeTask.id, { notes: e.target.value })}
                            className="w-full flex-1 bg-slate-50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-200 resize-none outline-none p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm leading-relaxed focus:ring-1 ring-blue-500/50"
                            placeholder="Notes, liens, idées..."
                        />
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: CHECKLIST */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-900">
                <div className="flex-1 p-2 md:p-4 overflow-hidden flex flex-col">
                    <div className="h-full flex flex-col">
                        <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm flex-1 flex flex-col overflow-hidden">
                            <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-700/50 shrink-0">
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                    <Icons.CheckSquare size={28} className="text-blue-500" /> Checklist
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-2 ml-10">
                                    Découpez votre tâche pour avancer étape par étape.
                                </p>
                            </div>
                            
                            {/* ENABLE VERTICAL SCROLL HERE */}
                            <div className="ml-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <SubtaskList 
                                    taskId={activeTask.id}
                                    subtasks={activeTask.subtasks}
                                    onAdd={addSubtask}
                                    onToggle={toggleSubtask}
                                    onDelete={deleteSubtask}
                                    onUpdate={updateSubtask}
                                    inputPosition="top"
                                    listClassName={useTwoColumns ? "columns-1 xl:columns-2 gap-8" : "flex flex-col gap-1"}
                                    // Removed h-full to allow natural height growth
                                    className="" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
