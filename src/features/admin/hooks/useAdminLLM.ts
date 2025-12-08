import { useState, useEffect } from 'react';
import { supabase } from '../../../supabase/config';
import { Database } from '../../../supabase/types';
import { useLLM } from './useLLM';

export type LLMProvider = Database['public']['Tables']['llm_providers']['Row'];
export type LLMProviderInsert = Database['public']['Tables']['llm_providers']['Insert'];
export type LLMProviderUpdate = Database['public']['Tables']['llm_providers']['Update'];

export function useAdminLLM() {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('llm_providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProviders(data || []);
    } catch (err: any) {
      console.error('Error fetching LLM providers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addProvider = async (provider: LLMProviderInsert) => {
    try {
      const { data, error } = await supabase
        .from('llm_providers')
        // @ts-ignore
        .insert([provider] as any)
        .select()
        .single();

      if (error) throw error;
      setProviders([data, ...providers]);
      return data;
    } catch (err: any) {
      console.error('Error adding LLM provider:', err);
      throw err;
    }
  };

  const updateProvider = async (id: string, updates: LLMProviderUpdate) => {
    try {
      const { data, error } = await supabase
        .from('llm_providers')
        // @ts-ignore
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setProviders(providers.map((p) => (p.id === id ? data : p)));
      return data;
    } catch (err: any) {
      console.error('Error updating LLM provider:', err);
      throw err;
    }
  };

  const deleteProvider = async (id: string) => {
    try {
      const { error } = await supabase
        .from('llm_providers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProviders(providers.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error('Error deleting LLM provider:', err);
      throw err;
    }
  };

  const { callLLM } = useLLM();

  const testConnection = async (providerId: string, prompt: string, origin: string = 'unknown') => {
    try {
      const result = await callLLM({
        providerId,
        messages: [{ role: 'user', content: prompt }],
        origin,
        action: 'test' // We might need to update useLLM to accept action or just use 'generate'
      } as any); // Casting as any because useLLM types might not include action yet, let's check useLLM

      return result;
    } catch (err: any) {
      console.error('❌ [useAdminLLM] Error testing LLM connection:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return {
    providers,
    loading,
    error,
    fetchProviders,
    addProvider,
    updateProvider,
    deleteProvider,
    testConnection,
  };
}
