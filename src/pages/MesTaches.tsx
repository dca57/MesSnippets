import React, { useEffect } from "react";
import { useTaskStore } from "./MesTaches/store/taskStore";
import { Sidebar } from "./MesTaches/components/Sidebar";
import { Dashboard } from "./MesTaches/pages/Dashboard";
import { ProjectDetails } from "./MesTaches/pages/ProjectDetails";
import { FocusOverlay } from "./MesTaches/components/FocusOverlay";

// --- MAIN LAYOUT ---
const MesTaches: React.FC = () => {
  const {
    selectedProjectId,
    projects,
    loadInitialData,
    isFocusMode,
    toggleFocusMode,
    toggleTaskTimer,
    tasks,
    focusedTaskId,
  } = useTaskStore();

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Initialize Data (Mock or Supabase)
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Cmd/Ctrl + Space -> Toggle Focus Mode
      if ((e.metaKey || e.ctrlKey) && e.code === "Space") {
        e.preventDefault();
        toggleFocusMode();
      }

      // 2. Esc -> Exit Focus Mode (Only if active)
      if (e.key === "Escape" && isFocusMode) {
        e.preventDefault();
        toggleFocusMode();
      }

      // 3. Cmd/Ctrl + Enter -> Start/Pause Timer (Only in Focus Mode)
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && isFocusMode) {
        e.preventDefault();
        // Determine active task (Same logic as FocusOverlay)
        const activeTask =
          tasks.find((t) => t.id === focusedTaskId) ||
          tasks.find((t) => t.isRunning);
        if (activeTask) {
          toggleTaskTimer(activeTask.id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocusMode, toggleFocusMode, toggleTaskTimer, tasks, focusedTaskId]);

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden bg-slate-50 dark:bg-slate-800">
      {/* Global Overlays */}
      <FocusOverlay />

      {selectedProject ? (
        // IF PROJECT SELECTED -> FULL SCREEN PROJECT BOARD (NO SIDEBAR)
        <div className="flex-1 overflow-hidden relative">
          <ProjectDetails project={selectedProject} />
        </div>
      ) : (
        // ELSE -> DASHBOARD WITH SIDEBAR
        <>
          <Sidebar />
          <main className="flex-1 overflow-hidden relative">
            <Dashboard />
          </main>
        </>
      )}
    </div>
  );
};

export default MesTaches;
