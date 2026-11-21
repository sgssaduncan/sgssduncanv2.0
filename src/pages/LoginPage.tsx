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
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  Sparkles,
  KeyRound,
  Send,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';
import { useSGD } from '../contexts/SGDContext';
import { DUNCAN_LOGO_COLOR } from '../lib/logos';
import toast from 'react-hot-toast';
import type { Rol } from '../types';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser,
    login,
    register,
    isOnline,
    resetPasswordWithIdentity,
    requestRecoveryCode
  } = useSGD();

  const from = (location.state as any)?.from?.pathname || '/';

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'recover'>('login');

  // Formulario de Inicio de Sesión
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Formulario de Registro
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCargo, setRegCargo] = useState('Inspector de Seguridad y Salud');
  const [regSede, setRegSede] = useState('Planta Principal Los Ruices');
  const [regRol, setRegRol] = useState<Rol>('Inspector');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // ── RECUPERACIÓN DE ACCESO MEDIANTE OTP (ZERO-TRUST) ──
  const [recEmail, setRecEmail] = useState('');
  const [recOtpCode, setRecOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [recNewPassword, setRecNewPassword] = useState('');
  const [recConfirmNewPassword, setRecConfirmNewPassword] = useState('');
  const [showRecPassword, setShowRecPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Acción: Iniciar Sesión
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error('Ingrese correo electrónico y contraseña.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await login(loginEmail.trim(), loginPassword.trim());
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

  // Acción: Registro de Usuario
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regNombre.trim()) {
      toast.error('Indique su nombre y apellido completo.');
      return;
    }

    const emailClean = regEmail.trim().toLowerCase();
    if (!emailClean || !emailClean.includes('@')) {
      toast.error('Debe ingresar un correo electrónico válido.');
      return;
    }

    if (!regPassword || regPassword.length < 8) {
      toast.error('La contraseña debe contener al menos 8 caracteres por directriz de seguridad.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    setIsRegistering(true);
    try {
      const res = await register({
        nombre: regNombre.trim(),
        email: emailClean,
        password: regPassword.trim(),
        cargo: regCargo.trim(),
        localidad: regSede.trim(),
        rol: regRol
      });

      if (res.success) {
        toast.success('¡Usuario registrado con éxito! Bienvenido al sistema.');
        navigate(from, { replace: true });
      } else {
        toast.error(res.message || 'No fue posible registrar el usuario.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error en el proceso de registro.');
    } finally {
      setIsRegistering(false);
    }
  };

  // Solicitar Código OTP al Correo (Google Apps Script)
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = recEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Ingrese su correo registrado para recibir el código de seguridad.');
      return;
    }

    setIsRequestingOtp(true);
    try {
      const res = await requestRecoveryCode(cleanEmail);
      if (res.success) {
        setOtpSent(true);
        toast.success(res.message);
      } else {
        toast.error(res.message || 'No se pudo generar el código.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error solicitando código.');
    } finally {
      setIsRequestingOtp(false);
    }
  };

  // Restablecer Contraseña con OTP
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = recEmail.trim().toLowerCase();
    const cleanOtp = recOtpCode.trim();

    if (!cleanEmail) {
      toast.error('Ingrese su correo electrónico.');
      return;
    }

    if (!cleanOtp || cleanOtp.length !== 6) {
      toast.error('Ingrese el código de seguridad de 6 dígitos enviado a su correo.');
      return;
    }

    if (!recNewPassword || recNewPassword.length < 8) {
      toast.error('La nueva contraseña debe contener al menos 8 caracteres.');
      return;
    }

    if (recNewPassword !== recConfirmNewPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    setIsResettingPassword(true);
    try {
      const res = await resetPasswordWithIdentity({
        email: cleanEmail,
        code: cleanOtp,
        newPassword: recNewPassword.trim()
      });

      if (res.success) {
        toast.success(res.message);
        setLoginEmail(cleanEmail);
        setLoginPassword(recNewPassword.trim());
        setOtpSent(false);
        setRecOtpCode('');
        setRecNewPassword('');
        setRecConfirmNewPassword('');
        setActiveTab('login');
      } else {
        toast.error(res.message || 'Código de seguridad inválido o expirado.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al restablecer la contraseña.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-[#0B132B] to-slate-900 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-amber-400 selection:text-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md md:max-w-xl">
        {/* Encabezado Corporativo Duncan */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-slate-900 rounded-2xl border-2 border-amber-400 shadow-2xl shadow-amber-500/20 mb-1">
            <img
              src={DUNCAN_LOGO_COLOR}
              alt="Acumuladores Duncan Logo Oficial"
              className="h-12 sm:h-14 w-auto object-contain"
            />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase flex items-center justify-center gap-2">
              Sistema de Gestión Duncan
              <span className="text-xs bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md font-black shadow-xs">2.0</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-md mx-auto">
              Plataforma Corporativa de Seguridad y Salud en el Trabajo, Control Operativo y Dotación EPP
            </p>
          </div>

          {/* Badges normativos oficiales */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-bold text-slate-300">
            <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-amber-400/40 text-amber-300 shadow-xs">LOPCYMAT Art. 62</span>
            <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 text-white shadow-xs">INPSASEL NT-03-2016</span>
            <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 text-white shadow-xs">COVENIN</span>
            <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 text-white shadow-xs flex items-center gap-1.5">
              {isOnline ? <Wifi size={13} className="text-emerald-400" /> : <WifiOff size={13} className="text-amber-400" />}
              {isOnline ? 'Online Sync' : 'Offline Almacén'}
            </span>
          </div>
        </div>

        {/* Tarjeta Principal de Alta Legibilidad y Contraste */}
        <div className="mt-6 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
          {/* Barra Superior de Pestañas: Iniciar Sesión | Registrarse | Recuperar Acceso */}
          <div className="grid grid-cols-3 bg-slate-900 p-2 gap-2 border-b-2 border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'login'
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-[1.01]'
                  : 'bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700'
              }`}
            >
              <LogIn size={15} />
              <span className="truncate">Iniciar Sesión</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'register'
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-[1.01]'
                  : 'bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700'
              }`}
            >
              <UserPlus size={15} />
              <span className="truncate">Registrarse</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('recover')}
              className={`flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'recover'
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-[1.01]'
                  : 'bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700'
              }`}
            >
              <KeyRound size={15} />
              <span className="truncate">Recuperar Acceso</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6 bg-white">
            {/* Aviso si ya existe sesión activa */}
            {currentUser && (
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl p-3.5 flex items-center justify-between text-xs sm:text-sm text-emerald-950 shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-extrabold">Sesión activa como:</span> {currentUser.nombre} ({currentUser.email})
                  </div>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-3 py-1.5 rounded-lg text-xs transition-colors shadow-xs"
                >
                  Ir al Sistema →
                </button>
              </div>
            )}

            {/* TAB 1: FORMULARIO DE INICIO DE SESIÓN */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                    Correo Electrónico <span className="text-amber-600">*</span>
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      required
                      placeholder="ejemplo@duncan.com.ve"
                      className="block w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-400/20 rounded-xl text-slate-950 font-bold text-sm sm:text-base placeholder-slate-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                      Contraseña <span className="text-amber-600">*</span>
                    </label>
                  </div>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                      placeholder="Ingrese su contraseña..."
                      className="block w-full pl-11 pr-11 py-3 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-400/20 rounded-xl text-slate-950 font-bold text-sm sm:text-base placeholder-slate-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-800 transition-colors"
                      title={showLoginPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Enlace a Recuperar Acceso */}
                <div className="flex justify-end pt-1 text-xs sm:text-sm font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('recover');
                      if (loginEmail) setRecEmail(loginEmail);
                    }}
                    className="text-amber-700 hover:text-amber-900 underline underline-offset-4 transition-colors flex items-center gap-1"
                  >
                    <KeyRound size={14} />
                    ¿Olvidó su contraseña?
                  </button>
                </div>

                {/* Botón Principal de Entrada */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full mt-3 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-slate-950 font-black py-3.5 px-4 rounded-xl text-sm sm:text-base uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <div className="w-5 h-5 border-3 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogIn size={18} />
                  )}
                  <span>{isLoggingIn ? 'Iniciando Sesión...' : 'Entrar al Sistema SGD'}</span>
                </button>
              </form>
            )}

            {/* TAB 2: FORMULARIO DE REGISTRO */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3.5 text-xs sm:text-sm text-amber-950 flex items-start gap-2.5 shadow-xs">
                  <Sparkles size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-semibold">
                    <strong>Registro de Inspector / Supervisor:</strong> Indique sus datos corporativos autorizados para habilitar su acceso al sistema.
                  </div>
                </div>

                {/* Nombre y Apellido */}
                <div>
                  <label className="block text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                    Nombre y Apellido <span className="text-amber-600">*</span>
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      value={regNombre}
                      onChange={e => setRegNombre(e.target.value)}
                      required
                      placeholder="Ej: Pedro Pérez"
                      className="block w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-400/20 rounded-xl text-slate-950 font-bold text-sm sm:text-base placeholder-slate-400 transition-all"
                    />
                  </div>
                </div>

                {/* Correo */}
                <div>
                  <label className="block text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                    Correo Electrónico <span className="text-amber-600">*</span>
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      required
                      placeholder="usuario@duncan.com.ve"
                      className="block w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-400/20 rounded-xl text-slate-950 font-bold text-sm sm:text-base placeholder-slate-400 transition-all"
                    />
                  </div>
                </div>

                {/* Cargo y Sede */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                      Cargo / Especialidad
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Briefcase size={18} />
                      </div>
                      <input
                        type="text"
                        value={regCargo}
                        onChange={e => setRegCargo(e.target.value)}
                        placeholder="Ej: Inspector SSA / Supervisor"
                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-400/20 rounded-xl text-slate-950 font-bold text-sm placeholder-slate-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                      Sede / Planta Duncan
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Building size={18} />
                      </div>
                      <select
                        value={regSede}
                        onChange={e => setRegSede(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-400/20 rounded-xl text-slate-950 font-bold text-sm transition-all"
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

                {/* Contraseñas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                      Contraseña <span className="text-amber-600">* (Mín. 8 car.)</span>
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock size={18} />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        required
                        minLength={8}
                        placeholder="Mínimo 8 car."
                        className="block w-full pl-11 pr-10 py-3 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-400/20 rounded-xl text-slate-950 font-bold text-sm placeholder-slate-400 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-800"
                      >
                        {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                      Confirmar Contraseña <span className="text-amber-600">*</span>
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock size={18} />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        placeholder="Repita contraseña"
                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-400/20 rounded-xl text-slate-950 font-bold text-sm placeholder-slate-400 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full mt-3 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-slate-950 font-black py-3.5 px-4 rounded-xl text-sm sm:text-base uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isRegistering ? (
                    <div className="w-5 h-5 border-3 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UserPlus size={18} />
                  )}
                  <span>{isRegistering ? 'Registrando Usuario...' : 'Crear Cuenta e Ingresar'}</span>
                </button>
              </form>
            )}

            {/* TAB 3: RECUPERACIÓN DE ACCESO MEDIANTE OTP SEGURO */}
            {activeTab === 'recover' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3.5 flex items-start gap-2.5 shadow-xs">
                  <ShieldCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-blue-950 uppercase tracking-wide">
                      Recuperación de Contraseña Segura (OTP)
                    </h3>
                    <p className="text-xs text-blue-900 mt-0.5 font-medium leading-relaxed">
                      Por políticas de seguridad Zero-Trust, se enviará un código numérico temporal (OTP) de 6 dígitos a su correo electrónico para validar su identidad.
                    </p>
                  </div>
                </div>

                {!otpSent ? (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                        Correo Electrónico Registrado <span className="text-amber-600">*</span>
                      </label>
                      <div className="relative rounded-xl shadow-xs">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Mail size={18} />
                        </div>
                        <input
                          type="email"
                          value={recEmail}
                          onChange={e => setRecEmail(e.target.value)}
                          required
                          placeholder="ejemplo@duncan.com.ve"
                          className="block w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-400/20 rounded-xl text-slate-950 font-bold text-sm sm:text-base placeholder-slate-400 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isRequestingOtp}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      {isRequestingOtp ? (
                        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      <span>{isRequestingOtp ? 'Enviando Código...' : 'Enviar Código OTP a mi Correo'}</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSaveNewPassword} className="space-y-4">
                    <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-900 font-bold">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <span>Código enviado a: <strong className="font-mono">{recEmail}</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-xs text-slate-500 hover:text-slate-800 underline flex items-center gap-1 font-semibold"
                      >
                        <RotateCcw size={12} /> Cambiar
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                        Código de Verificación OTP (6 Dígitos) <span className="text-amber-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={recOtpCode}
                        onChange={e => setRecOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        required
                        maxLength={6}
                        placeholder="123456"
                        className="block w-full py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-950 text-center font-mono font-black text-lg tracking-widest focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                        Nueva Contraseña <span className="text-amber-600">* (Mín. 8 caracteres)</span>
                      </label>
                      <div className="relative rounded-xl shadow-xs">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Lock size={18} />
                        </div>
                        <input
                          type={showRecPassword ? 'text' : 'password'}
                          value={recNewPassword}
                          onChange={e => setRecNewPassword(e.target.value)}
                          required
                          minLength={8}
                          placeholder="Nueva contraseña..."
                          className="block w-full pl-11 pr-11 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-950 text-sm font-bold placeholder-slate-400 focus:border-amber-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRecPassword(!showRecPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-800"
                        >
                          {showRecPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                        Confirmar Nueva Contraseña <span className="text-amber-600">*</span>
                      </label>
                      <div className="relative rounded-xl shadow-xs">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Lock size={18} />
                        </div>
                        <input
                          type={showRecPassword ? 'text' : 'password'}
                          value={recConfirmNewPassword}
                          onChange={e => setRecConfirmNewPassword(e.target.value)}
                          required
                          minLength={8}
                          placeholder="Repita la nueva contraseña..."
                          className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-950 text-sm font-bold placeholder-slate-400 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isResettingPassword}
                      className="w-full mt-2 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-slate-950 font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                    >
                      {isResettingPassword ? (
                        <div className="w-5 h-5 border-3 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 size={18} />
                      )}
                      <span>{isResettingPassword ? 'Validando con Servidor...' : 'Guardar Nueva Contraseña e Ingresar'}</span>
                    </button>
                  </form>
                )}

                {/* Botón para regresar al Login */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-950 inline-flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft size={15} />
                    <span>Volver a la pantalla de Inicio de Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer legal */}
        <div className="mt-6 text-center text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">Acumuladores Duncan, S.A. • RIF J-00045090-0</p>
          <p>Servicio de Seguridad y Salud en el Trabajo (SSST) • Todos los derechos reservados © 2026</p>
        </div>
      </div>
    </div>
  );
}
