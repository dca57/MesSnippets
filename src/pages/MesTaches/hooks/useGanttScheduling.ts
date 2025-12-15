
import { useMemo } from 'react';
import { Task } from '../types/types';

export type DayMode = 'off' | 'half' | 'full';

export interface DayLoadDetail {
    total: number;
    tasks: { id: string; title: string; load: number; colorClass: string }[];
}

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

const normalizeDate = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const getDiffDays = (start: Date, end: Date) => {
    const d1 = normalizeDate(start);
    const d2 = normalizeDate(end);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export const useGanttScheduling = (
    scheduledTasks: Task[],
    dailyCapacityHours: number,
    weekendConfig: { sat: DayMode, sun: DayMode }
) => {

    const getDayCapacity = (date: Date): number => {
        const day = date.getDay();
        if (day === 0) { // Sunday
            if (weekendConfig.sun === 'off') return 0;
            if (weekendConfig.sun === 'half') return dailyCapacityHours / 2;
            return dailyCapacityHours;
        }
        if (day === 6) { // Saturday
            if (weekendConfig.sat === 'off') return 0;
            if (weekendConfig.sat === 'half') return dailyCapacityHours / 2;
            return dailyCapacityHours;
        }
        return dailyCapacityHours; // Mon-Fri
    };

    const calculateMinDueDate = (startDateStr: string, remainingMinutes: number, currentTaskId: string, currentTotalEstimated: number): string => {
        if (remainingMinutes <= 0) return startDateStr;

        let currentDate = parseDateKey(startDateStr);
        let minutesLeft = remainingMinutes;
        let loops = 0;
        
        const contentionMap: { start: number, end: number, dailyLoad: number }[] = [];

        scheduledTasks.forEach(t => {
            if (t.id === currentTaskId) return;
            if (!t.startDate || !t.dueDate) return;
            if (t.estimatedDuration > currentTotalEstimated) return;

            const tStart = parseDateKey(t.startDate);
            const tEnd = parseDateKey(t.dueDate);
            
            let effectiveDays = 0;
            let iter = new Date(tStart);
            const limit = new Date(tEnd);
            let safety = 0;
            while (iter <= limit && safety < 366) {
                if (getDayCapacity(iter) > 0) effectiveDays++;
                iter.setDate(iter.getDate() + 1);
                safety++;
            }
            if (effectiveDays === 0) effectiveDays = 1;

            const tRemaining = Math.max(0, t.estimatedDuration - (t.spentDuration ? t.spentDuration / 60 : 0));
            if (tRemaining <= 0) return;

            contentionMap.push({
                start: tStart.getTime(),
                end: tEnd.getTime(),
                dailyLoad: tRemaining / effectiveDays
            });
        });

        while (minutesLeft > 0.01 && loops < 365) {
            const currentTimestamp = currentDate.getTime();
            const globalCap = getDayCapacity(currentDate) * 60;
            let consumedByOthers = 0;

            if (globalCap > 0) {
                for (const item of contentionMap) {
                    if (currentTimestamp >= item.start && currentTimestamp <= item.end) {
                        consumedByOthers += item.dailyLoad;
                    }
                }
            }

            const availableCap = Math.max(0, globalCap - consumedByOthers);
            if (availableCap > 0) minutesLeft -= availableCap;
            if (minutesLeft <= 0.01) break;

            currentDate = addDays(currentDate, 1);
            loops++;
        }
        
        return formatDateKey(currentDate);
    };

    const dailyLoadMap = useMemo(() => {
        const loadMap: Record<string, DayLoadDetail> = {}; 

        const addLoad = (dateKey: string, task: Task, minutes: number) => {
            if (!loadMap[dateKey]) {
                loadMap[dateKey] = { total: 0, tasks: [] };
            }
            const existingEntryIndex = loadMap[dateKey].tasks.findIndex(t => t.id === task.id);
            if (existingEntryIndex !== -1) {
                loadMap[dateKey].tasks[existingEntryIndex].load += minutes;
            } else {
                loadMap[dateKey].tasks.push({
                    id: task.id,
                    title: task.title,
                    load: minutes,
                    colorClass: task.status === 'done' ? 'text-green-600' : 'text-slate-700'
                });
            }
            loadMap[dateKey].total += minutes;
        };

        const sortedTasks = [...scheduledTasks].sort((a, b) => a.estimatedDuration - b.estimatedDuration);

        sortedTasks.forEach(t => {
            if (!t.startDate || !t.dueDate) return;
            const start = parseDateKey(t.startDate);
            const end = parseDateKey(t.dueDate);
            const diff = getDiffDays(start, end);
            let workToDistribute = Math.max(0, t.estimatedDuration - (t.spentDuration ? t.spentDuration / 60 : 0));

            if (workToDistribute <= 0) return;

            if (diff <= 1) {
                // Tâche courte (1 jour)
                addLoad(formatDateKey(start), t, workToDistribute);
            } else {
                // Tâche longue (Multi jours)
                const daysObj: { key: string, cap: number, currentLoad: number }[] = [];
                let totalCapacityRange = 0;

                for(let i=0; i<diff; i++) {
                    const current = addDays(start, i);
                    const capMinutes = getDayCapacity(current) * 60;
                    if (capMinutes > 0) {
                        daysObj.push({ key: formatDateKey(current), cap: capMinutes, currentLoad: loadMap[formatDateKey(current)]?.total || 0 });
                        totalCapacityRange += capMinutes;
                    }
                }

                if (totalCapacityRange > 0) {
                    for (const d of daysObj) {
                        if (workToDistribute <= 0.01) break;
                        const space = Math.max(0, d.cap - d.currentLoad);
                        if (space > 0) {
                            const added = Math.min(space, workToDistribute);
                            addLoad(d.key, t, added);
                            d.currentLoad += added;
                            workToDistribute -= added;
                        }
                    }
                    if (workToDistribute > 0.1) {
                        daysObj.forEach(d => {
                            const ratio = d.cap / totalCapacityRange;
                            addLoad(d.key, t, workToDistribute * ratio);
                        });
                    }
                }
            }
        });

        return loadMap;
    }, [scheduledTasks, weekendConfig, dailyCapacityHours]);

    return { getDayCapacity, calculateMinDueDate, dailyLoadMap };
};
