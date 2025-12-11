import React, { useState, useEffect } from "react";
import { useIAToolExample } from "./useIAToolExample";
import { Icons } from "@/core/helpers/icons";
import { useAdminLLM } from "@/features/admin/hooks/useAdminLLM";
import { useAuth } from "@/context/AuthContext";
import { useIAConfig } from "@/features/ia/hooks/useIAConfig";
import { useUserPlanLimits } from "@/features/admin/hooks/useUserPlanLimits";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../supabase/config";
import BackToMainButton from "@/components/admin/BackToMainButton";
import TokenUsageIndicator from "@/components/admin/TokenUsageIndicator";
import BadgePro from "@/components/admin/passerPro/BadgePro";
import PasserProFull from "@/components/admin/passerPro/PasserProFull";

const IAToolExamplePage: React.FC = () => {
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
    if (!selectedCategoryId) return;

    const selectedCategory = categories.find(
      (c) => c.id === selectedCategoryId
    );
    if (!selectedCategory) return;

    const estimation = estimateTokensForQuantity(
      selectedCategory.name,
      [],
      quantity,
      description
    );
    setEstimatedTokens(estimation.totalEstimated);
  }, [
    description,
    quantity,
    selectedCategoryId,
    categories,
    estimateTokensForQuantity,
  ]);

  const remainingTokens =
    planInfo.limits.maxTokensLLM - planInfo.current.tokens;
  const hasInsufficientTokens = remainingTokens < estimatedTokens;

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

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
    if (!selectedCategory) {
      setErrorMessage("Veuillez sélectionner une catégorie.");
      return;
    }

    try {
      // Fetch existing bookmarks in this category to avoid duplicates
      let existingBookmarkUrls: string[] = [];
      if (user) {
        const allBookmarks = await fetchBookmarks(user.id);
        const categoryBookmarks = allBookmarks.filter(
          (b) => b.categoryId === selectedCategoryId
        );
        existingBookmarkUrls = categoryBookmarks.map((b) => b.url);
      }

      await generateSuggestions(
        description,
        activeProviderId,
        selectedCategory.name,
        existingBookmarkUrls,
        quantity,
        "IA_IAToolExample"
      );

      // Refresh plan limits to update token usage
      await planInfo.refresh();
    } catch (err: any) {
      console.error("Error in handleGenerate:", err);
      setErrorMessage(
        err.message ||
          "Une erreur est survenue lors de la génération des suggestions."
      );
    }
  };

  const handleReset = () => {
    setSuggestions([]);
    setDescription("");
  };

  const handleAddBookmark = async (bookmark: {
    title: string;
    url: string;
    description?: string;
    tags?: string[];
  }) => {
    if (!user || !selectedCategoryId) {
      setErrorMessage("Vous devez sélectionner une catégorie.");
      return;
    }

    try {
      const allBookmarks = await fetchBookmarks(user.id);
      const categoryBookmarks = allBookmarks.filter(
        (b) => b.categoryId === selectedCategoryId
      );
      const maxOrder =
        categoryBookmarks.length > 0
          ? Math.max(...categoryBookmarks.map((b) => b.order || 0))
          : -1;

      await createBookmark({
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description,
        categoryId: selectedCategoryId,
        userId: user.id,
        tags: bookmark.tags || [],
        isPinned: false,
        clickCount: 0,
        order: maxOrder + 1,
        lastAiRenameAt: new Date().toISOString(),
        lastAiCleanAt: new Date().toISOString(),
      });

      setSuggestions((prev) => prev.filter((s) => s.url !== bookmark.url));
    } catch (err: any) {
      console.error("Error adding bookmark:", err);
      setErrorMessage(err.message || "Erreur lors de l'ajout du favori.");
    }
  };

  const handleAddAll = async () => {
    if (!user || suggestions.length === 0 || !selectedCategoryId) return;

    try {
      const allBookmarks = await fetchBookmarks(user.id);
      const categoryBookmarks = allBookmarks.filter(
        (b) => b.categoryId === selectedCategoryId
      );
      let maxOrder =
        categoryBookmarks.length > 0
          ? Math.max(...categoryBookmarks.map((b) => b.order || 0))
          : -1;

      const bookmarksToCreate = suggestions.map((s, index) => ({
        title: s.title,
        url: s.url,
        description: s.description,
        categoryId: selectedCategoryId,
        userId: user.id,
        tags: s.tags || [],
        isPinned: false,
        clickCount: 0,
        order: maxOrder + 1 + index,
        lastAiRenameAt: new Date().toISOString(),
        lastAiCleanAt: new Date().toISOString(),
      }));

      await createBookmarks(bookmarksToCreate);

      setSuggestions([]);
      setErrorMessage(null);
    } catch (err: any) {
      console.error("Error adding all bookmarks:", err);
      setErrorMessage(err.message || "Erreur lors de l'ajout des favoris.");
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 p-2">
        <div className="flex items-center justify-between">
          <BackToMainButton className="mb-4 -ml-2" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-500" />
              Suggestions IA
              {!canUse && <BadgePro />}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Trouvez des pépites pour enrichir vos catégories
            </p>
          </div>
          {/* Token Usage Section */}
          <TokenUsageIndicator className="mb-6 mx-1 px-4 py-3 w-60 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Pro Restriction Message */}
          {!canUse && !planInfo.loading && !configLoading && <PasserProFull />}

          {/* Selection & Controls */}
          <div
            className={`space-y-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 ${
              !canUse ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {/* Workspace Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Workspace
              </label>
              <div className="relative">
                <select
                  value={selectedWorkspaceId}
                  onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                  disabled={loadingWorkspaces || suggestions.length > 0}
                  className="w-full px-4 py-3 pr-10 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-700 dark:text-purple-400 pointer-events-none" />
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Catégorie
              </label>
              <div className="relative">
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  disabled={
                    loadingCategories ||
                    categories.length === 0 ||
                    suggestions.length > 0
                  }
                  className="w-full px-4 py-3 pr-10 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {categories.length === 0 ? (
                    <option value="">Aucune catégorie dans ce workspace</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-700 dark:text-purple-400 pointer-events-none" />
              </div>
            </div>

            {/* Quantity Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nombre de suggestions : {quantity}
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs ${
                      hasInsufficientTokens
                        ? "text-red-500 font-bold"
                        : "text-slate-500"
                    }`}
                  >
                    Coût estimé : ~{estimatedTokens} tokens
                  </span>
                  {hasInsufficientTokens && (
                    <span className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Solde insuffisant
                    </span>
                  )}
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                disabled={suggestions.length > 0}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Instructions (optionnel)
              </label>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Précisez votre demande si vous le souhaitez..."
                  disabled={!canUse || suggestions.length > 0}
                  className="w-full h-24 p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all text-sm disabled:cursor-not-allowed disabled:opacity-70"
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  {suggestions.length > 0 ? (
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                      Réinitialiser
                    </button>
                  ) : (
                    <button
                      onClick={handleGenerate}
                      disabled={
                        loading ||
                        !activeProviderId ||
                        !canUse ||
                        hasInsufficientTokens ||
                        !selectedCategoryId
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-sm disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Générer
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {!activeProviderId && !loading && (
              <div className="text-xs text-amber-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                Aucun modèle IA actif détecté
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error.message}
            </div>
          )}

          {/* Results */}
          {suggestions.length > 0 && (
            <div className="space-y-4 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Résultats ({suggestions.length})
                </h3>
                <div className="flex items-center gap-3">
                  {generatedSummary && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 italic hidden sm:inline">
                      {generatedSummary}
                    </span>
                  )}
                  <button
                    onClick={handleAddAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tout ajouter
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                {suggestions.map((bookmark, index) => (
                  <div
                    key={index}
                    className="group flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
                  >
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-indigo-500 hover:text-indigo-600 hover:scale-105 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">
                        {bookmark.title}
                      </h4>
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-400 hover:text-indigo-500 truncate block mt-0.5"
                      >
                        {bookmark.url}
                      </a>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2">
                        {bookmark.description}
                      </p>
                    </div>
                    <button
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Ajouter aux favoris"
                      onClick={() => handleAddBookmark(bookmark)}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ErrorModal
        isOpen={!!errorMessage}
        onClose={() => setErrorMessage(null)}
        message={errorMessage || ""}
      />
    </div>
  );
};

export default IAToolExamplePage;
