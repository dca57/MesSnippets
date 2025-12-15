
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Project, Task } from '../types/types';
import { useTaskStore } from '../store/taskStore';
import { Icons } from '../helpers/icons';
import { cn, formatDuration } from '../helpers/utils';
import { useGanttScheduling, DayMode } from '../hooks/useGanttScheduling';

// Helpers simples d'affichage
const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const parseDateKey = (dateStr: string) => {
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
};

const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const getDatesRange = (startDate: Date, days: number) => {
    return Array.from({ length: days }).map((_, i) => addDays(startDate, i));
};

const getDiffDays = (start: Date, end: Date) => {
    const d1 = new Date(start); d1.setHours(0,0,0,0);
    const d2 = new Date(end); d2.setHours(0,0,0,0);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

interface ProjectGanttProps {
    project: Project;
}

export const ProjectGantt: React.FC<ProjectGanttProps> = ({ project }) => {
    const { tasks, updateTask } = useTaskStore();
    const projectTasks = tasks.filter(t => t.projectId === project.id && t.status !== 'archived');
    
    // --- STATE ---
    const [viewStartDate, setViewStartDate] = useState(new Date());
    const [daysToShow, setDaysToShow] = useState(14); // Initial value, updated by effect
    const [dailyCapacityHours, setDailyCapacityHours] = useState(7);
    const [isDragOverDate, setIsDragOverDate] = useState<string | null>(null);

    // Weekend Configuration State
    const [weekendConfig, setWeekendConfig] = useState<{ sat: DayMode, sun: DayMode }>({ sat: 'off', sun: 'off' });
    const [showWeekendConfig, setShowWeekendConfig] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);

    // Resize State
    const [resizingTask, setResizingTask] = useState<{ id: string, startX: number, originalWidth: number, originalDays: number, minDaysRequired: number } | null>(null);
    const [resizePreviewDays, setResizePreviewDays] = useState<number | null>(null);
    
    const ganttBodyRef = useRef<HTMLDivElement>(null);
    const COLUMN_WIDTH = 100;

    // --- RESPONSIVE DAYS CALCULATION ---
    useEffect(() => {
        const handleResize = () => {
            if (ganttBodyRef.current) {
                const availableWidth = ganttBodyRef.current.clientWidth;
                // Calcul combien de colonnes de 100px rentrent dans l'espace disponible
                const cols = Math.floor(availableWidth / COLUMN_WIDTH);
                // On garde un minimum de 7 jours, et on ajoute 1 pour être sûr de couvrir le bord droit si besoin
                setDaysToShow(Math.max(7, cols));
            }
        };

        // Observer le redimensionnement
        window.addEventListener('resize', handleResize);
        
        // Appel initial après le montage (petit délai pour que le DOM soit prêt)
        const timer = setTimeout(handleResize, 0);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timer);
        };
    }, []);

    // --- DATA PREP ---
    const calendarDates = useMemo(() => getDatesRange(viewStartDate, daysToShow), [viewStartDate, daysToShow]);
    
    const { scheduledTasks, backlogTasks } = useMemo(() => {
        const scheduled: Task[] = [];
        const backlog: Task[] = [];
        projectTasks.forEach(t => {
            if (t.startDate) scheduled.push(t);
            else backlog.push(t);
        });
        scheduled.sort((a, b) => {
             const dateDiff = (a.startDate || '').localeCompare(b.startDate || '');
             if (dateDiff !== 0) return dateDiff;
             return b.priority.localeCompare(a.priority);
        });
        return { scheduledTasks: scheduled, backlogTasks: backlog };
    }, [projectTasks]);

    // --- HOOK LOGIC (ALGO) ---
    const { getDayCapacity, calculateMinDueDate, dailyLoadMap } = useGanttScheduling(scheduledTasks, dailyCapacityHours, weekendConfig);

    // --- EFFECT: AUTO-EXTEND TASKS (Validation) ---
    useEffect(() => {
        const sortedForCalc = [...scheduledTasks].sort((a, b) => (a.estimatedDuration || 0) - (b.estimatedDuration || 0));

        sortedForCalc.forEach(task => {
            if (!task.startDate || !task.dueDate) return;
            let remainingMinutes = Math.max(0, (task.estimatedDuration || 0) - (task.spentDuration ? (task.spentDuration / 60) : 0));
            if (task.status !== 'done' && task.status !== 'archived' && remainingMinutes <= 0) remainingMinutes = 60; 

            if (remainingMinutes > 0) {
                const minDueDate = calculateMinDueDate(task.startDate, remainingMinutes, task.id, task.estimatedDuration || 0);
                if (task.dueDate < minDueDate) updateTask(task.id, { dueDate: minDueDate });
            }
        });
    }, [scheduledTasks, dailyCapacityHours, weekendConfig]); 

    // --- HANDLERS ---
    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('taskId', taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDropOnDate = (e: React.DragEvent, dateStr: string) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOverDate(null);
        const taskId = e.dataTransfer.getData('taskId');
        if (!taskId) return;

        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        let remainingMinutes = Math.max(0, (task.estimatedDuration || 0) - (task.spentDuration ? (task.spentDuration / 60) : 0));
        if (remainingMinutes <= 0) remainingMinutes = task.estimatedDuration || 60;

        const minDueDate = calculateMinDueDate(dateStr, remainingMinutes, task.id, task.estimatedDuration || 0);
        
        updateTask(taskId, { startDate: dateStr, dueDate: minDueDate });
    };

    const startResize = (e: React.MouseEvent, task: Task, durationDays: number) => {
        e.preventDefault();
        e.stopPropagation();
        const remainingMinutes = Math.max(0, (task.estimatedDuration || 0) - (task.spentDuration ? (task.spentDuration / 60) : 0));
        const minDueDate = calculateMinDueDate(task.startDate!, remainingMinutes, task.id, task.estimatedDuration || 0);
        const minDaysRequired = getDiffDays(parseDateKey(task.startDate!), parseDateKey(minDueDate));

        setResizingTask({
            id: task.id,
            startX: e.clientX,
            originalWidth: durationDays * COLUMN_WIDTH, 
            originalDays: durationDays,
            minDaysRequired: minDaysRequired
        });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!resizingTask) return;
            const deltaX = e.clientX - resizingTask.startX;
            const daysDelta = Math.round(deltaX / COLUMN_WIDTH);
            const newDays = Math.max(resizingTask.minDaysRequired, resizingTask.originalDays + daysDelta); 
            setResizePreviewDays(newDays);
        };

        const handleMouseUp = () => {
            if (resizingTask && resizePreviewDays !== null) {
                const task = tasks.find(t => t.id === resizingTask.id);
                if (task && task.startDate) {
                    const newEndDate = addDays(parseDateKey(task.startDate), resizePreviewDays - 1);
                    updateTask(task.id, { dueDate: formatDateKey(newEndDate) });
                }
            }
            setResizingTask(null);
            setResizePreviewDays(null);
        };

        if (resizingTask) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizingTask, resizePreviewDays, tasks, updateTask]);

    const getHeatmapColor = (minutes: number, date: Date) => {
        const dayCap = getDayCapacity(date);
        if (dayCap === 0 && minutes > 0) return 'bg-red-500';
        if (dayCap === 0) return 'hidden'; 
        const loadRatio = (minutes / 60) / dayCap;
        if (loadRatio > 1.001) return 'bg-red-500'; 
        if (loadRatio > 0.85) return 'bg-amber-400';
        return 'bg-emerald-400';
    };

    const getColumnClasses = (date: Date, isHovered: boolean, isToday: boolean) => {
        if (isHovered) return "bg-blue-100 dark:bg-blue-900/40";

        const cap = getDayCapacity(date);
        const day = date.getDay();
        const isWeekend = day === 0 || day === 6;

        if (cap === 0) {
            return "bg-slate-50 dark:bg-slate-900/50 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#f1f5f9_10px,#f1f5f9_20px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.03)_10px,rgba(255,255,255,0.03)_20px)]";
        }
        if ((day === 0 && weekendConfig.sun === 'half') || (day === 6 && weekendConfig.sat === 'half')) {
            return "bg-blue-50 dark:bg-slate-800";
        }
        if (isWeekend) {
            return "bg-white dark:bg-slate-900";
        }
        if (isToday) return "bg-blue-50/50";
        return "bg-transparent";
    };

    // --- RENDER ---
    return (
        <div className="flex h-full flex-col bg-white dark:bg-slate-900 overflow-hidden animate-fade-in select-none">
            {/* TOOLBAR */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 shadow-sm shrink-0 z-20 overflow-visible relative">
                
                {/* LEFT: Config & Capacity */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button onClick={() => setShowWeekendConfig(!showWeekendConfig)} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors", showWeekendConfig ? "bg-blue-100 border-blue-300 text-blue-800" : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50")}>
                            <Icons.Calendar size={14} /> <span className="hidden sm:inline">Jours Ouvrés</span>
                        </button>
                        {showWeekendConfig && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-50 animate-fade-in">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 border-b pb-2">Configuration Semaine</h4>
                                {['sat', 'sun'].map((d) => (
                                    <div key={d} className="mb-3 last:mb-0">
                                        <div className="flex justify-between mb-1 text-sm font-medium">
                                            <span className="capitalize">{d === 'sat' ? 'Samedi' : 'Dimanche'}</span>
                                            <span className="text-blue-600 font-bold uppercase text-xs">{weekendConfig[d as 'sat'|'sun'] === 'off' ? 'Off' : weekendConfig[d as 'sat'|'sun'] === 'half' ? 'Matin' : 'Jour'}</span>
                                        </div>
                                        <div className="flex bg-slate-100 dark:bg-slate-700 rounded p-1">
                                            {(['off', 'half', 'full'] as DayMode[]).map(mode => (
                                                <button key={mode} onClick={() => setWeekendConfig(prev => ({ ...prev, [d]: mode }))} className={cn("flex-1 text-[10px] py-1 rounded capitalize transition-colors font-medium", weekendConfig[d as 'sat'|'sun'] === mode ? "bg-white dark:bg-slate-600 shadow text-blue-600" : "text-slate-400 hover:text-slate-600")}>
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 shrink-0 hidden sm:block" />
                    
                    <div className="flex items-center gap-3 group shrink-0 hidden sm:flex">
                        <div className="flex items-center gap-2">
                             <label className="text-[9px] font-bold uppercase text-slate-400 leading-none">Capacité</label>
                             <div className="font-mono font-bold text-xs text-blue-600">{dailyCapacityHours}h/j</div>
                        </div>
                        <input type="range" min="4" max="12" step="1" value={dailyCapacityHours} onChange={(e) => setDailyCapacityHours(Number(e.target.value))} className="w-24 accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none" />
                    </div>
                </div>

                {/* CENTER: Date Navigation (Absolute Center) */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-sm">
                    <button onClick={() => setViewStartDate(addDays(viewStartDate, -7))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-600 dark:text-slate-300">
                        <Icons.ChevronLeft size={16}/>
                    </button>
                    <div className="px-3 py-1 font-bold text-sm min-w-[100px] text-center border-l border-r border-slate-100 dark:border-slate-800">
                        {viewStartDate.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                        <span className="text-slate-400 mx-1">-</span>
                        {addDays(viewStartDate, daysToShow - 1).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                    </div>
                    <button onClick={() => setViewStartDate(addDays(viewStartDate, 7))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-600 dark:text-slate-300">
                        <Icons.ChevronRight size={16}/>
                    </button>
                    <button onClick={() => setViewStartDate(new Date())} className="ml-1 text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded font-bold hover:bg-blue-100 transition-colors">
                        Auj.
                    </button>
                </div>

                {/* RIGHT: Help */}
                <div>
                    <button onClick={() => setShowHelpModal(true)} className="flex items-center gap-1 px-2 py-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors text-xs font-bold uppercase border border-transparent hover:border-slate-200">
                        <Icons.CircleHelp size={16} /> <span className="hidden sm:inline">Aide</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* LEFT SIDEBAR (Backlog) */}
                <div className="w-56 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col shrink-0 z-10">
                    <div className="p-3 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-500 uppercase flex justify-between items-center">
                        <span>Backlog ({backlogTasks.length})</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {backlogTasks.map(task => (
                            <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)} className="bg-white dark:bg-slate-800 p-2 rounded shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:border-blue-400 group">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-medium line-clamp-2">{task.title}</span>
                                    <span className={`text-[10px] px-1 rounded ${task.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>{formatDuration(Math.max(0, (task.estimatedDuration * 60) - task.spentDuration))}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MAIN GANTT AREA */}
                <div className="flex-1 overflow-auto relative flex flex-col bg-slate-50/50 dark:bg-slate-900/50" ref={ganttBodyRef} onClick={() => setShowWeekendConfig(false)}>
                    {/* HEADER */}
                    <div className="flex sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm" style={{ width: `${daysToShow * COLUMN_WIDTH}px`, minWidth: '100%' }}>
                        {calendarDates.map((date) => {
                            const dateKey = formatDateKey(date);
                            const isToday = dateKey === formatDateKey(new Date());
                            const dayData = dailyLoadMap[dateKey] || { total: 0, tasks: [] };
                            const load = dayData.total;
                            const isHovered = isDragOverDate === dateKey;

                            return (
                                <div 
                                    key={dateKey} 
                                    className={cn(
                                        "shrink-0 border-r border-slate-100 dark:border-slate-800 flex flex-col items-center justify-end pb-2 pt-1 relative group transition-colors box-border", 
                                        getColumnClasses(date, isHovered, isToday)
                                    )} 
                                    style={{ width: `${COLUMN_WIDTH}px` }}
                                    onDragOver={(e) => { e.preventDefault(); if (isDragOverDate !== dateKey) setIsDragOverDate(dateKey); }} 
                                    onDragLeave={() => setIsDragOverDate(null)} 
                                    onDrop={(e) => handleDropOnDate(e, dateKey)}
                                >
                                    <div className="w-full px-1 mb-1 absolute top-0 left-0 h-1.5"><div className={cn("w-full h-full rounded-b-sm transition-colors opacity-80", getHeatmapColor(load, date))} /></div>
                                    <span className={cn("text-xs font-bold uppercase", isToday ? "text-blue-600" : "text-slate-400")}>{date.toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                                    <span className={cn("text-sm font-bold", isToday ? "text-blue-700" : "text-slate-700 dark:text-slate-300")}>{date.getDate()}</span>
                                    
                                    {/* TOOLTIP: LOAD BREAKDOWN */}
                                    <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 p-2 pointer-events-none animate-fade-in text-left">
                                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 border-b border-slate-100 dark:border-slate-700 pb-1 flex justify-between">
                                            {/* Fix: load is in minutes, formatDuration expects seconds */}
                                            <span>Charge: {formatDuration(load * 60)}</span>
                                            <span className="text-slate-300">/ {dailyCapacityHours}h</span>
                                        </div>
                                        <div className="space-y-1">
                                            {dayData.tasks.length > 0 ? dayData.tasks.map((t: any) => (
                                                <div key={t.id} className="flex justify-between items-center text-[10px]">
                                                    <span className="truncate max-w-[70%] font-medium text-slate-700 dark:text-slate-300">{t.title}</span>
                                                    {/* Fix: t.load is in minutes, formatDuration expects seconds */}
                                                    <span className={cn("font-mono", t.colorClass || "text-slate-500")}>{formatDuration(t.load * 60)}</span>
                                                </div>
                                            )) : <div className="text-[10px] text-slate-400 italic">Aucune tâche planifiée</div>}
                                        </div>
                                        {/* Arrow */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-white dark:border-b-slate-800"></div>
                                    </div>

                                    {project.deadline === dateKey && <div className="absolute top-0 bottom-[-100vh] left-1/2 w-0.5 border-l-2 border-dashed border-red-500 z-30 pointer-events-none flex flex-col items-center"><div className="bg-red-500 text-white text-[9px] px-1 py-0.5 rounded mt-8 whitespace-nowrap font-bold">DEADLINE</div></div>}
                                </div>
                            );
                        })}
                    </div>

                    {/* BODY GRID */}
                    <div className="relative flex-1 min-h-0" style={{ width: `${daysToShow * COLUMN_WIDTH}px`, minWidth: '100%' }}>
                        <div className="absolute inset-0 flex h-full pointer-events-none">
                             {calendarDates.map((date) => {
                                const dateKey = formatDateKey(date);
                                const isToday = dateKey === formatDateKey(new Date());
                                const isHovered = isDragOverDate === dateKey;
                                return (
                                    <div 
                                        key={dateKey} 
                                        className={cn(
                                            "shrink-0 border-r border-slate-100 dark:border-slate-800/50 h-full transition-colors pointer-events-auto box-border",
                                            getColumnClasses(date, isHovered, isToday)
                                        )}
                                        style={{ width: `${COLUMN_WIDTH}px` }}
                                        onDragOver={(e) => { e.preventDefault(); if (isDragOverDate !== dateKey) setIsDragOverDate(dateKey); }} 
                                        onDrop={(e) => handleDropOnDate(e, dateKey)} 
                                    />
                                );
                             })}
                        </div>

                        <div className="py-2 space-y-2 relative z-0 pointer-events-none">
                            {scheduledTasks.map(task => {
                                if (!task.startDate || !task.dueDate) return null;
                                const start = parseDateKey(task.startDate);
                                const end = parseDateKey(task.dueDate);
                                const offsetTime = start.getTime() - viewStartDate.getTime();
                                const offsetDays = Math.ceil(offsetTime / (1000 * 60 * 60 * 24));
                                const durationDays = getDiffDays(start, end);
                                const displayDurationDays = (resizingTask && resizingTask.id === task.id && resizePreviewDays) ? resizePreviewDays : durationDays;

                                if (offsetDays + displayDurationDays < 0 || offsetDays > daysToShow) return null;

                                // Calculate Remaining for display
                                const remainingMinutes = Math.max(0, (task.estimatedDuration || 0) - (task.spentDuration ? (task.spentDuration / 60) : 0));
                                const remainingText = remainingMinutes > 0 ? formatDuration(remainingMinutes * 60) : '';

                                return (
                                    <div key={task.id} className="relative h-9 flex items-center group/row">
                                        {/* TASK BAR - Removed overflow-hidden to allow tooltip, added z-index on hover */}
                                        <div className={cn("absolute h-7 rounded-sm shadow-sm border flex items-center px-2 cursor-move group/bar pointer-events-auto transition-all box-border hover:z-[60]", task.status === 'done' ? "bg-green-100 border-green-300 text-green-800 opacity-60" : "bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200", resizingTask?.id === task.id ? "ring-2 ring-blue-500 z-50 opacity-100 shadow-xl" : "")} style={{ left: `calc(${offsetDays} * ${COLUMN_WIDTH}px)`, width: `calc(${displayDurationDays} * ${COLUMN_WIDTH}px - 1px)` }} draggable={resizingTask === null} onDragStart={(e) => handleDragStart(e, task.id)}>
                                            <div className="flex-1 truncate font-medium text-xs px-1">
                                                {task.title} {remainingText && <span className="opacity-75 font-normal ml-1">({remainingText})</span>}
                                            </div>
                                            
                                            {/* RESTORED TASK TOOLTIP */}
                                            <div className="hidden group-hover/bar:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg z-[70] pointer-events-none">
                                                <div className="font-bold mb-1 truncate max-w-[180px]">{task.title}</div>
                                                <div className="text-slate-300 flex justify-between gap-4">
                                                    <span>{new Date(task.startDate).toLocaleDateString()} - {new Date(task.dueDate).toLocaleDateString()}</span>
                                                    <span className="font-mono text-white">{formatDuration(task.estimatedDuration * 60)}</span>
                                                </div>
                                                {/* Arrow */}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                            </div>

                                            <button onClick={() => updateTask(task.id, { startDate: undefined, dueDate: undefined })} className="ml-1 text-blue-400 hover:text-red-500 opacity-0 group-hover/bar:opacity-100 pointer-events-auto"><Icons.X size={12} /></button>
                                            <div className="absolute right-0 top-0 bottom-0 w-3 cursor-e-resize hover:bg-blue-500/20 active:bg-blue-500/50 flex items-center justify-center group/handle z-10" onMouseDown={(e) => startResize(e, task, durationDays)}><div className="w-0.5 h-3 bg-blue-400/50 group-hover/handle:bg-blue-600 rounded-full" /></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            
            {resizingTask && <div className="fixed inset-0 cursor-e-resize z-[100]" />}
            
            {/* HELP MODAL */}
            {showHelpModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
                        <button onClick={() => setShowHelpModal(false)} className="absolute top-4 right-4 text-slate-400"><Icons.X size={24} /></button>
                        <h3 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2"><Icons.CircleHelp size={20} className="text-blue-500"/> Guide d'utilisation du Gantt</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 italic border-l-4 border-blue-500 pl-3 bg-slate-50 dark:bg-slate-700/50 py-2 rounded-r">
                            Ce diagramme vous aide à planifier la réalisation de vos tâches dans le temps.
                        </p>
                        <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                            <li className="flex items-start gap-2">
                                <span className="bg-slate-200 dark:bg-slate-700 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                                <div>
                                    <strong>Navigation :</strong> Utilisez les flèches ou le bouton "Auj." en haut pour vous déplacer dans le temps.
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-slate-200 dark:bg-slate-700 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                                <div>
                                    <strong>Planification :</strong> Glissez une tâche depuis le "Backlog" (gauche) vers le calendrier, ou déplacez une tâche existante.
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-slate-200 dark:bg-slate-700 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                                <div>
                                    <strong>Durée :</strong> Étirez le bord droit d'une barre pour changer la date d'échéance (cela met à jour l'estimation).
                                </div>
                            </li>
                             <li className="flex items-start gap-2">
                                <span className="bg-slate-200 dark:bg-slate-700 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</span>
                                <div>
                                    <strong>Charge :</strong> La barre colorée en haut de chaque jour indique la charge. <span className="text-emerald-600 font-bold">Vert</span> = OK, <span className="text-amber-500 font-bold">Orange</span> = Chargé, <span className="text-red-500 font-bold">Rouge</span> = Surcharge.
                                </div>
                            </li>
                             <li className="flex items-start gap-2">
                                <span className="bg-slate-200 dark:bg-slate-700 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">5</span>
                                <div>
                                    <strong>Automatisme :</strong> Si vous réduisez la capacité (slider), les tâches s'étaleront automatiquement sur plus de jours.
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};
