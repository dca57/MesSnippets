import { useState, useEffect } from 'react';
import { supabase } from '../../../supabase/config';

export interface IAConfig {
  id: string;
  tool_name: string;
  free_can_use: boolean;
  max_input_tokens_free: number;
  max_output_tokens_free: number;
  max_input_tokens_pro: number;
  max_output_tokens_pro: number;
  updated_at: string;
}

export function useIAConfig(toolName: string) {
  const [config, setConfig] = useState<IAConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('ia_config')
          .select('*')
          .eq('tool_name', toolName)
          .single();

        if (error) throw error;
        setConfig(data);
      } catch (err: any) {
        console.error(`Error fetching config for ${toolName}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (toolName) {
      fetchConfig();
    }
  }, [toolName]);

  return { config, loading, error };
}
