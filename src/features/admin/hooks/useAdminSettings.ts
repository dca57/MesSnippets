import { useState, useEffect } from 'react';
import { fetchAdminSettings, updateAdminSettings } from '../services/adminService';
import { APP_DEFAULT_NAME, APP_DEFAULT_SUBNAME, APP_DEFAULT_URL } from './useAppConfig';

export function useAdminSettings() {
  const [siteUrl, setSiteUrl] = useState(APP_DEFAULT_URL);
  const [appName, setAppName] = useState(APP_DEFAULT_NAME);
  const [appSubName, setAppSubName] = useState(APP_DEFAULT_SUBNAME);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const globalSettings = await fetchAdminSettings();
      if (globalSettings) {
        if (globalSettings.siteUrl) setSiteUrl(globalSettings.siteUrl);
        if (globalSettings.appName) setAppName(globalSettings.appName);
        if (globalSettings.appSubName) setAppSubName(globalSettings.appSubName);
      }
    } catch (error) {
      console.error('Erreur chargement settings', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await updateAdminSettings({
        siteUrl,
        appName,
        appSubName,
      });
      alert('Paramètres sauvegardés avec succès ! Recharger la page pour voir les changements partout.');
    } catch (e) {
      alert('Erreur lors de la sauvegarde des paramètres.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return {
    siteUrl,
    setSiteUrl,
    appName,
    setAppName,
    appSubName,
    setAppSubName,
    loading,
    saveSettings,
  };
}
