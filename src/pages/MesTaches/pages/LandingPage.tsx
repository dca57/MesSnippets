import React from "react";
import { Link } from "react-router-dom";
import { Icons } from "../helpers/icons";

export const LandingPageMT = () => {
  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-900 animate-fade-in overflow-y-auto">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wide mb-6 border border-blue-200 dark:border-blue-800">
            <Icons.Zap size={14} className="fill-current" /> L'outil de gestion
            hybride
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
            Gérez votre quotidien,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Rendez des comptes simplement.
            </span>
          </h1>
          <p className="mt-4 text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Ni une simple liste de courses, ni un CRM collaboratif complexe.{" "}
            <br />
            L'équilibre parfait pour s'organiser soi-même tout en restant
            professionnel face au client.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
              Accéder à l'application <Icons.ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY SECTION */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Notre Philosophie
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-3xl mx-auto text-lg">
              On veut pouvoir à la fois{" "}
              <strong>rendre des comptes à son client</strong> et{" "}
              <strong>organiser son travail du quotidien</strong>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Coté Client */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group hover:border-blue-400 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icons.Briefcase size={100} />
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                <Icons.LayoutGrid size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Pour le Client : Le "Petit CRM"
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Gérez vos <strong>Projets</strong> et vos{" "}
                <strong>Tâches</strong> principales. Ce sont les éléments
                visibles, qui intéressent votre client ou responsable. Utilisez
                les vues Kanban ou Liste pour communiquer sur l'avancement
                global et générer des rapports.
              </p>
            </div>

            {/* Coté Perso */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group hover:border-purple-400 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icons.CheckSquare size={100} />
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
                <Icons.Target size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Pour Vous : Le Mode Focus
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                C'est votre "liste de courses" technique. Les{" "}
                <strong>Sous-tâches</strong> vous permettent de découper la
                complexité. Elles n'intéressent pas le client, mais elles sont
                essentielles pour votre charge mentale. En mode Focus, vous ne
                voyez que ça.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-24 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase text-sm">
              Fonctionnalités
            </span>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mt-2 mb-6">
              Conçu pour l'efficacité
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <Icons.List size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Structure 3 Niveaux
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Projet</strong> (Le client)<strong>Tâche</strong> (Le
                livrable)<strong>Sous-tâche</strong> (L'action). Une hiérarchie
                claire pour ne jamais se perdre.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <Icons.Zap size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Saisie Ultra Rapide
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Édition en ligne (Inline Editing) partout. Créez et modifiez vos
                tâches à la vitesse de la pensée, sans modales bloquantes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                <Icons.Calendar size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Vue Gantt Interactive
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Visualisez votre charge de travail dans le temps. Algorithme de
                remplissage intelligent pour optimiser vos journées.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                <Icons.LayoutGrid size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Kanban & Liste
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Vue Kanban pour le flux de travail visuel, Vue Liste pour le tri
                rapide et le nettoyage. Drag & Drop intuitif partout.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                <Icons.Target size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Mode Focus
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Double-cliquez sur une tâche pour masquer tout le reste. Lancez
                le timer et cochez vos sous-tâches une à une.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 mb-4">
                <Icons.Printer size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Reporting PDF
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Générez un rapport PDF propre en un clic pour envoyer un état
                des lieux à votre client.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 bg-slate-50 dark:bg-slate-900 text-center text-slate-400 text-sm">
        <p>
          © {new Date().getFullYear()} SNI Timesheets. Fait avec passion pour
          l'efficacité.
        </p>
      </footer>
    </div>
  );
};
