import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Project, Task, STATUS_LABELS, Priority, Difficulty, STATUS_ORDER } from '../types/types';
import { formatDuration } from '../helpers/utils';

// Constantes de style pour les PDF
const PRIORITY_COLORS: Record<Priority, { bg: [number, number, number], text: [number, number, number], label: string }> = {
    low: { bg: [191, 219, 254], text: [30, 64, 175], label: 'Faible' },    // blue-200 / blue-800
    normal: { bg: [167, 243, 208], text: [4, 120, 87], label: 'Normale' }, // emerald-200 / emerald-700
    high: { bg: [254, 215, 170], text: [154, 52, 18], label: 'Haute' },    // orange-200 / orange-800
    urgent: { bg: [254, 202, 202], text: [153, 27, 27], label: 'Urgente' }  // red-200 / red-800
};

const DIFFICULTY_COLORS: Record<Difficulty, { color: [number, number, number], label: string }> = {
    easy: { color: [34, 197, 94], label: 'Facile' },     // green-500
    medium: { color: [234, 179, 8], label: 'Moyenne' },  // yellow-500
    hard: { color: [249, 115, 22], label: 'Difficile' },  // orange-500
    expert: { color: [220, 38, 38], label: 'Expert' }    // red-600
};

// Dessiner une icône de difficulté simplifiée dans le PDF
const drawDifficultyIcon = (doc: jsPDF, diff: Difficulty, x: number, y: number, size: number) => {
    const color = DIFFICULTY_COLORS[diff].color;
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.5);
    
    // Circle
    doc.circle(x + size/2, y + size/2, size/2 - 1, 'S');

    // Face details
    const cx = x + size/2;
    const cy = y + size/2;
    
    switch(diff) {
        case 'easy':
             // Smile
             doc.lines([[2, 0], [0, 0]], cx - 1, cy + 1, [1, 1]); // bouche simple (courbe trop complexe sans bezier)
             // Yeux
             doc.circle(cx - 1.5, cy - 1, 0.4, 'F');
             doc.circle(cx + 1.5, cy - 1, 0.4, 'F');
             break;
        case 'medium':
            // Meh (Line)
            doc.line(cx - 2, cy + 1, cx + 2, cy + 1);
            doc.circle(cx - 1.5, cy - 1, 0.4, 'F');
            doc.circle(cx + 1.5, cy - 1, 0.4, 'F');
            break;
        case 'hard':
             // Frown (Line inversée ou just line)
             doc.line(cx - 2, cy + 2, cx + 2, cy + 1); // un peu de travers
             doc.circle(cx - 1.5, cy - 1, 0.4, 'F');
             doc.circle(cx + 1.5, cy - 1, 0.4, 'F');
             break;
        case 'expert':
             // Triangle warning like
             // Override circle
             doc.setFillColor(255, 255, 255);
             doc.circle(x + size/2, y + size/2, size/2, 'F');
             doc.triangle(x + size/2, y, x, y + size, x + size, y + size, 'S');
             doc.text("!", x + size/2 - 0.5, y + size - 1.5);
             break;
    }
};

