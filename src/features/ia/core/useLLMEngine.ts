/**
 * Unified LLM engine hook for the IA framework.
 * This is the main hook that all IA tools should use to interact with LLMs.
 * 
 * It orchestrates:
 * - Prompt building
 * - Token estimation  
 * - LLM API calls via llm-proxy
 * - Response parsing
 * - Error handling
 */

import { useState } from 'react';
import { supabase } from '../../../supabase/config';
import { 
  LLMRequest, 
  LLMResponse, 
  LLMError, 
  UseLLMEngineReturn,
  JSONParseOptions 
} from './types';
import { parseJSON, isSuccessfulParse } from './jsonParser';
import { handleLLMError } from './llmErrorHandler';

export function useLLMEngine<T = any>(): UseLLMEngineReturn<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LLMError | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const [usage, setUsage] = useState<{
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  } | null>(null);

  /**
   * Main function to call the LLM.
   * Handles the complete flow from request to parsed response.
   */
  const runLLM = async (
    request: LLMRequest,
    parseOptions?: JSONParseOptions
  ): Promise<LLMResponse<T> | LLMError> => {
    setLoading(true);
    setError(null);
    setResult(null);
    setUsage(null);

    try {
      console.log('🚀 [useLLMEngine] Starting LLM call:', {
        origin: request.origin,
        providerId: request.providerId,
        maxTokens: request.maxTokens,
        messageCount: request.messages.length
      });

      // Build request body for edge function
      const requestBody = {
        action: request.action || 'generate',
        providerId: request.providerId,
        messages: request.messages,
        model: request.model,
        origin: request.origin,
        ...(request.maxTokens && { maxTokens: request.maxTokens }),
      };

      console.log('📤 [useLLMEngine] Calling llm-proxy edge function...');

      // Call the edge function
      const { data, error: edgeFunctionError } = await supabase.functions.invoke('llm-proxy', {
        body: requestBody,
      });

      // Handle edge function errors
      if (edgeFunctionError) {
        const errorResult = handleLLMError(edgeFunctionError, 'Edge function call');
        setError(errorResult);
        return errorResult;
      }

      // Handle structured errors from proxy
      if (data && data.error) {
        const errorResult = handleLLMError(
          new Error(data.message || 'An error occurred in the LLM proxy'),
          'LLM proxy'
        );
        setError(errorResult);
        return errorResult;
      }

      console.log('📥 [useLLMEngine] Received response from llm-proxy');

      // Extract response and usage
      const rawResponse = data?.response;
      const responseUsage = data?.usage;

      if (!rawResponse) {
        const errorResult = handleLLMError(
          new Error('No response received from LLM'),
          'Response extraction'
        );
        setError(errorResult);
        return errorResult;
      }

      // Update usage stats
      if (responseUsage) {
        setUsage(responseUsage);
      }

      console.log('🔍 [useLLMEngine] Parsing response...');
      console.log('📝 [useLLMEngine] Raw response:', rawResponse.substring(0, 200) + '...');

      // Parse the response
      const parseResult = parseJSON<T>(rawResponse, parseOptions);

      if (isSuccessfulParse(parseResult)) {
        console.log('✅ [useLLMEngine] Successfully parsed response');
        setResult(parseResult.data);
        
        const successResult: LLMResponse<T> = {
          ok: true,
          data: parseResult.data,
          usage: responseUsage,
          warning: data?.warning
        };
        
        return successResult;
      } else {
        console.error('❌ [useLLMEngine] Failed to parse response:', parseResult.error);
        const errorResult: LLMError = {
          ok: false,
          type: 'parse',
          message: parseResult.error,
          raw: parseResult.raw
        };
        setError(errorResult);
        return errorResult;
      }

    } catch (err: any) {
      console.error('❌ [useLLMEngine] Unexpected error:', err);
      const errorResult = handleLLMError(err, 'LLM engine');
      setError(errorResult);
      return errorResult;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset the engine state.
   */
  const reset = () => {
    setLoading(false);
    setError(null);
    setResult(null);
    setUsage(null);
  };

  return {
    loading,
    error,
    result,
    usage,
    runLLM,
    reset
  };
}
