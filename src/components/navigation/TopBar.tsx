import React from 'react';
import { NavigationTab, ThemeMode, PilotProfile } from '../../types';
import { Moon, Sun, Satellite } from 'lucide-react';

interface TopBarProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  pilot: PilotProfile;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onNavigate,
  theme,
  onToggleTheme,
  pilot,
}) => {
  const getSubTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Libro de Vuelo Oficial · Inicio';
      case 'flights':
        return 'Libro de Vuelo Oficial · Bitácora';
      case 'new-flight':
        return 'Asistente de Misión · Cockpit';
      case 'tactical-map':
        return 'Cartografía y Espacio Aéreo AESA';
      case 'fleet':
        return 'Hangar y Flota Acreditada';
      case 'reports':
        return 'Informes y Certificaciones EASA';
      default:
        return 'Libro de Vuelo Oficial · Drones';
    }
  };

  const getInitials = (name?: string) => {
    if (!name || !name.trim()) return '+P';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const pilotDisplayName = pilot.name && pilot.name.trim() ? pilot.name : 'Nuevo Piloto (Sin configurar)';

  return (
    <header className="fixed top-0 w-full z-40 pt-safe bg-[#0b1320]/95 dark:bg-[#070d16]/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
        {/* Left: App Title & Status */}
        <div
          className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
          onClick={() => onNavigate('dashboard')}
        >
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-base tracking-tight text-[#005596] dark:text-[#38bdf8] truncate font-display flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                FEMETE AIR LOGBOOK
              </span>
              {pilot.isAuthenticated && pilot.uid ? (
                <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  FIRESTORE
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider bg-slate-500/15 text-slate-500 dark:text-slate-400 border border-slate-500/30">
                  SIN SESIÓN
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {getSubTitle()}
            </span>
          </div>
        </div>

        {/* Right: Actions (Theme Toggle, GNSS Status, Pilot Avatar) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Theme Switcher Toggle (AeroHUD Dark Ops vs AeroMetric Precision) */}
          <button
            aria-label="Conmutador de tema"
            title={theme === 'dark' ? 'Cambiar a Modo Claro (AeroMetric)' : 'Cambiar a Modo Oscuro (AeroHUD Ops)'}
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-amber-400 hover:text-[#005596] transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#005596]" />
            )}
          </button>

          {/* GNSS Status */}
          <button
            aria-label="Telemetría GNSS"
            title="GNSS Activo: 18 Satélites fijados (RTK ±1.8m)"
            onClick={() => onNavigate('tactical-map')}
            className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-sky-400 hover:text-emerald-500 transition-colors"
          >
            <Satellite className="w-4 h-4" />
          </button>

          {/* Pilot Avatar / Access */}
          <button
            aria-label="Perfil del Piloto"
            title={`Perfil: ${pilotDisplayName} (${pilot.isAuthenticated ? 'Sesión Activa' : 'Sin vincular'})`}
            onClick={() => onNavigate('auth')}
            className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#005596] to-sky-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-sky-400/40 cursor-pointer ml-0.5 shadow-sm"
          >
            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
              {pilot.avatarUrl ? (
                <img
                  src={pilot.avatarUrl}
                  alt={pilotDisplayName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{getInitials(pilot.name)}</span>
              )}
            </div>
            {pilot.isAuthenticated && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#071322]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
