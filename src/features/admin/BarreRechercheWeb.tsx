
import React, { useState } from 'react';
import { Icons } from "@/core/helpers/icons";

const BarreRechercheWeb = () => {
  const [query, setQuery] = useState('');
  const [engine, setEngine] = useState<'google' | 'ddg'>('google');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    let url = '';
    if (engine === 'google') {
      url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    } else {
      url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    }

    window.open(url, '_blank');
    setQuery('');
  };

  const toggleEngine = () => {
    setEngine(prev => prev === 'google' ? 'ddg' : 'google');
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className="flex items-center bg-white dark:bg-slate-900/50 rounded-xl border border-slate-400 dark:border-slate-600 shadow-sm overflow-hidden h-8 shrink-0 transition-all hover:border-blue-300 dark:hover:border-blue-700 focus-within:ring-2 focus-within:ring-blue-500/20"
    >
      {/* Engine Switcher */}
      <button
        type="button"
        onClick={toggleEngine}
        className="h-full px-3 flex items-center justify-center border-r border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        title={`Moteur actuel : ${engine === 'google' ? 'Google' : 'DuckDuckGo'} (Cliquer pour changer)`}
      >
        {engine === 'google' ? (
          <span className="font-bold text-blue-500 text-xs">G</span>
        ) : (
          <span className="font-bold text-orange-500 text-xs">DDG</span>
        )}
      </button>

      {/* Input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher sur le Web..."
        className="w-32 md:w-40 lg:w-36 pl-3 pr-2 h-full bg-transparent text-xs text-slate-800 dark:text-slate-200  outline-none placeholder:text-slate-400"
      />

      {/* Submit Button */}
      <button 
        type="submit" 
        className="h-full px-3 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <Icons.Search size={16} />
      </button>
    </form>
  );
};

export default BarreRechercheWeb;
