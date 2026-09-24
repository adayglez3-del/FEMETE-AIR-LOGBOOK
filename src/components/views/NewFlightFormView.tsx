import React, { useState } from 'react';
import { Drone, FlightRecord, OperationalScenario, PilotProfile, ThemeMode } from '../../types';
import { AlisiosLogo } from '../logos/AlisiosLogo';
import {
  AlertCircle,
  ArrowLeft,
  Battery,
  BatteryCharging,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  MapPin,
  Navigation,
  Plane,
  Save,
  Shield,
  Thermometer,
  Wind,
  Zap,
  PlusCircle,
  BookmarkCheck,
  Search,
  Check,
} from 'lucide-react';

interface NewFlightFormViewProps {
  drones: Drone[];
  pilot: PilotProfile;
  theme: ThemeMode;
  prefilledLocation?: {
    lat: number;
    lng: number;
    spotName: string;
    municipality: string;
  };
  onSaveFlight: (flight: FlightRecord) => void;
  onAddDrone?: (drone: Drone) => void;
  onOpenTacticalMap: () => void;
  onCancel: () => void;
}

// Popular and certified RPAS models in Spain & Canarias for instant autocomplete
const POPULAR_UAS_MODELS = [
  'DJI Mini 4 Pro',
  'DJI Mini 3 Pro',
  'DJI Air 3',
  'DJI Air 3S',
  'DJI Mavic 3 Pro',
  'DJI Mavic 3 Classic',
  'DJI Mavic 3 Enterprise',
  'DJI Mavic 3 Thermal (M3T)',
  'DJI Mavic 3 Multispectral',
  'DJI Matrice 350 RTK',
  'DJI Matrice 300 RTK',
  'DJI Matrice 30T',
  'DJI Inspire 3',
  'DJI Avata 2',
  'Autel EVO Max 4T',
  'Autel EVO II Dual 640T V3',
  'Autel EVO Lite+',
  'Yuneec H520E RTK',
  'Parrot Anafi USA',
  'WingtraOne GEN II (VTOL)',
  'SenseFly eBee X (Ala Fija)',
  'FPV Custom 5" Cinelifter',
  'FPV Long-Range 7" HD',
];

