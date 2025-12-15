
import React from 'react';
import { Icons } from '../helpers/icons';
import { PriorityBadge } from './PriorityBadge';
import { cn, formatDuration } from '../helpers/utils';
import { Difficulty, Priority, Status, DIFFICULTY_CONFIG, STATUS_LABELS } from '../types/types';

// --- 1. Quick Add Task ---
export const QuickAddInput = ({ 
  value, 
  onChange, 
  onEnter 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  onEnter: () => void; 
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onEnter();
  };

  return (
    <div className="w-64 shrink-0 relative">
      <input
        type="text"
        placeholder="+ Nouvelle tâche rapide..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-2 text-sm rounded-lg border-2 border-dashed border-slate-600 bg-slate-100 text-slate-900 outline-none focus:bg-slate-300 focus:dark:bg-slate-600 dark:bg-slate-800 dark:border-slate-300 dark:text-white transition-all"
      />
    </div>
  );
};

// --- 2. View Toggle (Kanban/List/Gantt) ---
export const ViewToggle = ({ 
  mode, 
  onChange 
}: { 
  mode: 'kanban' | 'list' | 'gantt'; 
  onChange: (mode: 'kanban' | 'list' | 'gantt') => void; 
}) => {
  return (
    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg py-1 px-1 border border-slate-300 dark:border-slate-600 shrink-0">
      <button 
        onClick={() => onChange('kanban')}
        className={cn("p-1.5 rounded-md transition-all", mode === 'kanban' ? "bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-300" : "text-slate-500 hover:text-slate-700")}
        title="Vue Kanban"
      >
        <Icons.LayoutGrid size={16} />
      </button>
      <button 
        onClick={() => onChange('list')}
        className={cn("p-1.5 rounded-md transition-all", mode === 'list' ? "bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-300" : "text-slate-500 hover:text-slate-700")}
        title="Vue Liste"
      >
        <Icons.List size={16} />
      </button>
      <button 
        onClick={() => onChange('gantt')}
        className={cn("p-1.5 rounded-md transition-all", mode === 'gantt' ? "bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-300" : "text-slate-500 hover:text-slate-700")}
        title="Vue Gantt (Ctrl+G)"
      >
        <Icons.Calendar size={16} />
      </button>
    </div>
  );
};

// --- 3. Search Input ---
export const SearchInput = ({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (val: string) => void; 
}) => {
  return (
    <div className="relative w-32 shrink-0 transition-all focus-within:w-48">
      <Icons.Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
      <input
        type="text"
        placeholder="Filtrer..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-slate-100 text-slate-900 outline-none focus:border-blue-400 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
      />
    </div>
  );
};

// --- 4. Priority Filter ---
export const PriorityFilter = ({ 
  current, 
  onChange 
}: { 
  current: Priority | 'all'; 
  onChange: (p: Priority | 'all') => void; 
}) => {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {(['low', 'normal', 'high', 'urgent'] as Priority[]).map(p => (
        <PriorityBadge
          className={'p-2 rounded-lg border border-slate-300 dark:border-slate-600'} 
          key={p} 
          priority={p} 
          onClick={() => onChange(current === p ? 'all' : p)}
          dimmed={current !== 'all' && current !== p}
        />
      ))}
    </div>
  );
};

// --- 5. Difficulty Filter ---
export const DifficultyFilter = ({ 
  current, 
  onChange 
}: { 
  current: Difficulty | 'all'; 
  onChange: (d: Difficulty | 'all') => void; 
}) => {
  return (
    <div className="flex items-center gap-1 shrink-0">
      {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map(d => {
        const Icon = d === 'easy' ? Icons.Smile : d === 'medium' ? Icons.Meh : d === 'hard' ? Icons.Frown : Icons.AlertTriangle;
        return (
          <button 
            key={d}
            onClick={() => onChange(current === d ? 'all' : d)}
            className={cn(
              "p-2 rounded-lg transition-all border border-slate-300 dark:border-slate-600",
              current !== 'all' && current !== d ? "opacity-30 grayscale" : "hover:bg-slate-50 dark:hover:bg-slate-800",
              current === d && "bg-slate-100 dark:bg-slate-700 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600"
            )}
            title={DIFFICULTY_CONFIG[d].label}
          >
            <Icon size={16} className={DIFFICULTY_CONFIG[d].color} />
          </button>
        );
      })}
    </div>
  );
};

