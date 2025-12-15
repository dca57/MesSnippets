import React from 'react';
import { Icons } from "@/core/helpers/icons";

interface PlanQuotasProps {
  limits: {
    free: {
      maxWorkspaces: number;
      maxCategoriesPerWorkspace: number;
      maxBookmarks: number;
      maxUploadSizeMB: number;
    };
    pro: {
      maxWorkspaces: number;
      maxCategoriesPerWorkspace: number;
      maxBookmarks: number;
      maxUploadSizeMB: number;
    };
  };
  onLimitChange: (plan: 'free' | 'pro', key: string, value: string) => void;
  onSave: () => void;
}

const PlanQuotas: React.FC<PlanQuotasProps> = ({ limits, onLimitChange, onSave }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-400"></span> Plan Gratuit
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Limites par défaut pour les nouveaux inscrits.
          </p>
        </div>
        <div className="p-6 space-y-6">
          {Object.entries(limits.free).map(([key, val]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                type="number"
                value={val}
                onChange={(e) => onLimitChange('free', key, e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Icons.CreditCard size={120} className="text-blue-500" />
        </div>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span> Plan PRO
          </h3>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            Limites étendues pour les abonnés payants.
          </p>
        </div>
        <div className="p-6 space-y-6">
          {Object.entries(limits.pro).map(([key, val]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                type="number"
                value={val}
                onChange={(e) => onLimitChange('pro', key, e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 flex justify-end">
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Icons.Save size={20} /> Sauvegarder les Quotas
        </button>
      </div>
    </div>
  );
};

export default PlanQuotas;
