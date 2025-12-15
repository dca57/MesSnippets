import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "../helpers/icons";
import { cn } from "../helpers/utils";
import { useTaskStore } from "../store/taskStore";
import { Project } from "../types/types";

export const Sidebar = () => {
  const { projects, selectedProjectId, selectProject } = useTaskStore();
  const navigate = useNavigate();
  // Group projects by client
  const groupedProjects = useMemo(() => {
    const groups: Record<string, Project[]> = {};
    projects.forEach((p) => {
      const client = p.client || "Sans client";
      if (!groups[client]) groups[client] = [];
      groups[client].push(p);
    });
    return groups;
  }, [projects]);

  const sortedClients = Object.keys(groupedProjects).sort();

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0 transition-all overflow-hidden h-full">
      <div className="flex gap-5 p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="font-bold text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
          <Icons.Briefcase className="w-6 h-6 text-blue-700 dark:text-blue-400" />{" "}
          Mes Projets - Tâches
        </h2>
        <button
          onClick={() => {
            navigate("/MesTaches/about");
          }}
          className="w-6 h-6 text-blue-700 dark:text-blue-400 rounded"
          title="About 'Mes Tâches'"
        >
          <Icons.Info className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {sortedClients.map((client) => (
          <div key={client} className="mb-2">
            <div className="px-4 py-1 text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">
              {client}
            </div>
            {groupedProjects[client].map((p) => (
              <div
                key={p.id}
                onClick={() => selectProject(p.id)}
                className={cn(
                  "px-4 py-2 cursor-pointer flex items-center gap-2 transition-colors border-l-4 text-sm",
                  selectedProjectId === p.id
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                )}
              >
                <span
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    p.status === "doing"
                      ? "bg-blue-500 animate-pulse"
                      : p.status === "done"
                      ? "bg-green-500"
                      : "bg-slate-300"
                  )}
                />
                <span className="truncate">{p.name}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
};
