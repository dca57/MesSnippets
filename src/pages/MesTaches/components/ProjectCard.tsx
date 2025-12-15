
import React from 'react';
import { Icons } from '../helpers/icons';
import { cn, formatDuration } from '../helpers/utils';
import { Project, ProjectStatus, PROJECT_STATUS_LABELS } from '../types/types';
import { useTaskStore } from '../store/taskStore';
import { EditableText } from './common/EditableText';

interface ProjectCardProps {
    project: Project;
    onDelete: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
    const { selectProject, updateProject, tasks, moveProject } = useTaskStore();
    
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    
    // Calcul Temps & Progression (Barre de chargement)
    const totalEstimated = project.modeGestionCharge 
       ? projectTasks.reduce((acc, t) => acc + t.estimatedDuration, 0) 
       : project.manualEstimated;
    const totalSpentSeconds = project.modeGestionCharge 
       ? projectTasks.reduce((acc, t) => acc + t.spentDuration, 0)
       : project.manualSpent * 60;
    const timeProgress = totalEstimated > 0 ? Math.min(((totalSpentSeconds / 60) / totalEstimated) * 100, 100) : 0;

    // --- KPI CALCULATIONS ---
    // KPI 1: Taux de succès (Tâches terminées / Total Tâches)
    const totalTasksCount = projectTasks.length;
    const doneTasksCount = projectTasks.filter(t => t.status === 'done' || t.status === 'archived').length;
    const successRate = totalTasksCount > 0 ? Math.round((doneTasksCount / totalTasksCount) * 100) : 0;

    // KPI 2: Nb Bloquant (Status 'blocked')
    const blockedCount = projectTasks.filter(t => t.status === 'blocked').length;

    const getBorderClass = (status: ProjectStatus) => {
        switch(status) {
            case 'doing': return 'border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/20';
            case 'done': return 'border-green-500';
            default: return 'border-slate-300';
        }
    };

    const handleStatusChange = (e: React.MouseEvent, projectId: string, newStatus: ProjectStatus) => {
        e.stopPropagation();
        moveProject(projectId, newStatus);
    };

    return (
        <div 
            onClick={() => selectProject(project.id)}
            className={cn(
                "bg-white dark:bg-slate-800 rounded-xl p-6 border hover:shadow-md transition-all cursor-pointer group flex flex-col h-full relative min-h-[220px] border-t-4",
                getBorderClass(project.status)
            )}
        >
            {/* HEADER AREA: Client + KPIs + Actions */}
            <div className="flex justify-between items-start mb-2">
                
                {/* LEFT: Client Name */}
                <div className="flex-1 mr-2" onClick={(e) => e.stopPropagation()}>
                    <EditableText 
                        value={project.client} 
                        onSave={(v) => updateProject(project.id, { client: v })}
                        className="text-xs font-bold uppercase text-slate-400 tracking-wider hover:text-blue-500 transition-colors"
                        inputClassName="text-xs font-bold uppercase"
                    />
                </div>

                {/* RIGHT: KPIs & Actions Container */}
                <div className="flex items-center gap-2">
                    {/* KPIs Row (Maintenant horizontal) */}
                    <div className="flex items-center gap-2">
                        {/* KPI 1: Success Rate */}
                        <div className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1",
                            successRate === 100 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : 
                            successRate >= 50 ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                            "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                        )}>
                            <Icons.Target size={10} />
                            {successRate}%
                        </div>
                        
                        {/* KPI 2: Blockers (Show only if > 0 or always show? Request implies showing it) */}
                        <div className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1",
                            blockedCount > 0 
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse" 
                                : "bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                        )}>
                            <Icons.AlertTriangle size={10} />
                            {blockedCount}
                        </div>
                    </div>

                    {/* Delete Button */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-0.5"
                        title="Supprimer le projet"
                    >
                        <Icons.Trash2 size={16} />
                    </button>
                </div>
            </div>
            
            <div className="mb-4 flex-1" onClick={(e) => e.stopPropagation()}>
                <EditableText 
                    value={project.name}
                    onSave={(v) => updateProject(project.id, { name: v })}
                    className="text-xl font-bold text-slate-900 dark:text-white block hover:text-blue-600 leading-tight"
                    inputClassName="text-xl font-bold"
                />
            </div>

            {/* Times & Progress Section */}
            <div className="mt-2 mb-4">
                 <div className={cn(
                     "flex justify-between items-center text-xs font-mono mb-1 font-bold transition-colors",
                     !project.modeGestionCharge ? "animate-pulse text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"
                 )}>
                    <span>{formatDuration(totalSpentSeconds)} (Réal.)</span>
                    <span>{formatDuration(totalEstimated * 60)} (Est.)</span>
                 </div>
                 <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500" 
                        style={{ width: `${timeProgress}%` }} 
                    />
                </div>
            </div>
            
            <div className="mt-auto flex items-center justify-between text-xs font-medium pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 rounded-full p-0.5" onClick={(e) => e.stopPropagation()}>
                    {(['todo', 'doing', 'done'] as ProjectStatus[]).map(s => (
                        <button
                            key={s}
                            onClick={(e) => handleStatusChange(e, project.id, s)}
                            className={cn(
                                "px-2 py-0.5 rounded-full transition-all text-[10px] uppercase",
                                project.status === s 
                                    ? s === 'doing' ? "bg-white text-blue-600 shadow-sm" 
                                    : s === 'done' ? "bg-white text-green-600 shadow-sm"
                                    : "bg-white text-slate-600 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {PROJECT_STATUS_LABELS[s]}
                        </button>
                    ))}
                </div>

                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        updateProject(project.id, { modeGestionCharge: !project.modeGestionCharge });
                    }}
                    className={cn(
                        "px-2 py-1 rounded transition-colors hover:bg-slate-100 dark:hover:bg-slate-700",
                        project.modeGestionCharge ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
                    )}
                >
                    {project.modeGestionCharge ? 'Auto' : 'Manuel'}
                </button>
            </div>
        </div>
    );
};
