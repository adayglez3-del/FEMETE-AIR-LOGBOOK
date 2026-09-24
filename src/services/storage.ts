import { FlightRecord, Drone, BatteryPack, PilotProfile, CanarySpot } from '../types';

const STORAGE_FLIGHTS_KEY = 'femete_air_logbook_flights_v4';
const STORAGE_DRONES_KEY = 'femete_air_logbook_drones_v4';
const STORAGE_BATTERIES_KEY = 'femete_air_logbook_batteries_v4';
const STORAGE_PILOT_KEY = 'femete_air_logbook_pilot_v4';
const STORAGE_PILOTS_ROSTER_KEY = 'femete_air_logbook_pilots_roster_v4';
const STORAGE_GOOGLE_ACCOUNTS_KEY = 'femete_air_logbook_google_accounts_v4';
const STORAGE_THEME_KEY = 'femete_air_logbook_theme_v4';

// Automatic cleanup of legacy data so all counters start clean at 0
try {
  if (typeof localStorage !== 'undefined') {
    [
      'femete_air_logbook_flights_v1',
      'femete_air_logbook_flights_v2',
      'femete_air_logbook_flights_v3',
      'femete_air_logbook_drones_v1',
      'femete_air_logbook_drones_v2',
      'femete_air_logbook_drones_v3',
      'femete_air_logbook_batteries_v1',
      'femete_air_logbook_batteries_v2',
      'femete_air_logbook_batteries_v3',
    ].forEach((k) => localStorage.removeItem(k));
  }
} catch {
  // Ignored
}

export const INITIAL_PILOT: PilotProfile = {
  name: '',
  dni: '',
  aesaOperatorId: '',
  email: '',
  trainingEntity: 'FEMETE Aeronáutica / EASA',
  baseLocation: 'Santa Cruz de Tenerife / Canarias',
  ratings: ['STS-ES-01', 'STS-ES-02', 'A1 / A2 / A3', 'Radiofonista RPAS'],
  isAuthenticated: false,
  activeRole: 'Piloto al Mando (PIC)',
  isSeniorPilot: false,
  previousAccreditedHours: 0,
  previousAccreditedMinutes: 0,
  previousAccreditationEntity: '',
  previousAccreditationDoc: '',
  previousAccreditationDate: '',
};

export const INITIAL_DRONES: Drone[] = [
  {
    id: 'drone-m300',
    manufacturer: 'DJI',
    model: 'DJI Matrice 300 RTK',
    serialNumber: '3ABC98240182',
    registration: 'EC-941-TF',
    mtomGrams: 9000,
    operationalClass: 'C3 / Específica',
    acquisitionDate: '2024-01-15',
    totalFlightMinutes: 0,
    totalMissions: 0,
    status: 'ready',
    statusLabel: 'Listo para vuelo',
    batteryType: 'TB60 Pack Dual',
    batteryPacksCount: 6,
    batteryHealthPct: 100,
    nextInspectionHours: 50,
    payloadNotes: 'Sensor LiDAR Zenmuse L1 y cámara termográfica H20T con firmware certificado.',
    propellerStatus: 'Juegos 2110 Revisados OK',
    lastMissionDate: '',
  },
  {
    id: 'drone-m3e',
    manufacturer: 'DJI',
    model: 'DJI Mavic 3 Enterprise',
    serialNumber: '1581F4Z7829',
    registration: 'EC-204-TF',
    mtomGrams: 1050,
    operationalClass: 'C2 / Estándar',
    acquisitionDate: '2023-06-10',
    totalFlightMinutes: 0,
    totalMissions: 0,
    status: 'ready',
    statusLabel: 'Listo para vuelo',
    batteryType: 'Intelligent Flight LiPo 4S',
    batteryPacksCount: 4,
    batteryHealthPct: 100,
    nextInspectionHours: 50,
    payloadNotes: 'Cámara mecánica 20MP y teleobjetivo híbrido 56x.',
    propellerStatus: 'Revisadas OK',
    lastMissionDate: '',
  },
  {
    id: 'drone-mini4',
    manufacturer: 'DJI',
    model: 'DJI Mini 4 Pro',
    serialNumber: '1581F6H1209',
    registration: 'ESP-DRN-0042',
    mtomGrams: 249,
    operationalClass: 'C0 / Abierta A1',
    acquisitionDate: '2023-11-05',
    totalFlightMinutes: 0,
    totalMissions: 0,
    status: 'ready',
    statusLabel: 'Operativo',
    batteryType: 'Plus Intelligent Flight Bat',
    batteryPacksCount: 3,
    batteryHealthPct: 100,
    nextInspectionHours: 50,
    payloadNotes: 'Sensor CMOS 1/1.3 pulgadas con detección de obstáculos omnidireccional.',
    propellerStatus: 'Juego A-B Revisadas OK',
    lastMissionDate: '',
  },
];

