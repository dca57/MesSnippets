import { useState, useEffect } from 'react';
import { supabase } from '../../../supabase/config';

export function useLLMQuota() {
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(100000); // Default limit
  const [loading, setLoading] = useState(true);

  const fetchQuota = async () => {
    setLoading(true);
    try {
      // This is a simplified version. In a real app, you'd fetch this from a table or edge function.
      // For now, we'll just mock it or fetch from a profile if available.
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', user.id)
        .single();

      const isPro = profile && (profile as any).subscription_plan === 'pro';
      const quotaLimit = isPro ? 1000000 : 100000; // Example limits

      setLimit(quotaLimit);
      // Fetch usage from somewhere if tracked, for now 0
      setUsed(0); 
    } catch (error) {
      console.error('Error fetching quota:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuota();
  }, []);

  return {
    used,
    limit,
    remaining: limit - used,
    canUse: used < limit,
    loading,
    message: used >= limit ? 'Quota exceeded' : undefined,
  };
}
