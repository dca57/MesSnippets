import React from 'react';
import { Settings, Save } from 'lucide-react';

interface Feature {
  id: string;
  label: string;
  free: boolean;
  pro: boolean;
}

interface PlanProps {
  features: Feature[];
  onToggleFeature: (featureId: string, plan: 'free' | 'pro') => void;
  onSave: () => void;
}

const Plan: React.FC<PlanProps> = ({ features, onToggleFeature, onSave }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">
            Feature Flipping
          </h3>
          <p className="text-sm text-slate-500">
            Gérez la disponibilité des fonctionnalités par plan.
          </p>
        </div>
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-all text-sm"
        >
          <Save size={16} /> Appliquer
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium">
            <tr>
              <th className="px-6 py-4 w-1/2">Fonctionnalité</th>
              <th className="px-6 py-4 text-center w-1/4">Plan Gratuit</th>
              <th className="px-6 py-4 text-center w-1/4">Plan PRO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {features.map((feat) => (
              <tr
                key={feat.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings size={16} className="text-slate-400" />
                  {feat.label}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => onToggleFeature(feat.id, 'free')}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                      feat.free
                        ? 'bg-green-500'
                        : 'bg-slate-200 dark:bg-slate-600'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                        feat.free ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    ></div>
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => onToggleFeature(feat.id, 'pro')}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                      feat.pro
                        ? 'bg-blue-600'
                        : 'bg-slate-200 dark:bg-slate-600'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                        feat.pro ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    ></div>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Plan;
