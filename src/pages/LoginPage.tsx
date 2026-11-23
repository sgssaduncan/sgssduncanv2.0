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
    <div className="min-h-screen bg-black flex flex-col justify-center items-center py-10 px-4 sm:px-6 font-sans selection:bg-[#f59e0b] selection:text-slate-950">
      <div className="w-full max-w-md sm:max-w-lg">
        {/* Encabezado: Logo Duncan en caja oscura */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <div className="p-3 sm:p-4 bg-[#070b14] rounded-xl border border-slate-700/60 shadow-lg inline-flex items-center justify-center">
            <img
              src={DUNCAN_LOGO_COLOR}
              alt="Duncan"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>

          {/* Pastilla: SISTEMA DE GESTIÓN DUNCAN 2.0 */}
          <div className="inline-flex items-center gap-2 bg-[#091124] border border-blue-900/60 px-5 py-1.5 rounded-lg shadow-sm">
            <span className="text-white font-black text-xs sm:text-sm tracking-wide uppercase">
              SISTEMA DE GESTIÓN DUNCAN
            </span>
            <span className="bg-[#f59e0b] text-slate-950 font-black text-[11px] px-1.5 py-0.5 rounded shadow-xs">
              2.0
            </span>
          </div>
        </div>

        {/* Tarjeta Principal */}
        <div className="mt-5 bg-[#0f172a] border border-slate-700/60 rounded-2xl shadow-2xl p-2 sm:p-2.5 overflow-hidden">
          {/* Barra Superior de Pestañas: Iniciar Sesión | Registrarse | Recuperar Acceso */}
          <div className="grid grid-cols-3 gap-1.5 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'login'
                  ? 'bg-[#f59e0b] text-slate-950 shadow-md scale-[1.01]'
                  : 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LogIn size={15} />
              <span className="truncate">Iniciar Sesión</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'register'
                  ? 'bg-[#f59e0b] text-slate-950 shadow-md scale-[1.01]'
                  : 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserPlus size={15} />
              <span className="truncate">Registrarse</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('recover')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'recover'
                  ? 'bg-[#f59e0b] text-slate-950 shadow-md scale-[1.01]'
                  : 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <KeyRound size={15} />
              <span className="truncate">Recuperar Acceso</span>
            </button>
          </div>

          {/* Tarjeta Blanca de Contenido */}
          <div className="bg-white rounded-xl p-6 sm:p-7 mt-2 space-y-4">
            {/* Aviso si ya existe sesión activa */}
            {currentUser && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-950">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Sesión activa:</span> {currentUser.nombre} ({currentUser.email})
                  </div>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-lg text-xs transition-colors"
                >
                  Entrar →
                </button>
              </div>
            )}

            {/* TAB 1: FORMULARIO DE INICIO DE SESIÓN */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wide mb-1.5">
                    CORREO ELECTRÓNICO <span className="text-[#f59e0b]">*</span>
                  </label>
                  <div className="relative rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      required
                      placeholder="ejemplo@duncan.com.ve"
                      className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-[#f59e0b] focus:ring-2 focus:ring-amber-400/20 rounded-xl text-slate-900 font-medium text-sm placeholder-slate-400 transition-all focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wide mb-1.5">
                    CONTRASEÑA <span className="text-[#f59e0b]">*</span>
                  </label>
                  <div className="relative rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                      placeholder="Ingrese su contraseña..."
                      className="block w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 focus:border-[#f59e0b] focus:ring-2 focus:ring-amber-400/20 rounded-xl text-slate-900 font-medium text-sm placeholder-slate-400 transition-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      title={showLoginPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Enlace: ¿Olvidó su contraseña? a la derecha */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('recover');
                      if (loginEmail) setRecEmail(loginEmail);
                    }}
                    className="text-xs font-bold text-[#c2410c] hover:text-[#9a3412] inline-flex items-center gap-1 transition-colors"
                  >
                    <KeyRound size={13} />
                    <span>¿Olvidó su contraseña?</span>
                  </button>
                </div>

                {/* Botón Principal: ENTRAR AL SISTEMA SGD */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full mt-4 bg-[#f59e0b] hover:bg-[#d97706] active:scale-[0.99] text-slate-950 font-black py-3 px-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogIn size={15} />
                  )}
                  <span>{isLoggingIn ? 'Iniciando Sesión...' : 'ENTRAR AL SISTEMA SGD'}</span>
                </button>
              </form>
            )}

            {/* TAB 2: FORMULARIO DE REGISTRO */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wide mb-1">
                    NOMBRE Y APELLIDO <span className="text-[#f59e0b]">*</span>
                  </label>
                  <div className="relative rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      value={regNombre}
                      onChange={e => setRegNombre(e.target.value)}
                      required
                      placeholder="Ej: Pedro Pérez"
                      className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-[#f59e0b] rounded-xl text-slate-900 font-medium text-sm placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wide mb-1">
                    CORREO ELECTRÓNICO <span className="text-[#f59e0b]">*</span>
                  </label>
                  <div className="relative rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      required
                      placeholder="usuario@duncan.com.ve"
                      className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-[#f59e0b] rounded-xl text-slate-900 font-medium text-sm placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wide mb-1">
                      CARGO
                    </label>
                    <div className="relative rounded-xl">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Briefcase size={16} />
                      </div>
                      <input
                        type="text"
                        value={regCargo}
                        onChange={e => setRegCargo(e.target.value)}
                        placeholder="Inspector SSA"
                        className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-[#f59e0b] rounded-xl text-slate-900 font-medium text-sm placeholder-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wide mb-1">
                      SEDE DUNCAN
                    </label>
                    <div className="relative rounded-xl">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Building size={16} />
                      </div>
                      <select
                        value={regSede}
                        onChange={e => setRegSede(e.target.value)}
                        className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-[#f59e0b] rounded-xl text-slate-900 font-medium text-sm focus:outline-none"
                      >
                        <option value="Planta Principal Los Ruices">Planta Principal Los Ruices</option>
                        <option value="Distribuidora Valencia">Distribuidora Valencia</option>
                        <option value="Distribuidora Maracaibo">Distribuidora Maracaibo</option>
                        <option value="Distribuidora Barcelona">Distribuidora Barcelona</option>
                        <option value="Distribuidora Barquisimeto">Distribuidora Barquisimeto</option>
                        <option value="Distribuidora Puerto Ordaz">Distribuidora Puerto Ordaz</option>
                        <option value="Servicentro Guarenas">Servicentro Guarenas</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wide mb-1">
                      CONTRASEÑA <span className="text-[#f59e0b]">*</span>
                    </label>
                    <div className="relative rounded-xl">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        required
                        minLength={8}
                        placeholder="Mín. 8 caracteres"
                        className="block w-full pl-10 pr-9 py-2.5 bg-white border border-slate-300 focus:border-[#f59e0b] rounded-xl text-slate-900 font-medium text-sm placeholder-slate-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wide mb-1">
                      CONFIRMAR <span className="text-[#f59e0b]">*</span>
                    </label>
                    <div className="relative rounded-xl">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        placeholder="Repita contraseña"
                        className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-[#f59e0b] rounded-xl text-slate-900 font-medium text-sm placeholder-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full mt-3 bg-[#f59e0b] hover:bg-[#d97706] active:scale-[0.99] text-slate-950 font-black py-3 px-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isRegistering ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UserPlus size={15} />
                  )}
                  <span>REGISTRARSE E INGRESAR</span>
                </button>
              </form>
            )}

            {/* TAB 3: RECUPERACIÓN DE ACCESO MEDIANTE OTP */}
            {activeTab === 'recover' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5">
                  <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-900 leading-relaxed font-medium">
                    Por seguridad, enviaremos un código numérico temporal (OTP) de 6 dígitos a su correo para validar su identidad.
                  </p>
                </div>

                {!otpSent ? (
                  <form onSubmit={handleRequestOtp} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wide mb-1.5">
                        CORREO ELECTRÓNICO REGISTRADO <span className="text-[#f59e0b]">*</span>
                      </label>
                      <div className="relative rounded-xl">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail size={16} />
                        </div>
                        <input
                          type="email"
                          value={recEmail}
                          onChange={e => setRecEmail(e.target.value)}
                          required
                          placeholder="ejemplo@duncan.com.ve"
                          className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-[#f59e0b] rounded-xl text-slate-900 font-medium text-sm placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isRequestingOtp}
                      className="w-full bg-[#f59e0b] hover:bg-[#d97706] active:scale-[0.99] text-slate-950 font-black py-3 px-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      {isRequestingOtp ? (
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send size={15} />
                      )}
                      <span>ENVIAR CÓDIGO OTP A MI CORREO</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSaveNewPassword} className="space-y-3.5">
                    <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
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
                      <label className="block text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wide mb-1">
                        CÓDIGO DE 6 DÍGITOS <span className="text-[#f59e0b]">*</span>
                      </label>
                      <input
                        type="text"
                        value={recOtpCode}
                        onChange={e => setRecOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        required
                        maxLength={6}
                        placeholder="123456"
                        className="block w-full py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-950 text-center font-mono font-black text-lg tracking-widest focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wide mb-1">
                        NUEVA CONTRASEÑA <span className="text-[#f59e0b]">* (MÍN. 8 CARACTERES)</span>
                      </label>
                      <div className="relative rounded-xl">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock size={16} />
                        </div>
                        <input
                          type={showRecPassword ? 'text' : 'password'}
                          value={recNewPassword}
                          onChange={e => setRecNewPassword(e.target.value)}
                          required
                          minLength={8}
                          placeholder="Nueva contraseña..."
                          className="block w-full pl-10 pr-9 py-2.5 bg-white border border-slate-300 focus:border-amber-500 rounded-xl text-slate-900 font-medium text-sm placeholder-slate-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRecPassword(!showRecPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          {showRecPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wide mb-1">
                        CONFIRMAR NUEVA CONTRASEÑA <span className="text-[#f59e0b]">*</span>
                      </label>
                      <div className="relative rounded-xl">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock size={16} />
                        </div>
                        <input
                          type={showRecPassword ? 'text' : 'password'}
                          value={recConfirmNewPassword}
                          onChange={e => setRecConfirmNewPassword(e.target.value)}
                          required
                          minLength={8}
                          placeholder="Repita la nueva contraseña..."
                          className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-amber-500 rounded-xl text-slate-900 font-medium text-sm placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isResettingPassword}
                      className="w-full mt-2 bg-[#f59e0b] hover:bg-[#d97706] active:scale-[0.99] text-slate-950 font-black py-3 px-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      {isResettingPassword ? (
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      <span>GUARDAR NUEVA CONTRASEÑA E INGRESAR</span>
                    </button>
                  </form>
                )}

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Volver a la pantalla de Inicio de Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer legal con créditos de ERGOEXPRESS */}
        <div className="mt-6 text-center text-xs text-slate-300 space-y-0.5 font-normal tracking-wide">
          <p>Desarrollado por: ERGOEXPRESS, C.A., RIF: J-502512462,</p>
          <p>ergoexpressca@gmail.com, +584244736489</p>
        </div>
      </div>
    </div>
  );
}
