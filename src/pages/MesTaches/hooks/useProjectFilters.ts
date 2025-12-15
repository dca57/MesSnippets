
import { useState, useMemo, useEffect } from 'react';
import { Task, Status, Priority, Difficulty, STATUS_ORDER } from '../types/types';

export const useProjectFilters = (
    tasks: Task[], 
    defaultStatuses: Status[], 
    viewMode: 'kanban' | 'list',
    projectRemainingDuration: number = 0, // En minutes
    isAutoManaged: boolean = false
) => {
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'all'>('all');
  const [filterStatuses, setFilterStatuses] = useState<Status[]>(defaultStatuses);
  
  // Quick Win States
  const [isQuickWinActive, setIsQuickWinActive] = useState(false);
  const [quickWinThreshold, setQuickWinThreshold] = useState(5); // Pourcentage 1-10

  // Reset statuses when switching to Kanban (Auto-include all except archived)
  useEffect(() => {
    if (viewMode === 'kanban') {
        setFilterStatuses(defaultStatuses);
    }
  }, [viewMode, defaultStatuses]);

  // Reset Quick Win if switching to manual project or view changes significantly (optional, kept loose for UX)
  useEffect(() => {
      if (!isAutoManaged && isQuickWinActive) {
          setIsQuickWinActive(false);
      }
  }, [isAutoManaged]);

  const toggleStatusFilter = (status: Status) => {
      if (status === 'archived') {
          setFilterStatuses(['archived']);
          return;
      }
      let newStatuses = [...filterStatuses];
      // If currently only looking at archive, switch to single selection of clicked status
      if (newStatuses.length === 1 && newStatuses[0] === 'archived') {
          setFilterStatuses([status]);
          return;
      }
      
      if (newStatuses.includes(status)) {
          newStatuses = newStatuses.filter(s => s !== status);
      } else {
          newStatuses.push(status);
      }
      
      // Ensure 'archived' is mutually exclusive in this logic if desired, or just cleanup
      newStatuses = newStatuses.filter(s => s !== 'archived');
      setFilterStatuses(newStatuses);
  };

  const selectAllStatuses = () => {
      setFilterStatuses(defaultStatuses);
  };

  const filteredTasks = useMemo(() => {
    // 1. Calcul du cutoff pour Quick Win (si actif)
    // Temps max autorisé = (Temps restant projet) * (Seuil / 100)
    const quickWinCutoffMinutes = isQuickWinActive && projectRemainingDuration > 0 
        ? projectRemainingDuration * (quickWinThreshold / 100) 
        : 0;

    return tasks.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
      const matchDifficulty = filterDifficulty === 'all' || t.difficulty === filterDifficulty;
      const matchStatus = filterStatuses.includes(t.status);
      
      let matchQuickWin = true;
      if (isQuickWinActive && isAutoManaged) {
          // On ne veut que les tâches "à faire" ou "en cours" (pas terminées)
          if (t.status === 'done' || t.status === 'archived') {
              matchQuickWin = false;
          } else {
              const taskRemaining = Math.max(0, t.estimatedDuration - (t.spentDuration / 60));
              // La tâche doit avoir du temps restant positif ET être inférieure au cutoff
              // Si la tâche a dépassé son temps (taskRemaining == 0), ce n'est pas un "Quick Win"
              matchQuickWin = taskRemaining > 0 && taskRemaining <= quickWinCutoffMinutes;
          }
      }

      return matchSearch && matchPriority && matchDifficulty && matchStatus && matchQuickWin;
    }).sort((a, b) => {
        // 1. Pinned first
        if (a.isPinned !== b.isPinned) return Number(b.isPinned) - Number(a.isPinned);

        // 2. Specific logic per view
        if (viewMode === 'list') {
             // For List: Status DESC (Done -> ... -> Todo)
             const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
             if (statusDiff !== 0) return statusDiff;
        }
        
        // 3. Si Quick Win actif, trier par temps restant croissant (les plus rapides en premier)
        if (isQuickWinActive) {
            const remA = Math.max(0, a.estimatedDuration - (a.spentDuration / 60));
            const remB = Math.max(0, b.estimatedDuration - (b.spentDuration / 60));
            if (remA !== remB) return remA - remB;
        }

        // 4. User Defined Order (Drag & Drop)
        return a.order - b.order;
    });
  }, [tasks, search, filterPriority, filterDifficulty, filterStatuses, viewMode, isQuickWinActive, quickWinThreshold, projectRemainingDuration, isAutoManaged]);

  return {
      search, setSearch,
      filterPriority, setFilterPriority,
      filterDifficulty, setFilterDifficulty,
      filterStatuses, setFilterStatuses,
      filteredTasks,
      toggleStatusFilter,
      selectAllStatuses,
      // Quick Win Exports
      isQuickWinActive, setIsQuickWinActive,
      quickWinThreshold, setQuickWinThreshold
  };
};
