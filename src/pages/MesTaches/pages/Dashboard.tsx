
import React, { useState } from 'react';
import { Icons } from '../helpers/icons';
import { useTaskStore } from '../store/taskStore';
import { ProjectCard } from '../components/ProjectCard';

export const Dashboard = () => {
    const { projects, addProject, deleteProject } = useTaskStore();
    const [newProjectClient, setNewProjectClient] = useState('');
    const [newProjectName, setNewProjectName] = useState('');
    
    // State for deletion modal
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

    const handleAddProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (newProjectName && newProjectClient) {
            addProject(newProjectClient, newProjectName);
            setNewProjectName('');
        }
    };

    const confirmDelete = () => {
        if (projectToDelete) {
            deleteProject(projectToDelete);
            setProjectToDelete(null);
        }
    };

    return (
        <div className="h-full overflow-y-auto p-6 animate-fade-in relative">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tableau de Bord</h1>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                    {projects.length} Projets actifs
                </div>
            </div>
            
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                <Icons.LayoutGrid size={18} /> Tous les projets
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Add New Project Card */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col justify-center items-center text-center order-first lg:order-last min-h-[220px] hover:border-blue-400 dark:hover:border-blue-500 transition-colors group">
                    <form onSubmit={handleAddProject} className="w-full">
                        <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-2 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                                <Icons.Plus size={24} />
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Nouveau Projet</h3>
                        </div>
                        
                        <input 
                            type="text" 
                            placeholder="Nom du Client / Entreprise" 
                            className="w-full mb-2 px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:ring-2 ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-shadow"
                            value={newProjectClient}
                            onChange={e => setNewProjectClient(e.target.value)}
                            required
                        />

                        <input 
                            type="text" 
                            placeholder="Nom du projet..." 
                            className="w-full mb-3 px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:ring-2 ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-shadow"
                            value={newProjectName}
                            onChange={e => setNewProjectName(e.target.value)}
                            required
                        />
                        
                        <button 
                            type="submit"
                            disabled={!newProjectName || !newProjectClient}
                            className="w-full py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                        >
                            Créer le projet
                        </button>
                    </form>
                </div>

                {projects.map(project => (
                    <ProjectCard 
                        key={project.id} 
                        project={project} 
                        onDelete={() => setProjectToDelete(project.id)}
                    />
                ))}
            </div>

            {/* CONFIRMATION MODAL */}
            {projectToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
                        <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-500">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <Icons.AlertTriangle size={24} />
                            </div>
                            <h3 className="text-lg font-bold">Supprimer le projet ?</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                            Cette action est irréversible. Toutes les tâches associées à ce projet seront définitivement perdues.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setProjectToDelete(null)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                            >
                                Confirmer la suppression
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
