import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Icons } from "@/core/helpers/icons";

const SideBar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    {
      path: "/MesSnippets",
      label: "Mes Snippets",
      icon: <Icons.FileText className="w-5 h-5" />,
    },
    {
      path: "/MesFichiers",
      label: "Mes Fichiers",
      icon: <Icons.FolderOpen className="w-5 h-5" />,
    },
    {
      path: "/SQLConstructor",
      label: "SQL Constructor",
      icon: <Icons.Layout className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="fixed left-0 top-10 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-lg z-40">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <Icons.Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Mes Langages
              </h1>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-all duration-200 group
                      ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }
                    `}
                  >
                    <span
                      className={`
                      transition-transform duration-200
                      ${isActive ? "" : "group-hover:scale-110"}
                    `}
                    >
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <Icons.ChevronRight className="w-4 h-4 ml-auto text-purple-700 dark:text-purple-400" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Icons.Home className="w-5 h-5" />
            <span className="text-sm font-medium">Retour à l'accueil</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
