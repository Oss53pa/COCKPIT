import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import { AuthGuard } from './components/auth';
import { ThemeProvider } from './contexts';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/ui';
import { useCentresStore, useAlertesStore, useAuthStore, initializeAuth } from './store';
import { initializeDatabase } from './db/database';

// Page Login (non lazy pour chargement rapide)
import { Login } from './pages/Login';

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

// Lazy loaded pages - Core
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const ActionsConsolidees = lazy(() => import('./pages/ActionsConsolidees').then(m => ({ default: m.ActionsConsolidees })));
const Centres = lazy(() => import('./pages/Centres').then(m => ({ default: m.Centres })));
const CentreDashboard = lazy(() => import('./pages/CentreDashboard').then(m => ({ default: m.CentreDashboard })));
const Pilotage = lazy(() => import('./pages/Pilotage').then(m => ({ default: m.Pilotage })));
const Actions = lazy(() => import('./pages/Actions').then(m => ({ default: m.Actions })));
const Agenda = lazy(() => import('./pages/Agenda').then(m => ({ default: m.Agenda })));
const Reporting = lazy(() => import('./pages/Reporting').then(m => ({ default: m.Reporting })));
const Conformite = lazy(() => import('./pages/Conformite').then(m => ({ default: m.Conformite })));
const Evaluations = lazy(() => import('./pages/Evaluations').then(m => ({ default: m.Evaluations })));
const Alertes = lazy(() => import('./pages/Alertes').then(m => ({ default: m.Alertes })));
const Parametres = lazy(() => import('./pages/Parametres').then(m => ({ default: m.Parametres })));
const Equipe = lazy(() => import('./pages/Equipe').then(m => ({ default: m.Equipe })));
const ImportData = lazy(() => import('./pages/ImportData').then(m => ({ default: m.ImportData })));
const ComparateurCentres = lazy(() => import('./pages/ComparateurCentres').then(m => ({ default: m.ComparateurCentres })));

// Lazy loaded pages - Projet
const ProjetDashboard = lazy(() => import('./pages/ProjetDashboard').then(m => ({ default: m.ProjetDashboard })));
const ProjetJalons = lazy(() => import('./pages/ProjetJalons').then(m => ({ default: m.ProjetJalons })));
const ProjetRecrutement = lazy(() => import('./pages/ProjetRecrutement').then(m => ({ default: m.ProjetRecrutement })));
const ProjetCommercial = lazy(() => import('./pages/ProjetCommercial').then(m => ({ default: m.ProjetCommercial })));
const ProjetRisques = lazy(() => import('./pages/ProjetRisques').then(m => ({ default: m.ProjetRisques })));
const ProjetHandover = lazy(() => import('./pages/ProjetHandover').then(m => ({ default: m.ProjetHandover })));
const ProjetBudget = lazy(() => import('./pages/ProjetBudget').then(m => ({ default: m.ProjetBudget })));
const ProjetSynchronisation = lazy(() => import('./pages/ProjetSynchronisation').then(m => ({ default: m.ProjetSynchronisation })));

// Lazy loaded pages - BI
const ImportPage = lazy(() => import('./pages/bi').then(m => ({ default: m.ImportPage })));
const CataloguePage = lazy(() => import('./pages/bi').then(m => ({ default: m.CataloguePage })));
const AnalysePage = lazy(() => import('./pages/bi').then(m => ({ default: m.AnalysePage })));
const RapportStudioPage = lazy(() => import('./pages/bi').then(m => ({ default: m.RapportStudioPage })));

// Lazy loaded pages - v1.1
const Profil = lazy(() => import('./pages/Profil').then(m => ({ default: m.Profil })));
const Templates = lazy(() => import('./pages/Templates').then(m => ({ default: m.Templates })));
const Journal = lazy(() => import('./pages/Journal').then(m => ({ default: m.Journal })));
const Notifications = lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));
const TemplatesEmail = lazy(() => import('./pages/TemplatesEmail').then(m => ({ default: m.TemplatesEmail })));

