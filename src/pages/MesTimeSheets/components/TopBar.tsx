import React from "react";
import { Icons } from "../helpers/icons";

interface TopBarProps {
  
}

export const TopBar: React.FC<TopBarProps> = ({ 
}) => {  

  return (
    <header className="h-14 bg-slate-50 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 flex items-center shrink-0 z-10 px-4 gap-3">
      {/* Logo Area */}
      <div className="md:w-64 xl:w-80 flex items-center gap-3 shrink-0">
        <div className="text-green-700 dark:text-green-400">
          <Icons.Calendar className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-green-700 dark:text-green-400">Mes Timesheets</h1>
        </div>
      </div>

      <div className="h-5 w-px bg-slate-700/50 mx-2" />

      <div className="h-5 w-px bg-slate-700/50 mx-2" />

    </header>
  );
};
