import { useState } from 'react';
import { supabase } from '../../../supabase/config';

export interface LLMRequest {
  providerId: string;
  messages: { role: string; content: string }[];
  origin?: string;
  action?: string;
}

export interface LLMResponse {
  response: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export function useLLM() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callLLM = async (request: LLMRequest): Promise<LLMResponse> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('llm-proxy', {
        body: request,
      });

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error calling LLM:', err);
      setError(err.message);
      throw err;
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
