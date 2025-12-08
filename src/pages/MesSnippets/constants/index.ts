// Color options for Collections and Categories
export const COLOR_OPTIONS = [
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' }, 
  { value: 'blue', label: 'Bleu', class: 'bg-blue-500' },
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { value: 'purple', label: 'Violet', class: 'bg-purple-500' },    
  { value: 'pink', label: 'Rose', class: 'bg-pink-500' },
  { value: 'red', label: 'Rouge', class: 'bg-red-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'yellow', label: 'Jaune', class: 'bg-yellow-500' },
  { value: 'green', label: 'Vert', class: 'bg-green-500' },
  { value: 'teal', label: 'Turquoise', class: 'bg-teal-500' },
  { value: 'white', label: 'Blanc', class: 'bg-white border-2 border-slate-300' },
  { value: 'gray', label: 'Gris Clair', class: 'bg-gray-400' },
  { value: 'slate', label: 'Gris Foncé', class: 'bg-slate-600' },
  { value: 'black', label: 'Noir', class: 'bg-black' }
];

// Icon options for Collections and Categories
export const ICON_OPTIONS = [
  { value: 'Code2', label: 'Code 2' },
  { value: 'FileCode', label: 'Fichier Code' },
  { value: 'Folder', label: 'Dossier' },
  { value: 'FolderOpen', label: 'Dossier Ouvert' },
  { value: 'Database', label: 'Base de données' },
  { value: 'Server', label: 'Serveur' },
  { value: 'Terminal', label: 'Terminal' },
  { value: 'Boxes', label: 'Boîtes' },
  { value: 'Package', label: 'Package' },
  { value: 'Settings', label: 'Paramètres' },
  { value: 'Wrench', label: 'Clé' },
  { value: 'Hammer', label: 'Marteau' },
  { value: 'Zap', label: 'Éclair' },
  { value: 'Sparkles', label: 'Étoiles' },
  { value: 'Star', label: 'Étoile' },
  { value: 'Layers', label: 'Calques' },
  { value: 'Layout', label: 'Disposition' },
  { value: 'Grid', label: 'Grille' },
  { value: 'Table', label: 'Tableau' },
  { value: 'List', label: 'Liste' },
  { value: 'BookOpen', label: 'Livre' },
  { value: 'FileText', label: 'Document' },
  { value: 'Regex', label: 'RegEx' },
  { value: 'FileArchive', label: 'Zip/Archive' },
  { value: 'Clock', label: 'Date/Heure' },
  { value: 'ShieldCheck', label: 'Admin' },
  { value: 'UserCircle', label: 'Environnement' },
  { value: 'Sheet', label: 'Excel' },
  { value: 'DatabaseZap', label: 'Access' },
  { value: 'Mail', label: 'Outlook' },
  { value: 'Share2', label: 'SharePoint' },
  { value: 'Webhook', label: 'API' },
  { value: 'Cloud', label: 'Cloud' }
];

// Language options for syntax highlighting
export const LANGUAGE_OPTIONS = [
  { value: 'visual-basic', label: 'VBA / VBScript' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'yaml', label: 'YAML' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' }
];

// Helper function to get color classes (for dynamic Tailwind)
// Helper function to get color classes (for dynamic Tailwind)
// Merging the definitions from CollectionSelector and previous constants
// Helper function to get color classes (for dynamic Tailwind)
// Merging the definitions from CollectionSelector and previous constants
export const getColorClasses = (color: string) => {
  const colorMap: Record<string, { bg: string; text: string; border: string; bgLight: string; hoverBg: string; hex: string }> = {
    cyan: { 
      bg: 'bg-cyan-500', 
      text: 'text-cyan-600 dark:text-cyan-400', 
      border: 'border-cyan-500', 
      bgLight: 'bg-cyan-100 dark:bg-cyan-900/30',
      hoverBg: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20',
      hex: '#06b6d4'
    },
    blue: { 
      bg: 'bg-blue-500', 
      text: 'text-blue-600 dark:text-blue-400', 
      border: 'border-blue-500', 
      bgLight: 'bg-blue-100 dark:bg-blue-900/30',
      hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
      hex: '#3b82f6'
    },
    indigo: { 
      bg: 'bg-indigo-500', 
      text: 'text-indigo-600 dark:text-indigo-400', 
      border: 'border-indigo-500', 
      bgLight: 'bg-indigo-100 dark:bg-indigo-900/30',
      hoverBg: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
      hex: '#6366f1'
    },
    purple: { 
      bg: 'bg-purple-500', 
      text: 'text-purple-600 dark:text-purple-400', 
      border: 'border-purple-500', 
      bgLight: 'bg-purple-100 dark:bg-purple-900/30',
      hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
      hex: '#a855f7'
    },
    pink: { 
      bg: 'bg-pink-500', 
      text: 'text-pink-600 dark:text-pink-400', 
      border: 'border-pink-500', 
      bgLight: 'bg-pink-100 dark:bg-pink-900/30',
      hoverBg: 'hover:bg-pink-50 dark:hover:bg-pink-900/20',
      hex: '#ec4899'
    },
    red: { 
      bg: 'bg-red-500', 
      text: 'text-red-600 dark:text-red-400', 
      border: 'border-red-500', 
      bgLight: 'bg-red-100 dark:bg-red-900/30',
      hoverBg: 'hover:bg-red-50 dark:hover:bg-red-900/20',
      hex: '#ef4444'
    },
    orange: { 
      bg: 'bg-orange-500', 
      text: 'text-orange-600 dark:text-orange-400', 
      border: 'border-orange-500', 
      bgLight: 'bg-orange-100 dark:bg-orange-900/30',
      hoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-900/20',
      hex: '#f97316'
    },
    yellow: { 
      bg: 'bg-yellow-500', 
      text: 'text-yellow-600 dark:text-yellow-400', 
      border: 'border-yellow-500', 
      bgLight: 'bg-yellow-100 dark:bg-yellow-900/30',
      hoverBg: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
      hex: '#eab308'
    },
    green: { 
      bg: 'bg-green-500', 
      text: 'text-green-600 dark:text-green-400', 
      border: 'border-green-500', 
      bgLight: 'bg-green-100 dark:bg-green-900/30',
      hoverBg: 'hover:bg-green-50 dark:hover:bg-green-900/20',
      hex: '#22c55e'
    },
    teal: { 
      bg: 'bg-teal-500', 
      text: 'text-teal-600 dark:text-teal-400', 
      border: 'border-teal-500', 
      bgLight: 'bg-teal-100 dark:bg-teal-900/30',
      hoverBg: 'hover:bg-teal-50 dark:hover:bg-teal-900/20',
      hex: '#14b8a6'
    },
    white: { 
      bg: 'bg-white', 
      text: 'text-slate-700 dark:text-slate-300', 
      border: 'border-slate-300', 
      bgLight: 'bg-slate-50', 
      hoverBg: 'hover:bg-slate-50',
      hex: '#ffffff'
    },
    gray: { 
      bg: 'bg-gray-400', 
      text: 'text-gray-600 dark:text-gray-400', 
      border: 'border-gray-500', 
      bgLight: 'bg-gray-100 dark:bg-gray-700',
      hoverBg: 'hover:bg-gray-50 dark:hover:bg-gray-700',
      hex: '#9ca3af'
    },
    slate: { 
      bg: 'bg-slate-600', 
      text: 'text-slate-600 dark:text-slate-400', 
      border: 'border-slate-500', 
      bgLight: 'bg-slate-100 dark:bg-slate-700',
      hoverBg: 'hover:bg-slate-50 dark:hover:bg-slate-700',
      hex: '#475569'
    },
    black: { 
      bg: 'bg-black', 
      text: 'text-slate-900 dark:text-white', 
      border: 'border-slate-900', 
      bgLight: 'bg-slate-800 dark:bg-slate-900',
      hoverBg: 'hover:bg-slate-800',
      hex: '#000000'
    }
  };
  return colorMap[color] || colorMap.blue;
};
