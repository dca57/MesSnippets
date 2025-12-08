import { useState, useEffect } from 'react';
import { getPlanLimits, updatePlanLimits } from '../services/planService';

const INITIAL_FEATURES = [
  { id: 'drag_drop', label: 'Drag & Drop', free: true, pro: true },
  { id: 'dark_mode', label: 'Dark Mode', free: true, pro: true },
  { id: 'sync_cloud', label: 'Synchronisation Cloud', free: true, pro: true },
  {
    id: 'share_workspace',
    label: 'Partage de Workspace',
    free: false,
    pro: true,
  },
  { id: 'ai_suggestions', label: 'Suggestions IA', free: false, pro: true },
  { id: 'analytics', label: "Analytiques d'usage", free: false, pro: true },
  { id: 'custom_branding', label: 'Logo personnalisé', free: false, pro: true },
  { id: 'api_access', label: 'Accès API', free: false, pro: false },
];

export function useAdminPlansFeatures() {
  const [limits, setLimits] = useState({
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
  const [features, setFeatures] = useState(INITIAL_FEATURES);
  const [loading, setLoading] = useState(true);

  // Fetch limits from database on mount
  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const data = await getPlanLimits();
        if (data && data.length > 0) {
          const limitsMap: any = {};
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
      } catch (error) {
        console.error('Error fetching plan limits:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLimits();
  }, []);

  const handleLimitChange = (
    plan: 'free' | 'pro',
    key: string,
    value: string
  ) => {
    setLimits({
      ...limits,
      [plan]: {
        ...limits[plan],
        [key]: parseInt(value) || 0,
      },
    });
  };

  const toggleFeature = (featureId: string, plan: 'free' | 'pro') => {
    setFeatures(
      features.map((f) => {
        if (f.id === featureId) {
          return { ...f, [plan]: !(f as any)[plan] };
        }
        return f;
      })
    );
  };

  const save = async () => {
    try {
      // Save both free and pro limits
      await Promise.all([
        updatePlanLimits('free', {
          max_workspaces: limits.free.maxWorkspaces,
          max_categories_per_workspace: limits.free.maxCategoriesPerWorkspace,
          max_bookmarks: limits.free.maxBookmarks,
          max_upload_size_mb: limits.free.maxUploadSizeMB,
          max_tokens_llm: limits.free.maxTokensLLM,
        }),
        updatePlanLimits('pro', {
          max_workspaces: limits.pro.maxWorkspaces,
          max_categories_per_workspace: limits.pro.maxCategoriesPerWorkspace,
          max_bookmarks: limits.pro.maxBookmarks,
          max_upload_size_mb: limits.pro.maxUploadSizeMB,
          max_tokens_llm: limits.pro.maxTokensLLM,
        }),
      ]);
      alert('Plans et quotas sauvegardés !');
    } catch (error) {
      console.error('Error saving plan limits:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  return {
    limits,
    features,
    loading,
    handleLimitChange,
    toggleFeature,
    save,
  };
}
