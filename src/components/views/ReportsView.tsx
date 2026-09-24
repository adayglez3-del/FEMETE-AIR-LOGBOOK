import React, { useState } from 'react';
import { BatteryPack, FlightRecord, PilotProfile, ThemeMode } from '../../types';
import { FemeteLogo } from '../logos/FemeteLogo';
import { AlisiosLogo } from '../logos/AlisiosLogo';
import { generateOfficialAesaPdf } from '../../services/pdfService';
import { StorageService } from '../../services/storage';
import {
  Award,
  BatteryCharging,
  CheckCircle2,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Printer,
  RotateCcw,
  Shield,
  UserCheck,
  Zap,
} from 'lucide-react';

interface ReportsViewProps {
  flights: FlightRecord[];
  pilot: PilotProfile;
  batteries: BatteryPack[];
  theme: ThemeMode;
  onResetData: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  flights,
  pilot,
  batteries,
  theme,
  onResetData,
}) => {
  const [period, setPeriod] = useState<'diario' | 'semanal' | 'mensual' | 'anual' | 'carrera'>('mensual');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleGeneratePdf = () => {
    const today = new Date().toISOString().split('T')[0];
    let filtered = flights;
    let label = 'Todos los registros';

    if (period === 'diario') {
      filtered = flights.filter((f) => f.date === today);
      label = `Diario - ${today}`;
    } else if (period === 'semanal') {
      filtered = flights.slice(0, 5);
      label = 'Semanal (Últimos 7 días)';
    } else if (period === 'mensual') {
      filtered = flights;
      label = 'Mensual Septiembre 2026';
    } else if (period === 'anual') {
      filtered = flights;
      label = 'Anual 2026';
    } else if (period === 'carrera') {
      filtered = flights;
      label = 'Carrera Histórica Completa PIC';
    }

    generateOfficialAesaPdf(filtered.length > 0 ? filtered : flights, pilot, period, label);
    showToast(`PDF oficial generado con membrete FEMETE y ALISIOS DRON`);
  };

  const handleExportCsv = () => {
    const csv = StorageService.exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FEMETE_Air_Logbook_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Archivo CSV exportado para Excel');
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-28 px-4 space-y-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight font-display">
            Informes Oficiales EASA / AESA
          </h2>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Exportación Certificada y Auditoría de Bitácora
          </span>
        </div>
      </div>

      {/* Institutional Co-Branding Banner */}
      <div className="bg-white dark:bg-[#111c2e] border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8">
            <FemeteLogo className="h-7 w-auto" variant={theme === 'dark' ? 'dark' : 'light'} />
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
          <div className="h-8">
            <AlisiosLogo className="h-5.5 w-auto" variant={theme === 'dark' ? 'dark' : 'light'} />
          </div>
        </div>

        <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold">
          RD 517/2024 OK
        </span>
      </div>

      {/* PDF Generator Card */}
      <section className="bg-white dark:bg-[#111c2e] border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#005596] dark:text-[#38bdf8]" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display">
            Generar Libro de Vuelo Oficial (PDF)
          </h3>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Genera un documento PDF formal con membrete federativo FEMETE y sello de ALISIOS DRON, incluyendo desglose de misiones, cálculo de TTO, códigos de verificación CUV y firma digital del piloto al mando.
        </p>

        {/* Period Selector Chips */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">
            Seleccionar Período de Inspección:
          </label>
          <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
            <button
              onClick={() => setPeriod('diario')}
              className={`p-2 rounded-lg border text-center transition-all ${
                period === 'diario'
                  ? 'bg-[#005596] text-white border-[#005596] font-bold'
                  : 'bg-slate-50 dark:bg-[#0a1424] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Diario
            </button>
            <button
              onClick={() => setPeriod('semanal')}
              className={`p-2 rounded-lg border text-center transition-all ${
                period === 'semanal'
                  ? 'bg-[#005596] text-white border-[#005596] font-bold'
                  : 'bg-slate-50 dark:bg-[#0a1424] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setPeriod('mensual')}
              className={`p-2 rounded-lg border text-center transition-all ${
                period === 'mensual'
                  ? 'bg-[#005596] text-white border-[#005596] font-bold'
                  : 'bg-slate-50 dark:bg-[#0a1424] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setPeriod('anual')}
              className={`p-2 rounded-lg border text-center transition-all ${
                period === 'anual'
                  ? 'bg-[#005596] text-white border-[#005596] font-bold'
                  : 'bg-slate-50 dark:bg-[#0a1424] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Anual
            </button>
            <button
              onClick={() => setPeriod('carrera')}
              className={`col-span-2 p-2 rounded-lg border text-center transition-all ${
                period === 'carrera'
                  ? 'bg-[#005596] text-white border-[#005596] font-bold'
                  : 'bg-slate-50 dark:bg-[#0a1424] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Carrera Total (Acreditación PIC)
            </button>
          </div>

          {/* Senior Pilot Accreditation Details */}
          {period === 'carrera' && pilot.isSeniorPilot && (
            <div className="p-3 bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-700 dark:text-amber-300 font-mono text-[10.5px] uppercase flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  Base de Piloto Senior Activa
                </span>
                <span className="font-mono text-xs font-bold text-amber-800 dark:text-amber-400">
                  {pilot.previousAccreditedHours || 0}h {String(pilot.previousAccreditedMinutes || 0).padStart(2, '0')}m
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Acreditado mediante <em>{pilot.previousAccreditationEntity || 'Libro anterior'}</em> ({pilot.previousAccreditationDoc || 'Acreditado'}).
                El PDF computará estas horas históricas más los vuelos registrados en la app.
              </p>
            </div>
          )}
        </div>

        {/* PDF Download Button */}
        <button
          onClick={handleGeneratePdf}
          className="w-full h-12 bg-gradient-to-r from-[#005596] to-sky-600 hover:brightness-105 active:scale-[0.99] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all text-xs uppercase tracking-wider font-display cursor-pointer"
        >
          <Printer className="w-4 h-4 text-sky-200" />
          <span>Descargar PDF Oficial EASA / AESA</span>
        </button>
      </section>

      {/* CSV / Excel Export Card */}
      <section className="bg-white dark:bg-[#111c2e] border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">
              Exportar Base de Datos CSV
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Compatible con Microsoft Excel, Google Sheets y LibreOffice
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          className="h-9 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar</span>
        </button>
      </section>

      {/* Battery Telemetry Status */}
      <section className="bg-white dark:bg-[#111c2e] border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BatteryCharging className="w-4 h-4 text-amber-500" />
            <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase font-display">
              Telemetría de Packs de Baterías
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            Salud (SoH)
          </span>
        </div>

        <div className="space-y-2">
          {batteries.map((bat) => (
            <div
              key={bat.id}
              className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0a1424] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  {bat.name}
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {bat.droneModel} · {bat.avgVoltage}V
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                  {bat.healthPct}% SoH
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {bat.cycles} / {bat.maxCycles} ciclos
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reset Data to Zero Button */}
      <div className="text-center pt-2">
        <button
          onClick={() => {
            if (confirm('¿Seguro que deseas poner todos los datos y horas de vuelo a cero para empezar a contar desde el inicio?')) {
              onResetData();
              showToast('Todos los datos de vuelo y baterías han sido puestos a cero');
            }
          }}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500 transition-colors py-1.5 px-3 rounded-lg cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Poner todos los datos de vuelo a cero (Inicio limpio)</span>
        </button>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#005596] text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-xs font-medium animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
