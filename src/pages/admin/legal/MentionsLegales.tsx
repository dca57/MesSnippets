import React from "react";
import { Link } from "react-router-dom";
import { Icons } from "@/core/helpers/icons";
import { useAppGlobalConfig } from "../../../features/admin/hooks/useAppConfig";

const MentionsLegales = () => {
  const { appName } = useAppGlobalConfig();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <Icons.ArrowLeft size={20} /> Retour à l'accueil
        </Link>
        <h1 className="text-3xl font-bold mb-8">Mentions Légales</h1>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Éditeur du site</h2>
            <p className="text-slate-600 dark:text-slate-300">
              Le site {appName} est édité par [Votre Nom ou Société],
              immatriculée au RCS de [Ville] sous le numéro [Numéro SIRET].
              <br />
              Siège social : [Votre Adresse]
              <br />
              Email : contact@MesSnippets.app
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Hébergement</h2>
            <p className="text-slate-600 dark:text-slate-300">
              Le site est hébergé par Supabase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              3. Propriété intellectuelle
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              L'ensemble de ce site relève de la législation française et
              internationale sur le droit d'auteur et la propriété
              intellectuelle. Tous les droits de reproduction sont réservés.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegales;
