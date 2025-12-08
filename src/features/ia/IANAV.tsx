import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icons } from "@/core/helpers/icons";

const IANav = () => {

  const navItems = [
    {
      path: '/ia/nettoyage-favoris',
      label: 'Nettoyage Favoris',
      icon: Icons.Eraser, // Need to import Eraser
      description: 'Détectez doublons et liens morts',
    },
    {
      path: '/ia/renommage-favoris',
      label: 'Renommage Favoris',
      icon: Icons.Eraser, // Need to import Eraser
      description: 'Renommez vos favoris',
    },
    {
      path: '/ia/suggestion-bookmarks',
      label: 'Suggestions Bookmarks',
      icon: Icons.Sparkles,
      description: 'Trouvez de nouveaux favoris pertinents',
    },
  ];

  return (
    <div className="flex flex-col min-h-full p-4">
      <div className="mb-8">        
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Icons.Sparkles className="w-6 h-6 text-indigo-500" />
          Bureau IA
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Assistants intelligents pour votre veille
        </p>
      </div>


      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-start gap-3 p-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-800'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`
            }
          >
            <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-sm">{item.label}</div>
              <div className="text-xs opacity-70 mt-0.5 font-normal">
                {item.description}
              </div>
            </div>
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-950">
        <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 text-center">
          Propulsé par OpenAI & Supabase Edge Functions
        </div>
      </div>



    </div>
  );
};

export default IANav;
