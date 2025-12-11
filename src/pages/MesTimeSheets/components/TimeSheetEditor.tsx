import React, { useRef } from 'react';
import { Icons } from '../helpers/icons';
import { MissionService } from '../services/missionService';
import { useTimeSheet } from '../hooks/useTimeSheet';
import { DayTable } from './DayTable';
import { TimeSheetSideBar } from './TimeSheetSideBar';
import { TimeSheetPrintView } from './TimeSheetPrintView';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface Props {
  missionId: string;
  year: number;
  month: number;
  onBack: () => void;
}

export const TimeSheetEditor: React.FC<Props> = ({ missionId, year, month, onBack }) => {
  const printRef = useRef<HTMLDivElement>(null);
  
  const {
    mission,
    timesheet,
    loading,
    saveMessage,
    setSaveMessage,
    stats,
    holidays,
    monthDays,
    splitData,
    updateEntry,
    removeEntry,
    handleAutoFill,
    handleSave
  } = useTimeSheet(missionId, year, month);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    // Check is now cleaner as we import it
    if (!html2pdf) {
      setSaveMessage("Erreur: Librairie PDF non chargée.");
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    if (!printRef.current || !mission) return;
    
    const element = printRef.current;
    
    // Ensure element is visible for capture
    element.style.display = 'block'; 

    const opt = {
      margin: [5, 10, 5, 10], 
      filename: `CRA_${mission.codeMission}_${year}_${month}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' }, 
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    setSaveMessage("Génération du PDF...");

    html2pdf().set(opt as any).from(element).save()
        .then(() => {
            // Hide again after generation
            element.style.display = 'none';
            setSaveMessage(null);
        })
        .catch((err: any) => {
            console.error(err);
            setSaveMessage("Erreur lors de la génération du PDF.");
            setTimeout(() => setSaveMessage(null), 3000);
            element.style.display = 'none';
        });
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Chargement...</div>;
  if (!mission || !timesheet) return (
    <div className="p-8 text-center flex flex-col items-center gap-4">
        <div className="text-red-500 font-bold">Mission ou données introuvables.</div>
        <button onClick={() => MissionService.resetData()} className="bg-red-50 text-red-700 px-4 py-2 rounded hover:bg-red-100 flex items-center gap-2"><Icons.Trash2 size={16} /> Réinitialiser</button>
        <button onClick={onBack} className="text-slate-600 hover:text-blue-600 hover:underline mt-2">Retour</button>
    </div>
  );

  return (
    <div className="w-full md:h-[calc(100vh-60px)] flex flex-col md:flex-row print:block print:h-auto print:overflow-visible">
      
      {/* SIDEBAR */}
      <TimeSheetSideBar 
        mission={mission}
        year={year}
        month={month}
        stats={stats}
        saveMessage={saveMessage}
        onBack={onBack}
        onSave={handleSave}
        onAutoFill={handleAutoFill}
        onDownloadPdf={handleDownloadPdf}
        onPrint={handlePrint}
      />

      {/* MAIN CONTENT (Split Grid) */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 md:p-6 overflow-y-auto print:hidden">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full mx-auto items-start">
          <DayTable 
            days={splitData.firstHalfDays} 
            timesheet={timesheet} 
            holidays={holidays} 
            onUpdate={updateEntry} 
            onRemove={removeEntry} 
          />
          <DayTable 
            days={splitData.secondHalfDays} 
            timesheet={timesheet} 
            holidays={holidays}
            emptyRows={splitData.rightColumnOffset}
            onUpdate={updateEntry} 
            onRemove={removeEntry} 
          />
        </div>
      </div>
      
      {/* PRINT VIEW */}
      <TimeSheetPrintView 
        ref={printRef}
        mission={mission}
        timesheet={timesheet}
        monthDays={monthDays}
        holidays={holidays}
        year={year}
        month={month}
        stats={stats}
      />
    </div>
  );
};