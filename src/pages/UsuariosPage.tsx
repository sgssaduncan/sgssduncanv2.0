import React, { useState } from 'react';
import {
  Users, ShieldCheck, Key, Mail, Plus, Edit3, Trash2,
  CheckCircle2, AlertCircle, Eye, EyeOff, LogIn, Crown, Shield,
  Search, Lock, Check, KeyRound, RotateCcw, IdCard
} from 'lucide-react';
import { useSGD } from '../contexts/SGDContext';
import type { Usuario, Rol } from '../types';
import toast from 'react-hot-toast';

export default function UsuariosPage() {
  const { usuarios, currentUser, switchUser, saveUsuario, deleteUsuario, isOnline } = useSGD();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

  // Formulario modal
  const [formNombre, setFormNombre] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRol, setFormRol] = useState<Rol>('Inspector');
  const [formPassword, setFormPassword] = useState('');
  const [formActivo, setFormActivo] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal de Restablecimiento Rápido de Contraseña (Costo Cero)
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<Usuario | null>(null);
  const [newPasswordToReset, setNewPasswordToReset] = useState('Duncan2026*');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Propietarios protegidos
  const isOwner = (email: string) => {
    const e = email.toLowerCase().trim();
    return e === 'francisco.rojasp@gmail.com' || e === 'sgssaduncan@gmail.com' || e === 'aabecerra852@gmail.com';
  };

  const openResetModal = (u: Usuario) => {
    setUserToReset(u);
    setNewPasswordToReset('Duncan2026*');
    setShowResetPassword(false);
    setResetModalOpen(true);
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToReset) return;
    if (!newPasswordToReset.trim() || newPasswordToReset.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsResetting(true);
    try {
      await saveUsuario({
        _id: userToReset._id,
        nombre: userToReset.nombre,
        email: userToReset.email,
        rol: userToReset.rol,
        password: newPasswordToReset.trim(),
        activo: userToReset.activo !== false
      });
      toast.success(`Contraseña de ${userToReset.nombre} restablecida con éxito`);
      setResetModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al restablecer contraseña');
    } finally {
      setIsResetting(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormNombre('');
    setFormEmail('');
    setFormRol('Inspector');
    setFormPassword('Duncan2026*');
    setFormActivo(true);
    setShowPassword(false);
    setModalOpen(true);
  };

  const openEditModal = (u: Usuario) => {
    setEditingUser(u);
    setFormNombre(u.nombre);
    setFormEmail(u.email);
    setFormRol(u.rol);
    setFormPassword(u.password || '');
    setFormActivo(u.activo !== false);
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim() || !formEmail.trim()) {
      toast.error('Nombre y correo son requeridos');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveUsuario({
        _id: editingUser ? editingUser._id : undefined,
        nombre: formNombre.trim(),
        email: formEmail.trim().toLowerCase(),
        rol: formRol,
        password: formPassword.trim() || 'Duncan2026*',
        activo: formActivo,
      });

      toast.success(editingUser ? 'Usuario actualizado correctamente' : 'Usuario creado exitosamente');
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Error guardando usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (u: Usuario) => {
    if (isOwner(u.email)) {
      toast.error('No se puede eliminar la cuenta de Propietario / Super Admin');
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar el acceso para "${u.nombre}" (${u.email})?`)) {
      return;
    }

    const res = await deleteUsuario(u._id);
    if (res.success) {
      toast.success('Usuario eliminado');
    } else {
      toast.error(res.message || 'Error eliminando usuario');
    }
  };

  const handleSwitchSession = (u: Usuario) => {
    switchUser(u);
    toast.success(`Sesión activa cambiada a: ${u.nombre}`);
  };

  // Filtrado
  const filteredUsers = usuarios.filter(u => {
    const matchesSearch =
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'todos' || u.rol === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 fade-in pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            Usuarios y Roles
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión de cuentas autorizadas, propietarios y niveles de acceso a SGD Duncan 2.0
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN DESTACADA: PROPIETARIOS Y ADMINISTRADORES OFICIALES */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 rounded-2xl p-6 text-white shadow-xl border border-amber-500/30 relative overflow-hidden">
        {/* Marca de agua decorativa */}
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
          <Crown className="w-56 h-56 text-amber-400" />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="p-2 bg-amber-400/20 text-amber-300 rounded-lg">
            <Crown className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-amber-300 tracking-wide">
              Cuentas Maestras — Propietarios y Administradores
            </h2>
            <p className="text-xs text-slate-300">
              Registradas con privilegios completos de administración y control total sobre el sistema
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Propietario 0: Administrador del Sistema A. Becerra */}
          <div className="bg-slate-800/80 backdrop-blur border border-yellow-400/50 rounded-xl p-4 flex flex-col justify-between hover:border-yellow-400 transition-all shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-yellow-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-md">
                  AB
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">A. Becerra</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-400 text-slate-950 flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Admin
                    </span>
                  </div>
                  <p className="text-xs text-yellow-200/90 flex items-center gap-1.5 mt-0.5 font-mono truncate max-w-[170px]" title="aabecerra852@gmail.com">
                    <Mail className="w-3.5 h-3.5 shrink-0" /> aabecerra852@gmail.com
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" /> Activo
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <div className="text-slate-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>Clave: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-yellow-300 font-mono text-[11px]">Panelas369*</code></span>
              </div>
              {currentUser?.email.toLowerCase() === 'aabecerra852@gmail.com' ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" /> En uso
                </span>
              ) : (
                <button
                  onClick={() => {
                    const u = usuarios.find(x => x.email.toLowerCase() === 'aabecerra852@gmail.com');
                    if (u) handleSwitchSession(u);
                  }}
                  className="px-2.5 py-1 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1 shadow text-xs"
                >
                  <LogIn className="w-3.5 h-3.5" /> Usar
                </button>
              )}
            </div>
          </div>

          {/* Propietario 1: Francisco Rojas */}
          <div className="bg-slate-800/80 backdrop-blur border border-amber-400/30 rounded-xl p-4 flex flex-col justify-between hover:border-amber-400 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-md">
                  FR
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">Francisco Rojas</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Propietario
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/90 flex items-center gap-1.5 mt-0.5 font-mono truncate max-w-[170px]" title="francisco.rojasp@gmail.com">
                    <Mail className="w-3.5 h-3.5 shrink-0" /> francisco.rojasp@gmail.com
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" /> Activo
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <div className="text-slate-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Clave: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300 font-mono text-[11px]">Leo150873#*$</code></span>
              </div>
              {currentUser?.email.toLowerCase() === 'francisco.rojasp@gmail.com' ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" /> En uso
                </span>
              ) : (
                <button
                  onClick={() => {
                    const u = usuarios.find(x => x.email.toLowerCase() === 'francisco.rojasp@gmail.com');
                    if (u) handleSwitchSession(u);
                  }}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1 shadow text-xs"
                >
                  <LogIn className="w-3.5 h-3.5" /> Usar
                </button>
              )}
            </div>
          </div>

          {/* Propietario 2: SST / SSA Duncan */}
          <div className="bg-slate-800/80 backdrop-blur border border-amber-400/30 rounded-xl p-4 flex flex-col justify-between hover:border-amber-400 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-md">
                  SD
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">SST / SSA</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Propietario
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/90 flex items-center gap-1.5 mt-0.5 font-mono truncate max-w-[170px]" title="sgssaduncan@gmail.com">
                    <Mail className="w-3.5 h-3.5 shrink-0" /> sgssaduncan@gmail.com
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" /> Activo
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <div className="text-slate-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Clave: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300 font-mono text-[11px]">Leo150873#*$</code></span>
              </div>
              {currentUser?.email.toLowerCase() === 'sgssaduncan@gmail.com' ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" /> En uso
                </span>
              ) : (
                <button
                  onClick={() => {
                    const u = usuarios.find(x => x.email.toLowerCase() === 'sgssaduncan@gmail.com');
                    if (u) handleSwitchSession(u);
                  }}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1 shadow text-xs"
                >
                  <LogIn className="w-3.5 h-3.5" /> Usar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input pl-9 text-sm w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Filtrar rol:</span>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="input text-sm py-1.5 w-full sm:w-auto"
          >
            <option value="todos">Todos los roles</option>
            <option value="Propietario / Super Admin">Propietario / Super Admin</option>
            <option value="Admin">Admin</option>
            <option value="Inspector">Inspector</option>
          </select>
        </div>
      </div>

      {/* Lista / Tabla de Usuarios */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Usuario</th>
                <th className="py-3.5 px-4">Correo Electrónico</th>
                <th className="py-3.5 px-4">Rol / Nivel</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No se encontraron usuarios coincidentes
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const owner = isOwner(u.email);
                  const isCurrent = currentUser?.email.toLowerCase() === u.email.toLowerCase();

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                            owner
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : u.rol === 'Admin'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {u.nombre.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block flex items-center gap-1.5">
                              {u.nombre}
                              {owner && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                              {isCurrent && (
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-medium">
                                  Tú
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">ID: {u._id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        {u.email}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          owner
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : u.rol === 'Admin'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {owner ? <ShieldCheck className="w-3 h-3 text-amber-600" /> : <Shield className="w-3 h-3" />}
                          {u.rol}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.activo !== false ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Inactivo
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isCurrent && (
                            <button
                              onClick={() => handleSwitchSession(u)}
                              title="Cambiar sesión a este usuario"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <LogIn className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openResetModal(u)}
                            title="Restablecer contraseña (Costo Cero)"
                            className="p-1.5 text-slate-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(u)}
                            title="Editar usuario"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {!owner && (
                            <button
                              onClick={() => handleDelete(u)}
                              title="Eliminar usuario"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR / EDITAR USUARIO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formNombre}
                  onChange={e => setFormNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="input w-full text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="ejemplo@duncan.com.ve"
                  className="input w-full text-sm font-mono"
                  disabled={editingUser && isOwner(editingUser.email)}
                />
                {editingUser && isOwner(editingUser.email) && (
                  <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Este correo es de un propietario principal y no se puede cambiar.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Rol y Nivel de Acceso *
                </label>
                <select
                  value={formRol}
                  onChange={e => setFormRol(e.target.value as Rol)}
                  className="input w-full text-sm"
                  disabled={editingUser && isOwner(editingUser.email)}
                >
                  <option value="Propietario / Super Admin">Propietario / Super Admin (Control total)</option>
                  <option value="Admin">Admin (Gestión y reportes)</option>
                  <option value="Inspector">Inspector (Ejecución de inspecciones)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="input w-full text-sm pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="userActivo"
                  checked={formActivo}
                  onChange={e => setFormActivo(e.target.checked)}
                  disabled={editingUser && isOwner(editingUser.email)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
                <label htmlFor="userActivo" className="text-sm font-medium text-slate-700">
                  Usuario Activo (Permitir acceso)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  {isSubmitting ? 'Guardando...' : editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL RESTABLECER CONTRASEÑA RÁPIDO (COSTO CERO) */}
      {resetModalOpen && userToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-yellow-400" />
                Restablecer Contraseña (Costo Cero)
              </h3>
              <button
                onClick={() => setResetModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReset} className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Usuario / Titular:</span>
                  <span className="font-bold text-slate-800">{userToReset.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Correo Gmail:</span>
                  <span className="font-mono text-slate-700">{userToReset.email}</span>
                </div>
                {userToReset.cedula && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Cédula:</span>
                    <span className="font-mono text-slate-700">{userToReset.cedula}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Rol:</span>
                  <span className="text-amber-600 font-semibold">{userToReset.rol}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nueva Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPasswordToReset}
                    onChange={e => setNewPasswordToReset(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="input w-full text-sm pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Recomendado para asistencia técnica rápida: <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-mono">Duncan2026*</code>
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="btn-secondary text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="btn-primary text-sm flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold border-yellow-500"
                >
                  {isResetting ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4" />
                  )}
                  <span>{isResetting ? 'Restableciendo...' : 'Confirmar Nueva Clave'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}