import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSGD } from '../contexts/SGDContext';
import type { Role } from '../types';
import toast from 'react-hot-toast';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: Role[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/'
}: ProtectedRouteProps) {
  const { currentUser } = useSGD();
  const location = useLocation();

  const userRole = String(currentUser?.rol || currentUser?.role || '') as Role;
  const isSuperAdminOrOwner =
    userRole === 'Super Admin' ||
    userRole === 'Propietario / Super Admin' ||
    userRole.includes('Propietario') ||
    userRole.includes('Super Admin');

  const hasPermission = Boolean(
    currentUser &&
    (!allowedRoles || allowedRoles.length === 0 || isSuperAdminOrOwner || allowedRoles.includes(userRole))
  );

  useEffect(() => {
    if (currentUser && !hasPermission) {
      toast.error('Acceso denegado: No posee los permisos requeridos para esta sección.', {
        id: 'rbac-denied'
      });
    }
  }, [currentUser, hasPermission]);

  // 1. Verificación de Autenticación
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2. Verificación de Control de Acceso Basado en Roles (RBAC)
  if (!hasPermission) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
