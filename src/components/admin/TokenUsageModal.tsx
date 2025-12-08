import React, { useEffect, useState } from 'react';
import { Icons } from "@/core/helpers/icons";
import { supabase } from '../../supabase/config';
import { useAuth } from '../../context/AuthContext';

interface TokenUsageRecord {
  id: string;
  created_at: string;
  model: string;
  origin: string;
  tokens_input: number;
  tokens_output: number;
  total_tokens: number;
}

interface TokenUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TokenUsageModal: React.FC<TokenUsageModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<TokenUsageRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchUsageHistory();
    }
  }, [isOpen, user]);

  const fetchUsageHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Calculate date 3 months ago
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data, error } = await supabase
        .from('user_llm_usage')
        .select('*')
        .eq('user_id', user!.id)
        .gte('created_at', threeMonthsAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err: any) {
      console.error('Error fetching token usage:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-300 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Icons.Activity className="w-5 h-5 text-indigo-500" />
              Historique de consommation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Détail des 3 derniers mois
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400"
          >
            <Icons.X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Icons.Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-500" />
              <p>Chargement de l'historique...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              <p>Une erreur est survenue lors du chargement des données.</p>
              <p className="text-sm mt-2 opacity-80">{error}</p>
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Icons.Database className="w-12 h-12 mb-3 opacity-20" />
              <p>Aucune consommation enregistrée sur cette période.</p>
            </div>
          ) : (
            <div className="min-w-full inline-block align-middle">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Origine
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Modèle
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Input
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Output
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Icons.Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(record.created_at).toLocaleString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-slate-200">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                          {record.origin || 'Inconnu'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Icons.Zap className="w-3.5 h-3.5 text-amber-500" />
                          {record.model}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 text-right">
                        {record.tokens_input.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 text-right">
                        {record.tokens_output.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700 dark:text-slate-200 text-right">
                        {record.total_tokens.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Total sur la période : <span className="font-bold text-slate-700 dark:text-slate-200">{records.reduce((acc, r) => acc + r.total_tokens, 0).toLocaleString()} tokens</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium transition-colors text-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenUsageModal;
