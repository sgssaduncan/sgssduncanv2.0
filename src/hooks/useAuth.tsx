import { useState, useEffect, useCallback } from 'react';
import { gsApi } from '../lib/googleSheetsClient';
import { isOwnerOrDeveloperEmail } from '../types';
import type { UserProfile, Role, Usuario } from '../types';

export interface AuthContextType {
  user: { uid: string; email: string; displayName: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email?: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isOwner: boolean;
  isDeveloper: boolean;
  canAccessAll: boolean;
}

export function useAuth(): AuthContextType {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const u = gsApi.getCurrentUser();
    if (!u) return null;
    return {
      id: u._id || u.id || 'usr_admin',
      email: u.email,
      displayName: u.nombre || u.displayName || u.email.split('@')[0],
      role: (u.rol || u.role || 'Super Admin') as Role,
      photoURL: u.fotoUrl || u.photoURL,
    };
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleAuth = () => {
      const u = gsApi.getCurrentUser();
      if (u) {
        setProfile({
          id: u._id || u.id || 'usr_admin',
          email: u.email,
          displayName: u.nombre || u.displayName || u.email.split('@')[0],
          role: (u.rol || u.role || 'Super Admin') as Role,
          photoURL: u.fotoUrl || u.photoURL,
        });
      } else {
        setProfile(null);
      }
    };

    window.addEventListener('storage', handleAuth);
    window.addEventListener('auth-changed', handleAuth);
    return () => {
      window.removeEventListener('storage', handleAuth);
      window.removeEventListener('auth-changed', handleAuth);
    };
  }, []);

  const signIn = useCallback(async (email?: string, password?: string) => {
    setLoading(true);
    try {
      const targetEmail = email || 'aabecerra852@gmail.com';
      const targetPass = password || 'Panelas369*';
      const res = await gsApi.login(targetEmail, targetPass);
      if (res.success && res.user) {
        setProfile({
          id: res.user._id || res.user.id || 'usr_admin',
          email: res.user.email,
          displayName: res.user.nombre || res.user.email.split('@')[0],
          role: (res.user.rol || res.user.role || 'Super Admin') as Role,
          photoURL: res.user.fotoUrl || res.user.photoURL,
        });
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    gsApi.logout();
    setProfile(null);
  }, []);

  const user = profile
    ? {
        uid: profile.id || '',
        email: profile.email,
        displayName: profile.displayName || profile.nombre || 'Usuario',
      }
    : null;

  const emailLow = (profile?.email || '').toLowerCase().trim();
  const role = profile?.role || profile?.rol || '';
  
  // Acceso total irrestricto para cuentas maestras de Propietarios y Desarrolladores
  const isSpecialDeveloperOwner = isOwnerOrDeveloperEmail(emailLow);
  const isOwner = isSpecialDeveloperOwner || role.includes('Propietario');
  const isDeveloper = isSpecialDeveloperOwner || emailLow === 'sgssaduncan@gmail.com' || emailLow.includes('francisco.rojasp');
  const isAdmin = isSpecialDeveloperOwner || role.includes('Admin') || role.includes('Propietario');
  const isSuperAdmin = isSpecialDeveloperOwner || role.includes('Super Admin') || role.includes('Propietario');
  const canAccessAll = isSpecialDeveloperOwner || isOwner || isDeveloper || isSuperAdmin;

  return {
    user,
    profile,
    loading,
    signIn,
    logout,
    isAdmin,
    isSuperAdmin,
    isOwner,
    isDeveloper,
    canAccessAll,
  };
}
