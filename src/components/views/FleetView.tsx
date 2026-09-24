import React, { useState } from 'react';
import { Drone, ThemeMode } from '../../types';
import { AlisiosLogo } from '../logos/AlisiosLogo';
import {
  AlertTriangle,
  Battery,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Shield,
  Tag,
  Wrench,
  X,
  Zap,
} from 'lucide-react';

interface FleetViewProps {
  drones: Drone[];
  theme: ThemeMode;
  onAddDrone: (drone: Drone) => void;
}

export const FleetView: React.FC<FleetViewProps> = ({ drones, theme, onAddDrone }) => {
  const [filter, setFilter] = useState<'all' | 'ready' | 'warning'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New drone form state
  const [model, setModel] = useState('');
  const [manufacturer, setManufacturer] = useState('DJI');
  const [registration, setRegistration] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [mtomGrams, setMtomGrams] = useState(900);
  const [operationalClass, setOperationalClass] = useState('C1 / Estándar');
  const [batteryType, setBatteryType] = useState('LiPo 4S Intelligent');
  const [payloadNotes, setPayloadNotes] = useState('Cámara 4K 60fps con estabilizador mecánico');

  const filteredDrones = drones.filter((d) => {
    if (filter === 'ready') return d.status === 'ready';
    if (filter === 'warning') return d.status === 'warning' || d.status === 'maintenance';
    return true;
  });

  const handleCreateDrone = (e: React.FormEvent) => {
    e.preventDefault();
    const newDrone: Drone = {
      id: `drone-${Date.now().toString(16)}`,
      manufacturer,
      model,
      serialNumber,
      registration,
      mtomGrams,
      operationalClass,
      acquisitionDate: new Date().toISOString().split('T')[0],
      totalFlightMinutes: 0,
      totalMissions: 0,
      status: 'ready',
      statusLabel: 'Listo para vuelo',
      batteryType,
      batteryPacksCount: 2,
      batteryHealthPct: 100,
      nextInspectionHours: 50,
      payloadNotes,
      propellerStatus: 'Hélices nuevas revisadas OK',
      lastMissionDate: 'Pendiente primer vuelo',
    };
    onAddDrone(newDrone);
    setShowAddModal(false);
    setModel('');
    setRegistration('');
    setSerialNumber('');
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-28 px-4 space-y-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight font-display">
            Hangar y Flota Oficial RPAS
          </h2>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Aeronaves Acreditadas EASA / AESA · FEMETE
          </span>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="h-9 px-3 rounded-lg bg-[#005596] hover:bg-[#004881] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Dron</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-[#005596] text-white shadow-sm'
              : 'bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Todos ({drones.length})
        </button>
        <button
          onClick={() => setFilter('ready')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            filter === 'ready'
              ? 'bg-[#005596] text-white shadow-sm'
              : 'bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Operativos ({drones.filter((d) => d.status === 'ready').length})
        </button>
        <button
          onClick={() => setFilter('warning')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            filter === 'warning'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          En Revisión ({drones.filter((d) => d.status !== 'ready').length})
        </button>
      </div>

      {/* Drone Cards List */}
      <div className="space-y-3">
        {filteredDrones.map((drone) => (
          <article
            key={drone.id}
            className="bg-white dark:bg-[#111c2e] border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3 relative overflow-hidden transition-all hover:border-[#005596]/40"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-[#005596] dark:text-[#38bdf8] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-[#0a1424] border border-blue-100 dark:border-slate-700">
                    {drone.registration}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                    S/N: {drone.serialNumber}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {drone.model}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {drone.manufacturer} · MTOM {drone.mtomGrams}g · Clase {drone.operationalClass}
                </p>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 ${
                  drone.status === 'ready'
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                }`}
              >
                {drone.statusLabel}
              </span>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-lg bg-slate-50 dark:bg-[#0a1424] border border-slate-200 dark:border-slate-800/80 font-mono text-xs">
              <div>
                <span className="text-[9px] uppercase text-slate-500 dark:text-slate-400 block">
                  Tiempo Total
                </span>
                <span className="font-bold text-[#005596] dark:text-[#38bdf8]">
                  {Math.floor(drone.totalFlightMinutes / 60)}h {drone.totalFlightMinutes % 60}m
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase text-slate-500 dark:text-slate-400 block">
                  Misiones
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {drone.totalMissions} ops
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase text-slate-500 dark:text-slate-400 block">
                  Salud Batería
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {drone.batteryHealthPct}% SoH
                </span>
              </div>
            </div>

            {/* Payload & Maintenance Info */}
            <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{drone.payloadNotes}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{drone.propellerStatus} · Próxima rev: {drone.nextInspectionHours}h</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Add Drone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-4 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#005596] dark:text-[#38bdf8]" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display">
                  Dar de Alta Aeronave en Flota
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDrone} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                  Modelo del RPAS *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. DJI Inspire 3 o Matrice 350 RTK"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                    Matrícula / Identificador *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="EC-XXX-TF"
                    value={registration}
                    onChange={(e) => setRegistration(e.target.value.toUpperCase())}
                    className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                    Número de Serie (S/N) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1581..."
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                    MTOM (Gramos)
                  </label>
                  <input
                    type="number"
                    value={mtomGrams}
                    onChange={(e) => setMtomGrams(parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                    Clase EASA
                  </label>
                  <select
                    value={operationalClass}
                    onChange={(e) => setOperationalClass(e.target.value)}
                    className="w-full h-10 px-2 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="C0 / Abierta A1">C0 (&lt; 250g)</option>
                    <option value="C1 / Estándar">C1 (&lt; 900g)</option>
                    <option value="C2 / Específica">C2 (&lt; 4kg)</option>
                    <option value="C3 / Industrial">C3 (&lt; 25kg)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                  Carga Útil / Payload / Cámaras
                </label>
                <input
                  type="text"
                  value={payloadNotes}
                  onChange={(e) => setPayloadNotes(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-11 bg-[#005596] hover:bg-[#004881] text-white rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Registrar Dron en Hangar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
