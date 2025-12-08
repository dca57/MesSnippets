import React, { useState } from 'react';
import { Icons } from "@/core/helpers/icons";
import { updateUserPlan } from '../../features/admin/services/planService';
import { useUserPlanLimits } from '../../features/admin/hooks/useUserPlanLimits';
import { useAuth } from '../../context/AuthContext';

const ADMIN_USER_ID = '714084df-5a70-43fc-acfd-e2ce97fd0510';

interface AdminPlanToggleProps {
  onRefresh?: () => void;
}

const AdminPlanToggle: React.FC<AdminPlanToggleProps> = ({ onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const { plan } = useUserPlanLimits();
  const { user } = useAuth();

  // Only show if current user is admin
  if (user?.id !== ADMIN_USER_ID) {
    return null;
  }

  const isCurrentlyPro = plan === 'pro';

  const handleTogglePlan = async () => {
    if (isCurrentlyPro) {
      // Switch to Free
     
        try {
          setLoading(true);
          await updateUserPlan(ADMIN_USER_ID, 'free');          
          onRefresh?.();
          // Reload page to refresh plan data
          window.location.reload();
        } catch (error) {
          console.error(error);
          alert('Erreur lors du changement de plan');
        } finally {
          setLoading(false);
        }
      
    } else {
      // Switch to Pro - show modal
      const defaultDate = new Date();
      defaultDate.setFullYear(defaultDate.getFullYear() + 1);
      setExpirationDate(defaultDate.toISOString().split('T')[0]);
      setShowModal(true);
    }
  };

  const handleConfirmPro = async () => {
    try {
      setLoading(true);
      const expiresAt = new Date(expirationDate);
      await updateUserPlan(ADMIN_USER_ID, 'pro', expiresAt);      
      setShowModal(false);
      onRefresh?.();
      // Reload page to refresh plan data
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Erreur lors du changement de plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleTogglePlan}
        disabled={loading}
        className={`flex items-center gap-2 px-2 py-1 rounded-xl transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
          isCurrentlyPro
            ? 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
        }`}
        title={isCurrentlyPro ? "Passer l'admin en plan Free" : "Passer l'admin en plan Pro"}
      >
        <Icons.Zap size={18} />
        <span>{isCurrentlyPro ? 'Passer Admin en Free' : 'Passer Admin en Pro'}</span>
      </button>

      {/* Pro Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-300 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              Passer Admin en Plan Pro
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Date d'expiration
                </label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleConfirmPro}
                  disabled={loading || !expirationDate}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPlanToggle;
