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
  ChevronRight,
  Search,
  HelpCircle,
  Copy,
  Check,
  RotateCcw,
  Send,
  ShieldAlert,
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
    findUserByCedula,
    findUserByEmail,
    resetPasswordWithIdentity,
    requestRecoveryCode,
    verifyRecoveryCode
  } = useSGD();

  const from = (location.state as any)?.from?.pathname || '/';

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'recover'>('login');

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

  // ── RECOVERY (COSTO CERO) STATE ──
  const [recoverySubTab, setRecoverySubTab] = useState<'username' | 'password'>('username');
  
  // Recuperar Usuario (por Cédula)
  const [recCedula, setRecCedula] = useState('');
  const [isSearchingCedula, setIsSearchingCedula] = useState(false);
  const [foundAccount, setFoundAccount] = useState<{
    found: boolean;
    user?: any;
    empleado?: any;
    message?: string;
  } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Recuperar Contraseña
  const [recEmail, setRecEmail] = useState('');
  const [recPassCedula, setRecPassCedula] = useState('');
  const [recOtpCode, setRecOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [recNewPassword, setRecNewPassword] = useState('');
  const [recConfirmNewPassword, setRecConfirmNewPassword] = useState('');
  const [showRecPassword, setShowRecPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

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

  // ── MÉTODOS DE RECUPERACIÓN (COSTO CERO) ──

  // 1. Buscar Usuario por Cédula (Localización de Nombre de Usuario / Correo)
  const handleSearchUserByCedula = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recCedula.trim()) {
      toast.error('Ingrese el número de cédula de identidad.');
      return;
    }

    setIsSearchingCedula(true);
    try {
      const result = findUserByCedula(recCedula.trim());
      setFoundAccount(result);
      if (result.found && result.user) {
        toast.success(`¡Cuenta localizada para ${result.user.nombre}!`);
      } else if (result.empleado) {
        toast(result.message || 'Trabajador localizado en nómina activa.', { icon: 'ℹ️' });
      } else {
        toast.error(result.message || 'No se encontró ninguna cuenta con esa cédula.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al buscar cuenta.');
    } finally {
      setIsSearchingCedula(false);
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
  const handleProceedToPasswordReset = (email: string, cedula?: string) => {
    setRecEmail(email);
    if (cedula) setRecPassCedula(cedula);
    setRecoverySubTab('password');
    setIdentityVerified(true);
    toast.success('Identidad validada con su Cédula. Defina su nueva contraseña.');
  };

  // 2. Validación de Identidad por Cédula para Restablecer Contraseña
  const handleVerifyIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = recEmail.trim().toLowerCase();
    const cleanCed = recPassCedula.trim();

    if (!cleanEmail) {
      toast.error('Ingrese su correo electrónico Gmail.');
      return;
    }
    if (!cleanCed) {
      toast.error('Ingrese su cédula de identidad para verificar que usted es el titular.');
      return;
    }

    const user = findUserByEmail(cleanEmail);
    if (!user) {
      toast.error('No se encontró ningún usuario con ese correo electrónico.');
      return;
    }

    // Comprobar coincidencia de cédula con el usuario o censo
    const cleanNumbersInput = cleanCed.replace(/[^0-9]/g, '');
    const userCedNumbers = (user.cedula || '').replace(/[^0-9]/g, '');

    if (userCedNumbers && userCedNumbers !== cleanNumbersInput) {
      toast.error('La cédula ingresada no coincide con los registros del titular de esta cuenta.');
      return;
    }

    setIdentityVerified(true);
    toast.success('¡Identidad confirmada exitosamente! Ingrese su nueva contraseña a continuación.');
  };

  // 3. Solicitar Código OTP a Gmail (Vía Google Apps Script - Costo Cero)
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

  // 4. Validar Código OTP
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

  // 5. Guardar Nueva Contraseña
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
        cedula: recPassCedula.trim(),
        newPassword: recNewPassword.trim()
      });

      if (res.success) {
        toast.success(res.message);
        setLoginEmail(recEmail.trim().toLowerCase());
        setLoginPassword(recNewPassword.trim());
        // Reset recovery form
        setIdentityVerified(false);
        setRecNewPassword('');
        setRecConfirmNewPassword('');
        setRecOtpCode('');
        setOtpSent(false);
        // Switch to login tab
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

        {/* Tarjeta Principal de Autenticación */}
        <div className="mt-6 bg-slate-900/95 border border-slate-800/90 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden">
          {/* Pestañas Principales: Login | Register | Recover */}
          <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/70 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'login'
                  ? 'bg-yellow-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LogIn size={14} />
              <span className="truncate">Iniciar Sesión</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'register'
                  ? 'bg-yellow-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <UserPlus size={14} />
              <span className="truncate">Registrarse</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('recover')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'recover'
                  ? 'bg-yellow-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <KeyRound size={14} />
              <span className="truncate">Recuperar Acceso</span>
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
            {activeTab === 'login' && (
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

                {/* Enlace destacado a Recuperar Acceso Costo Cero */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('recover');
                      setRecoverySubTab('password');
                      if (loginEmail) setRecEmail(loginEmail);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 transition-colors flex items-center gap-1"
                  >
                    <KeyRound size={12} />
                    ¿Olvidó su contraseña?
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('recover');
                      setRecoverySubTab('username');
                    }}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    ¿Olvidó su correo/usuario?
                  </button>
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
            )}

            {/* TAB 2: FORMULARIO DE REGISTRO CON GMAIL */}
            {activeTab === 'register' && (
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

            {/* TAB 3: RECUPERACIÓN DE ACCESO Y CONTRASEÑA (METODOLOGÍA COSTO CERO) */}
            {activeTab === 'recover' && (
              <div className="space-y-4">
                {/* Banner de Metodología Costo Cero */}
                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3 flex items-start gap-2.5">
                  <ShieldCheck size={18} className="text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-yellow-300">
                      Recuperación Autónoma a Costo Cero
                    </h3>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      Si olvidó su usuario (correo) o su contraseña, recupérelos al instante validando su <strong>Cédula de Identidad</strong> o recibiendo un código en su Gmail sin costo adicional.
                    </p>
                  </div>
                </div>

                {/* Sub-selector: ¿Olvidó Usuario o Contraseña? */}
                <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
                  <button
                    type="button"
                    onClick={() => setRecoverySubTab('username')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      recoverySubTab === 'username'
                        ? 'bg-slate-800 text-yellow-400 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <IdCard size={14} />
                    <span>1. Olvidé mi Correo/Usuario</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecoverySubTab('password')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      recoverySubTab === 'password'
                        ? 'bg-slate-800 text-yellow-400 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <KeyRound size={14} />
                    <span>2. Olvidé mi Contraseña</span>
                  </button>
                </div>

                {/* SUB-MODO A: RECUPERAR NOMBRE DE USUARIO / CORREO POR CÉDULA */}
                {recoverySubTab === 'username' && (
                  <div className="space-y-4 pt-1">
                    <form onSubmit={handleSearchUserByCedula} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Cédula de Identidad del Trabajador
                        </label>
                        <div className="relative rounded-xl shadow-xs">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                            <IdCard size={16} />
                          </div>
                          <input
                            type="text"
                            value={recCedula}
                            onChange={e => setRecCedula(e.target.value)}
                            required
                            placeholder="Ej: V-12033632 o 12033632"
                            className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-medium"
                          />
                        </div>
                        <p className="text-[10.5px] text-slate-400 mt-1">
                          El sistema consultará de forma instantánea el padrón de usuarios y la nómina activa de Duncan.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isSearchingCedula}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-yellow-400/30 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                      >
                        {isSearchingCedula ? (
                          <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Search size={15} />
                        )}
                        <span>Buscar Cuenta Registrada</span>
                      </button>
                    </form>

                    {/* Resultado de la Búsqueda */}
                    {foundAccount && (
                      <div className="mt-3">
                        {foundAccount.found && foundAccount.user ? (
                          <div className="bg-slate-950 border border-emerald-500/50 rounded-xl p-4 space-y-3 shadow-lg">
                            <div className="flex items-center gap-2 text-emerald-400">
                              <CheckCircle2 size={18} />
                              <span className="text-xs font-bold uppercase tracking-wider">¡Cuenta de Usuario Localizada!</span>
                            </div>

                            <div className="space-y-1.5 text-xs border-t border-slate-800/80 pt-2.5">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Nombre Completo:</span>
                                <span className="font-bold text-white">{foundAccount.user.nombre}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Cédula:</span>
                                <span className="font-mono text-white">{foundAccount.user.cedula || recCedula}</span>
                              </div>
                              <div className="flex justify-between items-center bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                                <div>
                                  <span className="text-[10px] text-yellow-400 block font-bold uppercase">Correo de Acceso (Usuario):</span>
                                  <span className="font-mono text-white font-bold text-xs">{foundAccount.user.email}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleUseFoundEmail(foundAccount.user.email)}
                                  className="p-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                                  title="Copiar e Iniciar Sesión"
                                >
                                  {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
                                  <span>{copiedEmail ? 'Copiado' : 'Usar'}</span>
                                </button>
                              </div>
                              {foundAccount.user.cargo && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Cargo:</span>
                                  <span className="text-slate-300">{foundAccount.user.cargo}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-slate-400">Nivel de Acceso:</span>
                                <span className="text-yellow-400 font-semibold">{foundAccount.user.rol}</span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
                              <button
                                type="button"
                                onClick={() => handleUseFoundEmail(foundAccount.user.email)}
                                className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black py-2 px-3 rounded-lg text-xs text-center transition-colors"
                              >
                                Iniciar Sesión con este Correo →
                              </button>
                              <button
                                type="button"
                                onClick={() => handleProceedToPasswordReset(foundAccount.user.email, foundAccount.user.cedula || recCedula)}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-3 rounded-lg text-xs text-center transition-colors"
                              >
                                Restablecer Contraseña
                              </button>
                            </div>
                          </div>
                        ) : foundAccount.empleado ? (
                          <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-amber-400">
                              <AlertCircle size={18} />
                              <span className="text-xs font-bold uppercase tracking-wider">Trabajador en Nómina Activa</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              El trabajador <strong>{foundAccount.empleado.nombre}</strong> (C.I. {foundAccount.empleado.cedula}) está registrado en la nómina de <strong>{foundAccount.empleado.empresaNombre || 'Duncan'}</strong>, pero todavía no ha creado su cuenta de acceso en la plataforma.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setRegNombre(foundAccount.empleado.nombre);
                                setRegCedula(foundAccount.empleado.cedula);
                                setRegCargo(foundAccount.empleado.cargo || '');
                                setActiveTab('register');
                                toast.success('Datos del trabajador precargados en el formulario de registro.');
                              }}
                              className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold py-2.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                            >
                              <UserPlus size={15} />
                              <span>Crear mi Cuenta de Usuario con Gmail Ahora</span>
                            </button>
                          </div>
                        ) : (
                          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center space-y-2">
                            <p className="text-xs text-slate-400">
                              {foundAccount.message || 'No se localizó ningún registro con esa cédula de identidad.'}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Verifique que los dígitos sean correctos o solicite asistencia directa al administrador:
                            </p>
                            <a
                              href="mailto:aabecerra852@gmail.com?subject=SGD%20Duncan%20-%20Solicitud%20de%20Recuperacion%20de%20Usuario&body=Hola%20Administrador,%20solicito%20asistencia%20para%20ubicar%20mi%20cuenta%20en%20el%20SGD%20Duncan.%20Mi%20C%C3%A9dula%20es:%20"
                              className="inline-flex items-center gap-1 text-xs text-yellow-400 hover:underline font-semibold"
                            >
                              <Mail size={13} />
                              Contactar a aabecerra852@gmail.com
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* SUB-MODO B: RESTABLECER CONTRASEÑA */}
                {recoverySubTab === 'password' && (
                  <div className="space-y-4 pt-1">
                    {!identityVerified ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Correo Gmail Registrado
                          </label>
                          <div className="relative rounded-xl shadow-xs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                              <Mail size={16} />
                            </div>
                            <input
                              type="email"
                              value={recEmail}
                              onChange={e => setRecEmail(e.target.value)}
                              required
                              placeholder="su_correo@gmail.com"
                              className="block w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-medium"
                            />
                          </div>
                        </div>

                        {/* Opción 1: Verificación de Identidad con Cédula (Inmediata y Costo Cero) */}
                        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                          <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider block">
                            Método 1: Validación Directa por Cédula (Recomendado - Sin Esperar)
                          </span>
                          <div className="relative rounded-xl shadow-xs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                              <IdCard size={15} />
                            </div>
                            <input
                              type="text"
                              value={recPassCedula}
                              onChange={e => setRecPassCedula(e.target.value)}
                              placeholder="Cédula de Identidad (Ej: V-12345678)"
                              className="block w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleVerifyIdentity}
                            className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <ShieldCheck size={14} />
                            <span>Validar Cédula y Restablecer Contraseña</span>
                          </button>
                        </div>

                        {/* Opción 2: Código OTP por Correo Gmail (Google Apps Script - Costo Cero) */}
                        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Método 2: Código OTP a su Gmail (Google Apps Script)
                            </span>
                            <span className="text-[9px] text-emerald-400 font-semibold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                              Costo 0
                            </span>
                          </div>

                          {!otpSent ? (
                            <button
                              type="button"
                              onClick={handleRequestOtp}
                              disabled={isRequestingOtp}
                              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                            >
                              {isRequestingOtp ? (
                                <div className="w-3.5 h-3.5 border-2 border-slate-200 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Send size={13} />
                              )}
                              <span>Enviar Código de 6 Dígitos a mi Gmail</span>
                            </button>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-[11px] text-emerald-300 flex items-center gap-1">
                                <CheckCircle2 size={13} /> Código generado. Ingréselo para continuar:
                              </p>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={recOtpCode}
                                  onChange={e => setRecOtpCode(e.target.value)}
                                  maxLength={6}
                                  placeholder="Código de 6 dígitos"
                                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono tracking-widest text-center focus:outline-none focus:border-yellow-400"
                                />
                                <button
                                  type="button"
                                  onClick={handleVerifyOtp}
                                  className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs transition-colors"
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
                      <form onSubmit={handleSaveNewPassword} className="space-y-3 bg-slate-950/80 border border-yellow-400/30 rounded-xl p-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <span className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                            <CheckCircle2 size={15} /> Titular Validado ({recEmail})
                          </span>
                          <button
                            type="button"
                            onClick={() => setIdentityVerified(false)}
                            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                          >
                            <RotateCcw size={12} /> Cambiar
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Nueva Contraseña (Mín. 6 caracteres)
                          </label>
                          <div className="relative rounded-xl shadow-xs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                              <Lock size={15} />
                            </div>
                            <input
                              type={showRecPassword ? 'text' : 'password'}
                              value={recNewPassword}
                              onChange={e => setRecNewPassword(e.target.value)}
                              required
                              minLength={6}
                              placeholder="Nueva contraseña..."
                              className="block w-full pl-9 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRecPassword(!showRecPassword)}
                              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white"
                            >
                              {showRecPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Confirmar Nueva Contraseña
                          </label>
                          <div className="relative rounded-xl shadow-xs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                              <Lock size={15} />
                            </div>
                            <input
                              type={showRecPassword ? 'text' : 'password'}
                              value={recConfirmNewPassword}
                              onChange={e => setRecConfirmNewPassword(e.target.value)}
                              required
                              minLength={6}
                              placeholder="Repita la nueva contraseña..."
                              className="block w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isResettingPassword}
                          className="w-full mt-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-yellow-500/10"
                        >
                          {isResettingPassword ? (
                            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}
                          <span>Guardar Nueva Contraseña e Iniciar Sesión</span>
                        </button>
                      </form>
                    )}

                    {/* Asistencia de Soporte Directo Maestro */}
                    <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-400">
                        <HelpCircle size={13} className="text-yellow-400" />
                        ¿Problemas para restablecer?
                      </span>
                      <a
                        href="mailto:aabecerra852@gmail.com?subject=Solicitud%20de%20Restablecimiento%20de%20Contrase%C3%B1a%20SGD%20Duncan&body=Hola%20Administrador,%20solicito%20asistencia%20para%20restablecer%20mi%20contrase%C3%B1a%20en%20el%20SGD%20Duncan.%20Mi%20Correo%20Gmail%20es:%20"
                        className="text-yellow-400 hover:text-yellow-300 underline font-semibold"
                      >
                        Contactar a Admin (aabecerra852@gmail.com)
                      </a>
                    </div>
                  </div>
                )}

                {/* Botón para volver a Iniciar Sesión */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft size={13} />
                    <span>Volver a la pantalla de Inicio de Sesión</span>
                  </button>
                </div>
              </div>
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
