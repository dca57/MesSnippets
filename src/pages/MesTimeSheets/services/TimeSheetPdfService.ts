import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Mission, Timesheet, ActivityType, ACTIVITY_LABELS } from '../types/types';
import { isWeekend, toLocalISOString } from '../utils/dateUtils';

interface PdfOptions {
  mission: Mission;
  timesheet: Timesheet;
  monthDays: Date[];
  year: number;
  month: number;
  stats: {
    workingDays: number;
    totalLogged: number;
  };
  holidays: string[];
}

export const generateTimeSheetPdf = ({
  mission,
  timesheet,
  monthDays,
  year,
  month,
  stats,
  holidays
}: PdfOptions) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // --- CONFIG ---
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  
  // Font setup
  doc.setFont('helvetica');

  // --- HEADER ---
  // Title
  const monthLabel = new Date(year, month - 1).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`CRA - ${monthLabel.toUpperCase()}`, pageWidth / 2, margin + 5, { align: 'center' });

  // 3 Boxes: PRESTATAIRE | SSII | CLIENT
  const boxWidth = (pageWidth - (margin * 2) - 10) / 3; // 10mm gap total (5mm each gap)
  const boxHeight = 35;
  const boxY = margin + 15;

  const drawBox = (x: number, title: string, content: { label: string; value: string }[]) => {
    // Header
    doc.setFillColor(219, 234, 254); // blue-100
    doc.rect(x, boxY, boxWidth, 8, 'F');
    doc.rect(x, boxY, boxWidth, 8, 'S'); // border
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), x + boxWidth / 2, boxY + 5.5, { align: 'center' });

    // Body
    doc.rect(x, boxY + 8, boxWidth, boxHeight - 8, 'S'); // border
    
    let currentY = boxY + 14;
    content.forEach(item => {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, x + 2, currentY);
      
      const labelWidth = doc.getTextWidth(item.label);
      doc.setFont('helvetica', 'normal');
      doc.text(item.value, x + 2 + labelWidth + 2, currentY);
      
      currentY += 5;
    });
  };

  // Box 1: Prestataire
  drawBox(margin, 'Prestataire', [
    { label: 'Société:', value: mission.prestataireNomEntreprise },
    { label: 'Collaborateur:', value: `${mission.prestataireNom} ${mission.prestatairePrenom}` },
    { label: 'Ville:', value: mission.prestataireVille },
  ]);

  // Box 2: SSII
  drawBox(margin + boxWidth + 5, 'SSII / Portage', [
    { label: 'Société:', value: mission.ssiNomEntreprise },
    { label: 'Responsable:', value: `${mission.ssiNomResponsable} ${mission.ssiPrenomResponsable}` },
    { label: 'Ville:', value: mission.ssiVille },
  ]);

  // Box 3: Client
  drawBox(margin + (boxWidth + 5) * 2, 'Client Final', [
    { label: 'Société:', value: mission.clientNomEntreprise },
    { label: 'Responsable:', value: `${mission.clientNomResponsable} ${mission.clientPrenomResponsable}` },
    { label: 'Mission:', value: `${mission.nomMission} (${mission.codeMission})` },
    { label: 'Ville:', value: mission.clientVille },
  ]);


  // --- GRID (AutoTable) ---
  const tableY = boxY + boxHeight + 10;

  // Prepare Data
  const allActivities = Object.keys(ACTIVITY_LABELS) as ActivityType[];
  const sortedActivities = allActivities.sort((a, b) => {
    if (a === ActivityType.MISSION) return -1;
    if (b === ActivityType.MISSION) return 1;
    return a.localeCompare(b);
  });

  const totalByActivity: Record<string, number> = {};
  const totalByDay: Record<string, number> = {};
  sortedActivities.forEach(type => (totalByActivity[type] = 0));
  monthDays.forEach(d => (totalByDay[toLocalISOString(d)] = 0));

  // Compute stats
  sortedActivities.forEach(type => {
    monthDays.forEach(d => {
      const iso = toLocalISOString(d);
      const entry = timesheet.days[iso]?.entries?.find(e => e.type === type);
      if (entry) {
        totalByActivity[type] += entry.duration;
        totalByDay[iso] += entry.duration;
      }
    });
  });

  // Table Body
  const body = [];
  
  // Rows
  sortedActivities.forEach(type => {
    const isMission = type === ActivityType.MISSION;
    
    // Separator before mission? No, matching current design
    // The current design adds separators AFTER Mission row.
    
    // Row Data
    const rowData: any[] = [ACTIVITY_LABELS[type]];
    monthDays.forEach(d => {
      const iso = toLocalISOString(d);
      const entry = timesheet.days[iso]?.entries?.find(e => e.type === type);
      if (entry && entry.duration > 0) {
        let text = entry.duration.toString();
        if (entry.isTelework) text += ' TT';
        rowData.push(text);
      } else {
        rowData.push('');
      }
    });
    rowData.push(totalByActivity[type] > 0 ? totalByActivity[type].toString() : '');
    
    body.push(rowData);

    
    // Separators for Mission
    if (isMission) {
       // We can iterate and add empty rows or use styling to add thick border.
       // Let's add empty rows to match visual
       const emptyRow = new Array(monthDays.length + 2).fill('');
       // Actually user wants "clean" design. Thick border might be better but let's stick to separator rows for exact match? 
       // No, programmatic table looks better with padding. Let's start with just rows.
    }
  });

  // Footer Row (Total)
  const totalRow = ['TOTAL'];
  monthDays.forEach(d => {
    const val = totalByDay[toLocalISOString(d)];
    totalRow.push(val > 0 ? val.toString() : '');
  });
  totalRow.push(stats.totalLogged.toString());
  body.push(totalRow);


  // Columns Definition
  const columns = [
    { header: 'Postes', dataKey: 'label' },
    ...monthDays.map(d => ({ 
      header: d.getDate().toString(), 
      dataKey: toLocalISOString(d) 
    })),
    { header: 'Total', dataKey: 'total' }
  ];

  autoTable(doc, {
    startY: tableY,
    head: [columns.map(c => c.header)],
    body: body,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1,
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      textColor: [0, 0, 0]
    },
    headStyles: {
      fillColor: [147, 197, 253], // blue-300
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0.1,
      lineColor: [0, 0, 0]
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 35, fontStyle: 'bold' }, // Postes column
      // Last column (Total)
      [monthDays.length + 1]: { fontStyle: 'bold', cellWidth: 10 }
    },
    didParseCell: (data) => {
        // Highlight weekends/holidays in headers and body
        if (data.section === 'head' || data.section === 'body') {
            const colIndex = data.column.index;
            // Column 0 is Label
            // Columns 1..N are days
            if (colIndex > 0 && colIndex <= monthDays.length) {
                const date = monthDays[colIndex - 1];
                const iso = toLocalISOString(date);
                const isOff = isWeekend(date) || holidays.includes(iso);
                if (isOff) {
                    data.cell.styles.fillColor = [209, 213, 219]; // gray-300
                }
            }
        }
        
        // Highlight Total Row
        if (data.section === 'body' && data.row.index === body.length - 1) {
             data.cell.styles.fillColor = [219, 234, 254]; // blue-100 (Total Row)
             data.cell.styles.fontStyle = 'bold';
        }
        
        // Custom styling for Mission Row (first row usually)
        if (data.section === 'body' && data.row.index === 0) {
             // Maybe light blue background for Mission row?
             // doc design has light blue
             data.cell.styles.fillColor = [219, 234, 254]; 
        }
    }
  });


  // --- FOOTER (Signatures) ---
  // @ts-ignore
  const finalY = doc.lastAutoTable.finalY + 10; // Position after table
  const today = new Date().toLocaleDateString('fr-FR');
  
  doc.setFontSize(8);
  doc.text(`Fait le : ${today}`, margin, finalY);

  const sigBoxY = finalY + 5;
  const sigBoxWidth = (pageWidth - margin * 2 - 10) / 2;
  const sigBoxHeight = 35;

  // Prestataire Sig
  // Left Side (Prestataire)
  let y = finalY + 5;
  
  // 1. Comment Box
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  
  // Comment Box
  doc.rect(margin, y, sigBoxWidth, 20, 'S'); // Single White Box (Height 20)
  doc.text('COMMENTAIRE PRESTATAIRE', margin + 2, y + 4);
  
  y += 25; // Gap between boxes

  // Signature Box
  doc.rect(margin, y, sigBoxWidth, 20, 'S'); // Single White Box (Height 20)
  doc.text('SIGNATURE PRESTATAIRE', margin + 2, y + 4);


  // Right Side (Client)
  const xRight = margin + sigBoxWidth + 10;
  y = finalY + 5;
  
  // Comment Box
  doc.rect(xRight, y, sigBoxWidth, 20, 'S');
  doc.text('COMMENTAIRE CLIENT', xRight + 2, y + 4);
  
  y += 25;
  
  // Signature Box
  doc.rect(xRight, y, sigBoxWidth, 20, 'S');
  doc.text('SIGNATURE CLIENT', xRight + 2, y + 4);


  // SAVE
  doc.save(`CRA_${mission.codeMission}_${year}_${month}.pdf`);
};
