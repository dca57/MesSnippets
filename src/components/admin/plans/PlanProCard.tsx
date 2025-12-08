import React from 'react';
import { Icons } from "@/core/helpers/icons";
import BadgeProLarge from '../passerPro/BadgeProLarge';
import PasserProButtonLarge from '../passerPro/PasserProButtonLarge';
import { usePlanLimits } from '../../../features/admin/hooks/usePlanLimits';

interface PlanProCardProps {
  showButton?: boolean;
}

const PlanProCard: React.FC<PlanProCardProps> = ({ showButton = true }) => {
  const { limits } = usePlanLimits();

  return (
    <div className="bg-gradient-to-b from-blue-600 to-indigo-700 rounded-3xl shadow-2xl p-8 flex flex-col text-white transform md:-translate-y-4 relative h-full">
      <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl uppercase">
        Populaire
      </div>
      <div className="mb-4">
        <BadgeProLarge/>
      </div>
      <div className="flex items-baseline mb-8">
        <span className="text-5xl font-extrabold tracking-tight">
          5€
        </span>
        <span className="text-xl text-blue-100 ml-2">/mois</span>
      </div>
      <ul className="space-y-4 mb-8 flex-1">
        {[
          "Tout ce qu'il y a dans Gratuit",
          `Max ${limits.pro.maxWorkspaces} Workspaces`,
          `Max ${limits.pro.maxCategoriesPerWorkspace} Catégories par workspace`,
          `Max ${limits.pro.maxBookmarks} favoris`,
          `Max ${limits.pro.maxTokensLLM.toLocaleString()} tokens LLM`,
          "Fonctionnalités IA avancées (Bientôt)",                  
          "Sauvegarde automatique quotidienne",
          "Partage de Workspace (Bientôt)",
          "Support prioritaire",
        ].map((item, i) => (
          <li key={i} className="flex items-center gap-3 text-blue-50">
            <Icons.CheckCircle2
              className="text-yellow-400 shrink-0"
              size={20}
            />
            {item}
          </li>
        ))}
      </ul>
      {showButton && <PasserProButtonLarge/>}
    </div>
  );
};

export default PlanProCard;