export const NewFlightFormView: React.FC<NewFlightFormViewProps> = ({
  drones,
  pilot,
  theme,
  prefilledLocation,
  onSaveFlight,
  onAddDrone,
  onOpenTacticalMap,
  onCancel,
}) => {
  const today = new Date().toISOString().split('T')[0];

  // UAS Selection & Custom typing state
  const initialDrone = drones[0] || {
    id: 'drone-custom-1',
    model: 'DJI Mini 4 Pro',
    registration: 'EC-001-CAN',
    operationalClass: 'C0 / Abierta A1',
  };

  const [droneModel, setDroneModel] = useState<string>(initialDrone.model);
  const [droneRegistration, setDroneRegistration] = useState<string>(initialDrone.registration);
  const [droneClass, setDroneClass] = useState<string>(initialDrone.operationalClass || 'C2 / Estándar');
  const [saveToFleet, setSaveToFleet] = useState<boolean>(true);

  // Pilot & flight details
  const [flightPilotName, setFlightPilotName] = useState<string>(
    pilot.name && pilot.name.trim() ? pilot.name : 'Piloto al Mando (PIC)'
  );
  const [date, setDate] = useState(today);
  const [timeStart, setTimeStart] = useState('10:00');
  const [timeEnd, setTimeEnd] = useState('10:35');
  const [scenario, setScenario] = useState<OperationalScenario>('STS-ES-01');
  const [purpose, setPurpose] = useState('Inspección de Infraestructura y Ensayos Operacionales');
  const [spotName, setSpotName] = useState(
    prefilledLocation?.spotName || 'Polígono Industrial de Granadilla, Tenerife'
  );
  const [municipality, setMunicipality] = useState(
    prefilledLocation?.municipality || 'Granadilla de Abona'
  );
  const [latitude, setLatitude] = useState(prefilledLocation?.lat || 28.1042);
  const [longitude, setLongitude] = useState(prefilledLocation?.lng || -16.5127);
  const [batStart, setBatStart] = useState(100);
  const [batEnd, setBatEnd] = useState(58);
  const [windKmH, setWindKmH] = useState(14);
  const [windDir, setWindDir] = useState('NE');
  const [skyCondition, setSkyCondition] = useState('Despejado 23°C');
  const [maxAgl, setMaxAgl] = useState(120);
  const [distanceKm, setDistanceKm] = useState(12.5);
  const [notes, setNotes] = useState(
    'Misión completada según protocolo estándar STS-ES. Telemetría y enlace C2 estables.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute duration in minutes automatically
  const computeDuration = (start: string, end: string): number => {
    try {
      const [h1, m1] = start.split(':').map(Number);
      const [h2, m2] = end.split(':').map(Number);
      let diff = h2 * 60 + m2 - (h1 * 60 + m1);
      if (diff < 0) diff += 24 * 60; // Cross midnight
      return Math.max(1, diff);
    } catch {
      return 35;
    }
  };

  const durationMinutes = computeDuration(timeStart, timeEnd);
  const batteryConsumed = Math.max(0, batStart - batEnd);

  // When user clicks a fleet drone chip
  const handleSelectFleetDrone = (drone: Drone) => {
    setDroneModel(drone.model);
    setDroneRegistration(drone.registration);
    if (drone.operationalClass) {
      setDroneClass(drone.operationalClass);
    }
  };

  // When user changes the model input text
  const handleModelChange = (typedValue: string) => {
    setDroneModel(typedValue);
    // If it matches a drone in the fleet, auto-fill registration and class
    const match = drones.find((d) => d.model.toLowerCase() === typedValue.trim().toLowerCase());
    if (match) {
      setDroneRegistration(match.registration);
      if (match.operationalClass) setDroneClass(match.operationalClass);
    } else if (!droneRegistration || droneRegistration.startsWith('EC-') || droneRegistration.startsWith('ESP-')) {
      // Suggest automatic registration format for ease
      if (!droneRegistration) {
        setDroneRegistration(`EC-${Math.floor(100 + Math.random() * 900)}-TF`);
      }
    }
  };

  // Check if current typed model is already in fleet
  const isExistingFleetDrone = drones.some(
    (d) => d.model.toLowerCase() === droneModel.trim().toLowerCase()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!droneModel.trim()) {
      alert('Por favor escriba o seleccione el modelo de UAS / Dron.');
      return;
    }

    setIsSubmitting(true);

    // Find if drone exists in fleet or create new
    let matchedDrone = drones.find(
      (d) => d.model.toLowerCase() === droneModel.trim().toLowerCase()
    );

    let droneId = matchedDrone?.id;

    // If new drone and user wants to save to fleet
    if (!matchedDrone) {
      const newDroneId = `drone-${Date.now()}`;
      droneId = newDroneId;
      if (saveToFleet && onAddDrone) {
        const newDroneObj: Drone = {
          id: newDroneId,
          manufacturer: droneModel.split(' ')[0] || 'Genérico',
          model: droneModel.trim(),
          registration: droneRegistration.trim() || `EC-${Math.floor(100 + Math.random() * 900)}-TF`,
          serialNumber: `SN-${Math.floor(10000000 + Math.random() * 90000000)}`,
          mtomGrams: 890,
          operationalClass: droneClass,
          acquisitionDate: today,
          totalFlightMinutes: durationMinutes,
          totalMissions: 1,
          status: 'ready',
          statusLabel: 'Listo para vuelo',
          batteryType: 'Intelligent Flight LiPo',
          batteryPacksCount: 2,
          batteryHealthPct: 100,
          nextInspectionHours: 50,
          payloadNotes: 'Sensor integrado y telemetría AESA.',
          propellerStatus: 'Revisadas OK',
          lastMissionDate: today,
        };
        onAddDrone(newDroneObj);
      }
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newFlight: FlightRecord = {
      id: `FL-${new Date().getFullYear()}-${randomSuffix}`,
      date,
      droneId: droneId || `drone-${Date.now()}`,
      droneModel: droneModel.trim(),
      droneRegistration: droneRegistration.trim() || 'EC-TEMP-TF',
      locationName: spotName,
      municipality,
      latitude,
      longitude,
      scenario,
      purpose,
      timeStart,
      timeEnd,
      durationMinutes,
      batStart,
      batEnd,
      batConsumed: batteryConsumed,
      batteryPackId: matchedDrone?.batteryType || 'Intelligent LiPo Pack',
      windKmH,
      windDir,
      skyCondition,
      tempC: 22,
      maxAglMeters: maxAgl,
      distanceKm,
      notes,
      pilotName: flightPilotName.trim() || pilot.name || 'Piloto al Mando (PIC)',
      pilotLicense: pilot.aesaOperatorId || 'ESP-RPAS-CANARIAS',
      verifiedAesa: true,
      officialHash: `AESA-${new Date().getFullYear()}-${randomSuffix.toString(16).toUpperCase()}-CAN`,
    };

    setTimeout(() => {
      onSaveFlight(newFlight);
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-28 px-4 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#005596] dark:hover:text-[#38bdf8] transition-colors py-1 px-2.5 rounded-lg bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancelar</span>
        </button>

        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#005596] dark:text-[#38bdf8]">
          REGISTRO OFICIAL AESA
        </span>
      </div>

      {/* Official Form Header Banner */}
      <div className="bg-gradient-to-r from-[#005596] to-sky-700 text-white rounded-2xl p-4 shadow-md space-y-1 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold font-display uppercase tracking-tight">
              Nueva Misión de Vuelo
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded bg-black/25 text-amber-300 text-[10px] font-mono font-bold">
            RD 517/2024
          </span>
        </div>
        <p className="text-xs text-sky-100 opacity-90 leading-tight">
          Asistente de registro oficial certificado para pilotos RPAS de FEMETE & ALISIOS DRON
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. SELECCIÓN Y ESCRITURA DE UAS */}
        <div className="bg-white dark:bg-[#111c2e] border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase font-display">
              <Plane className="w-4 h-4 text-[#005596] dark:text-[#38bdf8]" />
              <span>1. Aeronave RPAS / UAS (Escribir o Seleccionar)</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#005596] dark:text-sky-300 bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 px-2 py-0.5 rounded">
              TOTAL ACCESO
            </span>
          </div>

          {/* Quick Select Fleet Chips */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400">
              Drones en Flota Guardada (Click para Carga Rápida):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {drones.map((d) => {
                const isSelected = droneModel.toLowerCase() === d.model.toLowerCase();
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleSelectFleetDrone(d)}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#005596] text-white border-[#005596] shadow-sm'
                        : 'bg-slate-50 dark:bg-[#0a111c] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#005596]'
                    }`}
                  >
                    <Plane className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span className="truncate max-w-[130px]">{d.model}</span>
                    <span className="text-[9.5px] font-mono opacity-75">({d.registration})</span>
                    {isSelected && <Check className="w-3 h-3 shrink-0 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Input for Writing UAS Model */}
          <div className="space-y-2 pt-1">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                Modelo de UAS / Dron (Escribe libremente o busca en catálogo) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  list="uas-models-catalog"
                  value={droneModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  placeholder="Ej. DJI Avata 2, DJI Mini 4 Pro, Autel EVO Max 4T, FPV..."
                  className="w-full h-11 pl-9 pr-3 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#005596] dark:focus:ring-sky-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>

              {/* Datalist for fast autocomplete */}
              <datalist id="uas-models-catalog">
                {/* Fleet Drones */}
                {drones.map((d) => (
                  <option key={`fleet-${d.id}`} value={d.model}>
                    {d.model} · Flota Oficial ({d.registration})
                  </option>
                ))}
                {/* Popular industry models */}
                {POPULAR_UAS_MODELS.map((m) => (
                  <option key={`pop-${m}`} value={m}>
                    {m}
                  </option>
                ))}
              </datalist>
            </div>

            {/* Matrícula y Clase Operacional */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Matrícula / Registro UAS *
                </label>
                <input
                  type="text"
                  required
                  value={droneRegistration}
                  onChange={(e) => setDroneRegistration(e.target.value.toUpperCase())}
                  placeholder="Ej. EC-941-TF / ESP-DRN-0042"
                  className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-[#005596]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Clase Operacional EASA *
                </label>
                <select
                  value={droneClass}
                  onChange={(e) => setDroneClass(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#005596]"
                >
                  <option value="C0 / Abierta A1">C0 (&lt;250g · Abierta A1)</option>
                  <option value="C1 / Abierta A1">C1 (&lt;900g · Abierta A1)</option>
                  <option value="C2 / Estándar">C2 (&lt;4kg · Abierta A2)</option>
                  <option value="C3 / Específica">C3 (&lt;25kg · Específica)</option>
                  <option value="C4 / Abierta A3">C4 (Modelismo · Abierta A3)</option>
                  <option value="C5 / STS-01">C5 (Marcado STS-ES-01)</option>
                  <option value="C6 / STS-02">C6 (Marcado STS-ES-02)</option>
                  <option value="Específica SORA">Específica (PDRA / SORA)</option>
                  <option value="Artesanal / Sin Marcado">Artesanal / Sin Marcado</option>
                </select>
              </div>
            </div>

            {/* Save to fleet option if typed model is new */}
            {!isExistingFleetDrone && droneModel.trim() && (
              <div className="pt-1.5 flex items-center justify-between p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                <div className="flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-[#005596] dark:text-sky-400 shrink-0" />
                  <span className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                    Guardar este UAS en mi Hangar / Flota Permanente
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={saveToFleet}
                  onChange={(e) => setSaveToFleet(e.target.checked)}
                  className="w-4 h-4 text-[#005596] rounded focus:ring-[#005596]"
                />
              </div>
            )}
          </div>

          {/* Escenario y Piloto */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                Escenario Operacional AESA *
              </label>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value as OperationalScenario)}
                className="w-full h-11 px-3 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 text-amber-700 dark:text-amber-400 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#005596]"
              >
                <option value="STS-ES-01">STS-ES-01 (Urbano VLOS)</option>
                <option value="STS-ES-02">STS-ES-02 (BVLOS Zona Poco Poblada)</option>
                <option value="Abierta (A1 / A3)">Abierta A1 / A3</option>
                <option value="Abierta A2">Abierta A2 (C2 / Cercanía)</option>
                <option value="Específica (PDRA / SORA)">Específica (PDRA / SORA)</option>
                <option value="LUC Autorizado FEMETE">LUC Autorizado FEMETE</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                Piloto al Mando (PIC) *
              </label>
              <input
                type="text"
                required
                value={flightPilotName}
                onChange={(e) => setFlightPilotName(e.target.value)}
                placeholder="Nombre del Piloto"
                className="w-full h-11 px-3 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005596]"
              />
            </div>
          </div>
        </div>

        {/* 2. Horarios y Duración */}
        <div className="bg-white dark:bg-[#111c2e] border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase font-display">
            <Clock className="w-4 h-4 text-[#005596] dark:text-[#38bdf8]" />
            <span>2. Fecha, Despegue y Aterrizaje</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                Fecha Misión *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 px-2.5 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#005596]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                Despegue *
              </label>
              <input
                type="time"
                required
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                className="w-full h-11 px-2.5 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#005596]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                Aterrizaje *
              </label>
              <input
                type="time"
                required
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                className="w-full h-11 px-2.5 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#005596]"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-blue-50/70 dark:bg-sky-950/30 border border-blue-100 dark:border-sky-900/50 flex items-center justify-between">
            <span className="text-xs text-[#005596] dark:text-sky-300 font-semibold">
              Tiempo Oficial de Vuelo Computado:
            </span>
            <span className="font-mono font-bold text-sm text-[#005596] dark:text-sky-400">
              {Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m ({durationMinutes} min)
            </span>
          </div>
        </div>

        {/* 3. Localización y Coordenadas GNSS */}
        <div className="bg-white dark:bg-[#111c2e] border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase font-display">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>3. Ubicación y Espacio Aéreo Canario</span>
            </div>

            <button
              type="button"
              onClick={onOpenTacticalMap}
              className="text-xs font-semibold text-[#005596] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Seleccionar en Mapa</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                Lugar de Operación *
              </label>
              <input
                type="text"
                required
                value={spotName}
                onChange={(e) => setSpotName(e.target.value)}
                placeholder="Ej. Puerto de la Cruz, Tenerife"
                className="w-full h-11 px-3 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#005596]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                Municipio (Canarias) *
              </label>
              <input
                type="text"
                required
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                placeholder="Ej. Santa Cruz de Tenerife"
                className="w-full h-11 px-3 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#005596]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                Latitud GNSS
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                className="w-full h-11 px-3 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#005596]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                Longitud GNSS
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                className="w-full h-11 px-3 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#005596]"
              />
            </div>
          </div>
        </div>

        {/* 4. Telemetría de Batería & Consumo */}
        <div className="bg-white dark:bg-[#111c2e] border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase font-display">
            <BatteryCharging className="w-4 h-4 text-amber-500" />
            <span>4. Consumo Energético de Batería</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                Batería Inicial (%)
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={batStart}
                onChange={(e) => setBatStart(parseInt(e.target.value) || 100)}
                className="w-full h-11 px-3 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#005596]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                Batería Final (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={batEnd}
                onChange={(e) => setBatEnd(parseInt(e.target.value) || 0)}
                className="w-full h-11 px-3 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#005596]"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
            <span className="text-xs text-amber-800 dark:text-amber-300">
              Consumo Total de Misión:
            </span>
            <span className="font-mono font-bold text-sm text-amber-700 dark:text-amber-400">
              -{batteryConsumed}% (Remanente: {batEnd}%)
            </span>
          </div>
        </div>

        {/* 5. Meteorología y Notas */}
        <div className="bg-white dark:bg-[#111c2e] border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase font-display">
            <Wind className="w-4 h-4 text-[#005596] dark:text-[#38bdf8]" />
            <span>5. Condiciones Meteorológicas y Observaciones</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                Viento (km/h)
              </label>
              <input
                type="number"
                value={windKmH}
                onChange={(e) => setWindKmH(parseInt(e.target.value) || 0)}
                className="w-full h-11 px-3 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                Cielo / METAR
              </label>
              <input
                type="text"
                value={skyCondition}
                onChange={(e) => setSkyCondition(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
              Motivo u Objetivo de la Operación *
            </label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
              Observaciones Técnicas e Incidentes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-50 dark:bg-[#0a111c] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-13 bg-gradient-to-r from-[#005596] to-sky-600 hover:brightness-105 active:scale-[0.99] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all text-xs uppercase tracking-wider font-display cursor-pointer"
          >
            <Save className="w-5 h-5 text-sky-200" />
            <span>Guardar en Bitácora Oficial</span>
          </button>
        </div>
      </form>
    </div>
  );
};
