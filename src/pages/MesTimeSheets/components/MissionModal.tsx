import React, { useState, useEffect } from 'react';
import { Icons } from '../helpers/icons';
import { Mission } from '../types/types';
import { MissionService } from '../services/missionService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  missionToEdit: Mission | null; // If null, we are creating
}

export const MissionModal: React.FC<Props> = ({ isOpen, onClose, missionToEdit }) => {
  const [formData, setFormData] = useState<Partial<Mission>>({});

  useEffect(() => {
    if (isOpen) {
      if (missionToEdit) {
        setFormData({ ...missionToEdit });
      } else {
        setFormData({ id: '' }); // Reset for creation
      }
    }
  }, [isOpen, missionToEdit]);

  const handleSaveMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nomMission) {
      await MissionService.saveMission(formData as Mission);
      onClose();
    }
  };

  const handleDeleteMission = async () => {
    if (formData.id && confirm("Êtes-vous sûr de vouloir supprimer cette mission ?")) {
        await MissionService.deleteMission(formData.id);
        onClose();
    }
  };

  // STYLE HARMONIZATION
  const inputClass = "w-full px-4 py-1 text-sm rounded-md border border-slate-300 bg-slate-50 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-shadow";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Icons.Briefcase className="w-5 h-5 text-blue-600" /> 
            {missionToEdit ? 'Modifier la Mission' : 'Nouvelle Mission'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
            <form onSubmit={handleSaveMission} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Nom (Affichage Dashboard)</label>
                  <input required type="text" value={formData.nomMission || ''} onChange={e => setFormData({...formData, nomMission: e.target.value})} className={inputClass} placeholder="Ex: Mission Banque Populaire" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Code Mission (Référence Facture)</label>
                  <input required type="text" value={formData.codeMission || ''} onChange={e => setFormData({...formData, codeMission: e.target.value})} className={inputClass} />
                </div>

                {/* Prestataire Section */}
                <div className="md:col-span-2 mt-2 bg-slate-300 dark:bg-slate-400 p-2 rounded border border-slate-700 dark:border-slate-300"><h4 className="text-xs font-bold text-slate-700 dark:text-slate-800 uppercase tracking-wider flex items-center gap-2"><Icons.User size={14}/> Prestataire</h4></div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Entreprise Prestataire</label>
                  <input required type="text" value={formData.prestataireNomEntreprise || ''} onChange={e => setFormData({...formData, prestataireNomEntreprise: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Ville</label>
                  <input required type="text" value={formData.prestataireVille || ''} onChange={e => setFormData({...formData, prestataireVille: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Nom (Freelance)</label>
                  <input required type="text" value={formData.prestataireNom || ''} onChange={e => setFormData({...formData, prestataireNom: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Prénom (Freelance)</label>
                  <input required type="text" value={formData.prestatairePrenom || ''} onChange={e => setFormData({...formData, prestatairePrenom: e.target.value})} className={inputClass} />
                </div>
                
                {/* SSII Section */}
                <div className="md:col-span-2 mt-2 bg-slate-300 dark:bg-slate-400 p-2 rounded border border-slate-700 dark:border-slate-300"><h4 className="text-xs font-bold text-slate-700 dark:text-slate-800 uppercase tracking-wider flex items-center gap-2"><Icons.Briefcase size={14}/> SSII Porteuse</h4></div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Entreprise</label>
                  <input required type="text" value={formData.ssiNomEntreprise || ''} onChange={e => setFormData({...formData, ssiNomEntreprise: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Ville</label>
                  <input required type="text" value={formData.ssiVille || ''} onChange={e => setFormData({...formData, ssiVille: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Nom Responsable</label>
                  <input required type="text" value={formData.ssiNomResponsable || ''} onChange={e => setFormData({...formData, ssiNomResponsable: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Prénom Responsable</label>
                  <input required type="text" value={formData.ssiPrenomResponsable || ''} onChange={e => setFormData({...formData, ssiPrenomResponsable: e.target.value})} className={inputClass} />
                </div>

                {/* Client Section */}
                <div className="md:col-span-2 mt-2 bg-slate-300 dark:bg-slate-400 p-2 rounded border border-slate-700 dark:border-slate-300"><h4 className="text-xs font-bold text-slate-700 dark:text-slate-800 uppercase tracking-wider flex items-center gap-2"><Icons.Briefcase size={14}/> Client Final</h4></div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Entreprise</label>
                  <input required type="text" value={formData.clientNomEntreprise || ''} onChange={e => setFormData({...formData, clientNomEntreprise: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Ville</label>
                  <input required type="text" value={formData.clientVille || ''} onChange={e => setFormData({...formData, clientVille: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Nom Responsable</label>
                  <input required type="text" value={formData.clientNomResponsable || ''} onChange={e => setFormData({...formData, clientNomResponsable: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Prénom Responsable</label>
                  <input required type="text" value={formData.clientPrenomResponsable || ''} onChange={e => setFormData({...formData, clientPrenomResponsable: e.target.value})} className={inputClass} />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                {/* Delete button (only if editing) */}
                <div>
                    {missionToEdit && (
                        <button type="button" onClick={handleDeleteMission} className="px-4 py-2 rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 transition flex items-center gap-2 text-sm font-medium">
                            <Icons.Trash2 size={16} /> Supprimer
                        </button>
                    )}
                </div>

                <div className="flex gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition">Annuler</button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow-sm transition flex items-center gap-2"><Icons.Save size={16}/> Sauvegarder</button>
                </div>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};