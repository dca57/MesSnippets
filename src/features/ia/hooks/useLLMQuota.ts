import { useState, useEffect } from 'react';
import { supabase } from '../../../supabase/config';
import { useAuth } from '../../../context/AuthContext';
import { useUserPlanLimits } from '../../../hooks/useUserPlanLimits';

interface LLMQuotaStatus {
  canUse: boolean;
  used: number;
  limit: number;
  remaining: number;
  message?: string;
  loading: boolean;
}

export function useLLMQuota(): LLMQuotaStatus {
  const { user } = useAuth();
  const { limits, loading: planLoading } = useUserPlanLimits();
  
  const [quotaStatus, setQuotaStatus] = useState<LLMQuotaStatus>({
    canUse: true,
    used: 0,
    limit: limits.maxTokensLLM,
    remaining: limits.maxTokensLLM,
    loading: true,
  });

  useEffect(() => {
    const fetchTokenUsage = async () => {
      if (!user || planLoading) {
        return;
      }

      try {
        // Calculate start of current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Fetch tokens used this month
        const { data, error } = await supabase
          .from('user_llm_usage')
          .select('total_tokens')
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth.toISOString());

        if (error) {
          console.error('Error fetching LLM usage:', error);
          setQuotaStatus({
            canUse: false,
            used: 0,
            limit: limits.maxTokensLLM,
            remaining: limits.maxTokensLLM,
            message: 'Erreur lors de la vérification du quota',
            loading: false,
          });
          return;
        }

        // Sum total tokens used this month
        const totalUsed = (data as any[])?.reduce((sum, record: any) => sum + (record.total_tokens || 0), 0) || 0;
        const remaining = Math.max(0, limits.maxTokensLLM - totalUsed);
        const canUse = totalUsed < limits.maxTokensLLM;

        setQuotaStatus({
          canUse,
          used: totalUsed,
          limit: limits.maxTokensLLM,
          remaining,
          message: canUse ? undefined : `Quota mensuel dépassé (${totalUsed}/${limits.maxTokensLLM} tokens)`,
          loading: false,
        });
      } catch (error) {
        console.error('Error calculating LLM quota:', error);
        setQuotaStatus({
          canUse: false,
          used: 0,
          limit: limits.maxTokensLLM,
          remaining: limits.maxTokensLLM,
          message: 'Erreur lors de la vérification du quota',
          loading: false,
        });
      }
    };

    fetchTokenUsage();
  }, [user, limits.maxTokensLLM, planLoading]);

  return quotaStatus;
}
