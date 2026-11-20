import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SGDProvider } from './contexts/SGDContext';
import Layout from './components/Layout';

// Páginas
import DashboardPage from './pages/DashboardPage';
import InspeccionesPage from './pages/InspeccionesPage';
import NuevaInspeccionPage from './pages/NuevaInspeccionPage';
import InspeccionFormPage from './pages/InspeccionFormPage';
import ReportePage from './pages/ReportePage';
import PlanAccionPage from './pages/PlanAccionPage';
import DotacionPage from './pages/DotacionPage';
import LotoPage from './pages/LotoPage';
import MedicoPage from './pages/MedicoPage';
import ReportesPage from './pages/ReportesPage';
import UsuariosPage from './pages/UsuariosPage';
import AjustesPage from './pages/AjustesPage';

export default function App() {
  return (
    <SGDProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="inspecciones" element={<InspeccionesPage />} />
            <Route path="inspecciones/nueva" element={<NuevaInspeccionPage />} />
            <Route path="inspecciones/:id" element={<ReportePage />} />
            <Route path="inspecciones/:id/formulario" element={<InspeccionFormPage />} />
            <Route path="plan-accion" element={<PlanAccionPage />} />
            <Route path="dotacion" element={<DotacionPage />} />
            <Route path="loto" element={<LotoPage />} />
            <Route path="medico" element={<MedicoPage />} />
            <Route path="reportes" element={<ReportesPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="ajustes" element={<AjustesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SGDProvider>
  );
}
