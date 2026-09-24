import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { FlightRecord, PilotProfile } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID (CRITICAL)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export { onAuthStateChanged, type User };

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validation connection to Firestore on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

// Trigger connection test
testConnection();

// --- Auth Methods ---
export async function signInWithGoogleAuth(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutAuth(): Promise<void> {
  await signOut(auth);
}

// --- Firestore Operations for 'usuarios/{uid}/vuelos' and 'usuarios/{uid}' ---

/**
 * Fetch all flights under usuarios/{uid}/vuelos
 */
export async function fetchUserFlights(uid: string): Promise<FlightRecord[]> {
  const flightsPath = `usuarios/${uid}/vuelos`;
  try {
    const querySnapshot = await getDocs(collection(db, 'usuarios', uid, 'vuelos'));
    const flights: FlightRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      flights.push({
        id: docSnap.id,
        userId: uid,
        ...data,
      } as FlightRecord);
    });
    // Sort flights by date descending, timeStart descending
    return flights.sort((a, b) => {
      const dateDiff = new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      if (dateDiff !== 0) return dateDiff;
      return (b.timeStart || '').localeCompare(a.timeStart || '');
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, flightsPath);
    return [];
  }
}

/**
 * Save or update a flight under usuarios/{uid}/vuelos/{flightId}
 */
export async function saveUserFlightFirestore(uid: string, flight: FlightRecord): Promise<void> {
  const flightDocPath = `usuarios/${uid}/vuelos/${flight.id}`;
  try {
    const flightRef = doc(db, 'usuarios', uid, 'vuelos', flight.id);
    const flightPayload = {
      ...flight,
      userId: uid,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(flightRef, flightPayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, flightDocPath);
  }
}

/**
 * Delete a flight under usuarios/{uid}/vuelos/{flightId}
 */
export async function deleteUserFlightFirestore(uid: string, flightId: string): Promise<void> {
  const flightDocPath = `usuarios/${uid}/vuelos/${flightId}`;
  try {
    const flightRef = doc(db, 'usuarios', uid, 'vuelos', flightId);
    await deleteDoc(flightRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, flightDocPath);
  }
}

/**
 * Fetch user pilot profile under usuarios/{uid}
 */
export async function fetchUserProfileFirestore(uid: string): Promise<PilotProfile | null> {
  const userDocPath = `usuarios/${uid}`;
  try {
    const userDocRef = doc(db, 'usuarios', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as PilotProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userDocPath);
    return null;
  }
}

/**
 * Save or update user pilot profile under usuarios/{uid}
 */
export async function saveUserProfileFirestore(uid: string, profile: PilotProfile): Promise<void> {
  const userDocPath = `usuarios/${uid}`;
  try {
    const userDocRef = doc(db, 'usuarios', uid);
    const profilePayload = {
      ...profile,
      uid,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(userDocRef, profilePayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userDocPath);
  }
}

/**
 * Real-time listener for flights under usuarios/{uid}/vuelos
 */
export function subscribeToUserFlights(
  uid: string,
  onFlightsUpdated: (flights: FlightRecord[]) => void
): () => void {
  const flightsPath = `usuarios/${uid}/vuelos`;
  const flightsColRef = collection(db, 'usuarios', uid, 'vuelos');

  const unsubscribe = onSnapshot(
    flightsColRef,
    (snapshot) => {
      const flights: FlightRecord[] = [];
      snapshot.forEach((docSnap) => {
        flights.push({
          id: docSnap.id,
          userId: uid,
          ...docSnap.data(),
        } as FlightRecord);
      });
      flights.sort((a, b) => {
        const dateDiff = new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        if (dateDiff !== 0) return dateDiff;
        return (b.timeStart || '').localeCompare(a.timeStart || '');
      });
      onFlightsUpdated(flights);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, flightsPath);
    }
  );

  return unsubscribe;
}
