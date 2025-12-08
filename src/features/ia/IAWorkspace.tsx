import React from 'react';
import { Outlet } from 'react-router-dom';
import IANav from './IANAV';

const IAWorkspace = () => {
  return (
    <div className="flex h-[calc(100vh-40px)] w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-shrink-0 h-full overflow-y-auto">
        <IANav />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto pb-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default IAWorkspace;
