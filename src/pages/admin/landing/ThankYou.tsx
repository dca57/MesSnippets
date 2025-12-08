import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Icons } from "@/core/helpers/icons";
import { useAppGlobalConfig } from "../../../features/admin/hooks/useAppConfig";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import IconePlanPro from "../../../components/admin/passerPro/IconePro";

const ThankYou = () => {
  const { appName } = useAppGlobalConfig();
  const { width, height } = useWindowSize();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-white flex flex-col">
      <Helmet>
        <title>Merci ! - {appName}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={500}
        gravity={0.1}
      />

      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30 mb-8 animate-bounce-slow">
            <Icons.CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>

          <div>
            <h2 className="mt-6 text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Merci pour votre achat !
            </h2>
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-300">
              Votre compte a été mis à niveau avec succès.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-center gap-2 mb-4">
              <IconePlanPro />
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                Plan Pro Activé
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Vous avez maintenant accès à toutes les fonctionnalités premium de{" "}
              {appName}.
            </p>

            <ul className="text-left space-y-3 mb-8 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Icons.CheckCircle2 size={16} className="text-green-500" />
                100 fois plus de Favoris
              </li>
              <li className="flex items-center gap-2">
                <Icons.CheckCircle2 size={16} className="text-green-500" />
                IA avancée débloquée
              </li>
              <li className="flex items-center gap-2">
                <Icons.CheckCircle2 size={16} className="text-green-500" />
                Support prioritaire
              </li>
            </ul>

            <Link
              to="/MesSnippets"
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Retourner à mon bureau <Icons.ArrowRight size={20} />
            </Link>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-8">
            Un email de confirmation vous a été envoyé.
          </p>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="py-8 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © {new Date().getFullYear()} {appName}. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ThankYou;
