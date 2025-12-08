import { useState, useEffect } from 'react';
import { supabase } from '../../../supabase/config';

// Default configuration
export const APP_DEFAULT_NAME = 'Template Starter';
export const APP_DEFAULT_SUBNAME = 'Your App Foundation';
export const APP_DEFAULT_URL = window.location.origin;

export interface AppGlobalConfig {
  appName: string;
  appSubName: string;
  siteUrl: string;
}

/**
 * Hook to get global app configuration from admin settings
 * Falls back to defaults if not available
 */
export const useAppGlobalConfig = (): AppGlobalConfig => {
  const [config, setConfig] = useState<AppGlobalConfig>({
    appName: APP_DEFAULT_NAME,
    appSubName: APP_DEFAULT_SUBNAME,
    siteUrl: APP_DEFAULT_URL,
  });

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase
        .from('admin_settings')
        .select('*')
        .single();

      if (data && typeof data === 'object') {
        setConfig({
          appName: (data as any).app_name || APP_DEFAULT_NAME,
          appSubName: (data as any).app_subname || APP_DEFAULT_SUBNAME,
          siteUrl: (data as any).site_url || APP_DEFAULT_URL,
        });
      }
    };

    fetchConfig();
  }, []);

  return config;
};