export const INITIAL_BATTERIES: BatteryPack[] = [
  {
    id: 'bat-tb60-alpha',
    name: 'DJI TB60 Pair Alpha',
    model: 'TB60 5935 mAh',
    droneModel: 'DJI Matrice 300 RTK',
    cycles: 0,
    maxCycles: 200,
    healthPct: 100,
    avgVoltage: 52.8,
    status: 'excellent',
  },
  {
    id: 'bat-tb60-bravo',
    name: 'DJI TB60 Pair Bravo',
    model: 'TB60 5935 mAh',
    droneModel: 'DJI Matrice 300 RTK',
    cycles: 0,
    maxCycles: 200,
    healthPct: 100,
    avgVoltage: 52.8,
    status: 'excellent',
  },
  {
    id: 'bat-m3e-1',
    name: 'Intelligent Flight Bat #1',
    model: 'Mavic 3 Ent LiPo 4S',
    droneModel: 'DJI Mavic 3 Enterprise',
    cycles: 0,
    maxCycles: 150,
    healthPct: 100,
    avgVoltage: 15.4,
    status: 'excellent',
  },
  {
    id: 'bat-mini4-1',
    name: 'Mini 4 Pro Flight Bat #A',
    model: 'DJI Mini Intelligent LiPo',
    droneModel: 'DJI Mini 4 Pro',
    cycles: 0,
    maxCycles: 200,
    healthPct: 100,
    avgVoltage: 7.7,
    status: 'excellent',
  },
];

export const CANARY_SPOTS: CanarySpot[] = [
  {
    id: 'granadilla',
    name: 'Polígono Industrial de Granadilla',
    subLocation: 'Parcela E-14 (Pista de Ensayos RPAS)',
    municipality: 'Granadilla de Abona',
    island: 'Tenerife',
    latitude: 28.1042,
    longitude: -16.5127,
    category: 'industrial',
    categoryLabel: 'ZONA INDUSTRIAL',
    airspaceStatus: 'ZONA LIBRE STS-ES-01 / CTR ADYACENTE LIBERADO',
    maxAgl: 120,
    isSTSAllowed: true,
  },
  {
    id: 'darsena',
    name: 'Dársena Pesquera de Santa Cruz',
    subLocation: 'Zona Portuaria y Astilleros Navales',
    municipality: 'Santa Cruz de Tenerife',
    island: 'Tenerife',
    latitude: 28.4912,
    longitude: -16.2235,
    category: 'port',
    categoryLabel: 'PORTUARIO',
    airspaceStatus: 'ESPACIO PORTUARIO AUTORIZADO - PROTOCOLO PUERTO S/C',
    maxAgl: 60,
    isSTSAllowed: true,
  },
  {
    id: 'arico',
    name: 'Parque Eólico de Arico',
    subLocation: 'Parque Eólico Chimiche - Aerogeneradores T-04',
    municipality: 'Arico',
    island: 'Tenerife',
    latitude: 28.152,
    longitude: -16.489,
    category: 'industrial',
    categoryLabel: 'ENERGÍA EÓLICA',
    airspaceStatus: 'ZONA LIBRE BVLOS STS-ES-02 / AGL 120M',
    maxAgl: 120,
    isSTSAllowed: true,
  },
  {
    id: 'guimar',
    name: 'Valle de Güímar',
    subLocation: 'Finca Experimental y Prácticas Agrícolas',
    municipality: 'Güímar',
    island: 'Tenerife',
    latitude: 28.318,
    longitude: -16.4021,
    category: 'agriculture',
    categoryLabel: 'AGRÍCOLA / FORESTAL',
    airspaceStatus: 'ESPACIO G LIBRE DE CONTROL - VUELO VISUAL VLOS',
    maxAgl: 120,
    isSTSAllowed: true,
  },
  {
    id: 'los_rodeos',
    name: 'Entorno R33 San Cristóbal de La Laguna',
    subLocation: 'Perímetro CTR Tenerife Norte',
    municipality: 'La Laguna',
    island: 'Tenerife',
    latitude: 28.482,
    longitude: -16.341,
    category: 'ctr_controlled',
    categoryLabel: 'CTR COORDINADO',
    airspaceStatus: 'CTR R33 EN VIGOR - REQUIERE EARO & COORDINACIÓN TORRE TFN',
    maxAgl: 45,
    isSTSAllowed: false,
  },
];

