import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Building,
  Briefcase,
  IdCard,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  Sparkles,
  KeyRound,
  ChevronRight
} from 'lucide-react';
import { useSGD } from '../contexts/SGDContext';
import { DUNCAN_LOGO_COLOR } from '../lib/logos';
import toast from 'react-hot-toast';
import type { Rol } from '../types';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, login, register, isOnline } = useSGD();

  const from = (location.state as any)?.from?.pathname || '/';

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register form state
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCedula, setRegCedula] = useState('');
  const [regCargo, setRegCargo] = useState('Inspector de Seguridad y Salud');
  const [regSede, setRegSede] = useState('Planta Principal Los Ruices');
  const [regRol, setRegRol] = useState<Rol>('Inspector');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Pre-cargar cuenta de administrador solicitado
  const loadAdminAccount = () => {
    setLoginEmail('aabecerra852@gmail.com');
    setLoginPassword('Panelas369*');
    toast.success('Credenciales del Administrador del Sistema precargadas');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error('Ingrese correo electrónico y contraseña.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success && res.user) {
        toast.success(`¡Bienvenido, ${res.user.nombre || res.user.email}!`);
        navigate(from, { replace: true });
      } else {
        toast.error(res.message || 'Error al iniciar sesión. Verifique credenciales.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Fallo de autenticación.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regNombre.trim()) {
      toast.error('Indique su nombre y apellido completo.');
      return;
    }

    const emailClean = regEmail.trim().toLowerCase();
    if (!emailClean) {
      toast.error('Debe ingresar un correo electrónico.');
      return;
    }

    // Validación obligatoria de dominio Gmail
    if (!emailClean.endsWith('@gmail.com')) {
      toast.error('Por directriz corporativa, el registro debe realizarse exclusivamente con correos @gmail.com.');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      toast.error('La contraseña debe contener al menos 6 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      toast.error('Las contraseñas no coinciden. Verifíquelas.');
      return;
    }

    setIsRegistering(true);
    try {
      const res = await register({
        nombre: regNombre.trim(),
        email: emailClean,
        password: regPassword.trim(),
        cedula: regCedula.trim(),
        cargo: regCargo.trim(),
        localidad: regSede,
        rol: regRol
      });

      if (res.success && res.user) {
        toast.success(`¡Cuenta creada con éxito! Bienvenido al SGD, ${res.user.nombre}`);
        navigate(from, { replace: true });
      } else {
        toast.error(res.message || 'Error al registrar el usuario.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error en el registro.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-yellow-400 selection:text-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md md:max-w-xl">
        {/* Logo corporativo y título */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-slate-900/90 rounded-2xl border border-yellow-400/40 shadow-2xl shadow-yellow-500/10 mb-1">
            <img
              src={DUNCAN_LOGO_COLOR}
              alt="Acumuladores Duncan Logo Oficial"
              className="h-12 sm:h-14 w-auto object-contain"
            />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase flex items-center justify-center gap-2">
              Sistema de Gestión Duncan
              <span className="text-xs bg-yellow-400 text-slate-950 px-2 py-0.5 rounded-md font-black">2.0</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Plataforma Corporativa de Seguridad y Salud en el Trabajo, Control Operativo y Dotación EPP
            </p>
          </div>

          {/* Badges normativos */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[10px] font-bold text-slate-400">
            <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 text-yellow-400">LOPCYMAT Art. 62</span>
            <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">INPSASEL NT-03-2016</span>
            <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">COVENIN</span>
            <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 flex items-center gap-1">
              {isOnline ? <Wifi size={11} className="text-emerald-400" /> : <WifiOff size={11} className="text-amber-400" />}
              {isOnline ? 'Online Sync' : 'Offline Almacén'}
            </span>
          </div>
        </div>

        {/* Tarjeta de Inicio de Sesión / Registro */}
        <div className="mt-6 bg-slate-900/95 border border-slate-800/90 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden">
          {/* Pestañas Login vs Register */}
          <div className="grid grid-cols-2 border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'login'
                  ? 'bg-yellow-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LogIn size={15} />
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'register'
                  ? 'bg-yellow-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <UserPlus size={15} />
              Registrarse con Gmail
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Aviso si ya tiene sesión activa */}
            {currentUser && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold">Sesión activa como:</span> {currentUser.nombre} ({currentUser.email})
                  </div>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1 rounded text-[11px] transition-colors"
                >
                  Ir al Sistema →
                </button>
              </div>
            )}

            {/* TAB 1: FORMULARIO DE INICIO DE SESIÓN */}
            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Correo Electrónico
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      required
                      placeholder="ejemplo@gmail.com"
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      Contraseña
                    </label>
                  </div>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                      placeholder="Ingrese su contraseña..."
                      className="block w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full mt-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogIn size={16} />
                  )}
                  {isLoggingIn ? 'Iniciando Sesión...' : 'Entrar al Sistema SGD'}
                </button>

                {/* Acceso Rápido Administrador Maestro Solicitado */}
                <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <KeyRound size={13} className="text-yellow-400" />
                      Cuenta Administradora Autorizada:
                    </span>
                    <span className="text-[10px] text-yellow-400 font-semibold bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                      Super Admin
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-yellow-400" />
                        aabecerra852@gmail.com
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Contraseña configurada: <code className="bg-slate-900 px-1 rounded text-yellow-300 font-mono text-[10px]">Panelas369*</code>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={loadAdminAccount}
                      className="bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-yellow-400/30 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 self-start sm:self-auto"
                    >
                      <span>Usar Credenciales</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* TAB 2: FORMULARIO DE REGISTRO CON GMAIL */
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3 text-xs text-yellow-300 flex items-start gap-2">
                  <Sparkles size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <strong>Directriz de Registro:</strong> Solo se admiten correos electrónicos pertenecientes a Google (<code className="text-white font-mono">@gmail.com</code>). Su cuenta se vinculará para trazabilidad y auditoría.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Nombre y Apellido <span className="text-yellow-400">*</span>
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <User size={15} />
                      </div>
                      <input
                        type="text"
                        value={regNombre}
                        onChange={e => setRegNombre(e.target.value)}
                        required
                        placeholder="Ej: Pedro Pérez"
                        className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Cédula de Identidad (Opcional)
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <IdCard size={15} />
                      </div>
                      <input
                        type="text"
                        value={regCedula}
                        onChange={e => setRegCedula(e.target.value)}
                        placeholder="Ej: V-12345678"
                        className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Correo Gmail <span className="text-yellow-400">* (@gmail.com)</span>
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail size={15} />
                    </div>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      required
                      placeholder="usuario@gmail.com"
                      className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                  {regEmail && !regEmail.toLowerCase().endsWith('@gmail.com') && (
                    <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle size={12} /> El correo debe terminar en @gmail.com
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Cargo / Especialidad
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Briefcase size={15} />
                      </div>
                      <input
                        type="text"
                        value={regCargo}
                        onChange={e => setRegCargo(e.target.value)}
                        placeholder="Inspector SSA / Supervisor"
                        className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Sede / Planta
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Building size={15} />
                      </div>
                      <select
                        value={regSede}
                        onChange={e => setRegSede(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-yellow-400"
                      >
                        <option value="Planta Principal Los Ruices">Planta Principal Los Ruices (Caracas)</option>
                        <option value="Distribuidora Valencia">Distribuidora Valencia (Carabobo)</option>
                        <option value="Distribuidora Maracaibo">Distribuidora Maracaibo (Zulia)</option>
                        <option value="Distribuidora Barcelona">Distribuidora Barcelona (Anzoátegui)</option>
                        <option value="Distribuidora Barquisimeto">Distribuidora Barquisimeto (Lara)</option>
                        <option value="Distribuidora Puerto Ordaz">Distribuidora Puerto Ordaz (Bolívar)</option>
                        <option value="Servicentro Guarenas">Servicentro Guarenas</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Contraseña <span className="text-yellow-400">* (Min. 6 car.)</span>
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock size={15} />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Mínimo 6 car."
                        className="block w-full pl-9 pr-9 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white"
                      >
                        {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Confirmar Contraseña <span className="text-yellow-400">*</span>
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock size={15} />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Repita contraseña"
                        className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full mt-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isRegistering ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UserPlus size={16} />
                  )}
                  {isRegistering ? 'Registrando Usuario...' : 'Crear Cuenta e Ingresar'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer legal */}
        <div className="mt-6 text-center text-[11px] text-slate-500 space-y-1">
          <p>Acumuladores Duncan, S.A. • RIF J-00045090-0</p>
          <p>Servicio de Seguridad y Salud en el Trabajo (SSST) • Todos los derechos reservados © 2026</p>
        </div>
      </div>
    </div>
  );
}
