
import React, { useMemo } from 'react';
import { useTaskStore } from '../store/taskStore';
import { formatDuration, cn } from '../helpers/utils';
import { Icons } from '../helpers/icons';

export const DashboardStats = () => {
  const { tasks, projects } = useTaskStore();

  const stats = useMemo(() => {
    // 1. Total Time
    const totalSeconds = tasks.reduce((acc, t) => acc + t.spentDuration, 0);
    
    // 2. Global Progress (Tasks count)
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'done' || t.status === 'archived').length;
    const progressRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // 3. Top Projects by Time
    const projectTimes: Record<string, number> = {};
    tasks.forEach(t => {
      projectTimes[t.projectId] = (projectTimes[t.projectId] || 0) + t.spentDuration;
    });

    // Sort projects by time desc
    const sortedProjectIds = Object.keys(projectTimes).sort((a, b) => projectTimes[b] - projectTimes[a]).slice(0, 3);
    
    const topProjects = sortedProjectIds.map(pid => {
       const project = projects.find(p => p.id === pid);
       const seconds = projectTimes[pid];
       const totalProjectTasks = tasks.filter(t => t.projectId === pid).length;
       const doneProjectTasks = tasks.filter(t => t.projectId === pid && (t.status === 'done' || t.status === 'archived')).length;
       const projProgress = totalProjectTasks > 0 ? Math.round((doneProjectTasks / totalProjectTasks) * 100) : 0;
       
       return {
         name: project ? project.name : 'Inconnu',
         client: project ? project.client : '?',
         seconds,
         progress: projProgress
       };
    });

    return { totalSeconds, totalTasks, doneTasks, progressRate, topProjects };
  }, [tasks, projects]);

  if (projects.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
      
      {/* CARD 1: TOTAL TIME */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <Icons.Zap size={64} className="text-amber-500" />
        </div>
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
             <Icons.Calendar size={20} />
           </div>
           <h3 className="font-bold text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wide">Temps Total</h3>
        </div>
        <div className="text-4xl font-bold text-slate-900 dark:text-white mt-2">
            {formatDuration(stats.totalSeconds)}
        </div>
        <p className="text-xs text-slate-400 mt-2">
            Passé sur {stats.totalTasks} tâches
        </p>
      </div>

      {/* CARD 2: GLOBAL COMPLETION */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <Icons.CheckCircle size={64} className="text-green-500" />
        </div>
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
             <Icons.Target size={20} />
           </div>
           <h3 className="font-bold text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wide">Taux de succès</h3>
        </div>
        <div className="flex items-end gap-2 mt-2">
            <div className="text-4xl font-bold text-slate-900 dark:text-white">
                {stats.progressRate}%
            </div>
            <div className="mb-1.5 text-sm font-medium text-green-500">
                ({stats.doneTasks}/{stats.totalTasks})
            </div>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${stats.progressRate}%` }} />
        </div>
      </div>

      {/* CARD 3: TOP PROJECTS */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center">
        <h3 className="font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
            <Icons.Briefcase size={14} /> Top Projets (Temps)
        </h3>
        <div className="space-y-3">
            {stats.topProjects.length > 0 ? stats.topProjects.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex-1 min-w-0 pr-2">
                        <div className="flex justify-between mb-0.5">
                             <span className="font-medium text-slate-700 dark:text-slate-200 truncate" title={p.name}>{p.name}</span>
                             <span className="font-mono text-xs font-bold text-slate-500">{formatDuration(p.seconds)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.progress}%` }} />
                        </div>
                    </div>
                </div>
            )) : (
                <div className="text-slate-400 text-xs italic">Pas assez de données...</div>
            )}
        </div>
      </div>

    </div>
  );
};
