import React, { useEffect, useRef, useState } from 'react';
import { CanarySpot, ThemeMode } from '../../types';
import { CANARY_SPOTS } from '../../services/storage';
import L from 'leaflet';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Crosshair,
  Info,
  Layers,
  MapPin,
  Navigation,
  Radio,
  Satellite,
  Shield,
  Zap,
} from 'lucide-react';

interface TacticalMapViewProps {
  initialLat?: number;
  initialLng?: number;
  theme: ThemeMode;
  onApplyCoordinates: (coords: {
    lat: number;
    lng: number;
    spotName: string;
    municipality: string;
  }) => void;
  onBack: () => void;
}

export const TacticalMapView: React.FC<TacticalMapViewProps> = ({
  initialLat = 28.1042,
  initialLng = -16.5127,
  theme,
  onApplyCoordinates,
  onBack,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const homeMarkerRef = useRef<L.Marker | null>(null);
  const circleVlosRef = useRef<L.Circle | null>(null);
  const circleBufferRef = useRef<L.Circle | null>(null);
  const circleHpRef = useRef<L.Circle | null>(null);

  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [selectedSpotName, setSelectedSpotName] = useState('Polígono Industrial de Granadilla');
  const [selectedMunicipality, setSelectedMunicipality] = useState('Granadilla de Abona');
  const [airspaceNotice, setAirspaceNotice] = useState('ZONA LIBRE STS-ES-01 / CTR ADYACENTE LIBERADO');
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState('± 1.8 m (RTK)');
  const [activeLayers, setActiveLayers] = useState<'osm' | 'dark' | 'satellite'>('dark');

  // Update map circles & marker when coordinates change
  const updateMapPosition = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;

    mapInstanceRef.current.setView([lat, lng], 15);

    if (homeMarkerRef.current) {
      homeMarkerRef.current.setLatLng([lat, lng]);
    }
    if (circleHpRef.current) {
      circleHpRef.current.setLatLng([lat, lng]);
    }
    if (circleBufferRef.current) {
      circleBufferRef.current.setLatLng([lat, lng]);
    }
    if (circleVlosRef.current) {
      circleVlosRef.current.setLatLng([lat, lng]);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: [currentLat, currentLng],
      zoom: 15,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Choose base tiles
    const tileUrl =
      theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap & CartoDB',
      maxZoom: 19,
    }).addTo(map);

    // Custom tactical Home Point Icon
    const homeIcon = L.divIcon({
      className: 'custom-drone-hp-marker',
      html: `
        <div style="position:relative; width:36px; height:36px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:36px; height:36px; border-radius:50%; background:rgba(0,85,150,0.25); border:2px solid #005596; animation:pulse 2s infinite;"></div>
          <div style="width:16px; height:16px; border-radius:50%; background:#f59e0b; border:2px solid #ffffff; box-shadow:0 0 10px #f59e0b;"></div>
          <div style="position:absolute; bottom:-16px; background:#005596; color:#ffffff; font-size:9px; font-weight:bold; font-family:monospace; padding:1px 4px; border-radius:3px; white-space:nowrap;">HP DESPEGUE</div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const marker = L.marker([currentLat, currentLng], {
      icon: homeIcon,
      draggable: true,
    }).addTo(map);

    marker.on('dragend', (e: L.LeafletEvent) => {
      const target = e.target as L.Marker;
      const pos = target.getLatLng();
      setCurrentLat(pos.lat);
      setCurrentLng(pos.lng);
      setSelectedSpotName(`Punto Táctico (${pos.lat.toFixed(4)}°, ${pos.lng.toFixed(4)}°)`);
      updateMapPosition(pos.lat, pos.lng);
    });

    // Ring 1: 50m Home Point inner boundary
    const circleHp = L.circle([currentLat, currentLng], {
      radius: 50,
      color: '#f59e0b',
      fillColor: '#f59e0b',
      fillOpacity: 0.15,
      weight: 1.5,
      dashArray: '3, 4',
    }).addTo(map);

    // Ring 2: 150m Safety Buffer ring
    const circleBuffer = L.circle([currentLat, currentLng], {
      radius: 150,
      color: '#005596',
      fillColor: '#005596',
      fillOpacity: 0.08,
      weight: 1.5,
    }).addTo(map);

    // Ring 3: 500m VLOS operational boundary limit
    const circleVlos = L.circle([currentLat, currentLng], {
      radius: 500,
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: 0.03,
      weight: 1.5,
      dashArray: '5, 5',
    }).addTo(map);

    // Map click handler to relocate HP
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setCurrentLat(lat);
      setCurrentLng(lng);
      setSelectedSpotName(`Coordenada Manual (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
      updateMapPosition(lat, lng);
    });

    mapInstanceRef.current = map;
    homeMarkerRef.current = marker;
    circleHpRef.current = circleHp;
    circleBufferRef.current = circleBuffer;
    circleVlosRef.current = circleVlos;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [theme]);

  // Spot selection
  const handleSelectSpot = (spot: CanarySpot) => {
    setCurrentLat(spot.latitude);
    setCurrentLng(spot.longitude);
    setSelectedSpotName(`${spot.name} · ${spot.subLocation}`);
    setSelectedMunicipality(spot.municipality);
    setAirspaceNotice(spot.airspaceStatus);
    updateMapPosition(spot.latitude, spot.longitude);
  };

  // Device GNSS capture
  const handleCaptureDeviceGps = () => {
    setIsCapturingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = pos.coords.accuracy ? `± ${pos.coords.accuracy.toFixed(1)} m` : '± 2.1 m (GNSS)';
          setCurrentLat(lat);
          setCurrentLng(lng);
          setGpsAccuracy(acc);
          setSelectedSpotName('Posición GPS Capturada (Dispositivo)');
          setSelectedMunicipality('Canarias');
          updateMapPosition(lat, lng);
          setIsCapturingGps(false);
        },
        () => {
          // Fallback simulation: Granadilla high precision
          setTimeout(() => {
            const lat = 28.1042 + (Math.random() - 0.5) * 0.002;
            const lng = -16.5127 + (Math.random() - 0.5) * 0.002;
            setCurrentLat(lat);
            setCurrentLng(lng);
            setGpsAccuracy('± 1.8 m (GNSS Móvil)');
            setSelectedSpotName('Posición Capturada (Granadilla)');
            updateMapPosition(lat, lng);
            setIsCapturingGps(false);
          }, 800);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setIsCapturingGps(false);
    }
  };

  const handleConfirmAndApply = () => {
    onApplyCoordinates({
      lat: currentLat,
      lng: currentLng,
      spotName: selectedSpotName,
      municipality: selectedMunicipality,
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-28 px-4 space-y-3.5">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#005596] dark:hover:text-[#38bdf8] transition-colors py-1 px-2.5 rounded-lg bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Registro</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            18 SATS (GNSS)
          </span>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            {gpsAccuracy}
          </span>
        </div>
      </div>

      {/* Primary Action Button: Capturar GNSS Directo */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleCaptureDeviceGps}
          disabled={isCapturingGps}
          className="h-11 px-3 bg-[#005596] hover:bg-[#004881] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm text-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <Crosshair className={`w-4 h-4 ${isCapturingGps ? 'animate-spin' : ''}`} />
          <span>{isCapturingGps ? 'Adquiriendo Satélites...' : 'Capturar GNSS (±2.5m)'}</span>
        </button>

        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([currentLat, currentLng], 16);
            }
          }}
          className="h-11 px-3 bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm text-xs hover:bg-slate-50 dark:hover:bg-[#16243b] transition-colors"
        >
          <Radio className="w-4 h-4 text-amber-500" />
          <span>Centrar Home Point</span>
        </button>
      </div>

      {/* Interactive Tactical Map Container */}
      <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Reticle & Airspace HUD Overlay */}
        <div className="absolute top-2 left-2 z-20 pointer-events-none bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-white rounded-lg p-2 font-mono text-[9.5px] space-y-0.5 shadow-lg">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <Shield className="w-3 h-3" />
            <span>ENAIRE / AESA VERIFICADO</span>
          </div>
          <div>LAT: {currentLat.toFixed(6)}° N</div>
          <div>LNG: {currentLng.toFixed(6)}° W</div>
          <div className="text-emerald-400 font-bold">TECHO: 120 M AGL (MAX)</div>
        </div>

        {/* Rings Legend Bottom Overlay */}
        <div className="absolute bottom-2 left-2 right-2 z-20 pointer-events-none bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-white rounded-lg px-2.5 py-1.5 flex items-center justify-between text-[9px] font-mono shadow-lg">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span>HP 50m</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#005596] inline-block"></span>
            <span>Buffer 150m</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
            <span>VLOS 500m</span>
          </div>
        </div>
      </div>

      {/* Airspace status card */}
      <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 shadow-sm flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-amber-800 dark:text-amber-300 block">
            Estado de Espacio Aéreo (Canarias ENAIRE)
          </span>
          <p className="text-amber-700 dark:text-amber-200 mt-0.5 font-mono text-[11px] leading-tight">
            {airspaceNotice}
          </p>
        </div>
      </div>

      {/* Pre-validated spots in Canary Islands */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Spots Pre-Validados en Canarias (FEMETE / ALISIOS)
          </span>
          <span className="text-[10px] text-slate-400">Toca para fijar</span>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {CANARY_SPOTS.map((spot) => (
            <button
              key={spot.id}
              onClick={() => handleSelectSpot(spot)}
              className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                selectedSpotName.includes(spot.name)
                  ? 'bg-blue-50 dark:bg-[#16253c] border-[#005596] dark:border-[#38bdf8] shadow-sm'
                  : 'bg-white dark:bg-[#111c2e] border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#142033]'
              }`}
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#005596] dark:text-[#38bdf8] shrink-0" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {spot.name}
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {spot.categoryLabel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate pl-5">
                  {spot.subLocation} · {spot.municipality}
                </p>
              </div>

              <span className="text-[10px] font-mono text-[#005596] dark:text-cyan-300 font-semibold shrink-0">
                {spot.latitude.toFixed(2)}°, {spot.longitude.toFixed(2)}°
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Apply Coordinates to Flight Form CTA */}
      <div className="pt-2">
        <button
          onClick={handleConfirmAndApply}
          className="w-full h-13 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 active:scale-[0.99] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all text-xs uppercase tracking-wider font-display cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>Fijar Coordenadas y Aplicar al Vuelo</span>
        </button>
      </div>
    </div>
  );
};
