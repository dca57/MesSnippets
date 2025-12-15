import React from "react";
import { Icons } from "@/core/helpers/icons";
import { Link } from "react-router-dom";
import { usePlanLimits } from "../../hooks/usePlanLimits";

interface PlanFreeCardProps {
  showButton?: boolean;
}

const PlanFreeCard: React.FC<PlanFreeCardProps> = ({ showButton = true }) => {
  const { limits } = usePlanLimits();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 flex flex-col h-full">
      <div className="mb-4">
        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold uppercase">
          Gratuit
        </span>
      </div>
      <div className="flex items-baseline mb-8">
        <span className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          0€
        </span>
        <span className="text-xl text-slate-500 dark:text-slate-400 ml-2">
          /mois
        </span>
      </div>
      <ul className="space-y-4 mb-8 flex-1">
        {[
          `Max ${limits.free.maxWorkspaces} Workspaces`,
          `Max ${limits.free.maxCategoriesPerWorkspace} Catégories par workspace`,
          `Max ${limits.free.maxBookmarks} favoris`,
          `Max ${limits.free.maxTokensLLM.toLocaleString()} tokens LLM`,
          "Fonctionnalités IA de base",
          "Drag & Drop",
          "Thèmes Dark/Light",
          "Synchronisation Cloud multi-device",
          "Vue en mode liste ou grille",
          "Téléchargement de vos favoris",
        ].map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-3 text-slate-600 dark:text-slate-300"
          >
            <Icons.CheckCircle2 className="text-blue-500 shrink-0" size={20} />
            {item}
          </li>
        ))}
      </ul>
      {showButton && (
        <Link
          to="/MesSnippets"
          className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 font-bold rounded-xl transition-colors text-center"
        >
          Commencer Gratuitement
        </Link>
      )}
    </div>
  );
};

export default PlanFreeCard;
