import React, { useState, useEffect } from "react";
import { Icons } from "../pages/MesTimeSheets/helpers/icons";
import { MissionModal } from "./MesTimeSheets/components/MissionModal";
import { TimeSheetEditor } from "../pages/MesTimeSheets/components/TimeSheetEditor";
import { MissionCard } from "../pages/MesTimeSheets/components/MissionCard";
import { MissionService } from "../pages/MesTimeSheets/services/missionService";
import { Mission } from "../pages/MesTimeSheets/types/types";



const MesTimeSheets: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  
  // State for internal navigation without changing the global URL
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const [editorParams, setEditorParams] = useState<{missionId: string, year: number, month: number} | null>(null);

  const loadMissions = async () => {
    const data = await MissionService.getMissions();
    setMissions(data);
  };

  useEffect(() => {
    loadMissions();
  }, []);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const handleCreateTimesheet = (missionId: string, month: number, year: number) => {
    setEditorParams({ missionId, year, month });
    setCurrentView('editor');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setEditorParams(null);
  };

  const handleOpenCreate = () => {
    setEditingMission(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mission: Mission) => {
    setEditingMission(mission);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMission(null);
    loadMissions(); // Refresh list after edit/create/delete
  };

  // If in Editor mode, render the editor component
  if (currentView === 'editor' && editorParams) {
    return (
      <TimeSheetEditor 
        missionId={editorParams.missionId}
        year={editorParams.year}
        month={editorParams.month}
        onBack={handleBackToDashboard}
      />
    );
  }

  // Otherwise, render the Dashboard
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 tracking-tight">Mes Timesheets</h1>
          <p className="text-green-700 dark:text-green-400 mt-1">Gérez les CRAs de vos missions</p>
        </div>
        {/* "Mes Missions" button removed as requested */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {missions.map(mission => (
          <MissionCard 
            key={mission.id}
            mission={mission}
            currentMonth={currentMonth}
            currentYear={currentYear}
            onCreateTimesheet={handleCreateTimesheet}
            onEditMission={() => handleOpenEdit(mission)}
          />
        ))}

        {/* Add Mission CTA */}
        <button 
          onClick={handleOpenCreate}
          className="rounded-lg border-2 border-dashed border-green-700 dark:border-green-400 p-6 flex flex-col items-center justify-center h-64 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer group bg-slate-50/50 dark:bg-transparent"
        >
          <div className="bg-white dark:bg-slate-800 p-4 rounded-full mb-3 shadow-sm border border-green-700 dark:border-green-400 group-hover:scale-110 transition-transform duration-200">
            <Icons.Plus className="w-6 h-6 text-green-700 dark:text-green-400 " />
          </div>
          <span className="font-medium text-green-700 dark:text-green-400 transition-colors">Ajouter une mission</span>
        </button>
      </div>

      <MissionModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        missionToEdit={editingMission}
      />
    </div>
  );
};

export default MesTimeSheets;