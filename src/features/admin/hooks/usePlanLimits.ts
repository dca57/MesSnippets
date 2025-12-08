import { useState, useEffect } from 'react';
import { getPlanLimits } from '../services/planService';

export interface PlanLimitsData {
  free: {
    maxWorkspaces: number;
    maxCategoriesPerWorkspace: number;
    maxBookmarks: number;
    maxUploadSizeMB: number;
    maxTokensLLM: number;
  };
  pro: {
    maxWorkspaces: number;
    maxCategoriesPerWorkspace: number;
    maxBookmarks: number;
    maxUploadSizeMB: number;
    maxTokensLLM: number;
  };
}

export function usePlanLimits() {
  const [limits, setLimits] = useState<PlanLimitsData>({
    free: {
      maxWorkspaces: 1,
      maxCategoriesPerWorkspace: 5,
      maxBookmarks: 50,
      maxUploadSizeMB: 5,
      maxTokensLLM: 10000,
    },
    pro: {
      maxWorkspaces: 10,
      maxCategoriesPerWorkspace: 50,
      maxBookmarks: 5000,
      maxUploadSizeMB: 100,
      maxTokensLLM: 1000000,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const data = await getPlanLimits();
        if (data && data.length > 0) {
          const limitsMap: any = { free: {}, pro: {} };
          data.forEach((plan) => {
            limitsMap[plan.plan_name] = {
              maxWorkspaces: plan.max_workspaces,
              maxCategoriesPerWorkspace: plan.max_categories_per_workspace,
              maxBookmarks: plan.max_bookmarks,
              maxUploadSizeMB: plan.max_upload_size_mb,
              maxTokensLLM: plan.max_tokens_llm,
            };
          });
          setLimits(limitsMap);
        }
      } catch (err: any) {
        console.error('Error fetching plan limits:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLimits();
  }, []);

  return { limits, loading, error };
}
