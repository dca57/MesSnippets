import React, { useState, useEffect } from "react";
import { useIAToolExample } from "./useIAToolExample";
import { Icons } from "@/core/helpers/icons";
import { useAdminLLM } from "@/features/admin/hooks/useAdminLLM";
import { useAuth } from "@/features/admin/context/AuthContext";
import { useIAConfig } from "@/features/ia/hooks/useIAConfig";
import { useUserPlanLimits } from "@/features/admin/hooks/useUserPlanLimits";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabase/config";
import TokenUsageIndicator from "@/features/admin/components/TokenUsageIndicator";
import BackToMainButton from "@/features/admin/components/BackToMainButton";
import BadgePro from "@/features/admin/components/passerPro/BadgePro";
import PasserProFull from "@/features/admin/components/passerPro/PasserProFull";

interface IAToolExampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
}

const IAToolExampleModal: React.FC<IAToolExampleModalProps> = ({
  isOpen,
  onClose,
  categoryId,
  categoryName,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(5);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [estimatedTokens, setEstimatedTokens] = useState(0);

  const {
    generateSuggestions,
    estimateTokensForQuantity,
    suggestions,
    setSuggestions,
    generatedSummary,
    loading,
    error,
    lastUsage,
  } = useIAToolExample();
  const { providers, fetchProviders } = useAdminLLM();
  const { config, loading: configLoading } = useIAConfig("IA_IAToolExample");
  const planInfo = useUserPlanLimits();

  useEffect(() => {
    if (isOpen) {
      fetchProviders();
    }
  }, [isOpen]);

  const activeProviderId = providers.find((p) => p.is_active)?.id;
  const activeModel =
    providers.find((p) => p.is_active)?.model_id || "gpt-3.5-turbo";

  // Determine if user can use this feature
  const isPro = planInfo.plan === "pro";
  const canUse = isPro || (config?.free_can_use ?? true);

  // Determine max tokens based on plan
  const maxTokens = isPro
    ? config?.max_output_tokens_pro || 2000
    : config?.max_output_tokens_free || 500;

  // Real-time token estimation using the hook
  useEffect(() => {
    const estimation = estimateTokensForQuantity(
      categoryName,
      [],
      quantity,
      description
    );
    setEstimatedTokens(estimation.totalEstimated);
  }, [description, quantity, categoryName, estimateTokensForQuantity]);

  const remainingTokens =
    planInfo.limits.maxTokensLLM - planInfo.current.tokens;
  const hasInsufficientTokens = remainingTokens < estimatedTokens;

  const handleGenerate = async () => {
    if (!activeProviderId) {
      setErrorMessage(
        "Aucun modèle IA actif n'a été trouvé. Veuillez en configurer un dans l'administration."
      );
      return;
    }
    if (!canUse) {
      setErrorMessage("Cette fonctionnalité est réservée aux membres Pro.");
      return;
    }
    if (hasInsufficientTokens) {
      setErrorMessage("Solde de tokens insuffisant pour cette demande.");
      return;
    }
  };

  // ... (rest of the component)

  // In the JSX:
  // Update the estimated cost display
  // <span className={`text-xs ${hasInsufficientTokens ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
  //   Coût estimé : ~{estimatedTokens} tokens
  // </span>

  const handleReset = () => {
    setSuggestions([]);
    setDescription("");
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Icons.Sparkles className="w-5 h-5 text-indigo-500" />
                Suggestions IA
                {!canUse && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    <Icons.Crown className="w-3 h-3" />
                    Pro
                  </span>
                )}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Trouvez des pépites pour la catégorie{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  "{categoryName}"
                </span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Pro Restriction Message */}
            {!canUse && !planInfo.loading && !configLoading && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-amber-600 dark:text-amber-400">
                  <Icons.Crown className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100 text-sm">
                    Fonctionnalité réservée aux membres Pro
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Passez à la version Pro pour bénéficier des suggestions IA
                    illimitées et plus pertinentes.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      navigate("/upgrade");
                    }}
                    className="mt-3 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Passer Pro
                  </button>
                </div>
              </div>
            )}

            {/* Token Usage Section */}
            <TokenUsageIndicator className="mb-6 mx-1 px-4 py-3 w-60 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm" />

            {/* Controls */}
          </div>
        </div>
      </div>
    </>
  );
};

export default IAToolExampleModal;
