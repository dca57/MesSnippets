import React from 'react';
import { Type, Globe, MessageSquare, Save } from 'lucide-react';

interface ParametersProps {
  siteUrl: string;
  onSiteUrlChange: (value: string) => void;
  appName: string;
  onAppNameChange: (value: string) => void;
  appSubName: string;
  onAppSubNameChange: (value: string) => void;
  loading: boolean;
  onSave: () => void;
}

const Parameters: React.FC<ParametersProps> = ({
  siteUrl,
  onSiteUrlChange,
  appName,
  onAppNameChange,
  appSubName,
  onAppSubNameChange,
  loading,
  onSave,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in">
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nom de l'application
              <p className="text-xs text-slate-500 mb-2">
                Ce nom s'affichera partout (Barre de navigation, Page d'accueil, Modale d'aide, etc.).
              </p>
            </label>
            <div className="relative">
              <Type
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={appName}
                onChange={(e) => onAppNameChange(e.target.value)}
                placeholder="Mon Application"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Sous-titre de l'application
              <p className="text-xs text-slate-500 mb-2">
                Un slogan court pour l'application (barre de navigation principale).
              </p>
            </label>
            <div className="relative">
              <MessageSquare
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={appSubName}
                onChange={(e) => onAppSubNameChange(e.target.value)}
                placeholder="Votre gestionnaire de favoris"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              URL du Site (lien externe)
              <p className="text-xs text-slate-500 mb-2">
                Utilisé dans la modale aide, au clic sur 'Visiter le site'. Si vide, lien désactivé.
              </p>
            </label>
            <div className="relative">
              <Globe
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={siteUrl}
                onChange={(e) => onSiteUrlChange(e.target.value)}
                placeholder="https://monsite.com"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={onSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {loading ? 'Sauvegarde...' : 'Sauvegarder les Paramètres'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Parameters;
