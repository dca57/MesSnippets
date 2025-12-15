import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  sub?: string;
  icon: React.ComponentType<{ size: number }>;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, sub, icon: Icon, color }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-start justify-between">
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
        {title}
      </p>
      <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
        {value}
      </h3>
      {sub && <p className="text-xs text-slate-400 mt-2">{sub}</p>}
    </div>
    <div className={`p-3 rounded-xl ${color} text-white`}>
      <Icon size={24} />
    </div>
  </div>
);
