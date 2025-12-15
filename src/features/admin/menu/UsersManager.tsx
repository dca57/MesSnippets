import React, { useState } from 'react';
import { Icons } from "@/core/helpers/icons";
import { CopyableCell } from '../components/CopyableCell';
import { updateUserPlan, extendProSubscription } from '../../../features/admin/services/planService';

export interface UserStat {
  id: string;
  email: string;
  plan: 'free' | 'pro';
  subscription_expires_at?: string | null;
  // Keep these optional or remove if not needed, but Admin.tsx passes them currently
  workspaces?: number;
  categories?: number;
  bookmarks?: number;
  fullId?: string; // Derived in component if needed, or passed
}

interface UsersProps {
  userStats: UserStat[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelectUser: (userId: string) => void;
  onRefresh?: () => void;
}

const UsersManager: React.FC<UsersProps> = ({
  userStats,
  searchTerm,
  onSearchChange,
  onSelectUser,
  onRefresh,
}) => {
  const [showProModal, setShowProModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [expirationDate, setExpirationDate] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredUsers = userStats.filter((u) =>
    (u.email || u.id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTogglePlan = async (userId: string, currentPlan: 'free' | 'pro') => {
    if (currentPlan === 'free') {
      // Open modal to set expiration date
      setSelectedUserId(userId);
      setShowProModal(true);
      // Set default to 1 year from now
      const defaultDate = new Date();
      defaultDate.setFullYear(defaultDate.getFullYear() + 1);
      setExpirationDate(defaultDate.toISOString().split('T')[0]);
    } else {
      // Directly downgrade to Free
      if (confirm('Confirmer le passage en plan Free ?')) {
        try {
          setLoading(true);
          await updateUserPlan(userId, 'free');
          alert('Utilisateur passé en plan Free');
          onRefresh?.();
        } catch (error) {
          console.error(error);
          alert('Erreur lors du changement de plan');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleExtendPro = async (userId: string) => {
    if (confirm('Repousser l\'expiration de 30 jours ?')) {
      try {
        setLoading(true);
        await extendProSubscription(userId, 30);
        alert('Expiration repoussée de 30 jours');
        onRefresh?.();
      } catch (error) {
        console.error(error);
        alert('Erreur lors de l\'extension');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleConfirmPro = async () => {
    if (!selectedUserId) return;
    try {
      setLoading(true);
      const expiresAt = new Date(expirationDate);
      await updateUserPlan(selectedUserId, 'pro', expiresAt);
      alert('Utilisateur passé en plan Pro');
      setShowProModal(false);
      setSelectedUserId(null);
      onRefresh?.();
    } catch (error) {
      console.error(error);
      alert('Erreur lors du changement de plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">
            Utilisateurs Détectés
          </h3>
          <div className="relative">
            <Icons.Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Rechercher email ou ID..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Expiration</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 dark:text-white">{user.email}</span>
                      <CopyableCell
                        text={user.id}
                        id={user.id}
                        className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-1"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.plan === 'pro' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-sm">
                        <Icons.CreditCard size={10} /> PRO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold">
                        FREE
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {user.subscription_expires_at
                        ? new Date(user.subscription_expires_at).toLocaleDateString('fr-FR')
                        : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleExtendPro(user.id)}
                        disabled={loading || user.plan !== 'pro'}
                        className="flex items-center gap-1 text-xs border border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 px-3 py-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Repousser l'expiration de 30 jours"
                      >
                        <Icons.CalendarPlus size={12} />
                        Pro +30j
                      </button>
                      <button
                        onClick={() => handleTogglePlan(user.id, user.plan)}
                        disabled={loading}
                        className={`flex items-center gap-1 text-xs border px-3 py-1.5 rounded transition-colors ${
                          user.plan === 'pro'
                            ? 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            : 'border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }`}
                      >
                        <Icons.Zap size={12} />
                        {user.plan === 'pro' ? 'Passer en Free' : 'Passer en Pro'}
                      </button>
                      <button
                        onClick={() => onSelectUser(user.id)}
                        className="text-slate-400 hover:text-blue-500 text-xs border border-slate-200 dark:border-slate-700 px-2 py-1 rounded"
                      >
                        Audit Contenu
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-slate-400 italic"
                  >
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pro Plan Modal */}
      {showProModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-300 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              Passer en Plan Pro
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
                  onClick={() => setShowProModal(false)}
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

export default UsersManager;