// --- 6. Status Filter (List View) ---
export const StatusFilter = ({ 
  selectedStatuses, 
  onToggleStatus, 
  onSelectAll, 
  allStatuses 
}: { 
  selectedStatuses: Status[]; 
  onToggleStatus: (s: Status) => void; 
  onSelectAll: () => void; 
  allStatuses: Status[];
}) => {
  const isAllSelected = selectedStatuses.length === allStatuses.length;
  const isArchivedOnly = selectedStatuses.length === 1 && selectedStatuses[0] === 'archived';

  return (
    <div className="flex items-center gap-1 shrink-0">
      <button 
        onClick={onSelectAll}
        className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase border transition-colors", isAllSelected ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900 border-transparent" : "bg-transparent text-slate-500 border-transparent hover:bg-slate-100")}
      >
        Tout
      </button>
      {allStatuses.map(status => (
        <button 
          key={status}
          onClick={() => onToggleStatus(status)}
          className={cn(
            "px-2 py-1 rounded text-[10px] font-bold uppercase border transition-colors whitespace-nowrap", 
            selectedStatuses.includes(status) 
              ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800" 
              : "bg-transparent text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          {STATUS_LABELS[status]}
        </button>
      ))}
      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
      <button
        onClick={() => onToggleStatus('archived')}
        className={cn(
          "px-2 py-1 rounded text-[10px] font-bold uppercase border transition-colors whitespace-nowrap flex items-center gap-1", 
          isArchivedOnly
            ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800" 
            : "bg-transparent text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
        )}
      >
        <Icons.Archive size={10} /> {STATUS_LABELS['archived']}
      </button>
    </div>
  );
};

// --- MAIN FILTERS BAR ---
interface FiltersBarProps {
  // Config
  modeGestionCharge: boolean;
  isFocusMode: boolean;
  toggleFocusMode: () => void;

  // Quick Add
  newTaskTitle: string;
  setNewTaskTitle: (val: string) => void;
  onQuickAdd: () => void;
  
  // View
  viewMode: 'kanban' | 'list' | 'gantt';
  setViewMode: (mode: 'kanban' | 'list' | 'gantt') => void;
  
  // Quick Win (New)
  isQuickWinActive: boolean;
  setIsQuickWinActive: (active: boolean) => void;
  quickWinThreshold: number;
  setQuickWinThreshold: (val: number) => void;
  projectRemainingMinutes: number; // For Displaying cutoff calculation

  // Search
  search: string;
  setSearch: (val: string) => void;
  
  // Priority
  filterPriority: Priority | 'all';
  setFilterPriority: (val: Priority | 'all') => void;
  
  // Difficulty
  filterDifficulty: Difficulty | 'all';
  setFilterDifficulty: (val: Difficulty | 'all') => void;
  
  // Status (List Only)
  filterStatuses: Status[];
  toggleStatusFilter: (s: Status) => void;
  selectAllStatuses: () => void;
  visibleColumns: Status[]; // To know main columns
}

const Divider = () => <div className="w-px h-6 bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-300 dark:border-slate-600" />;

