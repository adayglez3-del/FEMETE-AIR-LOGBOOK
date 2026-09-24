import React from 'react';
import { FemeteLogo } from '../logos/FemeteLogo';
import { AlisiosLogo } from '../logos/AlisiosLogo';
import { ThemeMode } from '../../types';
import { ShieldCheck, BatteryCharging, FileText, WifiOff, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';

interface SplashViewProps {
  onEnter: () => void;
  onOpenProfile: () => void;
  theme: ThemeMode;
}

export const SplashView: React.FC<SplashViewProps> = ({ onEnter, onOpenProfile, theme }) => {
  return (
    <div className="w-full max-w-[420px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col justify-between py-3 px-4 relative">
      {/* Top Status Capsule */}
      <div className="flex items-center justify-between text-[11px] font-mono font-medium text-slate-600 dark:text-slate-300 bg-white/95 dark:bg-[#0b1424]/95 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1.5 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-100">MODO LOCAL OFFLINE</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 dark:bg-sky-950/80 text-[#005596] dark:text-[#38bdf8] font-bold text-[10px] border border-blue-100 dark:border-sky-800">
            AESA STS
          </span>
          <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold gap-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            GNSS OK
          </span>
        </div>
      </div>

      {/* Main Brand Card */}
      <section className="bg-white dark:bg-[#0f1b2d]/95 rounded-2xl p-5 border border-slate-100 dark:border-[#1f3352] shadow-sm dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex flex-col items-center text-center my-3 relative overflow-hidden backdrop-blur-md">
        {/* FEMETE Official Logo Container */}
        <div className="w-48 h-18 py-1 px-3 mb-2 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-white/95 border border-slate-200 shadow-sm">
          <FemeteLogo className="h-10 w-auto" variant={theme === 'dark' ? 'dark' : 'light'} showSubtitle />
        </div>

        {/* Divider with crosshair */}
        <div className="flex items-center w-full my-2">
          <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
          <span className="px-2 text-[#005596] dark:text-[#38bdf8] font-mono text-[10px] tracking-widest uppercase font-bold">
            RPAS · UAS SYSTEM
          </span>
          <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black tracking-tight text-[#003366] dark:text-white uppercase font-display">
          FEMETE <span className="text-[#005596] dark:text-[#38bdf8] font-extrabold">AIR LOGBOOK</span>
        </h1>

        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 leading-snug">
          Libro de Vuelo Oficial RPAS / Drones
        </p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 max-w-[280px] mt-0.5 leading-tight">
          Federación Provincial de Empresas del Metal y Nuevas Tecnologías de Santa Cruz de Tenerife
        </p>

        {/* Tagline */}
        <div className="mt-3 py-2 px-3 bg-slate-50 dark:bg-[#0a1220]/80 rounded-xl border border-slate-100 dark:border-slate-800 w-full text-center">
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
            Bitácora técnica de vuelo profesional para pilotos y operadores de drones en Canarias
          </p>
        </div>

        {/* 4 Feature Badges */}
        <div className="grid grid-cols-2 gap-2 w-full mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-left font-mono text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 bg-blue-50/70 dark:bg-[#0a1526] border border-blue-100 dark:border-[#1d3354] rounded-lg px-2.5 py-1.5">
            <ShieldCheck className="w-4 h-4 text-[#005596] dark:text-[#38bdf8] shrink-0" />
            <span className="truncate font-semibold">Vuelos STS-ES</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 bg-blue-50/70 dark:bg-[#0a1526] border border-blue-100 dark:border-[#1d3354] rounded-lg px-2.5 py-1.5">
            <BatteryCharging className="w-4 h-4 text-[#005596] dark:text-[#38bdf8] shrink-0" />
            <span className="truncate font-semibold">Baterías & Ciclos</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 bg-blue-50/70 dark:bg-[#0a1526] border border-blue-100 dark:border-[#1d3354] rounded-lg px-2.5 py-1.5">
            <FileText className="w-4 h-4 text-[#005596] dark:text-[#38bdf8] shrink-0" />
            <span className="truncate font-semibold">Informes EASA</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 bg-blue-50/70 dark:bg-[#0a1526] border border-blue-100 dark:border-[#1d3354] rounded-lg px-2.5 py-1.5">
            <WifiOff className="w-4 h-4 text-[#005596] dark:text-[#38bdf8] shrink-0" />
            <span className="truncate font-semibold">100% Offline</span>
          </div>
        </div>
      </section>

      {/* Official Collaborator Section: ALISIOS DRON */}
      <section className="bg-gradient-to-b from-white to-slate-50 dark:from-[#0e1728] dark:to-[#09111c] rounded-xl p-3.5 border border-slate-200 dark:border-[#1d2d45] shadow-sm relative overflow-hidden mb-3">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500 shadow-[0_0_8px_#f59e0b]"></div>
        <div className="flex flex-col items-center text-center pl-1">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-[10px] font-mono tracking-wider font-bold text-slate-600 dark:text-amber-300 uppercase">
              Partner Técnico Oficial & Operacional
            </span>
          </div>

          {/* Logo container */}
          <div className="w-48 h-12 py-1 px-3 flex items-center justify-center rounded-lg bg-white dark:bg-white/95 border border-slate-200 shadow-sm my-1">
            <AlisiosLogo className="h-6 w-auto" variant="light" />
          </div>

          <p className="text-[10.5px] font-semibold text-slate-700 dark:text-slate-300 mt-1">
            Consultoría Aeronáutica & Operador Acreditado EASA / AESA
          </p>
          <p className="text-[9.5px] text-slate-500 dark:text-slate-400 font-mono">
            Especialistas en Formación e Ingeniería de Drones en Canarias
          </p>
        </div>
      </section>

      {/* Actions */}
      <div className="space-y-2.5 pt-1 pb-4">
        <button
          onClick={onEnter}
          className="w-full h-13 py-3.5 px-4 bg-gradient-to-r from-[#005596] via-[#1565c0] to-[#003e6f] dark:from-[#1a80e6] dark:via-[#1565c0] dark:to-[#004e92] text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-[0.99] flex items-center justify-center gap-2 transition-all cursor-pointer font-display tracking-wide uppercase text-sm"
        >
          <span>ENTRAR AL LOGBOOK / ACCEDER</span>
          <ArrowRight className="w-5 h-5 text-sky-200" />
        </button>

        <div className="text-center">
          <button
            onClick={onOpenProfile}
            className="inline-flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#005596] dark:hover:text-[#38bdf8] py-1.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors gap-1.5"
          >
            <UserCheck className="w-4 h-4 text-slate-400 dark:text-[#38bdf8]" />
            <span>Configurar Perfil de Piloto / Opciones</span>
          </button>
        </div>

        {/* Legal notice */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-tight">
            Cumplimiento Reglamento de Ejecución (UE) 2019/947 & Directrices AESA STS-ES · RD 517/2024
          </p>
          <div className="flex items-center justify-center gap-2 mt-0.5 text-[8.5px] font-mono text-slate-400 dark:text-slate-500">
            <span>v1.0.0 Oficial</span>
            <span>•</span>
            <span>FEMETE & ALISIOS DRON</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">SISTEMA LISTO</span>
          </div>
        </div>
      </div>
    </div>
  );
};