// Page 404
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

function App() {
  const { session } = useAuthStore();

  // Initialiser la base de donnees et l'authentification
  useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase();
        initializeAuth();
      } catch (error) {
        console.error('Erreur d\'initialisation:', error);
      }
    };
    init();
  }, []);

  // Charger les donnees seulement si authentifie
  useEffect(() => {
    if (session.isAuthenticated) {
      useCentresStore.getState().loadCentres();
      useAlertesStore.getState().loadAlertes();
    }
  }, [session.isAuthenticated]);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Route publique - Login */}
            <Route path="/login" element={<Login />} />

            {/* Routes protegees */}
            <Route path="/" element={<AuthGuard><Layout /></AuthGuard>}>
              {/* Dashboard global */}
              <Route index element={<Dashboard />} />

              {/* Comparateur de centres */}
              <Route path="comparateur" element={<ComparateurCentres />} />

              {/* Plan d'action consolidé */}
              <Route path="actions-consolidees" element={<ActionsConsolidees />} />

              {/* Gestion des centres */}
              <Route path="centres" element={<Centres />} />

              {/* Pages d'un centre spécifique */}
              <Route path="centre/:centreId" element={<CentreDashboard />} />
              <Route path="centre/:centreId/pilotage" element={<Pilotage />} />
              <Route path="centre/:centreId/actions" element={<Actions />} />
              <Route path="centre/:centreId/agenda" element={<Agenda />} />
              <Route path="centre/:centreId/reporting" element={<Reporting />} />
              <Route path="centre/:centreId/equipe" element={<Equipe />} />
              <Route path="centre/:centreId/evaluations" element={<Evaluations />} />
              <Route path="centre/:centreId/conformite" element={<Conformite />} />
              <Route path="centre/:centreId/import" element={<ImportData />} />

              {/* Modules BI */}
              <Route path="centre/:centreId/bi/import" element={<ImportPage />} />
              <Route path="centre/:centreId/bi/catalogue" element={<CataloguePage />} />
              <Route path="centre/:centreId/bi/analyse" element={<AnalysePage />} />
              <Route path="centre/:centreId/bi/rapports" element={<RapportStudioPage />} />

              {/* Mode Projet - Centre en construction */}
              <Route path="centre/:centreId/projet" element={<ProjetDashboard />} />
              <Route path="centre/:centreId/projet/jalons" element={<ProjetJalons />} />
              <Route path="centre/:centreId/projet/recrutement" element={<ProjetRecrutement />} />
              <Route path="centre/:centreId/projet/commercial" element={<ProjetCommercial />} />
              <Route path="centre/:centreId/projet/handover" element={<ProjetHandover />} />
              <Route path="centre/:centreId/projet/budget" element={<ProjetBudget />} />
              <Route path="centre/:centreId/projet/risques" element={<ProjetRisques />} />
              <Route path="centre/:centreId/projet/synchronisation" element={<ProjetSynchronisation />} />
              <Route path="centre/:centreId/projet/communication" element={<PlaceholderPage title="Communication" />} />

              {/* Pages globales */}
              <Route path="alertes" element={<Alertes />} />
              <Route path="parametres" element={<Parametres />} />

              {/* Pages v1.1 - Parametres avances */}
              <Route path="profil" element={<Profil />} />
              <Route path="templates" element={<Templates />} />
              <Route path="journal" element={<Journal />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="templates-email" element={<TemplatesEmail />} />

              {/* Page 404 */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          </Suspense>
        </BrowserRouter>
        <ToastContainer />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// Composant temporaire pour les pages non encore implémentées
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <h1 className="text-2xl font-bold text-primary-900 dark:text-white mb-2">{title}</h1>
      <p className="text-primary-500 dark:text-gray-400">Cette page sera bientôt disponible</p>
    </div>
  );
}

export default App;
