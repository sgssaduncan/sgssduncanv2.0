import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import type { UserProfile, Role } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Users, Shield, ShieldAlert, User, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsersManager() {
  const { isSuperAdmin, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await dbService.getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    if (userId === currentUser?.uid) {
      toast.error('No puedes cambiar tu propio rol desde aquí.');
      return;
    }
    
    try {
      await dbService.updateUserRole(userId, newRole);
      toast.success('Rol actualizado con éxito');
      fetchUsers(); // Refresh list
    } catch (error) {
      toast.error('Error al actualizar el rol');
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <ShieldAlert className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-medium">Acceso Denegado</h2>
        <p className="mt-2 text-sm">No tienes permisos para ver la gestión de usuarios.</p>
      </div>
    );
  }

  const roleOptions: Role[] = ['Super Admin', 'Admin', 'Inspector'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-duncan-blue/10 rounded-xl">
          <Users className="w-6 h-6 text-duncan-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h1>
          <p className="text-slate-500">Administra los roles y accesos del sistema</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-4 border-duncan-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            Cargando usuarios...
          </div>
        ) : (
          <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Usuario</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Correo</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Rol Actual</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full border border-slate-200" />
                        ) : (
                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                        <span className="font-medium text-slate-900">{user.displayName || 'Sin Nombre'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'Super Admin' 
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'Admin'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'Super Admin' && <ShieldAlert className="w-3 h-3 mr-1" />}
                        {user.role === 'Admin' && <ShieldCheck className="w-3 h-3 mr-1" />}
                        {user.role === 'Inspector' && <User className="w-3 h-3 mr-1" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.id !== currentUser?.uid ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                          className="pl-3 pr-8 py-1 text-sm border-slate-200 rounded-lg focus:ring-duncan-blue focus:border-duncan-blue"
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Tú</span>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No se encontraron usuarios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="md:hidden flex flex-col divide-y divide-slate-100">
            {users.map((user) => (
              <div key={user.id} className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900">{user.displayName || 'Sin Nombre'}</p>
                      <p className="text-xs text-slate-500 break-all">{user.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'Super Admin' 
                      ? 'bg-purple-100 text-purple-800'
                      : user.role === 'Admin'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Cambiar Rol</span>
                  {user.id !== currentUser?.uid ? (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                      className="pl-3 pr-8 py-1.5 text-sm border-slate-200 rounded-lg focus:ring-duncan-blue focus:border-duncan-blue"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Tú</span>
                  )}
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No se encontraron usuarios.
              </div>
            )}
          </div>
          </>
        )}
      </div>
    </div>
  );
}
