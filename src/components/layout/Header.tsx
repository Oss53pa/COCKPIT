import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Bell, Search, Moon, Sun, ChevronRight, ChevronDown, Building2, Check, MailCheck, LogOut } from 'lucide-react';
import { useAppStore, useAlertesStore, useCentresStore, useAuthStore } from '../../store';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { centreId } = useParams<{ centreId: string }>();
  const { theme, setTheme, currentCentreId, setCurrentCentre } = useAppStore();
  const alertesNonLues = useAlertesStore((state) => state.getAlertesNonLues().length);
  const centres = useCentresStore((state) => state.centres);
  const { session, logout } = useAuthStore();
  const centre = useCentresStore((state) =>
    currentCentreId ? state.getCentre(currentCentreId) : null
  );

  const [isCentreDropdownOpen, setIsCentreDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCentreDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Changer de centre
  const handleCentreChange = (newCentreId: string) => {
    setCurrentCentre(newCentreId);
    setIsCentreDropdownOpen(false);

    // Naviguer vers la même sous-page du nouveau centre
    const pathParts = location.pathname.split('/');
    const centreIndex = pathParts.indexOf('centre');
    if (centreIndex !== -1 && pathParts[centreIndex + 1]) {
      // Reconstruire le chemin avec le nouveau centreId
      pathParts[centreIndex + 1] = newCentreId;
      navigate(pathParts.join('/'));
    } else {
      // Sinon, aller au dashboard du centre
      navigate(`/centre/${newCentreId}`);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Générer le fil d'Ariane
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: { label: string; path: string }[] = [
      { label: 'Accueil', path: '/' },
    ];

    let currentPath = '';
    paths.forEach((segment) => {
      currentPath += `/${segment}`;

      if (segment === 'centres') {
        breadcrumbs.push({ label: 'Centres', path: '/centres' });
      } else if (segment === 'centre' && centre) {
        // Skip, le prochain segment sera l'ID du centre
      } else if (centre && segment === currentCentreId) {
        breadcrumbs.push({ label: centre.nom, path: `/centre/${currentCentreId}` });
      } else if (segment === 'pilotage') {
        breadcrumbs.push({ label: 'Pilotage', path: currentPath });
      } else if (segment === 'actions') {
        breadcrumbs.push({ label: 'Plans d\'actions', path: currentPath });
      } else if (segment === 'agenda') {
        breadcrumbs.push({ label: 'Agenda', path: currentPath });
      } else if (segment === 'reporting') {
        breadcrumbs.push({ label: 'Reporting', path: currentPath });
      } else if (segment === 'equipe') {
        breadcrumbs.push({ label: 'Équipe', path: currentPath });
      } else if (segment === 'conformite') {
        breadcrumbs.push({ label: 'Conformité', path: currentPath });
      } else if (segment === 'parametres') {
        breadcrumbs.push({ label: 'Paramètres', path: '/parametres' });
      } else if (segment === 'alertes') {
        breadcrumbs.push({ label: 'Alertes', path: '/alertes' });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Vérifie si on est sur une page centre
  const isOnCentrePage = location.pathname.includes('/centre/');

  return (
    <header className="h-16 bg-white dark:bg-primary-900 border-b border-primary-200 dark:border-primary-700 flex items-center justify-between px-6 transition-colors">
      {/* Fil d'Ariane + Sélecteur de centre */}
      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              {index > 0 && <ChevronRight className="w-4 h-4 text-primary-400" />}
              <button
                onClick={() => navigate(crumb.path)}
                className={`hover:text-primary-900 dark:hover:text-primary-100 transition-colors ${
                  index === breadcrumbs.length - 1
                    ? 'text-primary-900 dark:text-primary-100 font-medium'
                    : 'text-primary-500 dark:text-primary-400'
                }`}
              >
                {crumb.label}
              </button>
            </React.Fragment>
          ))}
        </nav>

        {/* Sélecteur de centre (visible uniquement sur les pages centre) */}
        {isOnCentrePage && centres.length > 1 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsCentreDropdownOpen(!isCentreDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 hover:bg-primary-200 rounded-lg transition-colors"
            >
              <Building2 className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700 max-w-[150px] truncate">
                {centre?.nom || 'Sélectionner'}
              </span>
              <ChevronDown className={`w-4 h-4 text-primary-500 transition-transform ${isCentreDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {isCentreDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-primary-200 py-1 z-50 max-h-80 overflow-y-auto">
                <div className="px-3 py-2 border-b border-primary-100">
                  <p className="text-xs font-medium text-primary-500 uppercase tracking-wide">
                    Changer de centre
                  </p>
                </div>
                {centres.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleCentreChange(c.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-primary-50 transition-colors ${
                      c.id === currentCentreId ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      c.statut === 'actif' ? 'bg-success/10' : c.statut === 'en_construction' ? 'bg-warning/10' : 'bg-primary-100'
                    }`}>
                      <Building2 className={`w-4 h-4 ${
                        c.statut === 'actif' ? 'text-success' : c.statut === 'en_construction' ? 'text-warning' : 'text-primary-400'
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-primary-900 truncate">{c.nom}</p>
                      <p className="text-xs text-primary-500">{c.ville}</p>
                    </div>
                    {c.id === currentCentreId && (
                      <Check className="w-4 h-4 text-success" />
                    )}
                  </button>
                ))}
                <div className="border-t border-primary-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setIsCentreDropdownOpen(false);
                      navigate('/centres');
                    }}
                    className="w-full px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 text-left transition-colors"
                  >
                    Voir tous les centres →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Recherche */}
        <div className="relative">
          <Search className="w-4 h-4 text-primary-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-9 pr-4 py-2 w-64 bg-primary-50 dark:bg-primary-800 border border-primary-200 dark:border-primary-700 rounded-btn text-sm text-primary-900 dark:text-primary-100 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-900/10 dark:focus:ring-primary-500/20 transition-colors"
          />
        </div>

        {/* Thème */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
          title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          ) : (
            <Sun className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          )}
        </button>

        {/* Alertes */}
        <button
          onClick={() => navigate('/alertes')}
          className="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors relative"
          title="Alertes"
        >
          <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          {alertesNonLues > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
          title="Notifications"
        >
          <MailCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </button>

        {/* Profil */}
        <button
          onClick={() => navigate('/profil')}
          className="flex items-center gap-3 pl-4 border-l border-primary-200 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-800 rounded-lg pr-2 py-1 transition-colors"
          title="Mon Profil"
        >
          <div className="w-8 h-8 bg-primary-200 dark:bg-primary-700 rounded-full flex items-center justify-center">
            <span className="text-primary-700 dark:text-primary-200 font-medium text-sm">
              {session.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-primary-900 dark:text-primary-100 max-w-[120px] truncate">
              {session.email || 'Utilisateur'}
            </p>
            <p className="text-xs text-primary-500 dark:text-primary-400">Connecte</p>
          </div>
        </button>

        {/* Deconnexion */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
          title="Deconnexion"
        >
          <LogOut className="w-5 h-5 text-primary-500 group-hover:text-red-600 dark:text-primary-400 dark:group-hover:text-red-400 transition-colors" />
        </button>
      </div>
    </header>
  );
}
