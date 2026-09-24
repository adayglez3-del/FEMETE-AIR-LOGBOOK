export type ThemeMode = 'dark' | 'light';

export type NavigationTab =
  | 'splash'
  | 'auth'
  | 'dashboard'
  | 'flights'
  | 'new-flight'
  | 'tactical-map'
  | 'fleet'
  | 'reports';

export type OperationalScenario =
  | 'STS-ES-01'
  | 'STS-ES-02'
  | 'Abierta (A1 / A3)'
  | 'Abierta A2'
  | 'Específica (PDRA / SORA)'
  | 'LUC Autorizado FEMETE';

export interface FlightRecord {
  id: string;
  userId?: string;
  date: string;
  droneId: string;
  droneModel: string;
  droneRegistration: string;
  locationName: string;
  municipality: string;
  latitude: number;
  longitude: number;
  scenario: OperationalScenario;
  purpose: string;
  timeStart: string; // HH:mm
  timeEnd: string;   // HH:mm
  durationMinutes: number;
  batStart: number;  // %
  batEnd: number;    // %
  batConsumed: number; // %
  batteryPackId: string;
  windKmH: number;
  windDir: string;
  skyCondition: string;
  tempC: number;
  maxAglMeters: number;
  distanceKm: number;
  notes: string;
  pilotName: string;
  pilotLicense: string;
  verifiedAesa: boolean;
  officialHash: string;
}

export interface Drone {
  id: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  registration: string;
  mtomGrams: number;
  operationalClass: string;
  acquisitionDate: string;
  totalFlightMinutes: number;
  totalMissions: number;
  status: 'ready' | 'warning' | 'maintenance';
  statusLabel: string;
  batteryType: string;
  batteryPacksCount: number;
  batteryHealthPct: number;
  nextInspectionHours: number;
  payloadNotes: string;
  propellerStatus: string;
  lastMissionDate: string;
}

export interface BatteryPack {
  id: string;
  name: string;
  model: string;
  droneModel: string;
  cycles: number;
  maxCycles: number;
  healthPct: number;
  avgVoltage: number;
  status: 'excellent' | 'nominal' | 'review';
}

export interface PilotProfile {
  uid?: string;
  name: string;
  dni: string;
  aesaOperatorId: string;
  email: string;
  trainingEntity: string;
  baseLocation: string;
  ratings: string[];
  isAuthenticated: boolean;
  activeRole: string;
  avatarUrl?: string;
  googleEmail?: string;
  isGoogleLinked?: boolean;
  googleLinkedAt?: string;
  // Senior pilot & previous accredited flight hours:
  isSeniorPilot?: boolean;
  previousAccreditedHours?: number;
  previousAccreditedMinutes?: number;
  previousAccreditationEntity?: string;
  previousAccreditationDoc?: string;
  previousAccreditationDate?: string;
}

export interface CanarySpot {
  id: string;
  name: string;
  subLocation: string;
  municipality: string;
  island: string;
  latitude: number;
  longitude: number;
  category: 'industrial' | 'port' | 'agriculture' | 'ctr_controlled';
  categoryLabel: string;
  airspaceStatus: string;
  maxAgl: number;
  isSTSAllowed: boolean;
}
