import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Icons } from "@/core/helpers/icons";
import { useAppGlobalConfig } from "../../../features/admin/hooks/useAppConfig";
import { usePlanLimits } from "../../../features/admin/hooks/usePlanLimits";
import PasserProButtonLarge from "../../../components/admin/passerPro/PasserProButtonLarge";
import BadgeProLarge from "../../../components/admin/passerPro/BadgeProLarge";
import PlanFreeCard from "../../../components/admin/plans/PlanFreeCard";
import PlanProCard from "../../../components/admin/plans/PlanProCard";

const LandingPage = () => {
  const { appName, siteUrl } = useAppGlobalConfig();
  const { limits, loading } = usePlanLimits();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-white pb-20">
      <Helmet>
        <title>
          {appName} - Votre bureau web réinventé | Gestionnaire de favoris &
          Productivité
        </title>
        <meta
          name="description"
          content="Centralisez tous vos liens, organisez vos projets par espaces de travail et gagnez du temps avec MesSnippets. Le bureau virtuel ultime pour le télétravail et la productivité."
        />
        <meta
          property="og:title"
          content={`${appName} - Votre bureau web réinventé`}
        />
        <meta
          property="og:description"
          content="Centralisez tous vos liens, organisez vos projets par espaces de travail et gagnez du temps avec MesSnippets."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:image" content={`${siteUrl}og-image.jpg`} />
      </Helmet>
      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-blue-200/30 to-purple-200/30 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Nouveau
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 animate-fade-in">
            Votre bureau web,
            <br /> réinventé.
          </h1>

          <p className="mt-4 text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 animate-fade-in opacity-90">
            Centralisez tous vos liens, organisez vos projets par espaces de
            travail et gagnez du temps grâce à une interface fluide et
            intelligente.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Link
              to="/MesSnippets"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              Accéder à mon bureau <Icons.ArrowRight size={20} />
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-lg transition-all"
            >
              Découvrir les fonctions
            </a>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section
        id="features"
        className="py-24 bg-white dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              Fonctionnalités
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Tout ce dont vous avez besoin pour naviguer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <Icons.Briefcase className="text-white" size={24} />,
                color: "bg-blue-500",
                title: "Espaces de Travail",
                desc: "Séparez votre vie Pro et Perso. Créez des workspaces distincts (Travail, Maison, Veille) et basculez de l'un à l'autre en un clic.",
              },
              {
                icon: <Icons.MousePointer2 className="text-white" size={24} />,
                color: "bg-purple-500",
                title: "Drag & Drop Intuitif",
                desc: "Organisez tout visuellement. Glissez un lien depuis votre navigateur directement dans une catégorie pour l'ajouter.",
              },
              {
                icon: <Icons.Search className="text-white" size={24} />,
                color: "bg-emerald-500",
                title: "Recherche Instantanée",
                desc: "Ne perdez plus jamais un lien. Filtrez par nom, URL ou tags instantanément à travers toutes vos catégories.",
              },
              {
                icon: <Icons.Palette className="text-white" size={24} />,
                color: "bg-pink-500",
                title: "Personnalisation Totale",
                desc: "Choisissez parmi 50+ icônes et 20+ couleurs pour vos catégories et workspaces. Adaptez l'interface à votre goût.",
              },
              {
                icon: <Icons.Layers className="text-white" size={24} />,
                color: "bg-amber-500",
                title: "Tri Intelligent",
                desc: "Triez vos favoris par date, par ordre manuel ou affichez uniquement vos favoris épinglés par catégorie.",
              },
              {
                icon: <Icons.Zap className="text-white" size={24} />,
                color: "bg-indigo-500",
                title: "Accès Rapide",
                desc: "Vos sites les plus utilisés et vos épinglés sont toujours accessibles en un clic via le menu d'accès rapide.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 hover:-translate-y-1 transition-transform border border-slate-100 dark:border-slate-700"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Simple et Transparent
            </h2>
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-300">
              Commencez gratuitement, passez pro pour plus de puissance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* FREE PLAN */}
            <PlanFreeCard />

            {/* PRO PLAN */}
            <PlanProCard />
          </div>
        </div>
      </section>

      {/* --- CTA FOOTER --- */}
      <section className="py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Prêt à organiser votre vie numérique ?
        </h2>
        <Link
          to="/MesSnippets"
          className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-lg hover:opacity-90 transition-opacity"
        >
          Lancer l'application <Icons.ArrowRight size={20} />
        </Link>
      </section>

      {/* --- TESTIMONIALS (MOCKED) --- */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Ils adorent MesSnippets
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sophie Martin",
                role: "Freelance",
                content:
                  "Enfin un outil qui me permet de séparer mes liens pro et perso. L'interface est magnifique !",
              },
              {
                name: "Thomas Dubois",
                role: "Développeur",
                content:
                  "Le drag & drop est super fluide. Je gagne un temps fou chaque jour.",
              },
              {
                name: "Marie Leroy",
                role: "Chef de projet",
                content:
                  "Simple, efficace et beau. Je ne peux plus m'en passer pour organiser ma veille.",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icons.Star
                      key={star}
                      size={16}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-6 italic">
                  "{t.content}"
                </p>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {t.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- WHO ARE WE --- */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
            Qui sommes-nous ?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            MesSnippets est développé par une équipe passionnée de productivité
            et de design. Notre mission est de simplifier votre vie numérique en
            créant des outils beaux et intuitifs qui s'effacent pour laisser
            place à votre contenu.
          </p>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © {new Date().getFullYear()} {appName}. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <Link
              to="/mentions-legales"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Mentions Légales
            </Link>
            <Link
              to="/politique-confidentialite"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Politique de Confidentialité
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
