import React, { useState, useEffect } from 'react';
import { Icons } from '../helpers/icons';
import { Mission } from '../types/types';
import { MissionService } from '../services/missionService';

interface MissionCardProps {
  mission: Mission;
  currentMonth: number;
  currentYear: number;
  onCreateTimesheet: (missionId: string, month: number, year: number) => void;
  onEditMission: () => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({ 
  mission, 
  currentMonth, 
  currentYear, 
  onCreateTimesheet,
  onEditMission
}) => {
  const [history, setHistory] = useState<{month: number, year: number}[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
    }
    setShowHistory(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
        setShowHistory(false);
    }, 300);
  };

  // Load history on mount to populate the hover menu
  useEffect(() => {
    const loadHistory = async () => {
        const data = await MissionService.getMissionHistory(mission.id);
        setHistory(data);
    };
    loadHistory();
  }, [mission.id]);

  const getPrevMonth = (m: number, y: number) => m === 1 ? { m: 12, y: y - 1 } : { m: m - 1, y };
  const getNextMonth = (m: number, y: number) => m === 12 ? { m: 1, y: y + 1 } : { m: m + 1, y };

  const prev = getPrevMonth(currentMonth, currentYear);
  const next = getNextMonth(currentMonth, currentYear);

  return (
    <div className="group relative bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between border border-green-700 dark:border-green-400 border-t-[6px] border-t-green-700 dark:border-t-green-400  overflow-visible">
      {/* Edit Button (Visible on hover) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={onEditMission} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <Icons.FileEdit size={16} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-xl text-green-700 dark:text-green-400 truncate tracking-tight" title={mission.nomMission}>
            {mission.nomMission}
          </h3>
        </div>
        <div className="px-6 mb-3">
             <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                {mission.codeMission}
             </span>
        </div>
        <div className="px-6">             
             <span className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Icons.Briefcase size={12}/> {mission.clientNomEntreprise}
             </span>
        </div>
      </div>
      
      <div className="p-4 space-y-3 mt-auto">
        <button 
          onClick={() => onCreateTimesheet(mission.id, currentMonth, currentYear)}
          className="w-full bg-green-700 dark:bg-green-400  text-slate-200 dark:text-slate-600 font-medium py-2.5 rounded-md flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Icons.FileText className="w-4 h-4" /> CRA du mois
        </button>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onCreateTimesheet(mission.id, prev.m, prev.y)}
            className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 py-1.5 px-2 rounded-md text-xs font-medium flex items-center justify-center gap-1 transition-colors border border-slate-300 dark:border-slate-600"
          >
            <Icons.ChevronLeft className="w-3 h-3" /> Mois dernier
          </button>
          <button 
            onClick={() => onCreateTimesheet(mission.id, next.m, next.y)}
            className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 py-1.5 px-2 rounded-md text-xs font-medium flex items-center justify-center gap-1 transition-colors border border-slate-300 dark:border-slate-600"
          >
            Mois prochain <Icons.ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Historique Hover Area */}
        <div 
            className="relative text-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
          <div className="text-xs text-slate-400 dark:text-slate-500 cursor-pointer hover:text-blue-600 transition-colors py-2 flex items-center justify-center gap-1">
            <Icons.Calendar size={12} /> Historique
          </div>

          {/* Dropdown Menu */}
          {showHistory && history.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-0.5 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-1 z-50 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 text-left">CRA existants</div>
                {history.map((h, idx) => (
                    <button
                        key={`${h.year}-${h.month}`}
                        onClick={() => onCreateTimesheet(mission.id, h.month, h.year)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 rounded flex justify-between items-center text-slate-700 dark:text-slate-200"
                    >
                        <span>{new Date(h.year, h.month - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                        <Icons.ChevronRight size={12} className="text-slate-300" />
                    </button>
                ))}
            </div>
          )}
           {showHistory && history.length === 0 && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 mt-1 bg-slate-800 text-white text-xs rounded py-1 px-2 z-50">
                Aucun historique disponible
            </div>
          )}
        </div>
      </div>
    </div>
  );
};