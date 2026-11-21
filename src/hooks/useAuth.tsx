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
      id: u._id || u.id || 'usr_user',
      email: u.email,
      displayName: u.nombre || u.displayName || u.email.split('@')[0],
      role: (u.rol || u.role || 'Inspector') as Role,
      photoURL: u.fotoUrl || u.photoURL,
    };
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleAuth = () => {
      const u = gsApi.getCurrentUser();
      if (u) {
        setProfile({
          id: u._id || u.id || 'usr_user',
          email: u.email,
          displayName: u.nombre || u.displayName || u.email.split('@')[0],
          role: (u.rol || u.role || 'Inspector') as Role,
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
    if (!email || !password) {
      return false;
    }
    setLoading(true);
    try {
      const res = await gsApi.login(email.trim(), password.trim());
      if (res.success && res.user) {
        setProfile({
          id: res.user._id || res.user.id || 'usr_user',
          email: res.user.email,
          displayName: res.user.nombre || res.user.email.split('@')[0],
          role: (res.user.rol || res.user.role || 'Inspector') as Role,
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
    await gsApi.logout();
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
  
  const isOwner = role.includes('Propietario') || isOwnerOrDeveloperEmail(emailLow, role);
  const isSuperAdmin = isOwner || role.includes('Super Admin');
  const isAdmin = isSuperAdmin || role.includes('Admin');
  const isDeveloper = isOwner || isSuperAdmin;
  const canAccessAll = isOwner || isSuperAdmin || isAdmin;

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
