import React, { useState } from 'react';
import { FlightRecord, PilotProfile, ThemeMode } from '../../types';
import { FemeteLogo } from '../logos/FemeteLogo';
import { AlisiosLogo } from '../logos/AlisiosLogo';
import { StorageService } from '../../services/storage';
import { SeniorHoursModal } from './SeniorHoursModal';
import {
  Award,
  BatteryCharging,
  Bolt,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  Gauge,
  History,
  LogOut,
  MapPin,
  Medal,
  Plane,
  Plus,
  ShieldCheck,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface DashboardViewProps {
  flights: FlightRecord[];
  pilot: PilotProfile;
  theme: ThemeMode;
  onNavigateToNewFlight: () => void;
  onNavigateToFlights: () => void;
  onNavigateToFleet: () => void;
  onNavigateToReports: () => void;
  onNavigateToMap: () => void;
  onUpdatePilot: (pilot: PilotProfile) => void;
  onNavigateToAuth?: () => void;
  onLogout?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  flights,
  pilot,
  theme,
  onNavigateToNewFlight,
  onNavigateToFlights,
  onNavigateToFleet,
  onNavigateToReports,
  onNavigateToMap,
  onUpdatePilot,
  onNavigateToAuth,
  onLogout,
}) => {
  const [showSeniorModal, setShowSeniorModal] = useState(false);

  // Compute accumulated flight times with dynamic senior pilot baseline
  const careerTotals = StorageService.getCareerTotals(flights, pilot);
  const isSenior = !!(pilot.isSeniorPilot && ((pilot.previousAccreditedHours || 0) > 0 || (pilot.previousAccreditedMinutes || 0) > 0));

  // Today, Week, Month, Year strictly computed from flights
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const formatMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
  };

  // 1. Today flight time
  const todayMins = flights
    .filter((f) => f.date === todayStr)
    .reduce((acc, f) => acc + f.durationMinutes, 0);

  // 2. This Week (last 7 days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekMins = flights
    .filter((f) => new Date(f.date) >= sevenDaysAgo)
    .reduce((acc, f) => acc + f.durationMinutes, 0);

  // 3. This Month
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthMins = flights
    .filter((f) => f.date.startsWith(currentYearMonth))
    .reduce((acc, f) => acc + f.durationMinutes, 0);

  // 4. This Year
  const currentYear = String(now.getFullYear());
  const yearMins = flights
    .filter((f) => f.date.startsWith(currentYear))
    .reduce((acc, f) => acc + f.durationMinutes, 0);

  // Battery metrics calculated strictly from actual flight records
  const todayBatPct = flights
    .filter((f) => f.date === todayStr)
    .reduce((acc, f) => acc + (f.batConsumed || 0), 0);

  const weekBatPct = flights
    .filter((f) => new Date(f.date) >= sevenDaysAgo)
    .reduce((acc, f) => acc + (f.batConsumed || 0), 0);

  const monthBatPct = flights
    .filter((f) => f.date.startsWith(currentYearMonth))
    .reduce((acc, f) => acc + (f.batConsumed || 0), 0);

  const yearBatPct = flights
    .filter((f) => f.date.startsWith(currentYear))
    .reduce((acc, f) => acc + (f.batConsumed || 0), 0);

  const totalBatteryPct = flights.reduce((acc, f) => acc + (f.batConsumed || 0), 0);

  const handleQuickCsvExport = () => {
    const csvData = StorageService.exportToCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FEMETE_Bitacora_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-24 px-4 space-y-4">
      {/* 1. Pilot Identification Card with FEMETE branding */}
      <section className="bg-white dark:bg-[#111c2e] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 relative overflow-hidden transition-colors">
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0 w-12 h-12 rounded-xl bg-slate-50 dark:bg-[#08101d] border border-slate-200 dark:border-sky-500/30 flex items-center justify-center p-1 shadow-sm overflow-hidden">
              {pilot.avatarUrl ? (
                <img
                  src={pilot.avatarUrl}
                  alt={pilot.name || 'Piloto'}
                  className="w-full h-full object-cover rounded-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <FemeteLogo className="h-8 w-auto" variant={theme === 'dark' ? 'dark' : 'light'} />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {pilot.name && pilot.name.trim() ? (
                  <span className="font-bold text-base text-slate-900 dark:text-white truncate font-display">
                    {pilot.name}
                  </span>
                ) : (
                  <button
                    onClick={onNavigateToAuth}
                    className="font-bold text-sm text-[#005596] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Nuevo Piloto · Configurar / Iniciar Sesión</span>
                  </button>
                )}
                {pilot.isAuthenticated && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-mono text-[9px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    ACTIVO
                  </span>
                )}
                {isSenior && (
                  <button
                    onClick={() => setShowSeniorModal(true)}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 font-mono text-[9px] font-bold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
                    title="Piloto Senior: Click para ver/ajustar horas previas acreditadas"
                  >
                    <Award className="w-2.5 h-2.5 text-amber-500" />
                    SENIOR PIC ({careerTotals.previousHoursFormatted})
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-[#005596] dark:text-[#38bdf8]" />
                <span className="text-[#005596] dark:text-cyan-300 font-semibold">
                  {pilot.aesaOperatorId || 'AESA: Pendiente de registro'}
                </span>
                <span>·</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">Femete Air</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {pilot.isAuthenticated && (
              <button
                onClick={() => {
                  if (
                    confirm(
                      '¿Deseas desvincular tu cuenta de Google y cerrar la sesión? La aplicación se restablecerá a cero.'
                    )
                  ) {
                    if (onLogout) {
                      onLogout();
                    } else {
                      const blank = StorageService.unlinkGoogleAccount();
                      if (onUpdatePilot) onUpdatePilot(blank);
                    }
                  }
                }}
                className="h-9 px-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-100 flex items-center justify-center text-xs font-semibold transition-colors cursor-pointer"
                title="Desvincular Google / Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline ml-1">Salir</span>
              </button>
            )}
            {onNavigateToAuth && (
              <button
                onClick={onNavigateToAuth}
                className="h-9 px-2 rounded-lg bg-sky-50 dark:bg-[#0a1424] border border-sky-200 dark:border-slate-700 text-[#005596] dark:text-sky-400 flex items-center justify-center text-xs font-semibold hover:bg-sky-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Gestionar Perfil y Pilotos"
              >
                Perfil
              </button>
            )}
            <button
              onClick={handleQuickCsvExport}
              className="shrink-0 w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#0a1424] border border-slate-200 dark:border-slate-700 text-[#005596] dark:text-sky-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Exportar CSV de bitácora"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Official Technical Collaborator Banner: ALISIOS DRON */}
      <section className="bg-gradient-to-r from-white via-slate-50 to-white dark:from-[#111c2e] dark:via-[#142238] dark:to-[#111c2e] rounded-xl shadow-sm p-3 border border-slate-200 dark:border-sky-500/25 flex items-center justify-between gap-3 relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#005596] to-amber-500"></div>
        <div className="flex items-center gap-3 min-w-0 pl-1">
          <div className="h-10 px-2 rounded-lg bg-white dark:bg-white/95 border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
            <AlisiosLogo className="h-5.5 w-auto" variant="light" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                Colaboración Técnica Oficial
              </span>
              <span className="px-1.5 py-0.5 rounded bg-sky-50 dark:bg-cyan-950/90 border border-sky-200 dark:border-cyan-500/40 text-[#005596] dark:text-cyan-300 font-mono text-[9px] font-bold">
                PARTNER UAS
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5">
              En colaboración con <strong className="text-slate-900 dark:text-white font-semibold">ALISIOS DRON</strong> · Operador Acreditado EASA / AESA
            </p>
          </div>
        </div>
        <div className="shrink-0 hidden sm:flex items-center text-[#005596] dark:text-sky-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </section>

      {/* 3. Primary Command Action: REGISTRAR NUEVO VUELO */}
      <div>
        <button
          onClick={onNavigateToNewFlight}
          className="w-full h-14 bg-gradient-to-r from-[#005596] via-blue-600 to-sky-600 dark:from-sky-600 dark:via-blue-600 dark:to-indigo-700 hover:brightness-105 active:scale-[0.99] text-white rounded-xl font-medium flex items-center justify-between px-4 shadow-md transition-all group cursor-pointer border border-sky-400/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-sm tracking-wide font-display text-white">
                REGISTRAR NUEVO VUELO
              </span>
              <span className="text-[11px] font-mono text-sky-100 opacity-90">
                Entrada oficial de bitácora RPAS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-black/20 dark:bg-black/30 border border-white/20 px-2.5 py-1 rounded-lg text-xs font-mono">
            <span className="font-bold text-amber-300">OFFLINE</span>
            <span className="text-white group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </button>
      </div>

      {/* 4. Section: Official Flight Time Dashboard */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#005596] dark:text-[#38bdf8]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight font-display">
              Tiempo de Vuelo Oficial
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-cyan-400 font-medium">
            UTC+00 CANARIAS
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Today */}
          <div className="bg-white dark:bg-[#111c2e] border border-slate-200/80 dark:border-slate-800 p-3 rounded-xl shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Hoy
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-[#005596] dark:text-amber-400 font-mono">
                {formatMins(todayMins)}
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-100 dark:bg-[#08101d] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (todayMins / 120) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* This Week */}
          <div className="bg-white dark:bg-[#111c2e] border border-slate-200/80 dark:border-slate-800 p-3 rounded-xl shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Esta Semana
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-[#005596] dark:text-[#38bdf8] font-mono">
                {formatMins(weekMins)}
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-100 dark:bg-[#08101d] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#005596] dark:bg-sky-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (weekMins / 600) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-white dark:bg-[#111c2e] border border-slate-200/80 dark:border-slate-800 p-3 rounded-xl shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Este Mes
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-[#005596] dark:text-sky-300 font-mono">
                {formatMins(monthMins)}
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-100 dark:bg-[#08101d] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 dark:bg-sky-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (monthMins / 1800) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* This Year */}
          <div className="bg-white dark:bg-[#111c2e] border border-slate-200/80 dark:border-slate-800 p-3 rounded-xl shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Este Año
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-800 dark:text-emerald-400 font-mono">
                {formatMins(yearMins)}
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-100 dark:bg-[#08101d] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 dark:bg-emerald-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (yearMins / 6000) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Total Career Accreditation Banner */}
        <div className="bg-blue-50/70 dark:bg-[#16243b] border border-blue-200 dark:border-sky-500/30 p-3.5 rounded-xl shadow-sm space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#005596] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Medal className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#005596] dark:text-cyan-300 font-bold block truncate">
                    Total de Carrera Acreditada
                  </span>
                  {isSenior && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                      SENIOR
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                    {careerTotals.totalHoursFormatted}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-300 font-medium">
                    PIC (Comandante)
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSeniorModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0c1626] hover:bg-slate-100 dark:hover:bg-[#14233a] border border-blue-200 dark:border-sky-500/40 text-[#005596] dark:text-sky-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
              title="Acreditar horas de vuelo anteriores de piloto senior"
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-mono text-[10px] font-bold uppercase">
                {isSenior ? 'Horas Previas' : 'Acreditar Base'}
              </span>
            </button>
          </div>

          {/* Breakdown: Horas previas acreditadas + Horas registradas en la app */}
          <div className="p-2.5 rounded-lg bg-white/80 dark:bg-[#0c1626]/90 border border-blue-100 dark:border-slate-800 text-[11px] font-mono flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Base Histórica Acreditada:</span>
              <strong className="text-slate-900 dark:text-amber-400 font-bold">
                {careerTotals.previousHoursFormatted}
              </strong>
            </div>

            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span>Registrado en App:</span>
              <strong className="text-slate-900 dark:text-sky-400 font-bold">
                +{careerTotals.appHoursFormatted}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section: Battery Energy Telemetry */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <BatteryCharging className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight font-display">
              Consumo Energético Baterías
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            LIPO / TB60 / TB30
          </span>
        </div>

        <div className="bg-white dark:bg-[#111c2e] border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-xl shadow-sm space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-[#0b1424] border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block">
                  Bat. Hoy
                </span>
                <span className="text-base font-bold text-[#005596] dark:text-amber-400 font-mono">
                  {todayBatPct}%
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#0b1424] border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block">
                  Esta Semana
                </span>
                <span className="text-base font-bold text-slate-800 dark:text-sky-300 font-mono">
                  {weekBatPct}%
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-950 text-[#005596] dark:text-[#38bdf8] flex items-center justify-center">
                <Bolt className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Este Mes (Ciclos Equivalentes):</span>
              <span className="font-mono font-semibold text-[#005596] dark:text-cyan-300">
                {monthBatPct}% ({(monthBatPct / 100).toFixed(1)} ciclos)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-[#08101d] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#005596] dark:bg-sky-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (monthBatPct / 1000) * 100)}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Este Año acumulado:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-white">
                {yearBatPct}% ({(yearBatPct / 100).toFixed(1)} ciclos)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-[#08101d] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 dark:bg-sky-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (yearBatPct / 5000) * 100)}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-800 dark:text-slate-200 font-medium">Descarga Carrera Total:</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                {totalBatteryPct}% ({(totalBatteryPct / 100).toFixed(1)} ciclos acumulados)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Quick Action Navigation Grid (6 Buttons) */}
      <section className="space-y-2">
        <div className="px-1">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight font-display">
            Acciones Rápidas de Mando
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onNavigateToFlights}
            className="bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-sm flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-[#16243b] transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#0b1424] text-[#005596] dark:text-sky-400 flex items-center justify-center mb-1">
              <History className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Historial</span>
          </button>

          <button
            onClick={onNavigateToReports}
            className="bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-sm flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-[#16243b] transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#0b1424] text-[#005596] dark:text-sky-400 flex items-center justify-center mb-1">
              <Gauge className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Métricas</span>
          </button>

          <button
            onClick={onNavigateToReports}
            className="bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-sm flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-[#16243b] transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Exportar</span>
          </button>

          <button
            onClick={onNavigateToFleet}
            className="bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-sm flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-[#16243b] transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#0b1424] text-slate-700 dark:text-indigo-400 flex items-center justify-center mb-1">
              <Plane className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Mis Drones</span>
          </button>

          <button
            onClick={onNavigateToReports}
            className="bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-sm flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-[#16243b] transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-[#0b1424] text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
              <BatteryCharging className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Baterías</span>
          </button>

          <button
            onClick={onNavigateToMap}
            className="bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-sm flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-[#16243b] transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-[#0b1424] text-sky-600 dark:text-sky-400 flex items-center justify-center mb-1">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Mapa GNSS</span>
          </button>
        </div>
      </section>

      {/* 7. Section: Últimas Misiones Registradas */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-[#005596] dark:text-[#38bdf8]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight font-display">
              Últimas Misiones Registradas
            </h2>
          </div>
          <button
            onClick={onNavigateToFlights}
            className="text-xs font-mono text-[#005596] dark:text-sky-400 hover:underline font-semibold"
          >
            Ver todas ({flights.length}) →
          </button>
        </div>

        <div className="space-y-2.5">
          {flights.length === 0 ? (
            <div className="bg-white dark:bg-[#111c2e] border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center space-y-2.5 shadow-sm">
              <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-sky-950 text-[#005596] dark:text-sky-400 mx-auto flex items-center justify-center">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  Bitácora en Cero (0 Vuelos Registrados)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-0.5">
                  Todos los contadores de tiempo y baterías están a cero. Comienza a registrar tu primera misión para acumular horas oficiales PIC.
                </p>
              </div>
              <button
                onClick={onNavigateToNewFlight}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#005596] to-sky-600 text-white text-xs font-bold shadow-md hover:brightness-110 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Registrar Primer Vuelo</span>
              </button>
            </div>
          ) : (
            flights.slice(0, 3).map((flight) => (
              <article
                key={flight.id}
                onClick={onNavigateToFlights}
                className="bg-white dark:bg-[#111c2e] border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 shadow-sm space-y-2 relative transition-all hover:border-[#005596]/50 cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#005596] dark:text-[#38bdf8] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-[#0b1424] border border-blue-100 dark:border-slate-700">
                        {flight.droneModel}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-mono text-[10px] font-bold">
                        {flight.scenario}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {flight.purpose}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#005596] dark:text-[#38bdf8] shrink-0" />
                      <span className="truncate">{flight.locationName}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400 font-medium block">
                      {flight.date}
                    </span>
                    <span className="font-mono text-xs text-amber-600 dark:text-amber-400 font-bold">
                      {flight.timeStart} - {flight.timeEnd}
                    </span>
                  </div>
                </div>

                {/* Telemetry 3-column strip */}
                <div className="grid grid-cols-3 gap-2 py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-[#0a1424] border border-slate-200 dark:border-slate-800/80 font-mono text-xs">
                  <div>
                    <span className="text-[9.5px] uppercase text-slate-500 dark:text-slate-400 block">
                      Duración
                    </span>
                    <span className="font-bold text-[#005596] dark:text-[#38bdf8]">
                      {flight.durationMinutes} min
                    </span>
                  </div>
                  <div>
                    <span className="text-[9.5px] uppercase text-slate-500 dark:text-slate-400 block">
                      Batería
                    </span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      -{flight.batConsumed}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[9.5px] uppercase text-slate-500 dark:text-slate-400 block">
                      Viento
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {flight.windKmH} km/h
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <span className="truncate max-w-[220px] italic">
                    "{flight.notes}"
                  </span>
                  <span className="font-mono font-bold uppercase text-[#005596] dark:text-[#38bdf8] shrink-0">
                    #{flight.id}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Senior Pilot Baseline Hours Accreditation Modal */}
      <SeniorHoursModal
        isOpen={showSeniorModal}
        onClose={() => setShowSeniorModal(false)}
        pilot={pilot}
        flights={flights}
        onUpdatePilot={onUpdatePilot}
        theme={theme}
      />
    </div>
  );
};
