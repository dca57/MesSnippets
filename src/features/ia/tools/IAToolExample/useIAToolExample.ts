/**
 * Custom hook for IAToolExample IA tool.
 * Refactored to use the new core IA framework.
 */

import { useState } from 'react';
import { useLLMEngine, buildPrompt, estimatePromptTokens } from '../../core';
import { buildIAToolExamplePrompt } from '../../prompt/IAToolExample.prompt';
import { SuggestedBookmark, SuggestionResponse } from './types';
import { useIAConfig } from '../../hooks/useIAConfig';
import { useUserPlanLimits } from '@/features/admin/hooks/useUserPlanLimits';

export function useIAToolExample() {
  const llmEngine = useLLMEngine<SuggestionResponse>();
  const [suggestions, setSuggestions] = useState<SuggestedBookmark[]>([]);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  
  // Fetch config and plan limits
  const { config } = useIAConfig('IA_IAToolExample');
  const planInfo = useUserPlanLimits();

  /**
   * Generate bookmark suggestions using the LLM.
   */
  const generateSuggestions = async (
    userDescription: string,
    providerId: string,
    categoryName: string,
    existingBookmarkUrls: string[] = [],
    quantity: number = 5,
    origin: string = 'IA_IAToolExample'
  ) => {
    // Reset state
    setSuggestions([]);
    setGeneratedSummary(null);
    llmEngine.reset();

    // Determine max tokens based on plan
    const isPro = planInfo.plan === 'pro';
    const maxTokens = isPro 
      ? (config?.max_output_tokens_pro || 2000)
      : (config?.max_output_tokens_free || 500);

    console.log('🔍 [useIAToolExample] Generating suggestions:', {
      categoryName,
      quantity,
      maxTokens,
      plan: planInfo.plan,
      existingUrls: existingBookmarkUrls.length
    });

    // Build prompt using the dedicated prompt file
    const promptParts = buildIAToolExamplePrompt({
      categoryName,
      existingBookmarkUrls,
      quantity,
      userDescription,
      maxTokens
    });

    // Combine prompt parts using core builder
    const finalPrompt = buildPrompt(promptParts);

    console.log('📝 [useIAToolExample] Final prompt length:', finalPrompt.length);

    // Call LLM using the engine
    const result = await llmEngine.runLLM(
      {
        providerId,
        messages: [{ role: 'user', content: finalPrompt }],
        origin,
        maxTokens
      },
      {
        mode: 'permissive',
        arrayField: 'suggestions' // Enable partial recovery for suggestions array
      }
    );

    // Handle result
    if (result.ok) {
      console.log('✅ [useIAToolExample] Successfully received suggestions');
      
      const data = result.data;
      
      // Handle case where partial recovery returned just an array
      if (Array.isArray(data)) {
        const filteredSuggestions = data.filter(s => !existingBookmarkUrls.includes(s.url));
        setSuggestions(filteredSuggestions);
        setGeneratedSummary(`⚠️ Réponse partielle - ${filteredSuggestions.length} suggestion(s) récupérée(s)`);
      } 
      // Handle normal response with suggestions and summary
      else if (data.suggestions && Array.isArray(data.suggestions)) {
        const filteredSuggestions = data.suggestions.filter(s => !existingBookmarkUrls.includes(s.url));
        setSuggestions(filteredSuggestions);
        setGeneratedSummary(data.summary || null);
      } else {
        console.warn('⚠️ [useIAToolExample] Unexpected data format:', data);
        throw new Error('Format de réponse invalide.');
      }
    } else {
      // Error is already in llmEngine.error
      const errorMsg = 'message' in result ? result.message : 'Une erreur est survenue';
      console.error('❌ [useIAToolExample] Error:', errorMsg);
      throw new Error(errorMsg);
    }
  };

  /**
   * Estimate tokens for a given prompt configuration.
   * Used for real-time UI updates when user adjusts quantity slider.
   */
  const estimateTokensForQuantity = (
    categoryName: string,
    existingBookmarkUrls: string[],
    quantity: number,
    userDescription: string = ''
  ) => {
    const isPro = planInfo.plan === 'pro';
    const maxTokens = isPro 
      ? (config?.max_output_tokens_pro || 2000)
      : (config?.max_output_tokens_free || 500);

    // Build prompt
    const promptParts = buildIAToolExamplePrompt({
      categoryName,
      existingBookmarkUrls,
      quantity,
      maxTokens
    });

    const finalPrompt = buildPrompt(promptParts);

    // Estimate tokens
    return estimatePromptTokens(
      'gemini-1.5-flash-002', // Default model
      finalPrompt,
      quantity
    );
  };

  return {
    generateSuggestions,
    estimateTokensForQuantity,
    suggestions,
    setSuggestions,
    generatedSummary,
    loading: llmEngine.loading,
    error: llmEngine.error,
    lastUsage: llmEngine.usage
  };
}
