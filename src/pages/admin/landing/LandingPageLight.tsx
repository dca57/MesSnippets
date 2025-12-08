import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Icons } from "@/core/helpers/icons";
import { useAppGlobalConfig } from "../../../features/admin/hooks/useAppConfig";
import { usePlanLimits } from "../../../features/admin/hooks/usePlanLimits";
import { useAuth } from "../../../context/AuthContext";
import PasserProButtonLarge from "../../../components/admin/passerPro/PasserProButtonLarge";
import BadgeProLarge from "../../../components/admin/passerPro/BadgeProLarge";
import PlanFreeCard from "../../../components/admin/plans/PlanFreeCard";
import PlanProCard from "../../../components/admin/plans/PlanProCard";

const LandingPageLight = () => {
  const { appName } = useAppGlobalConfig();
  const { limits } = usePlanLimits();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-white pb-20">
      <Helmet>
        <title>Passer Pro - {appName}</title>
      </Helmet>

      {/* Header Simple */}
      <div className="p-6">
        <Link
          to="/MesSnippets"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Icons.ArrowLeft size={20} /> Retour au bureau
        </Link>
      </div>

      <section className="py-1 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Choisissez votre plan
            </h2>
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-300">
              Débloquez tout le potentiel de {appName}
            </p>
          </div>

          {/* --- PRICING SECTION --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* FREE PLAN */}
            <PlanFreeCard />
            {/* PRO PLAN */}
            <PlanProCard />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPageLight;
