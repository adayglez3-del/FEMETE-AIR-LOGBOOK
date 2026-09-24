import React, { useState } from 'react';
import { PilotProfile, FlightRecord, ThemeMode } from '../../types';
import { StorageService } from '../../services/storage';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  FileCheck2,
  HelpCircle,
  History,
  Info,
  Layers,
  Save,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react';
import { FemeteLogo } from '../logos/FemeteLogo';
import { AlisiosLogo } from '../logos/AlisiosLogo';

interface SeniorHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  pilot: PilotProfile;
  flights: FlightRecord[];
  onUpdatePilot: (updated: PilotProfile) => void;
  theme: ThemeMode;
}

export const SeniorHoursModal: React.FC<SeniorHoursModalProps> = ({
  isOpen,
  onClose,
  pilot,
  flights,
  onUpdatePilot,
  theme,
}) => {
  const [isSenior, setIsSenior] = useState<boolean>(pilot.isSeniorPilot ?? true);
  const [hours, setHours] = useState<number>(pilot.previousAccreditedHours ?? 142);
  const [minutes, setMinutes] = useState<number>(pilot.previousAccreditedMinutes ?? 50);
  const [entity, setEntity] = useState<string>(
    pilot.previousAccreditationEntity ?? 'Libro Físico Oficial AESA / Operador Anterior'
  );
  const [documentRef, setDocumentRef] = useState<string>(
    pilot.previousAccreditationDoc ?? 'AESA-EXP-2023-CAN'
  );
  const [accreditationDate, setAccreditationDate] = useState<string>(
    pilot.previousAccreditationDate ?? '2024-01-01'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  // Real-time calculation
  const validHours = Math.max(0, isNaN(hours) ? 0 : hours);
  const validMinutes = Math.min(59, Math.max(0, isNaN(minutes) ? 0 : minutes));
  const previousBaseMins = isSenior ? validHours * 60 + validMinutes : 0;
  const appRecordedMins = flights.reduce((sum, f) => sum + f.durationMinutes, 0);
  const newTotalCareerMins = previousBaseMins + appRecordedMins;
  const newCareerHours = Math.floor(newTotalCareerMins / 60);
  const newCareerRemMins = newTotalCareerMins % 60;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPilot: PilotProfile = {
      ...pilot,
      isSeniorPilot: isSenior,
      previousAccreditedHours: validHours,
      previousAccreditedMinutes: validMinutes,
      previousAccreditationEntity: entity.trim(),
      previousAccreditationDoc: documentRef.trim(),
      previousAccreditationDate: accreditationDate,
    };

    StorageService.savePilot(updatedPilot);
    onUpdatePilot(updatedPilot);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-sky-500/30 rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#005596] to-sky-700 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight font-display">
                  Cómputo de Horas Previas Acreditadas
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-slate-950 uppercase">
                  Senior PIC
                </span>
              </div>
              <p className="text-xs text-sky-100 opacity-90">
                Punto de partida oficial para el cómputo total de carrera (RD 517/2024)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (scrollable) */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 text-sm flex-1">
          {/* Institutional note */}
          <div className="bg-slate-50 dark:bg-[#111e33] border border-slate-200 dark:border-[#1e3458] rounded-xl p-3.5 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <p>
                <strong className="text-slate-900 dark:text-white font-semibold">
                  Normativa AESA / EASA (Pilotos con Experiencia Acreditada):
                </strong>{' '}
                Si eres piloto senior o provienes de libros de vuelo físicos, operadores certificados o
                acreditaciones previas, introduce aquí tus horas acumuladas reconocidas.
              </p>
              <p className="text-sky-600 dark:text-sky-400 font-medium">
                A partir de este mismo momento, cada nueva misión registrada en la app se sumará
                directamente sobre esta base oficial.
              </p>
            </div>
          </div>

          {/* Toggle is Senior */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0f1b2e] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/80 text-[#005596] dark:text-sky-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <label
                  htmlFor="senior-toggle"
                  className="font-semibold text-slate-900 dark:text-white text-xs block cursor-pointer"
                >
                  Habilitar Cómputo de Horas Previas de Piloto Senior
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isSenior ? 'Horas previas activadas en el total de carrera' : 'El contador inicia desde 0h en esta app'}
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="senior-toggle"
                type="checkbox"
                checked={isSenior}
                onChange={(e) => setIsSenior(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#005596] dark:peer-checked:bg-sky-500"></div>
            </label>
          </div>

          {isSenior && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-150">
              {/* Hours and Minutes Inputs */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold mb-1.5">
                  Tiempo Previo Oficialmente Acreditado *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="15000"
                      value={hours}
                      onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                      required
                      className="w-full h-12 pl-3 pr-12 rounded-xl bg-slate-50 dark:bg-[#08101d] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#005596] dark:focus:ring-sky-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                      HORAS
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={minutes}
                      onChange={(e) => setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                      required
                      className="w-full h-12 pl-3 pr-12 rounded-xl bg-slate-50 dark:bg-[#08101d] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#005596] dark:focus:ring-sky-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                      MIN
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHours(142);
                      setMinutes(50);
                    }}
                    className="text-[10px] font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                  >
                    Por defecto: 142h 50m
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHours(50);
                      setMinutes(0);
                    }}
                    className="text-[10px] font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                  >
                    Base STS: 50h
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHours(300);
                      setMinutes(0);
                    }}
                    className="text-[10px] font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                  >
                    Senior Plus: 300h
                  </button>
                </div>
              </div>

              {/* Accreditation Entity / Source */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold mb-1">
                  Entidad de Certificación / Libro Físico de Procedencia
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={entity}
                    onChange={(e) => setEntity(e.target.value)}
                    placeholder="Ej. Libro Físico AESA / Operador Anterior"
                    className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#08101d] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#005596] dark:focus:ring-sky-400"
                  />
                </div>
              </div>

              {/* Document Reference & Cutoff Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold mb-1">
                    Nº Certificado / Ref.
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={documentRef}
                      onChange={(e) => setDocumentRef(e.target.value)}
                      placeholder="EXP-AESA-xxxx"
                      className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#08101d] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs uppercase focus:outline-none focus:ring-2 focus:ring-[#005596] dark:focus:ring-sky-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold mb-1">
                    Fecha de Cómputo Base
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      value={accreditationDate}
                      onChange={(e) => setAccreditationDate(e.target.value)}
                      className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#08101d] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#005596] dark:focus:ring-sky-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Computation Matrix */}
          <div className="rounded-xl border border-sky-200 dark:border-sky-500/30 bg-gradient-to-br from-blue-50/80 via-white to-sky-50/50 dark:from-[#0a1525] dark:via-[#0e1c31] dark:to-[#081220] p-4 space-y-3 shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100 dark:border-slate-800">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#005596] dark:text-cyan-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Matriz de Cómputo de Carrera
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                AUDITORÍA EN VIVO
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>1. Horas Previas Acreditadas (Senior):</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {isSenior ? `${validHours}h ${String(validMinutes).padStart(2, '0')}m` : '00h 00m'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>2. Horas en FEMETE Logbook ({flights.length} vuelos):</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  +{Math.floor(appRecordedMins / 60)}h {String(appRecordedMins % 60).padStart(2, '0')}m
                </span>
              </div>

              <div className="pt-2 border-t border-dashed border-sky-300 dark:border-sky-500/40 flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white uppercase font-sans text-xs flex items-center gap-1">
                  <span>Total Carrera Acreditada:</span>
                </span>
                <span className="text-base font-extrabold text-[#005596] dark:text-amber-400">
                  {newCareerHours}h {String(newCareerRemMins).padStart(2, '0')}m
                </span>
              </div>
            </div>
          </div>
        </form>

        {/* Footer actions */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#09111c] border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-10 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={savedSuccess}
            className="px-5 h-10 rounded-xl bg-gradient-to-r from-[#005596] to-sky-600 hover:from-[#00477d] hover:to-sky-700 text-white text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-300" />
                <span>¡Horas Actualizadas!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Aplicar al Total de Carrera</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
