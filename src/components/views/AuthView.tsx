import React, { useState, useEffect } from 'react';
import { PilotProfile, ThemeMode } from '../../types';
import { StorageService } from '../../services/storage';
import { signInWithGoogleAuth, signOutAuth, saveUserProfileFirestore } from '../../services/firebase';
import { FemeteLogo } from '../logos/FemeteLogo';
import { AlisiosLogo } from '../logos/AlisiosLogo';
import { GoogleSignInModal } from './GoogleSignInModal';
import {
  Shield,
  CheckCircle,
  Lock,
  UserCheck,
  PlaneTakeoff,
  RotateCw,
  ArrowLeft,
  BadgeCheck,
  Award,
  BookOpen,
  UserPlus,
  LogOut,
  Users,
  Trash2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface AuthViewProps {
  pilot: PilotProfile;
  onUpdatePilot: (pilot: PilotProfile) => void;
  onContinue: () => void;
  onBack: () => void;
  theme: ThemeMode;
}

export const AuthView: React.FC<AuthViewProps> = ({
  pilot,
  onUpdatePilot,
  onContinue,
  onBack,
  theme,
}) => {
  const [operatorId, setOperatorId] = useState(pilot.aesaOperatorId || '');
  const [pilotName, setPilotName] = useState(pilot.name || '');
  const [pilotEmail, setPilotEmail] = useState(pilot.email || '');
  const [pilotDni, setPilotDni] = useState(pilot.dni || '');
  const [pilotAvatar, setPilotAvatar] = useState(pilot.avatarUrl || '');
  const [isSeniorPilot, setIsSeniorPilot] = useState<boolean>(pilot.isSeniorPilot ?? false);
  const [prevHours, setPrevHours] = useState<number>(pilot.previousAccreditedHours ?? 0);
  const [prevMinutes, setPrevMinutes] = useState<number>(pilot.previousAccreditedMinutes ?? 0);
  const [prevEntity, setPrevEntity] = useState<string>(
    pilot.previousAccreditationEntity ?? ''
  );
  const [prevDoc, setPrevDoc] = useState<string>(
    pilot.previousAccreditationDoc ?? ''
  );

  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Saved pilots roster for multi-pilot space
  const [savedPilots, setSavedPilots] = useState<PilotProfile[]>(() =>
    StorageService.getPilotRoster()
  );

  // Synchronize local input state whenever external pilot prop updates
  useEffect(() => {
    setOperatorId(pilot.aesaOperatorId || '');
    setPilotName(pilot.name || '');
    setPilotEmail(pilot.email || '');
    setPilotDni(pilot.dni || '');
    setPilotAvatar(pilot.avatarUrl || '');
    setIsSeniorPilot(pilot.isSeniorPilot ?? false);
    setPrevHours(pilot.previousAccreditedHours ?? 0);
    setPrevMinutes(pilot.previousAccreditedMinutes ?? 0);
    setPrevEntity(pilot.previousAccreditationEntity ?? '');
    setPrevDoc(pilot.previousAccreditationDoc ?? '');
  }, [pilot]);

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2500);
  };

  // Helper to calculate initials
  const getInitials = (name?: string) => {
    if (!name || !name.trim()) return 'P';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // Link Google Account & Restore Saved Profile
  const handleGoogleSuccess = async (userData: { uid?: string; name: string; email: string; avatarUrl?: string }) => {
    setIsAuthenticating(true);

    // Call linkGoogleAccount to restore previous AESA Operator ID, DNI, Senior hours, etc. if saved for this email!
    const activated = StorageService.linkGoogleAccount(userData);

    // Update local form state immediately with the restored / loaded data!
    setPilotName(activated.name);
    setPilotEmail(activated.email);
    setPilotAvatar(activated.avatarUrl || '');
    setOperatorId(activated.aesaOperatorId);
    setPilotDni(activated.dni || '');
    setIsSeniorPilot(activated.isSeniorPilot ?? false);
    setPrevHours(activated.previousAccreditedHours ?? 0);
    setPrevMinutes(activated.previousAccreditedMinutes ?? 0);
    setPrevEntity(activated.previousAccreditationEntity ?? '');
    setPrevDoc(activated.previousAccreditationDoc ?? '');

    setSavedPilots(StorageService.getPilotRoster());
    onUpdatePilot(activated);

    if (userData.uid) {
      try {
        await saveUserProfileFirestore(userData.uid, activated);
      } catch (e) {
        console.error('Error saving profile to Firestore:', e);
      }
    }

    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthSuccess(true);
      showToast(`Cuenta Google vinculada: ${activated.email}`);
      setTimeout(() => {
        setAuthSuccess(false);
        onContinue();
      }, 900);
    }, 400);
  };

  // Unlink Google account & clear active session safely
  const handleUnlinkGoogle = async () => {
    if (
      confirm(
        '¿Seguro que deseas desvincular tu cuenta de Google y cerrar la sesión activa? La aplicación se restablecerá a cero.'
      )
    ) {
      try {
        await signOutAuth();
      } catch (err) {
        console.error('Error signing out:', err);
      }
      const blank = StorageService.unlinkGoogleAccount();
      setPilotName('');
      setPilotEmail('');
      setPilotDni('');
      setOperatorId('');
      setPilotAvatar('');
      setIsSeniorPilot(false);
      setPrevHours(0);
      setPrevMinutes(0);
      setPrevEntity('');
      setPrevDoc('');
      setAuthSuccess(false);
      setIsAuthenticating(false);
      setSavedPilots(StorageService.getPilotRoster());
      onUpdatePilot(blank);
      showToast('Cuenta de Google desvinculada y sesión cerrada');
    }
  };

  const handleDirectGoogleLogin = async () => {
    setIsAuthenticating(true);
    try {
      const user = await signInWithGoogleAuth();
      await handleGoogleSuccess({
        uid: user.uid,
        name: user.displayName || 'Piloto Google',
        email: user.email || '',
        avatarUrl: user.photoURL || undefined,
      });
    } catch (err: any) {
      console.warn('Direct Google Auth error:', err);
      setIsAuthenticating(false);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setIsGoogleModalOpen(true);
      }
    }
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pilotName.trim()) {
      alert('Por favor introduzca el nombre y apellidos del piloto.');
      return;
    }
    if (!acceptedTerms) {
      alert('Debe aceptar los términos de uso federativo y directrices EASA / AESA.');
      return;
    }

    const updated: PilotProfile = {
      ...pilot,
      isAuthenticated: true,
      name: pilotName.trim(),
      email: pilotEmail.trim() || `${pilotName.trim().toLowerCase().replace(/\s+/g, '.')}@piloto.aesa`,
      googleEmail: pilot.isGoogleLinked ? (pilot.googleEmail || pilotEmail.trim()) : pilot.googleEmail,
      isGoogleLinked: pilot.isGoogleLinked ?? false,
      googleLinkedAt: pilot.googleLinkedAt,
      avatarUrl:
        pilotAvatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(pilotName.trim())}&background=005596&color=fff&size=128`,
      aesaOperatorId: operatorId.trim() || `ESP-RPAS-${Math.floor(10000000 + Math.random() * 90000000)}CAN`,
      dni: pilotDni.trim(),
      isSeniorPilot,
      previousAccreditedHours: Math.max(0, isNaN(prevHours) ? 0 : prevHours),
      previousAccreditedMinutes: Math.min(59, Math.max(0, isNaN(prevMinutes) ? 0 : prevMinutes)),
      previousAccreditationEntity: prevEntity,
      previousAccreditationDoc: prevDoc,
    };

    StorageService.savePilot(updated);
    if (pilot.uid) {
      saveUserProfileFirestore(pilot.uid, updated).catch((err) =>
        console.error('Error saving updated profile to Firestore:', err)
      );
    }
    setSavedPilots(StorageService.getPilotRoster());
    onUpdatePilot(updated);
    setAuthSuccess(true);
    showToast('Credenciales guardadas y sincronizadas con la cuenta');
    setTimeout(() => {
      setAuthSuccess(false);
      onContinue();
    }, 700);
  };

  // Create clean space for a new pilot
  const handleStartNewPilot = () => {
    const blank = StorageService.createBlankPilot();
    setPilotName('');
    setPilotEmail('');
    setPilotDni('');
    setOperatorId('');
    setPilotAvatar('');
    setIsSeniorPilot(false);
    setPrevHours(0);
    setPrevMinutes(0);
    setPrevEntity('');
    setPrevDoc('');
    StorageService.savePilot(blank);
    onUpdatePilot(blank);
    showToast('Espacio limpio para nuevo piloto preparado');
  };

  // Switch to another saved pilot from the roster
  const handleSelectSavedPilot = (saved: PilotProfile) => {
    setPilotName(saved.name);
    setPilotEmail(saved.email);
    setPilotDni(saved.dni);
    setOperatorId(saved.aesaOperatorId);
    setPilotAvatar(saved.avatarUrl || '');
    setIsSeniorPilot(saved.isSeniorPilot ?? false);
    setPrevHours(saved.previousAccreditedHours ?? 0);
    setPrevMinutes(saved.previousAccreditedMinutes ?? 0);
    setPrevEntity(saved.previousAccreditationEntity ?? '');
    setPrevDoc(saved.previousAccreditationDoc ?? '');
    StorageService.savePilot(saved);
    onUpdatePilot(saved);
    showToast(`Cambiado a piloto: ${saved.name}`);
  };

  // Delete a pilot from the roster
  const handleDeletePilotFromRoster = (p: PilotProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`¿Eliminar al piloto "${p.name}" de la lista de pilotos guardados en este dispositivo?`)) {
      const updated = StorageService.removePilotFromRoster(p.email || p.name);
      setSavedPilots(updated);
      if (pilot.name === p.name || pilot.email === p.email) {
        handleStartNewPilot();
      }
      showToast('Piloto eliminado de la lista local');
    }
  };

  const isLinked = Boolean(pilot.isAuthenticated && (pilot.isGoogleLinked || pilot.email));

  return (
    <div className="w-full max-w-lg mx-auto pb-12 pt-1 px-4 space-y-4">
      {/* Navigation Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-[#005596] dark:hover:text-[#38bdf8] text-sm font-semibold transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Cockpit</span>
        </button>
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
          FEMETE RPAS AUTH
        </span>
      </div>

      {/* Institutional Co-branding Banner */}
      <div className="flex items-center justify-center gap-4 py-2.5 px-4 bg-white dark:bg-[#0e1726] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="h-8 flex items-center justify-center">
          <FemeteLogo className="h-7 w-auto" variant={theme === 'dark' ? 'dark' : 'light'} />
        </div>
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-700"></div>
        <div className="h-8 flex items-center justify-center">
          <AlisiosLogo className="h-5 w-auto" variant={theme === 'dark' ? 'dark' : 'light'} />
        </div>
      </div>

      {/* Header Badge & Title */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-[#111d2e] border border-blue-100 dark:border-[#1f385c] text-[#005596] dark:text-[#38bdf8] text-xs font-semibold">
          <Shield className="w-3.5 h-3.5" />
          <span>ACCESO SEGURO FEDERATIVO · EASA/AESA</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-[#003366] dark:text-white font-display">
          FEMETE AIR LOGBOOK
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Registro y Acceso Oficial de Pilotos RPAS / Operadores Registrados
        </p>
      </div>

      {/* Google Federated Login Card with Explicit Linked / Unlinked state */}
      <div className="bg-white dark:bg-[#111a29] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#16253b] border border-blue-100 dark:border-[#22395b] text-[#005596] dark:text-[#38bdf8] flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Identidad Digital de Vuelo con Google
              </h3>
              <span className="text-[10px] font-mono text-slate-500 dark:text-cyan-400 block mt-0.5">
                AUTH-OAUTH2 · PROTOCOLO EN-303-645
              </span>
            </div>
          </div>

          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 ${
              isLinked
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
            }`}
          >
            {isLinked ? 'VINCULADO' : 'DESVINCULADO'}
          </span>
        </div>

        {isLinked ? (
          /* Linked State View */
          <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-[#0c1c27] border border-emerald-200 dark:border-emerald-900/60 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#005596] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs overflow-hidden">
                  {pilot.avatarUrl ? (
                    <img src={pilot.avatarUrl} alt={pilot.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{getInitials(pilot.name)}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {pilot.name || 'Piloto Google'}
                    </span>
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 block truncate">
                    {pilot.googleEmail || pilot.email}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 shrink-0 bg-white dark:bg-[#07131e] px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-900">
                Datos sincronizados
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleUnlinkGoogle}
                className="flex-1 h-10 px-3 rounded-lg border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Desvincular Cuenta de Google</span>
              </button>

              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111c2e] hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                Cambiar Cuenta
              </button>
            </div>
          </div>
        ) : (
          /* Unlinked State View */
          <>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Inicia sesión con tu cuenta de Google para vincular tu libro oficial de vuelos, certificados AESA y telemetría de aeronaves. Al conectar, se cargarán automáticamente todos tus datos guardados.
            </p>

            <button
              type="button"
              onClick={handleDirectGoogleLogin}
              disabled={isAuthenticating}
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-[#162236] hover:bg-sky-50 dark:hover:bg-[#1f2d42] border-2 border-slate-200 dark:border-[#2b3e5b] hover:border-[#005596] dark:hover:border-sky-500 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.99] cursor-pointer group"
            >
              {isAuthenticating ? (
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 text-xs font-semibold">
                  <RotateCw className="w-4 h-4 animate-spin text-[#005596] dark:text-[#38bdf8]" />
                  <span>Conectando y cargando datos...</span>
                </div>
              ) : authSuccess ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <CheckCircle className="w-4 h-4" />
                  <span>¡Sesión Iniciada con Éxito!</span>
                </div>
              ) : (
                <>
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        fill="#EA4335"
                      />
                    </svg>
                  </div>
                  <span className="font-semibold text-xs text-slate-800 dark:text-white tracking-tight group-hover:text-[#005596] dark:group-hover:text-[#38bdf8] transition-colors">
                    Continuar con Google (Gmail)
                  </span>
                </>
              )}
            </button>
          </>
        )}

        {/* Security guarantees */}
        <div className="bg-slate-50 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 p-3 rounded-lg space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#005596] dark:text-[#38bdf8] flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Garantías de Seguridad EASA
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Los datos de operador y DNI se guardan y cargan de forma persistente.</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Al desvincular, la sesión se cierra de inmediato sin perder tus vuelos.</span>
          </div>
        </div>
      </div>

      {/* Espacio para Nuevos Pilotos y Sesión Activa */}
      <div className="bg-white dark:bg-[#111a29] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#005596] dark:text-sky-400" />
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 dark:text-white">
              Espacio de Pilotos & Operadores
            </h3>
          </div>

          <button
            type="button"
            onClick={handleStartNewPilot}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 text-[#005596] dark:text-sky-300 text-xs font-semibold hover:bg-sky-100 transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Nuevo Piloto</span>
          </button>
        </div>

        {/* Current Active Pilot Card */}
        {pilot.name && pilot.name.trim() ? (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0d1724] border border-slate-200 dark:border-[#1d2d44] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold uppercase">
                Piloto en Cockpit Activo
              </span>
              <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                SESIÓN ACTIVA
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#005596] to-sky-500 text-white font-bold flex items-center justify-center shrink-0 shadow-sm text-sm overflow-hidden">
                  {pilotAvatar ? (
                    <img src={pilotAvatar} alt={pilotName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{getInitials(pilotName)}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {pilotName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                    {pilotEmail || pilot.email || 'Sin correo asignado'}
                  </p>
                  <span className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    {pilot.isAuthenticated ? 'Cuenta Verificada EASA' : 'Perfil Local'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleUnlinkGoogle}
                title="Cerrar sesión y desvincular"
                className="h-8 px-2.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-sky-50/60 dark:bg-[#0d1724] border border-sky-100 dark:border-[#1d2d44] text-center space-y-1">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              Sin piloto asignado actualmente (Sesión Cerrada)
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Inicia sesión con Google arriba para cargar tu perfil o completa el formulario inferior para configurar un nuevo piloto.
            </p>
          </div>
        )}

        {/* Quick Roster of other saved pilots if any */}
        {savedPilots.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10.5px] font-mono text-slate-500 dark:text-slate-400 block font-semibold">
              Pilotos Guardados en este Dispositivo:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {savedPilots.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSavedPilot(p)}
                  className={`text-xs pl-2.5 pr-1 py-1 rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer group ${
                    p.name === pilot.name
                      ? 'bg-[#005596] text-white border-[#005596]'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#005596]'
                  }`}
                >
                  <span className="font-semibold truncate max-w-[120px]">{p.name}</span>
                  <button
                    type="button"
                    title="Eliminar piloto de la lista"
                    onClick={(e) => handleDeletePilotFromRoster(p, e)}
                    className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors ml-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Operational Credentials & AESA Form */}
      <form
        onSubmit={handleSaveCredentials}
        className="bg-white dark:bg-[#111a29] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3.5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlaneTakeoff className="w-4 h-4 text-[#005596] dark:text-[#38bdf8]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Credenciales Oficiales del Piloto & AESA
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            {isLinked ? 'Guardado con Google' : 'Guardado Local'}
          </span>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
            Nombre y Apellidos del Piloto (PIC) *
          </label>
          <input
            type="text"
            required
            value={pilotName}
            onChange={(e) => setPilotName(e.target.value)}
            placeholder="Ej. Aday González"
            className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-[#070d16] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005596]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
              DNI / NIE Piloto *
            </label>
            <input
              type="text"
              value={pilotDni}
              onChange={(e) => setPilotDni(e.target.value)}
              placeholder="Ej. 78564123K"
              className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-[#070d16] border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005596]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
              Nº Operador UAS (AESA)
            </label>
            <input
              type="text"
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              placeholder="ESP-RPAS-XXXXXXXXCAN"
              className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-[#070d16] border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005596]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
            Correo Electrónico Oficial
          </label>
          <input
            type="email"
            value={pilotEmail}
            onChange={(e) => setPilotEmail(e.target.value)}
            placeholder="ejemplo@gmail.com"
            className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-[#070d16] border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005596]"
          />
        </div>

        {/* Senior Pilot Accreditation Section */}
        <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-[#1a1710] border border-amber-200 dark:border-amber-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                Acreditación de Piloto Senior (Horas Previas)
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isSeniorPilot}
                onChange={(e) => setIsSeniorPilot(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <p className="text-[11px] text-amber-800 dark:text-amber-300/80 leading-snug">
            Si dispones de horas acreditadas previas en certificados AESA u operadores anteriores, puedes sumarlas a tu cómputo histórico oficial de carrera PIC.
          </p>

          {isSeniorPilot && (
            <div className="space-y-2 pt-1 border-t border-amber-200 dark:border-amber-800/60">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Horas Acreditadas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={prevHours}
                    onChange={(e) => setPrevHours(parseInt(e.target.value) || 0)}
                    className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#080e18] border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Minutos (0-59)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={prevMinutes}
                    onChange={(e) => setPrevMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#080e18] border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Entidad Certificadora
                </label>
                <input
                  type="text"
                  value={prevEntity}
                  onChange={(e) => setPrevEntity(e.target.value)}
                  placeholder="Ej. Libro Físico AESA / Operador Anterior"
                  className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#080e18] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Nº Expediente / Justificante Oficial
                </label>
                <input
                  type="text"
                  value={prevDoc}
                  onChange={(e) => setPrevDoc(e.target.value)}
                  placeholder="Ej. EXP-AESA-2023 / Certificado Horas PIC"
                  className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#080e18] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* RGPD & AESA Agreement Checkbox */}
        <div className="flex items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-[#005596] focus:ring-[#005596] border-slate-300 dark:border-slate-700 cursor-pointer"
          />
          <label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-400 leading-snug cursor-pointer">
            Acepto el tratamiento de datos para el Libro Oficial de Vuelo conforme al Reglamento UE 2019/947, normativa AESA y protocolo federativo FEMETE.
          </label>
        </div>

        {/* Submit & Save Button */}
        <button
          type="submit"
          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#005596] to-sky-600 text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-[0.99] shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Guardar Credenciales Oficiales</span>
        </button>
      </form>

      {/* Google Sign In Modal */}
      <GoogleSignInModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
        onUnlink={handleUnlinkGoogle}
        currentPilot={pilot}
        theme={theme}
      />

      {/* Floating Notification */}
      {showNotification && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#005596] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notificationMsg || 'Operación completada con éxito'}</span>
        </div>
      )}
    </div>
  );
};
