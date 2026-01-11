import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Target,
  ClipboardList,
  Calendar,
  FileText,
  Users,
  Shield,
  Settings,
  ChevronLeft,
  Rocket,
  BarChart3,
  Upload,
  BookOpen,
  LineChart,
  FileEdit,
  Milestone,
  UserPlus,
  Store,
  FileCheck,
  Wallet,
  AlertTriangle,
  FileSpreadsheet,
  ArrowLeftRight,
  History,
  Download,
  Mail,
} from 'lucide-react';
import { useAppStore, useCentresStore } from '../../store';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, currentCentreId } = useAppStore();
  const centre = useCentresStore((state) =>
    currentCentreId ? state.getCentre(currentCentreId) : null
  );

  const mainNavItems: NavItem[] = [
    { path: '/', label: 'Tableau de bord', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/actions-consolidees', label: 'Plan d\'action', icon: <ClipboardList className="w-5 h-5" /> },
    { path: '/centres', label: 'Centres', icon: <Building2 className="w-5 h-5" /> },
  ];

  // Mode Exploitation visible si :
  // - Centre actif (toujours)
  // - OU Centre en construction AVEC modeExploitationActif (période transitoire)
  const afficherModeExploitation = centre?.statut === 'actif' ||
    (centre?.statut === 'en_construction' && centre?.modeExploitationActif);

  const centreNavItems: NavItem[] = currentCentreId && afficherModeExploitation ? [
    { path: `/centre/${currentCentreId}`, label: 'Vue Centre', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: `/centre/${currentCentreId}/pilotage`, label: 'Pilotage', icon: <Target className="w-5 h-5" /> },
    { path: `/centre/${currentCentreId}/actions`, label: 'Plans d\'actions', icon: <ClipboardList className="w-5 h-5" /> },
    { path: `/centre/${currentCentreId}/agenda`, label: 'Agenda', icon: <Calendar className="w-5 h-5" /> },
    { path: `/centre/${currentCentreId}/reporting`, label: 'Reporting', icon: <FileText className="w-5 h-5" /> },
    { path: `/centre/${currentCentreId}/equipe`, label: 'Équipe', icon: <Users className="w-5 h-5" /> },
    { path: `/centre/${currentCentreId}/conformite`, label: 'Conformité', icon: <Shield className="w-5 h-5" /> },
    { path: `/centre/${currentCentreId}/import`, label: 'Import données', icon: <FileSpreadsheet className="w-5 h-5" /> },
  ] : [];

  // Modules BI - visible en mode projet ET en mode exploitation
  const biNavItems: NavItem[] = currentCentreId ? [
    { path: `/centre/${currentCentreId}/bi/import`, label: 'Import données', icon: <Upload className="w-5 h-5" /> },
    { path: `/centre/${currentCentreId}/bi/catalogue`, label: 'Catalogue BI', icon: <BookOpen className="w-5 h-5" /> },
    { path: `/centre/${currentCentreId}/bi/analyse`, label: 'Analyse', icon: <LineChart className="w-5 h-5" /> },
    { path: `/centre/${currentCentreId}/bi/rapports`, label: 'Rapport Studio', icon: <FileEdit className="w-5 h-5" /> },
  ] : [];

  // Mode Projet visible si centre en construction
  const projetNavItem: NavItem | null = currentCentreId && centre?.statut === 'en_construction'
    ? { path: `/centre/${currentCentreId}/projet`, label: 'Mode Projet', icon: <Rocket className="w-5 h-5" /> }
    : null;

  // Sous-navigation Projet (navigation rapide)
  const projetSubNavItems: NavItem[] = currentCentreId && centre?.statut === 'en_construction' ? [
    { path: `/centre/${currentCentreId}/projet/jalons`, label: 'Jalons', icon: <Milestone className="w-4 h-4" /> },
    { path: `/centre/${currentCentreId}/projet/recrutement`, label: 'Recrutement', icon: <UserPlus className="w-4 h-4" /> },
    { path: `/centre/${currentCentreId}/projet/commercial`, label: 'Commercial', icon: <Store className="w-4 h-4" /> },
    { path: `/centre/${currentCentreId}/projet/handover`, label: 'Handover', icon: <FileCheck className="w-4 h-4" /> },
    { path: `/centre/${currentCentreId}/projet/budget`, label: 'Budget', icon: <Wallet className="w-4 h-4" /> },
    { path: `/centre/${currentCentreId}/projet/risques`, label: 'Risques', icon: <AlertTriangle className="w-4 h-4" /> },
    { path: `/centre/${currentCentreId}/projet/synchronisation`, label: 'Synchro', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { path: `/centre/${currentCentreId}/import`, label: 'Import', icon: <FileSpreadsheet className="w-4 h-4" /> },
  ] : [];

  // Période transitoire = en construction + mode exploitation activé
  const estEnTransition = centre?.statut === 'en_construction' && centre?.modeExploitationActif;

  // Navigation globale (accessible sans centre)
  const globalNavItems: NavItem[] = [
    { path: '/templates', label: 'Templates Import', icon: <Download className="w-5 h-5" /> },
    { path: '/templates-email', label: 'Templates Email', icon: <Mail className="w-5 h-5" /> },
    { path: '/journal', label: 'Journal', icon: <History className="w-5 h-5" /> },
  ];

  const bottomNavItems: NavItem[] = [
    { path: '/parametres', label: 'Paramètres', icon: <Settings className="w-5 h-5" /> },
  ];

  const NavItem = ({ item }: { item: NavItem }) => {
    const location = useLocation();
    const isActive = location.pathname === item.path;

    return (
      <NavLink
        to={item.path}
        className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors relative ${
          isActive
            ? 'bg-primary-100 dark:bg-primary-800 text-primary-900 dark:text-primary-100 font-medium border-r-2 border-primary-900 dark:border-primary-400'
            : 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-800'
        }`}
      >
        {item.icon}
        {sidebarOpen && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="bg-error text-white text-xs px-2 py-0.5 rounded-full">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-primary-900 border-r border-primary-200 dark:border-primary-700 flex flex-col z-40 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-primary-200 dark:border-primary-700">
        {sidebarOpen && (
          <span className="font-display text-2xl text-primary-900 dark:text-primary-100">Cockpit</span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
        >
          <ChevronLeft
            className={`w-5 h-5 text-primary-500 dark:text-primary-400 transition-transform ${
              sidebarOpen ? '' : 'rotate-180'
            }`}
          />
        </button>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </div>

        {/* Navigation globale - Outils */}
        <div className="my-4 px-4">
          <div className="border-t border-primary-200 dark:border-primary-700" />
          {sidebarOpen && (
            <p className="text-xs text-primary-500 dark:text-primary-400 mt-4 mb-2 font-medium uppercase tracking-wider">
              Outils
            </p>
          )}
        </div>
        <div className="space-y-1">
          {globalNavItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </div>

        {/* Navigation Centre (si un centre est sélectionné) */}
        {currentCentreId && centre && (
          <>
            <div className="my-4 px-4">
              <div className="border-t border-primary-200 dark:border-primary-700" />
              {sidebarOpen && (
                <p className="text-xs text-primary-500 dark:text-primary-400 mt-4 mb-2 font-medium uppercase tracking-wider">
                  {centre.code}
                </p>
              )}
            </div>

            {/* Mode Projet - affiché en premier si en construction */}
            {projetNavItem && (
              <>
                {sidebarOpen && (
                  <div className="px-4 mb-2">
                    <p className={`text-xs font-medium uppercase tracking-wider flex items-center gap-1 ${
                      estEnTransition ? 'text-warning' : 'text-info'
                    }`}>
                      <Rocket className="w-3 h-3" />
                      {estEnTransition ? 'Transition' : 'Lancement'}
                    </p>
                  </div>
                )}
                <div className="space-y-1">
                  <NavItem item={projetNavItem} />
                </div>

                {/* Navigation rapide Projet */}
                {projetSubNavItems.length > 0 && sidebarOpen && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-primary-200 dark:border-primary-700">
                    {projetSubNavItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                            isActive
                              ? 'text-info font-medium bg-info/5 border-l-2 border-info -ml-[2px]'
                              : 'text-primary-500 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-200 hover:bg-primary-50 dark:hover:bg-primary-800'
                          }`
                        }
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Mode Exploitation - visible si actif OU en transition */}
            {centreNavItems.length > 0 && (
              <>
                <div className="my-4 px-4">
                  <div className="border-t border-primary-200 dark:border-primary-700" />
                  {sidebarOpen && (
                    <p className="text-xs text-success mt-4 mb-2 font-medium uppercase tracking-wider flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      Exploitation
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  {centreNavItems.map((item) => (
                    <NavItem key={item.path} item={item} />
                  ))}
                </div>
              </>
            )}

            {/* Modules BI - visible en mode projet ET en mode exploitation */}
            {biNavItems.length > 0 && (
              <>
                <div className="my-4 px-4">
                  <div className="border-t border-primary-200 dark:border-primary-700" />
                  {sidebarOpen && (
                    <p className="text-xs text-info mt-4 mb-2 font-medium uppercase tracking-wider flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      Business Intelligence
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  {biNavItems.map((item) => (
                    <NavItem key={item.path} item={item} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </nav>

      {/* Navigation bas */}
      <div className="border-t border-primary-200 dark:border-primary-700 py-4">
        <div className="space-y-1">
          {bottomNavItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </div>
      </div>
    </aside>
  );
}
