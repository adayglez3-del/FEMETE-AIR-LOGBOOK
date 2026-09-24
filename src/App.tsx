import React, { useEffect, useState } from 'react';
import {
  BatteryPack,
  Drone,
  FlightRecord,
  NavigationTab,
  PilotProfile,
  ThemeMode,
} from './types';
import { StorageService, INITIAL_PILOT } from './services/storage';
import {
  auth,
  onAuthStateChanged,
  type User,
  signOutAuth,
  fetchUserProfileFirestore,
  saveUserProfileFirestore,
  saveUserFlightFirestore,
  deleteUserFlightFirestore,
  subscribeToUserFlights,
} from './services/firebase';
import { TopBar } from './components/navigation/TopBar';
import { BottomNav } from './components/navigation/BottomNav';
import { SplashView } from './components/views/SplashView';
import { AuthView } from './components/views/AuthView';
import { DashboardView } from './components/views/DashboardView';
import { FlightLogView } from './components/views/FlightLogView';
import { NewFlightFormView } from './components/views/NewFlightFormView';
import { TacticalMapView } from './components/views/TacticalMapView';
import { FleetView } from './components/views/FleetView';
import { ReportsView } from './components/views/ReportsView';
import { WifiOff } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => StorageService.getTheme());
  const [currentTab, setCurrentTab] = useState<NavigationTab>('splash');
  const [flights, setFlights] = useState<FlightRecord[]>([]);
  const [drones, setDrones] = useState<Drone[]>(() => StorageService.getInitialCleanDrones());
  const [batteries, setBatteries] = useState<BatteryPack[]>(() => StorageService.getInitialCleanBatteries());
  const [pilot, setPilot] = useState<PilotProfile>(() => StorageService.getPilot());
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Prefilled spot from map
  const [prefilledLocation, setPrefilledLocation] = useState<{
    lat: number;
    lng: number;
    spotName: string;
    municipality: string;
  } | undefined>(undefined);

  // Sync theme class on <html> and <body>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.className = 'bg-[#051424] text-slate-100 antialiased select-none overflow-x-hidden min-h-screen';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      document.body.className = 'bg-[#f8f9ff] text-slate-900 antialiased select-none overflow-x-hidden min-h-screen';
    }
    StorageService.setTheme(theme);
  }, [theme]);

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Firebase Auth State Listener & Cloud Sync (usuarios/{uid}/vuelos)
  useEffect(() => {
    let unsubscribeFlightsListener: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (unsubscribeFlightsListener) {
        unsubscribeFlightsListener();
        unsubscribeFlightsListener = null;
      }

      if (firebaseUser) {
        // 1. User is authenticated with Firebase Auth
        const uid = firebaseUser.uid;

        // Fetch user profile from Firestore: usuarios/{uid}
        let profile = await fetchUserProfileFirestore(uid);

        if (!profile) {
          // If profile document does not exist yet, build initial profile
          const localMatch = StorageService.getSavedGoogleAccount(firebaseUser.email || '');
          profile = {
            ...(localMatch || INITIAL_PILOT),
            uid,
            name: firebaseUser.displayName || localMatch?.name || 'Piloto Google',
            email: firebaseUser.email || localMatch?.email || '',
            googleEmail: firebaseUser.email || localMatch?.googleEmail || '',
            avatarUrl:
              firebaseUser.photoURL ||
              localMatch?.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                firebaseUser.displayName || 'Piloto'
              )}&background=005596&color=fff&size=128`,
            isAuthenticated: true,
            isGoogleLinked: true,
            googleLinkedAt: new Date().toISOString(),
            aesaOperatorId:
              localMatch?.aesaOperatorId || `ESP-RPAS-${Math.floor(10000000 + Math.random() * 90000000)}CAN`,
          };
          await saveUserProfileFirestore(uid, profile);
        } else {
          profile = {
            ...profile,
            uid,
            isAuthenticated: true,
            isGoogleLinked: true,
          };
        }

        setPilot(profile);
        StorageService.savePilot(profile);

        // 2. Subscribe in real time to usuarios/{uid}/vuelos
        unsubscribeFlightsListener = subscribeToUserFlights(uid, (userFlights) => {
          setFlights(userFlights);
          setDrones(StorageService.computeDronesFromFlights(userFlights));
          setBatteries(StorageService.computeBatteriesFromFlights(userFlights));
        });
      } else {
        // 3. User logged out: empty all state and show app at zero
        setFlights([]);
        const blank = StorageService.createBlankPilot();
        setPilot(blank);
        setDrones(StorageService.getInitialCleanDrones());
        setBatteries(StorageService.getInitialCleanBatteries());
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFlightsListener) {
        unsubscribeFlightsListener();
      }
    };
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSaveFlight = async (newFlight: FlightRecord) => {
    const uid = pilot.uid || auth.currentUser?.uid;
    const flightRecordWithUser: FlightRecord = {
      ...newFlight,
      userId: uid || undefined,
    };

    if (uid) {
      // Save directly under usuarios/{uid}/vuelos/{id}
      await saveUserFlightFirestore(uid, flightRecordWithUser);
      // Optimistic local update
      setFlights((prev) => {
        const idx = prev.findIndex((f) => f.id === flightRecordWithUser.id);
        const next = idx >= 0 ? prev.map((f, i) => (i === idx ? flightRecordWithUser : f)) : [flightRecordWithUser, ...prev];
        setDrones(StorageService.computeDronesFromFlights(next));
        setBatteries(StorageService.computeBatteriesFromFlights(next));
        return next;
      });
    } else {
      // Offline fallback
      const updated = StorageService.saveFlight(flightRecordWithUser);
      setFlights(updated);
      setDrones(StorageService.computeDronesFromFlights(updated));
      setBatteries(StorageService.computeBatteriesFromFlights(updated));
    }

    setCurrentTab('flights');
  };

  const handleDeleteFlight = async (id: string) => {
    const uid = pilot.uid || auth.currentUser?.uid;
    if (uid) {
      // Delete from Firestore under usuarios/{uid}/vuelos/{id}
      await deleteUserFlightFirestore(uid, id);
      setFlights((prev) => {
        const next = prev.filter((f) => f.id !== id);
        setDrones(StorageService.computeDronesFromFlights(next));
        setBatteries(StorageService.computeBatteriesFromFlights(next));
        return next;
      });
    } else {
      const updated = StorageService.deleteFlight(id);
      setFlights(updated);
      setDrones(StorageService.computeDronesFromFlights(updated));
      setBatteries(StorageService.computeBatteriesFromFlights(updated));
    }
  };

  const handleLogout = async () => {
    try {
      await signOutAuth();
    } catch (err) {
      console.error('Error logging out from Firebase:', err);
    }
    StorageService.unlinkGoogleAccount();
    // Vaciar todo el estado y mostrar la app a cero
    setFlights([]);
    setPilot(StorageService.createBlankPilot());
    setDrones(StorageService.getInitialCleanDrones());
    setBatteries(StorageService.getInitialCleanBatteries());
    setCurrentTab('dashboard');
  };

  const handleAddDrone = (newDrone: Drone) => {
    const updated = StorageService.addDrone(newDrone);
    setDrones(updated);
  };

  const handleResetData = async () => {
    const uid = pilot.uid || auth.currentUser?.uid;
    if (uid) {
      // Delete flights for this user in Firestore
      for (const flight of flights) {
        await deleteUserFlightFirestore(uid, flight.id);
      }
    }
    StorageService.resetAllData();
    setFlights([]);
    setDrones(StorageService.getInitialCleanDrones());
    setBatteries(StorageService.getInitialCleanBatteries());
    setPilot(StorageService.createBlankPilot());
  };

  const handleApplyCoordinatesFromMap = (coords: {
    lat: number;
    lng: number;
    spotName: string;
    municipality: string;
  }) => {
    setPrefilledLocation(coords);
    setCurrentTab('new-flight');
  };

  const showTopBar = currentTab !== 'splash';
  const showBottomNav =
    currentTab !== 'splash' &&
    currentTab !== 'auth' &&
    currentTab !== 'new-flight' &&
    currentTab !== 'tactical-map';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-[#051424] text-slate-100 radar-grid-dark'
          : 'bg-[#f8f9ff] text-slate-900 radar-grid-light'
      }`}
    >
      {/* Top Header Bar */}
      {showTopBar && (
        <TopBar
          currentTab={currentTab}
          onNavigate={(tab) => setCurrentTab(tab)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          pilot={pilot}
        />
      )}

      {/* Main Content View Container */}
      <main className={`flex-1 w-full max-w-lg mx-auto ${showTopBar ? 'pt-20' : 'pt-2'}`}>
        {currentTab === 'splash' && (
          <SplashView
            onEnter={() => setCurrentTab('dashboard')}
            onOpenProfile={() => setCurrentTab('auth')}
            theme={theme}
          />
        )}

        {currentTab === 'auth' && (
          <AuthView
            pilot={pilot}
            onUpdatePilot={(updated) => setPilot(updated)}
            onContinue={() => setCurrentTab('dashboard')}
            onBack={() => setCurrentTab('dashboard')}
            theme={theme}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            flights={flights}
            pilot={pilot}
            theme={theme}
            onNavigateToNewFlight={() => setCurrentTab('new-flight')}
            onNavigateToFlights={() => setCurrentTab('flights')}
            onNavigateToFleet={() => setCurrentTab('fleet')}
            onNavigateToReports={() => setCurrentTab('reports')}
            onNavigateToMap={() => setCurrentTab('tactical-map')}
            onNavigateToAuth={() => setCurrentTab('auth')}
            onUpdatePilot={(updated) => setPilot(updated)}
            onLogout={handleLogout}
          />
        )}

        {currentTab === 'flights' && (
          <FlightLogView
            flights={flights}
            pilot={pilot}
            theme={theme}
            onNavigateToNewFlight={() => setCurrentTab('new-flight')}
            onDeleteFlight={handleDeleteFlight}
          />
        )}

        {currentTab === 'new-flight' && (
          <NewFlightFormView
            drones={drones}
            pilot={pilot}
            theme={theme}
            prefilledLocation={prefilledLocation}
            onSaveFlight={handleSaveFlight}
            onAddDrone={handleAddDrone}
            onOpenTacticalMap={() => setCurrentTab('tactical-map')}
            onCancel={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'tactical-map' && (
          <TacticalMapView
            initialLat={prefilledLocation?.lat || 28.1042}
            initialLng={prefilledLocation?.lng || -16.5127}
            theme={theme}
            onApplyCoordinates={handleApplyCoordinatesFromMap}
            onBack={() => setCurrentTab('new-flight')}
          />
        )}

        {currentTab === 'fleet' && (
          <FleetView drones={drones} theme={theme} onAddDrone={handleAddDrone} />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            flights={flights}
            pilot={pilot}
            batteries={batteries}
            theme={theme}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      {showBottomNav && (
        <BottomNav currentTab={currentTab} onNavigate={(tab) => setCurrentTab(tab)} />
      )}

      {/* Offline Status Float Indicator */}
      {!isOnline && (
        <div className="fixed bottom-20 left-4 z-40 flex items-center gap-2 rounded-xl bg-amber-500 text-slate-950 px-3 py-1.5 text-xs font-bold shadow-lg">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Modo Sin Conexión · Almacenamiento Local Activo</span>
        </div>
      )}
    </div>
  );
}
