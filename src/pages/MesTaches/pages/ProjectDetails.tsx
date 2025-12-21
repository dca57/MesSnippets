
import React, { useState, useEffect } from 'react';
import { Icons } from '../helpers/icons';
import { cn, formatDuration, parseDurationInput } from '../helpers/utils';
import { Project, Status, STATUS_LABELS } from '../types/types';
import { useTaskStore } from '../store/taskStore';
import { EditableText } from '../components/common/EditableText';
import { FiltersBar } from '../components/ProjectFilters';
import { TaskCardKanban } from '../components/TaskCardKanban';
import { TaskCardList } from '../components/TaskCardList';
import { ProjectGantt } from '../components/ProjectGantt';
import { exportProjectToCSV } from '../services/exportService';
import { exportProjectToPDF } from '../services/pdfExportService';
import { useProjectFilters } from '../hooks/useProjectFilters';
import { useProjectStatistics } from '../hooks/useProjectStatistics';
import { WikiModal } from '../components/WikiModal';
import { RecipesModal } from '../components/RecipesModal';

export const ProjectDetails = ({ project }: { project: Project }) => {
  const allTasks = useTaskStore(s => s.tasks).filter(t => t.projectId === project.id);
  const { addTask, moveTaskToStatus, updateProject, selectProject, isFocusMode, toggleFocusMode } = useTaskStore();
  
  // View State
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'gantt'>('kanban');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showWikiModal, setShowWikiModal] = useState(false);
  const [showRecipesModal, setShowRecipesModal] = useState(false);
  
  // PDF Comment Modal
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfComment, setPdfComment] = useState('');

  // Statistics Hook
  const { totalEstimated, totalSpentSeconds, progress, totalRemainingMinutes } = useProjectStatistics(project, allTasks);

  // Config (Memoized to prevent infinite loop in useProjectFilters)
  const visibleColumns: Status[] = React.useMemo(() => ['todo', 'analysis', 'doing', 'blocked', 'review', 'done'], []);

  // Filters Hook
  const filters = useProjectFilters(
      allTasks, 
      visibleColumns, 
      viewMode === 'gantt' ? 'list' : viewMode, 
      totalRemainingMinutes, 
      project.modeGestionCharge
  );

  // Shortcut for Gantt
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && (e.key === 'g' || e.key === 'G')) {
            e.preventDefault();
            setViewMode(prev => prev === 'gantt' ? 'kanban' : 'gantt');
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQuickAdd = () => {
    if (newTaskTitle.trim()) {
      addTask(project.id, newTaskTitle);
      setNewTaskTitle('');
    }
  };

  const handleGeneratePdf = () => {
      exportProjectToPDF(project, allTasks, pdfComment);
      setShowPdfModal(false);
      setPdfComment('');
  };

  return (
    <div className="h-full flex flex-col animate-fade-in max-w-full mx-4 mt-2">
      {/* HEADER COMPACT */}
      <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap lg:flex-nowrap items-center justify-between gap-6">
        
        {/* LEFT: Navigation & Titles */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
             <div className="flex items-center gap-3 overflow-hidden">
                <button 
                    onClick={() => selectProject(null)} 
                    className="shrink-0 text-red-600 dark:text-red-400 hover:text-red-500 transition-colors p-1"
                    title="Retour aux projets"
                >
                    <Icons.ChevronLeft size={20} />
                </button>
                
                <div className="flex items-center gap-2 truncate text-slate-900 dark:text-white">
                    <EditableText 
                        value={project.client}
                        onSave={(v) => updateProject(project.id, { client: v })}
                        className="text-lg font-bold uppercase tracking-wide text-slate-500 shrink-0"
                        inputClassName="text-lg font-bold uppercase tracking-wide"
                    />
                    <span className="text-slate-300 dark:text-slate-600 text-xl font-light">/</span>
                    <EditableText 
                        value={project.name}
                        onSave={(v) => updateProject(project.id, { name: v })}
                        className="text-xl font-bold truncate"
                        inputClassName="text-xl font-bold"
                    />
                </div>
            </div>

            <div className="ml-9 flex items-center gap-2">
                 <button 
                    onClick={() => updateProject(project.id, { modeGestionCharge: !project.modeGestionCharge })}
                    className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase border transition-colors flex items-center gap-1.5 w-fit",
                        project.modeGestionCharge 
                            ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300"
                            : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400"
                    )}
                >
                    <Icons.Zap size={10} />
                    {project.modeGestionCharge ? "Gestion Avancée" : "Gestion Simple"}
                </button>

                <button 
                    onClick={() => setShowWikiModal(true)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-purple-800  dark:border-purple-300 bg-purple-400 dark:bg-purple-400 text-slate-600 hover:text-purple-600 hover:border-purple-200 transition-colors flex items-center gap-1.5 dark:text-slate-200 dark:hover:text-purple-300"
                    title="Wiki du Projet"
                >
                    <Icons.BookOpen size={10} />
                    Wiki
                </button>

                <button 
                    onClick={() => exportProjectToCSV(project.name, allTasks)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors flex items-center gap-1.5 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:text-blue-300"
                    title="Exporter en CSV"
                >
                    <Icons.Download size={10} />
                    CSV
                </button>

                <button 
                    onClick={() => setShowPdfModal(true)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-slate-200 bg-white text-slate-600 hover:text-red-600 hover:border-red-200 transition-colors flex items-center gap-1.5 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:text-red-300"
                    title="Rapport PDF"
                >
                    <Icons.Printer size={10} />
                    PDF
                </button>

                <button 
                    onClick={() => setShowRecipesModal(true)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-purple-800 dark:border-purple-300 bg-purple-400 dark:bg-purple-400 text-slate-600 hover:text-purple-600 hover:border-purple-200 transition-colors flex items-center gap-1.5 dark:text-slate-200 dark:hover:text-purple-300"
                    title="Cahier de Recettes"
                >
                    <Icons.FlaskConical size={10} />
                    Recettes
                </button>

                <div className="relative group ml-2">
                    <button className="text-blue-400 hover:text-blue-600 transition-colors p-1">
                        <Icons.CircleHelp size={14} />
                    </button>
                    {/* Tooltip */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border border-slate-700 pointer-events-none">
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 border-t border-l border-slate-700"></div>
                        <h4 className="font-bold mb-2 text-blue-300 border-b border-slate-700 pb-1">Astuces & Raccourcis</h4>
                        <ul className="space-y-1.5 text-slate-300">
                            <li className="flex justify-between">
                                <span>Focus Mode:</span>
                                <span className="font-mono bg-slate-700 px-1 rounded text-white">Double-clic</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Focus Toggle:</span>
                                <span className="font-mono bg-slate-700 px-1 rounded text-white">Ctrl + Space</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Vue Gantt:</span>
                                <span className="font-mono bg-slate-700 px-1 rounded text-white">Ctrl + G</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Timer (Focus):</span>
                                <span className="font-mono bg-slate-700 px-1 rounded text-white">Ctrl + Enter</span>
                            </li>
                             <li className="flex justify-between">
                                <span>Quitter Focus:</span>
                                <span className="font-mono bg-slate-700 px-1 rounded text-white">Esc</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT: Stats & Progress */}
        <div className="w-full lg:w-1/3 min-w-[300px]">
            <div className="flex justify-between items-center mb-1 text-sm">
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">(Réalisé)</span>
                     {project.modeGestionCharge ? (
                        <span className="font-mono font-bold text-lg text-slate-700 dark:text-slate-200">
                            {formatDuration(totalSpentSeconds)}
                        </span>
                    ) : (
                        <EditableText 
                            value={formatDuration(totalSpentSeconds)}
                            onSave={(val) => {
                                const seconds = parseDurationInput(val);
                                updateProject(project.id, { manualSpent: seconds / 60 });
                            }}
                            clearOnFocus={true}
                            className={cn(
                                "font-mono font-bold text-lg underline decoration-dashed underline-offset-4",
                                !project.modeGestionCharge ? "animate-pulse text-blue-600 dark:text-blue-400 decoration-blue-300" : "text-slate-700 dark:text-slate-200 decoration-slate-300 hover:decoration-blue-500"
                            )}
                            inputClassName="font-mono font-bold text-lg w-[80px]"
                        />
                    )}
                </div>

                <div className="flex items-center gap-1.5">
                    {project.modeGestionCharge ? (
                         <span className="font-mono font-bold text-lg text-slate-700 dark:text-slate-200">
                            {formatDuration(totalEstimated * 60)}
                         </span>
                    ) : (
                         <EditableText 
                            value={formatDuration(totalEstimated * 60)}
                            onSave={(val) => {
                                const seconds = parseDurationInput(val);
                                updateProject(project.id, { manualEstimated: seconds / 60 });
                            }}
                            clearOnFocus={true}
                            className={cn(
                                "font-mono font-bold text-lg text-right underline decoration-dashed underline-offset-4",
                                !project.modeGestionCharge ? "animate-pulse text-blue-600 dark:text-blue-400 decoration-blue-300" : "text-slate-700 dark:text-slate-200 decoration-slate-300 hover:decoration-blue-500"
                            )}
                            inputClassName="font-mono font-bold text-lg w-[80px] text-right"
                        />
                    )}
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">(Estimé)</span>
                </div>
            </div>

            <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500" 
                    style={{ width: `${progress}%` }} 
                />
            </div>
        </div>
      </div>

      {/* FILTERS BAR */}
      <FiltersBar 
        modeGestionCharge={project.modeGestionCharge}
        isFocusMode={isFocusMode}
        toggleFocusMode={toggleFocusMode}
        newTaskTitle={newTaskTitle}
        setNewTaskTitle={setNewTaskTitle}
        onQuickAdd={handleQuickAdd}
        viewMode={viewMode}
        setViewMode={setViewMode}
        {...filters}
        projectRemainingMinutes={totalRemainingMinutes}
        visibleColumns={visibleColumns}
      />

      {/* Content Area Switcher */}
      {viewMode === 'gantt' ? (
          <div className="flex-1 overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl">
             <ProjectGantt project={project} />
          </div>
      ) : viewMode === 'kanban' ? (
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
             {/* COMPACT KANBAN CONTAINER */}
             <div className="flex h-full gap-2 pb-4 w-full min-w-full">
                {visibleColumns.map(status => {
                   if (filters.isQuickWinActive && (status === 'done' || status === 'archived')) return null;

                   const columnTasks = filters.filteredTasks.filter(t => t.status === status);
                   return (
                       <div 
                         key={status}
                         onDragOver={(e) => e.preventDefault()}
                         onDrop={(e) => {
                             const taskId = e.dataTransfer.getData('taskId');
                             if (taskId) moveTaskToStatus(taskId, status);
                         }}
                         className="flex-1 flex flex-col min-w-[180px] bg-slate-100 dark:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-600 max-h-full"
                       >
                         {/* Centered Headers */}
                         <div className="p-2 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center relative shrink-0">
                            <span className="font-bold text-[10px] uppercase text-slate-500 dark:text-slate-400 truncate">{STATUS_LABELS[status]}</span>
                            <span className="absolute right-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                                {columnTasks.length}
                            </span>
                         </div>
                         <div className="p-1.5 flex-1 overflow-y-auto space-y-1.5 no-scrollbar">
                            {columnTasks.map(task => (
                                <TaskCardKanban 
                                    key={task.id} 
                                    task={task} 
                                    modeGestionCharge={project.modeGestionCharge}
                                    isQuickWinActive={filters.isQuickWinActive}
                                    quickWinThresholdMinutes={totalRemainingMinutes * (filters.quickWinThreshold / 100)}
                                />
                            ))}
                         </div>
                       </div>
                   );
                })}
             </div>
          </div>
      ) : (
          <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
             {filters.filteredTasks.length > 0 ? (
                 filters.filteredTasks.map(task => (
                     <TaskCardList 
                        key={task.id} 
                        task={task} 
                        modeGestionCharge={project.modeGestionCharge} 
                        isQuickWinActive={filters.isQuickWinActive}
                        quickWinThresholdMinutes={totalRemainingMinutes * (filters.quickWinThreshold / 100)}
                     />
                 ))
             ) : (
                 <div className="p-8 text-center text-slate-400 italic">Aucune tâche ne correspond aux filtres.</div>
             )}
          </div>
      )}

      {/* PDF COMMENT MODAL */}
      {showWikiModal && (
        <WikiModal 
            project={project} 
            onClose={() => setShowWikiModal(false)} 
            onUpdateProject={updateProject} 
        />
      )}

      {showRecipesModal && (
        <RecipesModal 
            project={project} 
            tasks={allTasks}
            onClose={() => setShowRecipesModal(false)} 
        />
      )}

      {/* PDF COMMENT MODAL */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Icons.FileText size={20} className="text-blue-500" />
                    Ajouter un commentaire
                </h3>
                <textarea
                    value={pdfComment}
                    onChange={(e) => setPdfComment(e.target.value)}
                    placeholder="Ex: Facture acquittée..."
                    className="w-full min-h-[100px] p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-6 resize-none"
                    autoFocus
                />
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setShowPdfModal(false)}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={handleGeneratePdf}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        Générer le PDF
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
