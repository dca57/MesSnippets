import React, { useState, useEffect } from 'react';
import { Icons } from "@/core/helpers/icons";
import { useAuth } from '../../context/AuthContext';
import { useUserPlanLimits } from '../../features/admin/hooks/useUserPlanLimits';
import { supabase } from '../../supabase/config';
import TokenUsageModal from './TokenUsageModal';

interface TokenUsageIndicatorProps {
  className?: string;
  variant?: 'default' | 'compact';
}

const TokenUsageIndicator: React.FC<TokenUsageIndicatorProps> = ({ className = '', variant = 'default' }) => {
  const { user } = useAuth();
  const { limits } = useUserPlanLimits();
  const [tokensUsed, setTokensUsed] = useState(0);
  const [showTokenUsageModal, setShowTokenUsageModal] = useState(false);

  // Fetch tokens used this month
  useEffect(() => {
    if (!user) return;

    const fetchTokensUsed = async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data, error } = await supabase
        .from('user_llm_usage')
        .select('total_tokens')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      if (!error && data) {
        const total = data.reduce((sum, record) => sum + ((record as any).total_tokens || 0), 0);
        setTokensUsed(total);
      }
    };

    fetchTokensUsed();
  }, [user]);

  // Calculate progress percentage safely
  const progressPercentage = limits.maxTokensLLM > 0 
    ? Math.min((tokensUsed / limits.maxTokensLLM) * 100, 100) 
    : 0;

  return (
    <>
      <div 
        className={`${className} cursor-pointer transition-all`}
        onClick={() => setShowTokenUsageModal(true)}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Icons.Activity size={14} className="text-indigo-500" />
            Tokens
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {tokensUsed.toLocaleString()} / {limits.maxTokensLLM.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-1">
          <div
            className={`h-1.5 rounded-full transition-all ${
              progressPercentage > 90 ? 'bg-red-500' : 
              progressPercentage > 70 ? 'bg-amber-500' : 
              'bg-green-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-[10px] text-indigo-500 text-right font-medium flex items-center justify-end gap-1 hover:underline">
          Voir le détail
        </div>
      </div>

      {/* Token Usage Modal */}
      {showTokenUsageModal && (
        <TokenUsageModal isOpen={showTokenUsageModal} onClose={() => setShowTokenUsageModal(false)} />
      )}
    </>
  );
};

export default TokenUsageIndicator;