export const INITIAL_FLIGHTS: FlightRecord[] = [];

// Offline storage functions
export const StorageService = {
  getFlights(): FlightRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_FLIGHTS_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_FLIGHTS_KEY, JSON.stringify(INITIAL_FLIGHTS));
        return INITIAL_FLIGHTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_FLIGHTS;
    }
  },

  saveFlight(flight: FlightRecord): FlightRecord[] {
    const flights = this.getFlights();
    const existingIndex = flights.findIndex((f) => f.id === flight.id);
    let updated: FlightRecord[];
    if (existingIndex >= 0) {
      updated = [...flights];
      updated[existingIndex] = flight;
    } else {
      updated = [flight, ...flights];
    }
    localStorage.setItem(STORAGE_FLIGHTS_KEY, JSON.stringify(updated));

    // Also update drone accumulated hours and battery cycles
    this.updateDroneFlightHours(flight.droneId, flight.durationMinutes);
    this.updateBatteryUsage(flight.batteryPackId, flight.batConsumed);
    return updated;
  },

  deleteFlight(id: string): FlightRecord[] {
    const flights = this.getFlights();
    const updated = flights.filter((f) => f.id !== id);
    localStorage.setItem(STORAGE_FLIGHTS_KEY, JSON.stringify(updated));
    return updated;
  },

  getInitialCleanDrones(): Drone[] {
    return INITIAL_DRONES.map((d) => ({
      ...d,
      totalFlightMinutes: 0,
      totalMissions: 0,
      lastMissionDate: '',
    }));
  },

  getInitialCleanBatteries(): BatteryPack[] {
    return INITIAL_BATTERIES.map((b) => ({
      ...b,
      cycles: 0,
    }));
  },

  computeDronesFromFlights(flights: FlightRecord[], baseDrones?: Drone[]): Drone[] {
    const drones = (baseDrones || this.getDrones()).map((d) => ({
      ...d,
      totalFlightMinutes: 0,
      totalMissions: 0,
      lastMissionDate: '',
    }));

    for (const flight of flights) {
      const drone = drones.find((d) => d.id === flight.droneId || d.model === flight.droneModel);
      if (drone) {
        drone.totalFlightMinutes += flight.durationMinutes || 0;
        drone.totalMissions += 1;
        if (!drone.lastMissionDate || (flight.date && flight.date > drone.lastMissionDate)) {
          drone.lastMissionDate = flight.date;
        }
      }
    }
    return drones;
  },

  computeBatteriesFromFlights(flights: FlightRecord[], baseBatteries?: BatteryPack[]): BatteryPack[] {
    const batteries = (baseBatteries || this.getBatteries()).map((b) => ({
      ...b,
      cycles: 0,
    }));

    for (const flight of flights) {
      if (!flight.batteryPackId) continue;
      const battery = batteries.find((b) => b.id === flight.batteryPackId);
      if (battery) {
        const inc = flight.batConsumed && flight.batConsumed > 0 ? Math.max(1, Math.round(flight.batConsumed / 70)) : 1;
        battery.cycles += inc;
      }
    }
    return batteries;
  },

  getDrones(): Drone[] {
    try {
      const data = localStorage.getItem(STORAGE_DRONES_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_DRONES_KEY, JSON.stringify(INITIAL_DRONES));
        return INITIAL_DRONES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_DRONES;
    }
  },

  addDrone(drone: Drone): Drone[] {
    const drones = this.getDrones();
    const updated = [drone, ...drones];
    localStorage.setItem(STORAGE_DRONES_KEY, JSON.stringify(updated));
    return updated;
  },

  updateDroneFlightHours(droneId: string, additionalMinutes: number): void {
    const drones = this.getDrones();
    const target = drones.find((d) => d.id === droneId);
    if (target) {
      target.totalFlightMinutes += additionalMinutes;
      target.totalMissions += 1;
      target.lastMissionDate = new Date().toISOString().split('T')[0];
      localStorage.setItem(STORAGE_DRONES_KEY, JSON.stringify(drones));
    }
  },

  updateBatteryUsage(batteryPackId?: string, batConsumed?: number): void {
    if (!batteryPackId) return;
    const batteries = this.getBatteries();
    const target = batteries.find((b) => b.id === batteryPackId);
    if (target) {
      const inc = batConsumed && batConsumed > 0 ? Math.max(1, Math.round(batConsumed / 70)) : 1;
      target.cycles += inc;
      localStorage.setItem(STORAGE_BATTERIES_KEY, JSON.stringify(batteries));
    }
  },

  getBatteries(): BatteryPack[] {
    try {
      const data = localStorage.getItem(STORAGE_BATTERIES_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_BATTERIES_KEY, JSON.stringify(INITIAL_BATTERIES));
        return INITIAL_BATTERIES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_BATTERIES;
    }
  },

  getPilot(): PilotProfile {
    try {
      const data = localStorage.getItem(STORAGE_PILOT_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_PILOT_KEY, JSON.stringify(INITIAL_PILOT));
        return INITIAL_PILOT;
      }
      const parsed: PilotProfile = JSON.parse(data);
      // Clean up previous hardcoded Alejandro Ramos Hernández to leave space for new pilots
      if (parsed.name === 'Alejandro Ramos Hernández' || parsed.email === 'piloto.alramos@gmail.com') {
        localStorage.setItem(STORAGE_PILOT_KEY, JSON.stringify(INITIAL_PILOT));
        return INITIAL_PILOT;
      }
      return parsed;
    } catch {
      return INITIAL_PILOT;
    }
  },

  savePilot(profile: PilotProfile): void {
    localStorage.setItem(STORAGE_PILOT_KEY, JSON.stringify(profile));
    // Also update roster if named
    if (profile.name && profile.name.trim()) {
      this.savePilotToRoster(profile);
    }
    // Also update dedicated Google account store if linked or has googleEmail
    const targetEmail = profile.googleEmail || (profile.isGoogleLinked ? profile.email : null);
    if (targetEmail) {
      this.saveGoogleAccount(targetEmail, profile);
    }
  },

  getSavedGoogleAccounts(): Record<string, PilotProfile> {
    try {
      const data = localStorage.getItem(STORAGE_GOOGLE_ACCOUNTS_KEY);
      if (!data) return {};
      return JSON.parse(data);
    } catch {
      return {};
    }
  },

  getSavedGoogleAccount(email: string): PilotProfile | null {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    const accounts = this.getSavedGoogleAccounts();
    if (accounts[normalized]) return accounts[normalized];
    // Also check roster
    const roster = this.getPilotRoster();
    const found = roster.find(
      (p) =>
        (p.email && p.email.toLowerCase() === normalized) ||
        (p.googleEmail && p.googleEmail.toLowerCase() === normalized)
    );
    return found || null;
  },

  saveGoogleAccount(email: string, profile: PilotProfile): void {
    try {
      if (!email) return;
      const normalized = email.trim().toLowerCase();
      const accounts = this.getSavedGoogleAccounts();
      accounts[normalized] = {
        ...profile,
        googleEmail: normalized,
        isGoogleLinked: true,
      };
      localStorage.setItem(STORAGE_GOOGLE_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch {
      // Ignored
    }
  },

  linkGoogleAccount(userData: { uid?: string; name: string; email: string; avatarUrl?: string }): PilotProfile {
    const normalizedEmail = userData.email.trim().toLowerCase();
    const existing = this.getSavedGoogleAccount(normalizedEmail);

    let profileToActivate: PilotProfile;

    if (existing) {
      // PRESERVE all previously configured and loaded data (DNI, AESA operator ID, senior pilot hours, certifications, etc.)
      profileToActivate = {
        ...existing,
        uid: userData.uid || existing.uid,
        name: userData.name || existing.name || 'Piloto Google',
        email: normalizedEmail,
        googleEmail: normalizedEmail,
        avatarUrl: userData.avatarUrl || existing.avatarUrl,
        isAuthenticated: true,
        isGoogleLinked: true,
        googleLinkedAt: new Date().toISOString(),
        aesaOperatorId:
          existing.aesaOperatorId && existing.aesaOperatorId.trim()
            ? existing.aesaOperatorId
            : `ESP-RPAS-${Math.floor(10000000 + Math.random() * 90000000)}CAN`,
      };
    } else {
      // Create new profile with clean defaults but persistent registration
      const generatedOperator = `ESP-RPAS-${Math.floor(10000000 + Math.random() * 90000000)}CAN`;
      profileToActivate = {
        ...INITIAL_PILOT,
        uid: userData.uid,
        name: userData.name || 'Piloto Google',
        email: normalizedEmail,
        googleEmail: normalizedEmail,
        avatarUrl:
          userData.avatarUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'Piloto')}&background=005596&color=fff&size=128`,
        aesaOperatorId: generatedOperator,
        dni: '',
        trainingEntity: 'FEMETE Aeronáutica / EASA',
        baseLocation: 'Santa Cruz de Tenerife / Canarias',
        ratings: ['STS-ES-01', 'STS-ES-02', 'A1 / A2 / A3', 'Radiofonista RPAS'],
        isAuthenticated: true,
        isGoogleLinked: true,
        googleLinkedAt: new Date().toISOString(),
        activeRole: 'Piloto al Mando (PIC)',
        isSeniorPilot: false,
        previousAccreditedHours: 0,
        previousAccreditedMinutes: 0,
      };
    }

    // Save as active pilot
    this.savePilot(profileToActivate);
    // Save into dedicated Google accounts registry
    this.saveGoogleAccount(normalizedEmail, profileToActivate);
    // Save to roster
    this.savePilotToRoster(profileToActivate);

    return profileToActivate;
  },

  unlinkGoogleAccount(): PilotProfile {
    try {
      // 1. Save current pilot's data before unlinking so nothing is lost
      const current = this.getPilot();
      if (current && (current.email || current.googleEmail)) {
        const email = (current.googleEmail || current.email).trim().toLowerCase();
        this.saveGoogleAccount(email, { ...current, isGoogleLinked: false, isAuthenticated: false });
        this.savePilotToRoster({ ...current, isAuthenticated: false, isGoogleLinked: false });
      }

      // 2. Disable GIS automatic re-selection if present
      if (typeof window !== 'undefined') {
        try {
          (window as any).google?.accounts?.id?.disableAutoSelect?.();
        } catch {
          // Ignored
        }
      }

      // 3. Create fresh blank unlinked pilot and reset stored data to zero
      const blank = this.createBlankPilot();
      localStorage.setItem(STORAGE_PILOT_KEY, JSON.stringify(blank));
      localStorage.setItem(STORAGE_FLIGHTS_KEY, JSON.stringify([]));
      localStorage.setItem(STORAGE_DRONES_KEY, JSON.stringify(this.getInitialCleanDrones()));
      localStorage.setItem(STORAGE_BATTERIES_KEY, JSON.stringify(this.getInitialCleanBatteries()));
      return blank;
    } catch {
      return this.createBlankPilot();
    }
  },

  getPilotRoster(): PilotProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_PILOTS_ROSTER_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  savePilotToRoster(profile: PilotProfile): void {
    try {
      if (!profile.name || !profile.name.trim()) return;
      const roster = this.getPilotRoster();
      const existingIdx = roster.findIndex(
        (p) =>
          (p.email && profile.email && p.email.toLowerCase() === profile.email.toLowerCase()) ||
          (p.googleEmail && profile.googleEmail && p.googleEmail.toLowerCase() === profile.googleEmail.toLowerCase()) ||
          (p.dni && profile.dni && p.dni.toLowerCase() === profile.dni.toLowerCase()) ||
          p.name.toLowerCase() === profile.name.toLowerCase()
      );
      if (existingIdx >= 0) {
        roster[existingIdx] = profile;
      } else {
        roster.push(profile);
      }
      localStorage.setItem(STORAGE_PILOTS_ROSTER_KEY, JSON.stringify(roster));
    } catch {
      // Ignored
    }
  },

  removePilotFromRoster(identifier: string): PilotProfile[] {
    try {
      const roster = this.getPilotRoster();
      const lower = identifier.toLowerCase().trim();
      const updated = roster.filter(
        (p) =>
          p.name.toLowerCase().trim() !== lower &&
          p.email.toLowerCase().trim() !== lower &&
          (!p.googleEmail || p.googleEmail.toLowerCase().trim() !== lower) &&
          (!p.dni || p.dni.toLowerCase().trim() !== lower)
      );
      localStorage.setItem(STORAGE_PILOTS_ROSTER_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return this.getPilotRoster();
    }
  },

  createBlankPilot(): PilotProfile {
    return { ...INITIAL_PILOT };
  },

  getTheme(): 'dark' | 'light' {
    try {
      const saved = localStorage.getItem(STORAGE_THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
      return 'dark'; // Default to AeroHUD Dark Ops
    } catch {
      return 'dark';
    }
  },

  setTheme(theme: 'dark' | 'light'): void {
    localStorage.setItem(STORAGE_THEME_KEY, theme);
  },

  resetAllData(): void {
    localStorage.setItem(STORAGE_FLIGHTS_KEY, JSON.stringify(INITIAL_FLIGHTS));
    localStorage.setItem(STORAGE_DRONES_KEY, JSON.stringify(INITIAL_DRONES));
    localStorage.setItem(STORAGE_BATTERIES_KEY, JSON.stringify(INITIAL_BATTERIES));
    localStorage.setItem(STORAGE_PILOT_KEY, JSON.stringify(INITIAL_PILOT));
  },

  exportToCSV(): string {
    const flights = this.getFlights();
    const headers = [
      'ID_Mision',
      'Fecha',
      'Hora_Despegue',
      'Hora_Aterrizaje',
      'Duracion_Min',
      'Dron_Modelo',
      'Matricula',
      'Escenario_AESA',
      'Ubicacion_Spot',
      'Municipio',
      'Latitud',
      'Longitud',
      'Altitud_Max_AGL',
      'Consumo_Bateria_Pct',
      'Viento_KmH',
      'Piloto_Al_Mando',
      'Licencia_AESA',
      'Hash_Certificado',
      'Observaciones',
    ];

    const rows = flights.map((f) => [
      `"${f.id}"`,
      `"${f.date}"`,
      `"${f.timeStart}"`,
      `"${f.timeEnd}"`,
      f.durationMinutes,
      `"${f.droneModel}"`,
      `"${f.droneRegistration}"`,
      `"${f.scenario}"`,
      `"${f.locationName.replace(/"/g, '""')}"`,
      `"${f.municipality}"`,
      f.latitude,
      f.longitude,
      f.maxAglMeters,
      f.batConsumed,
      f.windKmH,
      `"${f.pilotName}"`,
      `"${f.pilotLicense}"`,
      `"${f.officialHash}"`,
      `"${f.notes.replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  getCareerTotals(flights: FlightRecord[], pilot: PilotProfile) {
    const previousMinutes = ((pilot.previousAccreditedHours || 0) * 60) + (pilot.previousAccreditedMinutes || 0);
    const appMinutes = flights.reduce((acc, f) => acc + f.durationMinutes, 0);
    const totalMinutes = previousMinutes + appMinutes;
    const totalHours = Math.floor(totalMinutes / 60);
    const totalRemMinutes = totalMinutes % 60;

    return {
      previousMinutes,
      appMinutes,
      totalMinutes,
      totalHours,
      totalRemMinutes,
      previousHoursFormatted: `${pilot.previousAccreditedHours || 0}h ${String(pilot.previousAccreditedMinutes || 0).padStart(2, '0')}m`,
      appHoursFormatted: `${Math.floor(appMinutes / 60)}h ${String(appMinutes % 60).padStart(2, '0')}m`,
      totalHoursFormatted: `${totalHours}h ${String(totalRemMinutes).padStart(2, '0')}m`,
    };
  },
};
