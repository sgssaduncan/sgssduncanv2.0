import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { auditService } from '../services/auditService';

const ROUTE_NAMES: Record<string, string> = {
  '/': 'Tablero Principal (Dashboard)',
  '/inspecciones': 'Lista de Inspecciones Técnicas',
  '/inspecciones/nueva': 'Crear Nueva Inspección',
  '/transporte': 'Transporte & Control de Carga',
  '/permisos': 'Permisos de Trabajo de Alto Riesgo (PTAR)',
  '/carga-fuego': 'Carga de Fuego & Protección Contra Incendios',
  '/plan-accion': 'Plan de Acción & Hallazgos',
  '/dotacion': 'Dotación de EPP y Uniformes',
  '/medico': 'Salud Ocupacional, Plombemia & Vacaciones (V-EXPRESS)',
  '/accidentes': 'Accidentes Laborales F-465 & Árbol de Causas',
  '/formacion': 'Formación de Conductores & RACDA',
  '/comites': 'Comités CSSL & Delegados de Prevención',
  '/consolidador': 'Consolidador Ejecutivo de Conformidad',
  '/reportes': 'Informes Ejecutivos & Reportes Gerenciales',
  '/usuarios': 'Gestión de Usuarios y Accesos',
  '/ajustes': 'Ajustes del Sistema & Google Sheets',
  '/auditoria': 'Centro de Auditoría Forense y Trazabilidad',
  '/loto': 'Bloqueo y Etiquetado LOTO'
};

export default function AuditNavigationTracker() {
  const location = useLocation();
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === lastPathRef.current) return;
    lastPathRef.current = currentPath;

    let title = ROUTE_NAMES[currentPath];
    if (!title) {
      if (currentPath.includes('/formulario')) {
        title = 'Completar Formulario de Inspección Técnica';
      } else if (currentPath.startsWith('/inspecciones/')) {
        title = 'Visualización de Reporte de Inspección';
      } else {
        title = `Vista: ${currentPath}`;
      }
    }

    auditService.logNavigation(currentPath, title).catch(err => {
      console.warn('Error al registrar navegación en auditoría:', err);
    });
  }, [location.pathname]);

  return null;
}
