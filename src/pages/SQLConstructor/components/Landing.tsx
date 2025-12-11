import React from "react";
import { Icons } from "./icons";

interface LandingProps {
  onClose: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onClose }) => {
  return (
    <div className="flex-1 bg-slate-800 text-slate-200 overflow-y-auto p-8 md:p-16 relative animate-in fade-in duration-300">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Hero */}
        <div className="text-center space-y-6 pt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <Icons.Database className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 pb-2">
            SQL Constructor
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A visual environment for building complex PostgreSQL queries.
            <br />
            <span className="text-slate-500 text-lg">
              Stop writing boilerplate. Start constructing logic.
            </span>
          </p>
          <div className="pt-6">
            <button
              onClick={onClose}
              className="group bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2 mx-auto ring-4 ring-indigo-900/20"
            >
              <Icons.Rocket className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              Start Building
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div>
          <h2 className="text-center text-sm font-bold text-slate-500 uppercase tracking-widest mb-8">
            Core Capabilities
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Icons.Network />}
              title="Auto-Join Intelligence"
              desc="Algorithmically finds the shortest path between tables using Foreign Keys. Connect tables without memorizing the schema."
            />
            <FeatureCard
              icon={<Icons.Drag />}
              title="Visual Drag & Drop"
              desc="Intuitive interface. Drag columns from the sidebar directly into your workspace. Reorder fields and priority with ease."
            />
            <FeatureCard
              icon={<Icons.Terminal />}
              title="Real-time SQL"
              desc="Instant SQL generation as you build. Optimized syntax with context-aware highlighting, ready for production."
            />
            <FeatureCard
              icon={<Icons.Filter />}
              title="Advanced Filtering"
              desc="Build complex WHERE clauses with OR groups. Support for SQL expressions and smart type-based inputs."
            />
            <FeatureCard
              icon={<Icons.Sigma />}
              title="Smart Aggregations"
              desc="Handle GROUP BY, HAVING, and aggregate functions (SUM, COUNT, AVG) automatically without SQL errors."
            />
            <FeatureCard
              icon={<Icons.Upload />}
              title="Schema Management"
              desc="Import your own database structure via JSON. Save multiple workspace configurations and switch instantly."
            />
          </div>
        </div>

        {/* Tech Specs / Footer */}
        <div className="border-t border-slate-800 pt-8 text-center">
          <p className="text-slate-600 text-sm font-medium">
            Built for PostgreSQL • React 19 • TypeScript • Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 hover:border-indigo-500/40 hover:bg-slate-800/60 transition-all duration-300 group">
    <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-indigo-400 mb-4 border border-slate-800 group-hover:scale-110 transition-transform duration-300">
      {React.cloneElement(icon, { className: "w-6 h-6" })}
    </div>
    <h3 className="text-lg font-bold text-slate-200 mb-2 group-hover:text-indigo-300 transition-colors">
      {title}
    </h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);
