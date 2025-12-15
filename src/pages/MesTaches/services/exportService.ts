
import { Task, STATUS_LABELS } from '../types/types';

export const exportProjectToCSV = (projectName: string, tasks: Task[]) => {
    const headers = ['Titre', 'Statut', 'Priorité', 'Difficulté', 'Estimé (min)', 'Réalisé (min)', 'Notes'];
    
    const rows = tasks.map(t => [
        `"${t.title.replace(/"/g, '""')}"`, // Escape quotes
        STATUS_LABELS[t.status],
        t.priority,
        t.difficulty,
        t.estimatedDuration,
        Math.round(t.spentDuration / 60),
        `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Projet_${projectName.replace(/\s+/g, '_')}_export.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
