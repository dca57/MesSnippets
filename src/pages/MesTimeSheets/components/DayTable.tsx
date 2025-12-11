import React from 'react';
import { Icons } from '../helpers/icons';
import { Timesheet, ActivityType, ACTIVITY_LABELS, TimeEntry } from '../types/types';
import { isWeekend, formatDateFr, toLocalISOString } from '../utils/dateUtils';

interface DayTableProps {
  days: Date[];
  timesheet: Timesheet;
  holidays: string[];
  emptyRows?: number; // Number of spacer rows to add at the top
  onUpdate: (dateIso: string, index: number, field: keyof TimeEntry, value: any) => void;
  onRemove: (dateIso: string, index: number) => void;
}

export const DayTable: React.FC<DayTableProps> = ({ days, timesheet, holidays, emptyRows = 0, onUpdate, onRemove }) => {
  // Matched to Admin_LightDarkMode: bg-slate-50 for light, bg-slate-700 for dark, borders 300/600
  const inputClass = "border border-slate-300 rounded px-2 py-0.5 bg-slate-50 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none";
  
  // Create an array for spacer rows
  const spacers = Array.from({ length: emptyRows });

  return (
    <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 h-fit">
      <table className="w-full text-xs">
        <thead className="bg-slate-200 dark:bg-slate-700/50 text-left border-b border-slate-300 dark:border-slate-700">
          <tr>
            <th className="p-3 w-28 font-semibold text-slate-900 dark:text-slate-200">Date</th>
            <th className="p-3 font-semibold text-slate-900 dark:text-slate-200">Activité(s)</th>
            <th className="p-3 w-12 text-center font-semibold text-slate-900 dark:text-slate-200">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {/* SPACER ROWS for alignment */}
          {spacers.map((_, i) => (
             <tr key={`spacer-${i}`} className="bg-transparent pointer-events-none select-none" aria-hidden="true">
                <td className="p-2 align-top whitespace-nowrap opacity-0">
                  <div className="font-medium">Spacer</div>
                </td>
                <td className="p-1.5 opacity-0">
                  <div className="flex flex-row items-center gap-2">
                      <div className="flex gap-1 items-center">
                        <select className={`${inputClass} w-24`} disabled><option>Mission</option></select>
                        <select className={`${inputClass} w-16`} disabled><option>1.0 j</option></select>
                      </div>
                  </div>
                </td>
                <td className="p-2 opacity-0"></td>
             </tr>
          ))}

          {days.map((date) => {
            const dateIso = toLocalISOString(date);
            const isWknd = isWeekend(date);
            const isHol = holidays.includes(dateIso);
            const isOff = isWknd || isHol;
            const dayEntries = timesheet.days[dateIso]?.entries || [];
            const dayTotal = dayEntries.reduce((a, b) => a + b.duration, 0);
            const dayOk = dayTotal === 1;

            const rowClass = isOff 
              ? "bg-slate-50 dark:bg-slate-900/40" 
              : (!dayOk && dayTotal > 0 ? "bg-red-50 dark:bg-red-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors");
              
            const availableActivities = isOff 
              ? { [ActivityType.MISSION]: ACTIVITY_LABELS[ActivityType.MISSION] } 
              : ACTIVITY_LABELS;

            // Determine if we can add another activity (Max 2, and total < 1)
            const canAdd = dayEntries.length < 2 && dayTotal < 1 && !isOff;

            return (
              <tr key={dateIso} className={rowClass}>
                <td className="p-3 align-top whitespace-nowrap">
                  <div className={`font-medium ${isOff ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>{formatDateFr(dateIso)}</div>
                </td>
                <td className="p-2">
                  <div className="flex flex-row items-center gap-3 overflow-x-visible">
                    {/* CASE: NO ENTRIES YET */}
                    {dayEntries.length === 0 && (
                       <button 
                          onClick={() => onUpdate(dateIso, -1, 'type', null)} 
                          className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all text-[10px] font-medium border border-transparent ${
                              isOff 
                              ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50' 
                              : 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40'
                          }`}
                      >
                        <Icons.Plus size={10} /> Ajouter
                      </button>
                    )}

                    {/* CASE: EXISTING ENTRIES */}
                    {dayEntries.map((entry, idx) => (
                      <div key={idx} className="flex flex-nowrap gap-1 items-center shrink-0">
                        <select 
                          value={entry.type}
                          onChange={(e) => onUpdate(dateIso, idx, 'type', e.target.value)}
                          className={`${inputClass} w-32 text-ellipsis overflow-hidden`}
                          title={ACTIVITY_LABELS[entry.type]}
                        >
                          {Object.entries(availableActivities).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                        <select 
                          value={entry.duration}
                          onChange={(e) => onUpdate(dateIso, idx, 'duration', parseFloat(e.target.value))}
                          className={`${inputClass} w-16`}
                        >
                          <option value={0.5}>0.5 j</option>
                          <option value={1}>1.0 j</option>
                        </select>
                        
                        {entry.duration > 0 && entry.type === ActivityType.MISSION && (
                          <label className="flex items-center gap-1 cursor-pointer select-none px-1" title="Télétravail">
                            <input 
                              type="checkbox" 
                              checked={entry.isTelework}
                              onChange={(e) => onUpdate(dateIso, idx, 'isTelework', e.target.checked)}
                              className="rounded text-blue-600 focus:ring-blue-500 h-3 w-3 border-slate-300 bg-slate-50 dark:bg-slate-700 dark:border-slate-600"
                            /> <span className="hidden sm:inline text-slate-500 dark:text-slate-400">TT</span>
                          </label>
                        )}

                        <button onClick={() => onRemove(dateIso, idx)} className="text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Supprimer">
                          <Icons.X size={14} />
                        </button>
                        
                        {/* INLINE ADD BUTTON (Only on first entry if eligible) */}
                        {idx === 0 && canAdd && (
                            <button 
                                onClick={() => onUpdate(dateIso, -1, 'type', null)} 
                                className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded"
                                title="Ajouter une 2ème activité"
                            >
                                <Icons.Plus size={14} />
                            </button>
                        )}
                        
                        {/* Visual Separator if there's a next entry */}
                        {idx === 0 && dayEntries.length > 1 && (
                            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </td>
                <td className={`p-3 text-center font-bold align-top ${dayTotal > 1 ? 'text-red-500' : (dayTotal < 1 && !isOff ? 'text-orange-500' : 'text-emerald-600 dark:text-emerald-400')}`}>
                  {(dayTotal > 0 || !isOff) ? dayTotal : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};