import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SGDProvider } from './contexts/SGDContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AuditNavigationTracker from './components/AuditNavigationTracker';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';

// Carga diferida (Code Splitting) para arranque rápido y ligero en dispositivos móviles
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TransportePage = lazy(() => import('./pages/TransportePage'));
const PermisosTrabajoPage = lazy(() => import('./pages/PermisosTrabajoPage'));
const InspeccionesPage = lazy(() => import('./pages/InspeccionesPage'));
const NuevaInspeccionPage = lazy(() => import('./pages/NuevaInspeccionPage'));
const InspeccionFormPage = lazy(() => import('./pages/InspeccionFormPage'));
const ReportePage = lazy(() => import('./pages/ReportePage'));
const PlanAccionPage = lazy(() => import('./pages/PlanAccionPage'));
const DotacionPage = lazy(() => import('./pages/DotacionPage'));
const LotoPage = lazy(() => import('./pages/LotoPage'));
const MedicoPage = lazy(() => import('./pages/MedicoPage'));
const AccidentesPage = lazy(() => import('./pages/AccidentesPage'));
const ComitesPage = lazy(() => import('./pages/ComitesPage'));
const FormacionPage = lazy(() => import('./pages/FormacionPage'));
const CargaFuegoPage = lazy(() => import('./pages/CargaFuegoPage'));
const ConsolidadorPage = lazy(() => import('./pages/ConsolidadorPage'));
const ReportesPage = lazy(() => import('./pages/ReportesPage'));
const UsuariosPage = lazy(() => import('./pages/UsuariosPage'));
const AjustesPage = lazy(() => import('./pages/AjustesPage'));
const AuditoriaPage = lazy(() => import('./pages/AuditoriaPage'));
const TrabajadoresPage = lazy(() => import('./pages/TrabajadoresPage'));
const CriteriosPage = lazy(() => import('./pages/CriteriosPage'));

function PageLoader() {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center p-6 text-slate-500">
      <div className="w-9 h-9 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-xs font-bold tracking-wide uppercase text-slate-500">Cargando módulo...</p>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Sistema de Gestión Digital Duncan 2.0">
      <SGDProvider>
        <BrowserRouter>
          <AuditNavigationTracker />
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Ruta pública de Autenticación */}
              <Route path="/login" element={<LoginPage />} />

              {/* Rutas Protegidas bajo Layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<DashboardPage />} />

                {/* Operaciones y Logística */}
                <Route path="transporte" element={<TransportePage />} />
                <Route path="inspecciones" element={<InspeccionesPage />} />
                <Route path="inspecciones/nueva" element={<NuevaInspeccionPage />} />
                <Route path="inspecciones/:id" element={<ReportePage />} />
                <Route path="inspecciones/:id/formulario" element={<InspeccionFormPage />} />
                <Route path="criterios" element={<CriteriosPage />} />
                <Route path="loto" element={<LotoPage />} />

                {/* Seguridad en Campo */}
                <Route path="permisos" element={<PermisosTrabajoPage />} />
                <Route path="carga-fuego" element={<CargaFuegoPage />} />
                <Route path="plan-accion" element={<PlanAccionPage />} />

                {/* Salud y Bienestar */}
                <Route path="trabajadores" element={<TrabajadoresPage />} />
                <Route path="dotacion" element={<DotacionPage />} />
                <Route
                  path="medico"
                  element={
                    <ProtectedRoute allowedRoles={['Super Admin', 'Propietario / Super Admin', 'Admin', 'Supervisor']}>
                      <MedicoPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="accidentes" element={<AccidentesPage />} />
                <Route path="formacion" element={<FormacionPage />} />

                {/* Auditoría y Gestión */}
                <Route
                  path="auditoria"
                  element={
                    <ProtectedRoute allowedRoles={['Super Admin', 'Propietario / Super Admin', 'Admin']}>
                      <AuditoriaPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="consolidador"
                  element={
                    <ProtectedRoute allowedRoles={['Super Admin', 'Propietario / Super Admin', 'Admin', 'Supervisor']}>
                      <ConsolidadorPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="comites" element={<ComitesPage />} />
                <Route
                  path="reportes"
                  element={
                    <ProtectedRoute allowedRoles={['Super Admin', 'Propietario / Super Admin', 'Admin', 'Supervisor']}>
                      <ReportesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="usuarios"
                  element={
                    <ProtectedRoute allowedRoles={['Super Admin', 'Propietario / Super Admin', 'Admin']}>
                      <UsuariosPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="ajustes"
                  element={
                    <ProtectedRoute allowedRoles={['Super Admin', 'Propietario / Super Admin', 'Admin']}>
                      <AjustesPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </SGDProvider>
    </ErrorBoundary>
  );
}
