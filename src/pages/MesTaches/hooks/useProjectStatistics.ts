
import { useMemo } from 'react';
import { Project, Task } from '../types/types';

export const useProjectStatistics = (project: Project, tasks: Task[]) => {
    return useMemo(() => {
        const totalEstimated = project.modeGestionCharge 
            ? tasks.reduce((acc, t) => acc + t.estimatedDuration, 0)
            : project.manualEstimated; 
        
        const totalSpentSeconds = project.modeGestionCharge 
            ? tasks.reduce((acc, t) => acc + t.spentDuration, 0)
            : project.manualSpent * 60;
            
        const progress = totalEstimated > 0 
            ? Math.min(((totalSpentSeconds / 60) / totalEstimated) * 100, 100) 
            : 0;

        const totalRemainingMinutes = Math.max(0, totalEstimated - (totalSpentSeconds / 60));

        return {
            totalEstimated,
            totalSpentSeconds,
            progress,
            totalRemainingMinutes
        };
    }, [project, tasks]);
};