export const FiltersBar: React.FC<FiltersBarProps> = (props) => {
  // Calculate display value for Quick Win threshold
  const cutoffMinutes = props.projectRemainingMinutes * (props.quickWinThreshold / 100);
  
  return (
    <div className="mb-6 flex items-center gap-4 bg-slate-200 dark:bg-slate-700 p-2 rounded-xl border border-slate-300 dark:border-slate-600 shadow-sm overflow-x-auto no-scrollbar">
      
      {/* 1. Quick Add */}
      {props.viewMode !== 'gantt' && (
        <>
            <QuickAddInput 
                value={props.newTaskTitle} 
                onChange={props.setNewTaskTitle} 
                onEnter={props.onQuickAdd} 
            />
            <Divider />
        </>
      )}

      {/* Focus Mode Button (Only in Auto Mode) - RED */}
      {props.modeGestionCharge && props.viewMode !== 'gantt' && (
          <>
            <button 
                onClick={props.toggleFocusMode}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all border shrink-0",
                    props.isFocusMode 
                        ? "bg-red-500 text-white border-red-600 animate-pulse shadow-md" 
                        : "bg-slate-100 text-red-600 border-slate-300 hover:bg-red-50 hover:border-red-200 dark:bg-slate-800 dark:text-red-400 dark:border-slate-600 dark:hover:bg-red-900/20"
                )}
            >
                <Icons.Target size={16} /> 
                <span className="hidden sm:inline">Focus</span>
            </button>
            <Divider />
          </>
      )}

      {/* 2. View Toggle */}
      <ViewToggle 
        mode={props.viewMode} 
        onChange={props.setViewMode} 
      />

      {/* 2b. QUICK WIN TOGGLE (New) - Not in Gantt */}
      {props.modeGestionCharge && props.viewMode !== 'gantt' && (
        <div className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all duration-300",
            props.isQuickWinActive 
                ? "bg-amber-100 border-amber-300 dark:bg-amber-900/40 dark:border-amber-700"
                : "bg-slate-100 border-transparent hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
        )}>
            <button 
                onClick={() => props.setIsQuickWinActive(!props.isQuickWinActive)}
                className={cn(
                    "flex items-center gap-1.5 text-sm font-bold shrink-0 transition-colors",
                    props.isQuickWinActive ? "text-amber-700 dark:text-amber-400" : "text-slate-500 hover:text-amber-600"
                )}
                title="Mode Gains Rapides"
            >
                <Icons.Zap size={16} className={props.isQuickWinActive ? "fill-current" : ""} />
                {props.isQuickWinActive && <span className="text-xs uppercase tracking-tight">Quick Win</span>}
            </button>
            
            {/* Inline Slider appearing smoothly */}
            <div className={cn(
                "overflow-hidden transition-all duration-300 flex items-center gap-2",
                props.isQuickWinActive ? "w-44 opacity-100 ml-1" : "w-0 opacity-0"
            )}>
                 <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="1"
                    value={props.quickWinThreshold}
                    onChange={(e) => props.setQuickWinThreshold(Number(e.target.value))}
                    className="h-1.5 w-16 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600 dark:accent-amber-500"
                 />
                 <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap">
                     {props.quickWinThreshold}% <span className="opacity-70">({formatDuration(cutoffMinutes * 60)})</span>
                 </span>
            </div>
        </div>
      )}

      {props.viewMode !== 'gantt' && (
        <>
            <Divider />
            <SearchInput 
                value={props.search} 
                onChange={props.setSearch} 
            />

            <Divider />

            <PriorityFilter 
                current={props.filterPriority} 
                onChange={props.setFilterPriority} 
            />

            <Divider />

            <DifficultyFilter 
                current={props.filterDifficulty} 
                onChange={props.setFilterDifficulty} 
            />
        </>
      )}

      {/* 6. Status (List View Only) */}
      {props.viewMode === 'list' && (
        <>
          <Divider />
          <StatusFilter 
            selectedStatuses={props.filterStatuses}
            onToggleStatus={props.toggleStatusFilter}
            onSelectAll={props.selectAllStatuses}
            allStatuses={props.visibleColumns}
          />
        </>
      )}
      
      {/* Gantt Specific Help Text */}
      {props.viewMode === 'gantt' && (
          <div className="text-xs text-slate-500 italic ml-4">
              Glissez-déposez les tâches pour planifier
          </div>
      )}

    </div>
  );
};
