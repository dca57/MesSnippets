import React from 'react';
import { Icons } from '../helpers/icons';
import { Mission } from '../types/types';

interface TimeSheetSideBarProps {
  mission: Mission;
  year: number;
  month: number;
  stats: {
    workingDays: number;
    totalLogged: number;
  };
  saveMessage: string | null;
  onBack: () => void;
  onSave: () => void;
  onAutoFill: () => void;
  onDownloadPdf: () => void;
  onPrint: () => void;
}

export const TimeSheetSideBar: React.FC<TimeSheetSideBarProps> = ({
  mission,
  year,
  month,
  stats,
  saveMessage,
  onBack,
  onSave,
  onAutoFill,
  onDownloadPdf,
  onPrint
}) => {
  const isComplete = stats.totalLogged === stats.workingDays;
  const isOver = stats.totalLogged > stats.workingDays;

  return (
    <div className="w-full md:w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-6 no-print overflow-y-auto shrink-0 z-10 shadow-sm">
      <button onClick={onBack} className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-500 transition-colors font-medium">
        <Icons.ChevronLeft size={20} /> Retour
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 leading-tight tracking-tight">{mission.nomMission}</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium capitalize">{new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
      </div>

      <div className={`p-4 rounded-xl text-center border ${isComplete ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200' : isOver ? 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-200' : 'bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-200'}`}>
        <span className="block text-4xl font-bold mb-1 tracking-tighter">{stats.totalLogged}</span>
        <span className="text-xs uppercase font-bold tracking-wider opacity-70">Jours saisis</span>
        <div className="text-sm font-medium mt-3 pt-3 border-t border-black/5 dark:border-white/10">Objectif : {stats.workingDays} jours</div>
      </div>

      <div className="flex flex-col gap-3 mt-auto">
        {saveMessage && (
          <div className="text-center text-emerald-600 dark:text-emerald-400 text-sm font-bold animate-pulse bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-2 rounded-md">
            {saveMessage}
          </div>
        )}
        <button onClick={onSave} className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow font-medium">
          <Icons.Save size={18} /> Sauvegarder
        </button>
        <button onClick={onAutoFill} className="w-full bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 px-4 py-3 rounded-md flex items-center justify-center gap-2 transition-colors font-medium dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600">
          <Icons.Zap size={18} className="text-yellow-500" /> Remplissage Auto
        </button>
        <button onClick={onDownloadPdf} className="w-full bg-slate-800 text-white hover:bg-slate-900 border border-slate-800 px-4 py-3 rounded-md flex items-center justify-center gap-2 transition-colors font-medium dark:bg-slate-600 dark:border-slate-600 dark:hover:bg-slate-500">
          <Icons.Download size={18} /> Télécharger PDF
        </button>
        <button onClick={onPrint} className="w-full bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent hover:border-slate-200 px-4 py-3 rounded-md flex items-center justify-center gap-2 transition-all font-medium text-xs dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
          <Icons.Printer size={14} /> Imprimer
        </button>
      </div>
    </div>
  );
};