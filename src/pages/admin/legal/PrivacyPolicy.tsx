import React from "react";
import { Link } from "react-router-dom";
import { Icons } from "@/core/helpers/icons";
import { useAppGlobalConfig } from "../../../features/admin/hooks/useAppConfig";

const PrivacyPolicy = () => {
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
        <h1 className="text-3xl font-bold mb-8">
          Politique de Confidentialité
        </h1>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">
              1. Collecte des données
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              {appName} collecte les données suivantes pour le bon
              fonctionnement du service :
              <ul className="list-disc ml-5 mt-2">
                <li>Données d'authentification (via Supabase Auth)</li>
                <li>
                  Données de navigation (Favoris, Catégories, Workspaces)
                  stockées dans Supabase Database
                </li>
              </ul>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              2. Utilisation des données
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Vos données sont utilisées uniquement pour vous fournir le service
              de gestion de favoris. Elles ne sont jamais revendues à des tiers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Vos droits</h2>
            <p className="text-slate-600 dark:text-slate-300">
              Conformément au RGPD, vous disposez d'un droit d'accès, de
              rectification et de suppression de vos données. Vous pouvez
              exercer ce droit en nous contactant à contact@MesSnippets.app ou
              directement depuis l'application (suppression de compte).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
