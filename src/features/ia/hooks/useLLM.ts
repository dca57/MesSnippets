import { useState } from 'react';
import { supabase } from '../../../supabase/config';

export interface LLMRequestOptions {
  providerId: string;
  messages: { role: string; content: string }[];
  model?: string;
  origin?: string;
  action?: string;
  maxTokens?: number;
}

export interface LLMResponse {
  response: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  warning?: string;
  insertError?: any;
}

export function useLLM() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callLLM = async ({ providerId, messages, model, origin = 'IA_Workspace', action = 'generate', maxTokens }: LLMRequestOptions): Promise<LLMResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      // Send messages directly to the Edge Function
      const requestBody = {
        action,
        providerId,
        messages, // Send messages array directly instead of extracting prompt
        model,
        origin,
        ...(maxTokens && { maxTokens }), // Include maxTokens if provided
      };

      console.log('🔍 [useLLM] Sending to llm-proxy:', requestBody);

      const { data, error } = await supabase.functions.invoke('llm-proxy', {
        body: requestBody,
      });

      if (error) throw error;

      // Handle structured error from proxy
      if (data && data.error) {
        throw new Error(data.message || 'An error occurred in the LLM proxy');
      }

      console.log('✅ [useLLM] Response from llm-proxy:', data);
      return data as LLMResponse;
    } catch (err: any) {
      console.error('❌ [useLLM] Error calling LLM:', err);
      setError(err.message || 'An error occurred while calling the LLM');
      // Return a structured error object instead of null if possible, or just null and let the component handle it via 'error' state
      // The component usually checks 'error' state.
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    callLLM,
    loading,
    error,
  };
}
