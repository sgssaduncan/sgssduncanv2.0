import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SGDProvider } from './contexts/SGDContext';
import Layout from './components/Layout';

// Páginas
import DashboardPage from './pages/DashboardPage';
import TransportePage from './pages/TransportePage';
import PermisosTrabajoPage from './pages/PermisosTrabajoPage';
import InspeccionesPage from './pages/InspeccionesPage';
import NuevaInspeccionPage from './pages/NuevaInspeccionPage';
import InspeccionFormPage from './pages/InspeccionFormPage';
import ReportePage from './pages/ReportePage';
import PlanAccionPage from './pages/PlanAccionPage';
import DotacionPage from './pages/DotacionPage';
import LotoPage from './pages/LotoPage';
import MedicoPage from './pages/MedicoPage';
import AccidentesPage from './pages/AccidentesPage';
import ComitesPage from './pages/ComitesPage';
import FormacionPage from './pages/FormacionPage';
import CargaFuegoPage from './pages/CargaFuegoPage';
import ConsolidadorPage from './pages/ConsolidadorPage';
import ReportesPage from './pages/ReportesPage';
import UsuariosPage from './pages/UsuariosPage';
import AjustesPage from './pages/AjustesPage';
import AuditoriaPage from './pages/AuditoriaPage';
import TrabajadoresPage from './pages/TrabajadoresPage';
import AuditNavigationTracker from './components/AuditNavigationTracker';
import LoginPage from './pages/LoginPage';

import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Sistema de Gestión Digital Duncan 2.0">
      <SGDProvider>
        <BrowserRouter>
          <AuditNavigationTracker />
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
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
              <Route path="loto" element={<LotoPage />} />
              
              {/* Seguridad en Campo */}
              <Route path="permisos" element={<PermisosTrabajoPage />} />
              <Route path="carga-fuego" element={<CargaFuegoPage />} />
              <Route path="plan-accion" element={<PlanAccionPage />} />
              
              {/* Salud y Bienestar */}
              <Route path="trabajadores" element={<TrabajadoresPage />} />
              <Route path="dotacion" element={<DotacionPage />} />
              <Route path="medico" element={<MedicoPage />} />
              <Route path="accidentes" element={<AccidentesPage />} />
              <Route path="formacion" element={<FormacionPage />} />
              
              {/* Auditoría y Gestión */}
              <Route path="auditoria" element={<AuditoriaPage />} />
              <Route path="consolidador" element={<ConsolidadorPage />} />
              <Route path="comites" element={<ComitesPage />} />
              <Route path="reportes" element={<ReportesPage />} />
              <Route path="usuarios" element={<UsuariosPage />} />
              <Route path="ajustes" element={<AjustesPage />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SGDProvider>
    </ErrorBoundary>
  );
}
