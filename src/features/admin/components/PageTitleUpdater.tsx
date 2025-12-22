import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = 'MesSnippets';

    if (path === '/' || path === '/dashboard') {
      title = 'Dashboard';
    } else if (path.startsWith('/MesSnippets')) {
      title = 'MesSnippets';
    } else if (path.startsWith('/SQLConstructor')) {
      title = 'SQLConstructor';
    } else if (path.startsWith('/MesTimeSheets')) {
      title = 'MesTimeSheets';
    } else if (path.startsWith('/MesTaches')) {
      title = 'MesTaches';
    } else if (path.startsWith('/admin')) {
        title = 'Admin';
    } else if (path.startsWith('/user-settings')) {
        title = 'Paramètres';
    } else if (path.startsWith('/login')) {
        title = 'Connexion';
    }

    document.title = title;
  }, [location]);

  return null;
};

export default PageTitleUpdater;
