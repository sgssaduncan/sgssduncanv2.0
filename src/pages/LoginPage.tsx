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
  Search,
  HelpCircle,
  Copy,
  Check,
  RotateCcw,
  Send,
  ArrowLeft
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
    findUserAccount,
    findUserByEmail,
    resetPasswordWithIdentity,
    requestRecoveryCode,
    verifyRecoveryCode
  } = useSGD();

  const from = (location.state as any)?.from?.pathname || '/';

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'recover'>('login');

  // Formulario de Inicio de Sesión
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Formulario de Registro (Sin exigencia de Cédula)
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCargo, setRegCargo] = useState('Inspector de Seguridad y Salud');
  const [regSede, setRegSede] = useState('Planta Principal Los Ruices');
  const [regRol, setRegRol] = useState<Rol>('Inspector');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // ── RECUPERACIÓN DE ACCESO AUTÓNOMA A COSTO CERO ──
  const [recoverySubTab, setRecoverySubTab] = useState<'username' | 'password'>('username');
  
  // 1. Buscar Usuario por Correo Gmail o Nombre
  const [recQuery, setRecQuery] = useState('');
  const [isSearchingAccount, setIsSearchingAccount] = useState(false);
  const [foundAccount, setFoundAccount] = useState<{
    found: boolean;
    user?: any;
    empleado?: any;
    message?: string;
  } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // 2. Restablecer Contraseña
  const [recEmail, setRecEmail] = useState('');
  const [recOtpCode, setRecOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [identityVerified, setIdentityVerified] = useState(false);
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
    if (!emailClean) {
      toast.error('Debe ingresar un correo electrónico.');
      return;
    }

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

  // Acción: Buscar Cuenta por Correo Gmail o Nombre
  const handleSearchAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recQuery.trim()) {
      toast.error('Ingrese su correo Gmail o nombre para buscar su cuenta.');
      return;
    }

    setIsSearchingAccount(true);
    try {
      const result = findUserAccount(recQuery.trim());
      setFoundAccount(result);
      if (result.found && result.user) {
        toast.success(`¡Cuenta localizada para ${result.user.nombre}!`);
      } else if (result.empleado) {
        toast(result.message || 'Trabajador localizado en nómina activa.', { icon: 'ℹ️' });
      } else {
        toast.error(result.message || 'No se encontró ninguna cuenta con los datos ingresados.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al buscar cuenta.');
    } finally {
      setIsSearchingAccount(false);
    }
  };

  // Copiar correo y transferir al Login
  const handleUseFoundEmail = (email: string) => {
    setLoginEmail(email);
    navigator.clipboard?.writeText(email);
    setCopiedEmail(true);
    toast.success('Correo copiado y transferido a la pantalla de inicio de sesión');
    setTimeout(() => {
      setCopiedEmail(false);
      setActiveTab('login');
    }, 800);
  };

  // Pasar de Usuario encontrado a Restablecer Contraseña
  const handleProceedToPasswordReset = (email: string) => {
    setRecEmail(email);
    setRecoverySubTab('password');
    setIdentityVerified(true);
    toast.success('Cuenta confirmada. Defina su nueva contraseña a continuación.');
  };

  // Validar Identidad por Correo Gmail para Restablecer Contraseña
  const handleVerifyAccountEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = recEmail.trim().toLowerCase();

    if (!cleanEmail) {
      toast.error('Ingrese su correo electrónico Gmail.');
      return;
    }

    const user = findUserByEmail(cleanEmail);
    if (!user) {
      toast.error('No se encontró ningún usuario con ese correo electrónico.');
      return;
    }

    setIdentityVerified(true);
    toast.success(`¡Cuenta de ${user.nombre} confirmada! Ingrese su nueva contraseña a continuación.`);
  };

  // Solicitar Código OTP a Gmail (Google Apps Script - Costo Cero)
  const handleRequestOtp = async () => {
    const cleanEmail = recEmail.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error('Ingrese su correo Gmail para enviarle el código de seguridad.');
      return;
    }

    setIsRequestingOtp(true);
    try {
      const res = await requestRecoveryCode(cleanEmail);
      if (res.success) {
        setOtpSent(true);
        if (res.sentViaEmail) {
          toast.success(res.message);
        } else {
          toast.success(`Código de seguridad generado para ${cleanEmail}. Ingréselo abajo.`);
        }
      } else {
        toast.error(res.message || 'No se pudo generar el código.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error solicitando código.');
    } finally {
      setIsRequestingOtp(false);
    }
  };

  // Validar Código OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recOtpCode.trim()) {
      toast.error('Ingrese el código de 6 dígitos.');
      return;
    }

    const isValid = verifyRecoveryCode(recEmail.trim().toLowerCase(), recOtpCode.trim());
    if (isValid) {
      setIdentityVerified(true);
      toast.success('¡Código validado exitosamente! Defina su nueva contraseña.');
    } else {
      toast.error('Código inválido o expirado. Verifíquelo o solicite uno nuevo.');
    }
  };

  // Guardar Nueva Contraseña
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recNewPassword || recNewPassword.length < 6) {
      toast.error('La nueva contraseña debe contener al menos 6 caracteres.');
      return;
    }
    if (recNewPassword !== recConfirmNewPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    setIsResettingPassword(true);
    try {
      const res = await resetPasswordWithIdentity({
        email: recEmail.trim().toLowerCase(),
        newPassword: recNewPassword.trim()
      });

      if (res.success) {
        toast.success(res.message);
        setLoginEmail(recEmail.trim().toLowerCase());
        setLoginPassword(recNewPassword.trim());
        setIdentityVerified(false);
        setRecNewPassword('');
        setRecConfirmNewPassword('');
        setRecOtpCode('');
        setOtpSent(false);
        setActiveTab('login');
      } else {
        toast.error(res.message);
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
                      placeholder="ejemplo@gmail.com"
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

                {/* Enlaces a Recuperar Acceso */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs sm:text-sm font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('recover');
                      setRecoverySubTab('password');
                      if (loginEmail) setRecEmail(loginEmail);
                    }}
                    className="text-amber-700 hover:text-amber-900 underline underline-offset-4 transition-colors flex items-center gap-1"
                  >
                    <KeyRound size={14} />
                    ¿Olvidó su contraseña?
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('recover');
                      setRecoverySubTab('username');
                    }}
                    className="text-slate-600 hover:text-slate-900 underline underline-offset-4 transition-colors"
                  >
                    ¿Olvidó su correo/usuario?
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

            {/* TAB 2: FORMULARIO DE REGISTRO CON GMAIL (SIN CÉDULA) */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3.5 text-xs sm:text-sm text-amber-950 flex items-start gap-2.5 shadow-xs">
                  <Sparkles size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-semibold">
                    <strong>Directriz de Registro:</strong> Solo se admiten correos electrónicos de Google (<code className="bg-amber-200/80 text-amber-900 px-1 py-0.5 rounded font-mono font-bold">@gmail.com</code>).
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

                {/* Correo Gmail */}
                <div>
                  <label className="block text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                    Correo Gmail <span className="text-amber-600">* (@gmail.com)</span>
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
                      placeholder="usuario@gmail.com"
                      className="block w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-400/20 rounded-xl text-slate-950 font-bold text-sm sm:text-base placeholder-slate-400 transition-all"
                    />
                  </div>
                  {regEmail && !regEmail.toLowerCase().endsWith('@gmail.com') && (
                    <p className="text-xs text-red-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle size={14} /> El correo debe terminar en @gmail.com
                    </p>
                  )}
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
                      Contraseña <span className="text-amber-600">* (Mín. 6 car.)</span>
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
                        minLength={6}
                        placeholder="Mínimo 6 car."
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
                        minLength={6}
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

            {/* TAB 3: RECUPERACIÓN DE ACCESO Y CONTRASEÑA (COSTO CERO) */}
            {activeTab === 'recover' && (
              <div className="space-y-4">
                {/* Banner de Metodología Costo Cero */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3.5 flex items-start gap-2.5 shadow-xs">
                  <ShieldCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-blue-950 uppercase tracking-wide">
                      Recuperación Autónoma a Costo Cero
                    </h3>
                    <p className="text-xs text-blue-900 mt-0.5 font-medium leading-relaxed">
                      Si olvidó su usuario o contraseña, recupérelos al instante buscando por su <strong>Correo Gmail</strong> o <strong>Nombre Completo</strong> sin costos adicionales.
                    </p>
                  </div>
                </div>

                {/* Sub-selector de Recuperación */}
                <div className="grid grid-cols-2 bg-slate-100 p-1.5 rounded-xl border-2 border-slate-200 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRecoverySubTab('username')}
                    className={`py-2.5 px-3 text-xs sm:text-sm font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      recoverySubTab === 'username'
                        ? 'bg-slate-900 text-amber-400 shadow-sm'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200 font-bold'
                    }`}
                  >
                    <Search size={15} />
                    <span>1. Buscar mi Cuenta</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecoverySubTab('password')}
                    className={`py-2.5 px-3 text-xs sm:text-sm font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      recoverySubTab === 'password'
                        ? 'bg-slate-900 text-amber-400 shadow-sm'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200 font-bold'
                    }`}
                  >
                    <KeyRound size={15} />
                    <span>2. Restablecer Contraseña</span>
                  </button>
                </div>

                {/* SUB-MODO 1: BUSCAR CUENTA POR CORREO O NOMBRE */}
                {recoverySubTab === 'username' && (
                  <div className="space-y-4 pt-1">
                    <form onSubmit={handleSearchAccount} className="space-y-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                          Correo Gmail, Nombre Completo o Cédula
                        </label>
                        <div className="relative rounded-xl shadow-xs">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                            <Search size={18} />
                          </div>
                          <input
                            type="text"
                            value={recQuery}
                            onChange={e => setRecQuery(e.target.value)}
                            required
                            placeholder="Ej: pedro@gmail.com o Pedro Pérez o 12345678"
                            className="block w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-400/20 rounded-xl text-slate-950 font-bold text-sm sm:text-base placeholder-slate-400 transition-all"
                          />
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          El sistema consultará de forma instantánea el registro de usuarios del sistema y la nómina de trabajadores de Duncan.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isSearchingAccount}
                        className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-amber-400 font-black py-3 px-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
                      >
                        {isSearchingAccount ? (
                          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Search size={16} />
                        )}
                        <span>Buscar Cuenta Registrada</span>
                      </button>
                    </form>

                    {/* Resultado de la Búsqueda */}
                    {foundAccount && (
                      <div className="mt-3">
                        {foundAccount.found && foundAccount.user ? (
                          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl p-4 space-y-3 shadow-sm">
                            <div className="flex items-center gap-2 text-emerald-800">
                              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                              <span className="text-xs sm:text-sm font-black uppercase tracking-wider">¡Cuenta de Usuario Localizada!</span>
                            </div>

                            <div className="space-y-2 text-xs sm:text-sm border-t border-emerald-200 pt-2.5 text-slate-800">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-600">Nombre Completo:</span>
                                <span className="font-black text-slate-950">{foundAccount.user.nombre}</span>
                              </div>
                              <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border-2 border-emerald-300">
                                <div>
                                  <span className="text-[10px] text-amber-700 block font-extrabold uppercase">Correo de Acceso (Gmail):</span>
                                  <span className="font-mono text-slate-950 font-black text-sm">{foundAccount.user.email}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleUseFoundEmail(foundAccount.user.email)}
                                  className="py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-black flex items-center gap-1 shadow-xs transition-all"
                                  title="Copiar e Iniciar Sesión"
                                >
                                  {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
                                  <span>{copiedEmail ? 'Copiado' : 'Usar'}</span>
                                </button>
                              </div>
                              {foundAccount.user.cargo && (
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-slate-600">Cargo:</span>
                                  <span className="font-semibold text-slate-900">{foundAccount.user.cargo}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-600">Nivel de Acceso:</span>
                                <span className="text-amber-800 font-extrabold">{foundAccount.user.rol}</span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-emerald-200 flex flex-col sm:flex-row gap-2">
                              <button
                                type="button"
                                onClick={() => handleUseFoundEmail(foundAccount.user.email)}
                                className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-2.5 px-3 rounded-lg text-xs uppercase tracking-wider text-center transition-colors shadow-xs"
                              >
                                Iniciar Sesión con este Correo →
                              </button>
                              <button
                                type="button"
                                onClick={() => handleProceedToPasswordReset(foundAccount.user.email)}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3 rounded-lg text-xs text-center transition-colors shadow-xs"
                              >
                                Restablecer Contraseña
                              </button>
                            </div>
                          </div>
                        ) : foundAccount.empleado ? (
                          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-amber-900">
                              <AlertCircle size={20} className="text-amber-600 shrink-0" />
                              <span className="text-xs sm:text-sm font-black uppercase tracking-wider">Trabajador en Nómina Activa Duncan</span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                              El trabajador <strong>{foundAccount.empleado.nombre}</strong> está registrado en la nómina activa de Duncan, pero todavía no ha creado su cuenta de acceso en el sistema.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setRegNombre(foundAccount.empleado.nombre);
                                setRegCargo(foundAccount.empleado.cargo || '');
                                setActiveTab('register');
                                toast.success('Nombre y cargo precargados en el formulario de registro.');
                              }}
                              className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 px-3 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-md"
                            >
                              <UserPlus size={16} />
                              <span>Crear mi Cuenta de Usuario con Gmail Ahora</span>
                            </button>
                          </div>
                        ) : (
                          <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 text-center space-y-2">
                            <p className="text-xs sm:text-sm text-slate-700 font-semibold">
                              {foundAccount.message || 'No se localizó ninguna cuenta con los datos ingresados.'}
                            </p>
                            <p className="text-xs text-slate-500">
                              Verifique que el correo o nombre estén bien escritos o solicite asistencia directa:
                            </p>
                            <a
                              href="mailto:aabecerra852@gmail.com?subject=SGD%20Duncan%20-%20Solicitud%20de%20Recuperacion%20de%20Usuario"
                              className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 underline font-bold"
                            >
                              <Mail size={14} />
                              Contactar al Administrador (aabecerra852@gmail.com)
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* SUB-MODO 2: RESTABLECER CONTRASEÑA */}
                {recoverySubTab === 'password' && (
                  <div className="space-y-4 pt-1">
                    {!identityVerified ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                            Correo Gmail Registrado <span className="text-amber-600">*</span>
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
                              placeholder="su_correo@gmail.com"
                              className="block w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-400/20 rounded-xl text-slate-950 font-bold text-sm sm:text-base placeholder-slate-400 transition-all"
                            />
                          </div>
                        </div>

                        {/* Opción 1: Confirmación Directa por Titularidad */}
                        <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 space-y-3">
                          <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                            Validación Directa de la Cuenta (Recomendado - Inmediato)
                          </span>
                          <button
                            type="button"
                            onClick={handleVerifyAccountEmail}
                            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 px-3 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md"
                          >
                            <ShieldCheck size={16} />
                            <span>Confirmar Cuenta y Restablecer Contraseña</span>
                          </button>
                        </div>

                        {/* Opción 2: Código OTP por Correo Gmail (Google Apps Script - Costo Cero) */}
                        <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                              Código de Seguridad OTP a su Gmail
                            </span>
                            <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                              Costo Cero
                            </span>
                          </div>

                          {!otpSent ? (
                            <button
                              type="button"
                              onClick={handleRequestOtp}
                              disabled={isRequestingOtp}
                              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              {isRequestingOtp ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Send size={14} />
                              )}
                              <span>Enviar Código OTP a mi Gmail</span>
                            </button>
                          ) : (
                            <div className="space-y-2.5">
                              <p className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                                <CheckCircle2 size={15} /> Código generado para {recEmail}. Ingréselo abajo:
                              </p>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={recOtpCode}
                                  onChange={e => setRecOtpCode(e.target.value)}
                                  maxLength={6}
                                  placeholder="Código 6 dígitos"
                                  className="flex-1 px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-slate-950 text-sm font-mono tracking-widest text-center focus:outline-none focus:border-amber-500 font-bold"
                                />
                                <button
                                  type="button"
                                  onClick={handleVerifyOtp}
                                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm"
                                >
                                  Validar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* FORMULARIO PARA ESTABLECER NUEVA CONTRASEÑA */
                      <form onSubmit={handleSaveNewPassword} className="space-y-3.5 bg-amber-50/60 border-2 border-amber-300 rounded-xl p-4">
                        <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                          <span className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-1.5">
                            <CheckCircle2 size={16} className="text-emerald-600" /> Titular Confirmado ({recEmail})
                          </span>
                          <button
                            type="button"
                            onClick={() => setIdentityVerified(false)}
                            className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1"
                          >
                            <RotateCcw size={13} /> Cambiar
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                            Nueva Contraseña <span className="text-amber-600">* (Mín. 6 caracteres)</span>
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
                              minLength={6}
                              placeholder="Nueva contraseña..."
                              className="block w-full pl-11 pr-11 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 text-sm font-bold placeholder-slate-400 focus:outline-none focus:border-amber-500"
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
                              minLength={6}
                              placeholder="Repita la nueva contraseña..."
                              className="block w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 text-sm font-bold placeholder-slate-400 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isResettingPassword}
                          className="w-full mt-2 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-slate-950 font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                        >
                          {isResettingPassword ? (
                            <div className="w-5 h-5 border-3 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle2 size={18} />
                          )}
                          <span>Guardar Nueva Contraseña e Iniciar Sesión</span>
                        </button>
                      </form>
                    )}

                    {/* Soporte Directo */}
                    <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-1">
                      <span className="flex items-center gap-1 font-medium">
                        <HelpCircle size={14} className="text-amber-600" />
                        ¿Necesita asistencia para restablecer?
                      </span>
                      <a
                        href="mailto:aabecerra852@gmail.com?subject=Solicitud%20de%20Restablecimiento%20de%20Contrasena%20SGD%20Duncan"
                        className="text-amber-700 hover:text-amber-900 underline font-bold"
                      >
                        Contactar al Administrador
                      </a>
                    </div>
                  </div>
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
