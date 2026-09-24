import React, { useState } from 'react';
import { FlightRecord, PilotProfile, ThemeMode } from '../../types';
import { AlisiosLogo } from '../logos/AlisiosLogo';
import { generateOfficialAesaPdf } from '../../services/pdfService';
import { StorageService } from '../../services/storage';
import {
  Calendar,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FileText,
  Filter,
  MapPin,
  Plus,
  Search,
  Timer,
  Trash2,
  Wind,
  X,
  Zap,
} from 'lucide-react';

interface FlightLogViewProps {
  flights: FlightRecord[];
  pilot: PilotProfile;
  theme: ThemeMode;
  onNavigateToNewFlight: () => void;
  onDeleteFlight: (id: string) => void;
}

export const FlightLogView: React.FC<FlightLogViewProps> = ({
  flights,
  pilot,
  theme,
  onNavigateToNewFlight,
  onDeleteFlight,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'matrice' | 'mini' | 'sts'>('all');
  const [selectedFlight, setSelectedFlight] = useState<FlightRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Filter flights
  const filteredFlights = flights.filter((flight) => {
    const query = searchQuery.toLowerCase().trim();
    const matchQuery =
      !query ||
      flight.locationName.toLowerCase().includes(query) ||
      flight.droneModel.toLowerCase().includes(query) ||
      flight.purpose.toLowerCase().includes(query) ||
      flight.droneRegistration.toLowerCase().includes(query) ||
      flight.scenario.toLowerCase().includes(query);

    if (!matchQuery) return false;

    if (selectedFilter === 'matrice') {
      return flight.droneModel.toLowerCase().includes('matrice');
    }
    if (selectedFilter === 'mini') {
      return flight.droneModel.toLowerCase().includes('mini');
    }
    if (selectedFilter === 'sts') {
      return flight.scenario.includes('STS');
    }
    return true;
  });

  const totalMinutes = flights.reduce((acc, f) => acc + f.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remMinutes = totalMinutes % 60;
  const careerTotals = StorageService.getCareerTotals(flights, pilot);

  const handleExportIndividualPdf = (flight: FlightRecord) => {
    generateOfficialAesaPdf([flight], pilot, 'diario', `Vuelo ${flight.id} - ${flight.date}`);
    showToast(`PDF oficial generado para ${flight.id}`);
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-28 px-4 space-y-3.5">
      {/* 1. Search Bar & Filter Button */}
      <div className="flex items-center gap-2 pt-1">
        <div className="flex-1 flex items-center bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 rounded-full px-3.5 py-2 shadow-sm">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ubicación, dron, motivo..."
            className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setSelectedFilter(selectedFilter === 'sts' ? 'all' : 'sts')}
          className={`w-10 h-10 flex items-center justify-center rounded-full border shadow-sm transition-colors ${
            selectedFilter === 'sts'
              ? 'bg-[#005596] text-white border-[#005596]'
              : 'bg-white dark:bg-[#111c2e] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
          title="Filtro STS"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            selectedFilter === 'all'
              ? 'bg-[#005596] dark:bg-[#1a80e6] text-white shadow-sm'
              : 'bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <span>Todos</span>
          <span className="text-[10px] opacity-80 font-mono">({flights.length})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('matrice')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            selectedFilter === 'matrice'
              ? 'bg-[#005596] dark:bg-[#1a80e6] text-white shadow-sm'
              : 'bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Matrice 300
        </button>

        <button
          onClick={() => setSelectedFilter('mini')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            selectedFilter === 'mini'
              ? 'bg-[#005596] dark:bg-[#1a80e6] text-white shadow-sm'
              : 'bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Mini 4 Pro
        </button>

        <button
          onClick={() => setSelectedFilter('sts')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            selectedFilter === 'sts'
              ? 'bg-[#005596] dark:bg-[#1a80e6] text-white shadow-sm'
              : 'bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <span>STS-ES</span>
        </button>
      </div>

      {/* 3. Operational Audit Summary Strip */}
      <div className="bg-slate-50 dark:bg-[#111c2e] border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-sky-950/80 text-[#005596] dark:text-[#38bdf8] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
              {filteredFlights.length} vuelos listados · Carrera: {careerTotals.totalHoursFormatted}
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {careerTotals.previousHoursFormatted} previas acreditadas + {careerTotals.appHoursFormatted} en app
            </span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
          AESA REG. OK
        </span>
      </div>

      {/* Official Collaborator Strip */}
      <div className="bg-white dark:bg-[#0e1726] border border-slate-200/70 dark:border-slate-800 rounded-xl p-2.5 px-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Colaborador Oficial:
          </span>
          <span className="text-xs font-bold text-[#005596] dark:text-[#38bdf8]">
            ALISIOS DRON
          </span>
        </div>
        <div className="h-6">
          <AlisiosLogo className="h-5 w-auto" variant={theme === 'dark' ? 'dark' : 'light'} />
        </div>
      </div>

      {/* 4. Chronological Flight Cards */}
      <div className="space-y-3">
        {flights.length === 0 ? (
          <div className="bg-white dark:bg-[#111c2e] border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-sky-950 text-[#005596] dark:text-sky-400 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Bitácora Oficial a Cero</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
                No hay operaciones registradas aún. El tiempo acumulado de vuelo y ciclos de batería comenzarán a contar desde tu primera misión.
              </p>
            </div>
            <button
              onClick={onNavigateToNewFlight}
              className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#005596] to-sky-600 text-white rounded-xl text-xs font-bold shadow-md hover:brightness-110 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Registrar Primer Vuelo Oficial</span>
            </button>
          </div>
        ) : filteredFlights.length === 0 ? (
          <div className="bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-2">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Sin vuelos coincidentes</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              No se encontraron operaciones registradas con ese término de búsqueda o filtro.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              className="mt-2 px-3 py-1.5 bg-[#005596] text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          filteredFlights.map((flight) => (
            <article
              key={flight.id}
              className="bg-white dark:bg-[#111c2e] border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 shadow-sm space-y-2.5 relative overflow-hidden transition-all hover:border-[#005596]/40"
            >
              {/* Left edge colored border */}
              <div
                className={`absolute top-0 left-0 w-1.5 h-full ${
                  flight.scenario.includes('STS-ES-02')
                    ? 'bg-[#005596] dark:bg-[#1a80e6]'
                    : 'bg-amber-500'
                }`}
              ></div>

              {/* Header */}
              <div className="flex items-start justify-between gap-2 pl-1.5">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#005596] dark:text-[#38bdf8] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-[#0a1424] border border-blue-100 dark:border-slate-700">
                      {flight.droneRegistration}
                    </span>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {flight.droneModel}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-mono text-[9.5px] font-bold">
                      {flight.scenario}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{flight.date}</span>
                    <span>•</span>
                    <span>{flight.timeStart} - {flight.timeEnd} UTC+1</span>
                  </p>
                </div>
              </div>

              {/* Two Metric Pills (Duration & Battery Consumed) */}
              <div className="grid grid-cols-2 gap-2 pl-1.5">
                <div className="bg-slate-50 dark:bg-[#0a1424] border border-slate-200 dark:border-slate-800/80 rounded-lg p-2 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#005596] text-white flex items-center justify-center shrink-0">
                    <Timer className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase text-slate-500 dark:text-slate-400 block">
                      Duración
                    </span>
                    <span className="font-bold text-xs font-mono text-[#005596] dark:text-[#38bdf8]">
                      {flight.durationMinutes} min
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-lg p-2 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase text-amber-700 dark:text-amber-400 block">
                      Batería Consumida
                    </span>
                    <span className="font-bold text-xs font-mono text-amber-700 dark:text-amber-300">
                      {flight.batConsumed}% <span className="text-[10px] font-normal">({flight.batStart}%→{flight.batEnd}%)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Location & Conditions */}
              <div className="space-y-1 pl-1.5">
                <div className="flex items-center gap-1.5 text-slate-900 dark:text-white text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#005596] dark:text-[#38bdf8] shrink-0" />
                  <span className="truncate">{flight.locationName}</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 pl-5 leading-snug">
                  {flight.purpose}
                </div>
                <div className="flex items-center gap-3 text-[10.5px] font-mono text-slate-500 dark:text-slate-400 pt-0.5 pl-5">
                  <span className="flex items-center gap-1">
                    <Wind className="w-3 h-3 text-[#005596] dark:text-[#38bdf8]" />
                    <span>Viento {flight.windKmH} km/h {flight.windDir}</span>
                  </span>
                  <span>•</span>
                  <span>{flight.skyCondition}</span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 -mx-3.5 -mb-3.5 px-3.5 py-2 bg-slate-50/60 dark:bg-[#0a1424]">
                <button
                  onClick={() => setSelectedFlight(flight)}
                  className="h-8 px-3 rounded-lg bg-[#005596] hover:bg-[#004881] text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver detalle</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleExportIndividualPdf(flight)}
                    className="w-8 h-8 rounded-lg text-slate-500 hover:text-[#005596] dark:text-slate-400 dark:hover:text-[#38bdf8] flex items-center justify-center transition-colors"
                    title="Exportar PDF de este vuelo"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(flight, null, 2));
                      showToast(`Registro ${flight.id} copiado al portapapeles`);
                    }}
                    className="w-8 h-8 rounded-lg text-slate-500 hover:text-[#005596] dark:text-slate-400 dark:hover:text-[#38bdf8] flex items-center justify-center transition-colors"
                    title="Copiar datos del vuelo"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar el registro ${flight.id} de la bitácora?`)) {
                        onDeleteFlight(flight.id);
                        showToast(`Vuelo ${flight.id} eliminado`);
                      }
                    }}
                    className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition-colors"
                    title="Eliminar vuelo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Floating Action Button (FAB) "+ Registrar" */}
      <div className="fixed right-4 bottom-20 z-30">
        <button
          onClick={onNavigateToNewFlight}
          className="flex items-center gap-2 pl-3.5 pr-4 h-12 bg-gradient-to-r from-[#005596] to-sky-600 hover:brightness-110 active:scale-95 text-white rounded-full shadow-xl transition-all cursor-pointer border border-white/20"
        >
          <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="font-bold text-xs uppercase tracking-wider font-display">Registrar</span>
        </button>
      </div>

      {/* Flight Detail Modal / Drawer */}
      {selectedFlight && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end p-0 sm:p-4 sm:items-center sm:justify-center">
          <div className="bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[88vh] overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Modal Top Bar */}
            <div className="sticky top-0 bg-white dark:bg-[#111c2e] z-10 px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-sky-950 text-[#005596] dark:text-[#38bdf8] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-mono font-bold text-sm text-[#005596] dark:text-[#38bdf8]">
                    {selectedFlight.id}
                  </h3>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Ficha Oficial de Misión FEMETE
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedFlight(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3.5 text-xs">
              {/* Telemetry Stats Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 dark:bg-[#0a1424] p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                    Tiempo de Vuelo
                  </span>
                  <p className="font-mono font-bold text-sm text-[#005596] dark:text-[#38bdf8] mt-0.5">
                    {selectedFlight.durationMinutes} min
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-[#0a1424] p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                    Altitud Máx. AGL
                  </span>
                  <p className="font-mono font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                    {selectedFlight.maxAglMeters} m AGL
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-[#0a1424] p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                    Consumo Batería
                  </span>
                  <p className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400 mt-0.5">
                    {selectedFlight.batStart}% a {selectedFlight.batEnd}% (-{selectedFlight.batConsumed}%)
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-[#0a1424] p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                    Distancia Estimada
                  </span>
                  <p className="font-mono font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                    {selectedFlight.distanceKm} km
                  </p>
                </div>
              </div>

              {/* Drone & Pilot Details */}
              <div className="bg-slate-50 dark:bg-[#0a1424] p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Aeronave RPAS:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedFlight.droneModel} ({selectedFlight.droneRegistration})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Escenario:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {selectedFlight.scenario}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Piloto al Mando:</span>
                  <span className="text-slate-900 dark:text-white font-medium">
                    {selectedFlight.pilotName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Licencia / Operador:</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {selectedFlight.pilotLicense}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Coordenadas GNSS:</span>
                  <span className="font-mono text-[#005596] dark:text-[#38bdf8]">
                    {selectedFlight.latitude.toFixed(4)}° N, {selectedFlight.longitude.toFixed(4)}° W
                  </span>
                </div>
              </div>

              {/* Observations */}
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold block mb-1">
                  Observaciones Técnicas de la Misión
                </span>
                <p className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0a1424] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{selectedFlight.notes}"
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleExportIndividualPdf(selectedFlight)}
                  className="w-full h-11 bg-[#005596] hover:bg-[#004881] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Download className="w-4 h-4 text-sky-200" />
                  <span>Exportar Certificado Oficial PDF</span>
                </button>
                <button
                  onClick={() => setSelectedFlight(null)}
                  className="w-full h-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors"
                >
                  Cerrar Ficha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
