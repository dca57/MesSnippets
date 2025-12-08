import { useState, useEffect } from 'react';
import { supabase } from '../../../supabase/config';
import { getPlanLimits } from '../services/planService';
import { PlanLimitsData } from './usePlanLimits';

interface UserPlanInfo {
  plan: 'free' | 'pro';
  subscriptionExpiresAt: string | null;
  limits: {    
    maxTokensLLM: number;
  };
  current: {
    tokens: number;
  };
  canCreate: {
  };
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useUserPlanLimits(): UserPlanInfo {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [planInfo, setPlanInfo] = useState<UserPlanInfo>({
    plan: 'free',
    subscriptionExpiresAt: null,
    limits: {
      maxTokensLLM: 10000,
    },
    current: {
      tokens: 0,
    },
    canCreate: {
    },
    loading: true,
    refresh: async () => {},
  });

  const fetchPlanInfo = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPlanInfo(prev => ({ ...prev, loading: false }));
        return;
      }

      // Fetch user profile to get plan
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan, subscription_expires_at')
        .eq('id', user.id)
        .single();

      const typedProfile = profile as { subscription_plan: string; subscription_expires_at: string | null } | null;
      const userPlan = typedProfile?.subscription_plan || 'free';

      // Check if Pro is expired
      const isProExpired = userPlan === 'pro' && typedProfile?.subscription_expires_at 
        ? new Date(typedProfile.subscription_expires_at) < new Date()
        : false;

      const effectivePlan: 'free' | 'pro' = isProExpired ? 'free' : (userPlan as 'free' | 'pro');

      // Fetch plan limits
      const limitsData = await getPlanLimits();
      const planLimits = limitsData.find(l => l.plan_name === effectivePlan);

      if (!planLimits) {
        setPlanInfo(prev => ({ ...prev, loading: false }));
        return;
      }

      // Count current data
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      
      const [usageRes] = await Promise.all([        
        supabase.from('user_llm_usage').select('tokens_input, tokens_output').eq('user_id', user.id).gte('created_at', startOfMonth),
      ]);

      const usageData = usageRes.data as any[] || [];
      const currentTokens = usageData.reduce((acc, curr) => acc + (curr.tokens_input || 0) + (curr.tokens_output || 0), 0) || 0;

      const currentCounts = {
        tokens: currentTokens,
      };

      // Calculate canCreate
      const canUseLLM = currentCounts.tokens < planLimits.max_tokens_llm;

      setPlanInfo(prev => ({
        ...prev,
        plan: effectivePlan,
        subscriptionExpiresAt: typedProfile?.subscription_expires_at || null,
        limits: {          
          maxTokensLLM: planLimits.max_tokens_llm,
        },
        current: currentCounts,
        canCreate: {
        },
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching plan info:', error);
      setPlanInfo(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchPlanInfo();
  }, [refreshTrigger]);

  const refresh = async () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return { ...planInfo, refresh };
}