export const exportProjectToPDF = (project: Project, tasks: Task[], comment: string = '') => {
    // 1. Tri des tâches : Statut (ordre défini) puis Nom (alphabétique)
    const sortedTasks = [...tasks].sort((a, b) => {
        const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        if (statusDiff !== 0) return statusDiff;
        return a.title.localeCompare(b.title);
    });

    // Calculs pour le rapport (sur l'ensemble des tâches)
    const totalEstimated = project.modeGestionCharge 
      ? tasks.reduce((acc, t) => acc + t.estimatedDuration, 0)
      : project.manualEstimated;
    
    const totalSpentSeconds = project.modeGestionCharge 
        ? tasks.reduce((acc, t) => acc + t.spentDuration, 0)
        : project.manualSpent * 60;
    
    const totalSpentMinutes = Math.floor(totalSpentSeconds / 60);
    const progress = totalEstimated > 0 ? Math.round((totalSpentMinutes / totalEstimated) * 100) : 0;
    
    const doneTasks = tasks.filter(t => t.status === 'done' || t.status === 'archived').length;

    const date = new Date().toLocaleDateString('fr-FR', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    // --- GENERATION JSPDF ---
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let currentY = margin;

    // FONT SETUP
    doc.setFont('helvetica');

    // --- HEADER ---
    // Client (Small Uppercase)
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text((project.client || 'CLIENT NON SPÉCIFIÉ').toUpperCase(), margin, currentY + 3);

    // Date (Right)
    doc.text(date, pageWidth - margin, currentY + 3, { align: 'right' });
    doc.text("Rapport d'avancement", pageWidth - margin, currentY - 1, { align: 'right' });

    currentY += 10;

    // Project Name (Large Title)
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont('helvetica', 'bold');
    doc.text(project.name, margin, currentY);

    currentY += 10;

    // Separator
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 10;

    // --- SUMMARY CARDS ---
    const drawCard = (x: number, width: number, title: string, mainText: string, subText: string, color: [number, number, number]) => {
        // Bg
        doc.setFillColor(248, 250, 252); // slate-50
        doc.roundedRect(x, currentY, width, 25, 2, 2, 'F');
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.roundedRect(x, currentY, width, 25, 2, 2, 'S');

        // Title
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), x + 5, currentY + 6);

        // Main Text
        doc.setFontSize(14);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(mainText, x + 5, currentY + 15);

        // Sub Text
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.setFont('helvetica', 'normal');
        doc.text(subText, x + 5, currentY + 21);
    };

    const cardGap = 5;
    const cardWidth = (pageWidth - (margin * 2) - (cardGap * 2)) / 3;

    // Card 1: Temps Passé
    drawCard(margin, cardWidth, 'Temps Passé', formatDuration(totalSpentSeconds), `sur ${formatDuration(totalEstimated * 60)} estimés`, [59, 130, 246]); // blue-500

    // Card 2: Avancement
    const progressColor: [number, number, number] = progress > 100 ? [239, 68, 68] : [16, 185, 129]; // red-500 or emerald-500
    drawCard(margin + cardWidth + cardGap, cardWidth, 'Avancement', `${progress}%`, 'Global', progressColor);
    // Petite barre de progression visuelle dans la card 2
    const barX = margin + cardWidth + cardGap + 5;
    const barY = currentY + 18;
    const barW = cardWidth - 10;
    doc.setFillColor(226, 232, 240); // bg bar
    doc.rect(barX, barY, barW, 2, 'F');
    doc.setFillColor(progressColor[0], progressColor[1], progressColor[2]);
    doc.rect(barX, barY, (Math.min(progress, 100) / 100) * barW, 2, 'F');

    // Card 3: Tâches
    drawCard(margin + (cardWidth + cardGap) * 2, cardWidth, 'Tâches Terminées', `${doneTasks}`, `/ ${tasks.length} total`, [15, 23, 42]); // slate-900

    currentY += 35;

    // --- TABLE HEADING ---
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85); // slate-700
    doc.setFont('helvetica', 'bold');
    doc.text('Détail des tâches', margin, currentY);
    
    currentY += 5;

    // --- AUTOTABLE ---
    // Prepare Data
    const tableData = sortedTasks.map(t => {
        return [
            t.title,
            STATUS_LABELS[t.status], // Col 1: Status (moved before prio for better flow?) No, user asked to keep format. 
            // Previous Format: Tâche | Prio | Diff | Statut | Réalisé | Estimé
            // We'll stick to that
        ];
    });

    const bodyData = sortedTasks.map(t => [
        t.title,
        PRIORITY_COLORS[t.priority].label, // We will custom draw this
        DIFFICULTY_COLORS[t.difficulty].label, // We will custom draw this
        STATUS_LABELS[t.status], // We will custom draw this
        formatDuration(t.spentDuration),
        formatDuration(t.estimatedDuration * 60)
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [['Tâche', 'Prio.', 'Diff.', 'Statut', 'Réalisé', 'Estimé']],
        body: bodyData,
        theme: 'grid',
        styles: {
            font: 'helvetica',
            fontSize: 9,
            textColor: [51, 65, 85],
            lineColor: [226, 232, 240],
            lineWidth: 0.1,
            cellPadding: 3,
            valign: 'middle',
        },
        headStyles: {
            fillColor: [241, 245, 249], // slate-100
            textColor: [71, 85, 105], // slate-600
            fontStyle: 'bold',
            halign: 'left'
        },
        columnStyles: {
            0: { cellWidth: 'auto' }, // Tâche
            1: { cellWidth: 20, halign: 'center' }, // Prio
            2: { cellWidth: 20, halign: 'center' }, // Diff
            3: { cellWidth: 25, halign: 'center' }, // Statut
            4: { cellWidth: 20, halign: 'right', font: 'courier' }, // Réalisé
            5: { cellWidth: 20, halign: 'right', font: 'courier' }, // Estimé
        },
        didParseCell: (data) => {
            // Custom Styling via hooks if needed, but didDrawCell is better for badges
        },
        didDrawCell: (data) => {
            if (data.section === 'body') {
                const task = sortedTasks[data.row.index];
                
                // Draw Priority Badge
                if (data.column.index === 1) {
                    const style = PRIORITY_COLORS[task.priority];
                    // Clear text
                    doc.setFillColor(255, 255, 255);
                    doc.rect(data.cell.x + 1, data.cell.y + 1, data.cell.width - 2, data.cell.height - 2, 'F');
                    
                    // Draw Badge
                    doc.setFillColor(style.bg[0], style.bg[1], style.bg[2]);
                    doc.roundedRect(data.cell.x + 2, data.cell.y + 2, data.cell.width - 4, data.cell.height - 4, 1, 1, 'F');
                    
                    doc.setFontSize(7);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(style.text[0], style.text[1], style.text[2]);
                    doc.text(style.label.toUpperCase(), data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center' });
                }

                // Draw Difficulty Icon
                if (data.column.index === 2) {
                    // Clear text
                     doc.setFillColor(255, 255, 255);
                     doc.rect(data.cell.x + 1, data.cell.y + 1, data.cell.width - 2, data.cell.height - 2, 'F');
                     
                     drawDifficultyIcon(doc, task.difficulty, data.cell.x + data.cell.width/2 - 4, data.cell.y + data.cell.height/2 - 4, 8);
                }

                // Draw Status Badge (White + Border)
                if (data.column.index === 3) {
                     // Clear text
                    doc.setFillColor(255, 255, 255);
                    doc.rect(data.cell.x + 1, data.cell.y + 1, data.cell.width - 2, data.cell.height - 2, 'F');
                    
                    // Badge Container
                    doc.setFillColor(241, 245, 249); // slate-100
                    doc.setDrawColor(226, 232, 240);
                    doc.roundedRect(data.cell.x + 2, data.cell.y + 2, data.cell.width - 4, data.cell.height - 4, 1, 1, 'FD');

                    doc.setFontSize(7);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(71, 85, 105);
                    doc.text(STATUS_LABELS[task.status].toUpperCase(), data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center' });
                }
            }
        }
    });

    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 10;

    // --- COMMENTAIRES ---
    if (comment) {
        // Bg
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, currentY, pageWidth - margin * 2, 30, 2, 2, 'FD');

        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'bold');
        doc.text('COMMENTAIRES :', margin + 5, currentY + 8);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        const splitComment = doc.splitTextToSize(comment, pageWidth - margin * 2 - 10);
        doc.text(splitComment, margin + 5, currentY + 15);
        
        currentY += 40;
    } else {
        currentY += 10;
    }

    // --- FOOTER ---
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text('Généré via MesTaches App', pageWidth / 2, currentY, { align: 'center' });

    doc.save(`Rapport_${project.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};
