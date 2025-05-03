import React, { createContext, useContext, useState, useEffect } from 'react';
import { WorkoutRoutine, WorkoutSummary } from '@/types/workout';
import { auth, db } from '@/FirebaseConfig'; // Import auth and db
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot, // For real-time updates
  Timestamp, // Import Timestamp
  getDoc, // Add this import for fetching single documents
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { useUser } from './UserContext'; // Optional: Can use UserContext to get user status

interface PersonalRecord {
  id: string;
  name: string;
  value: string;
  date: string;
}

interface WorkoutContextProps {
  routines: WorkoutRoutine[];
  workoutHistory: WorkoutSummary[];
  personalRecords: PersonalRecord[];
  addRoutine: (routine: Omit<WorkoutRoutine, 'id' | 'createdAt'>) => Promise<string | null>; // Return new ID or null
  updateRoutine: (updatedRoutine: WorkoutRoutine) => Promise<void>;
  deleteRoutine: (routineId: string) => Promise<void>;
  addWorkoutToHistory: (workout: Omit<WorkoutSummary, 'id' | 'date'>) => Promise<string | null>; // Return new ID or null
  deleteWorkout: (workoutId: string) => Promise<void>;
  loading: boolean; // Add loading state
}

export const WorkoutContext = createContext<WorkoutContextProps>({
  routines: [],
  workoutHistory: [],
  personalRecords: [],
  addRoutine: async () => null,
  updateRoutine: async () => {},
  deleteRoutine: async () => {},
  addWorkoutToHistory: async () => null,
  deleteWorkout: async () => {},
  loading: true,
});

export const useWorkout = () => useContext(WorkoutContext);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser(); // Add this to access user data
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSummary[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([
    { id: '1', name: 'Bench Press', value: '0 kg', date: '' },
    { id: '2', name: 'Squat', value: '0 kg', date: '' },
    { id: '3', name: 'Deadlift', value: '0 kg', date: '' },
  ]);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Listen for Auth state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setFirebaseUser(currentUser);
      if (!currentUser) {
        // Clear data on logout
        setRoutines([]);
        setWorkoutHistory([]);
        setLoading(false);
      }
      // Data loading triggered by firebaseUser change below
    });
    return () => unsubscribeAuth();
  }, []);

  // Load/Listen for Routines when user is logged in
  useEffect(() => {
    if (firebaseUser) {
      setLoading(true);
      const routinesColRef = collection(db, 'users', firebaseUser.uid, 'routines');
      const q = query(routinesColRef, orderBy('createdAt', 'desc')); // Order routines if needed

      const unsubscribeRoutines = onSnapshot(q, (snapshot) => {
        const loadedRoutines = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "Unnamed Routine", // Explicitly include the name property
            ...data,
            // Convert Firestore Timestamps to string
            createdAt: ((data.createdAt as Timestamp)?.toDate() || new Date()).toISOString(),
            exercises: data.exercises?.map((ex: any) => ({
              ...ex,
              // Ensure nested Timestamps are converted if they exist
            })) || []
          } as WorkoutRoutine;
        });
        setRoutines(loadedRoutines);
        // Consider setting loading false after both listeners are active or data is fetched
      }, (error) => {
        console.error("Error listening to routines:", error);
        setRoutines([]);
        setLoading(false);
      });

      return () => unsubscribeRoutines();
    } else {
      setRoutines([]); // Clear if no user
    }
  }, [firebaseUser]);

  // Load/Listen for Workout History when user is logged in
  useEffect(() => {
    if (firebaseUser) {
      setLoading(true); // Ensure loading is true when starting fetch
      const historyColRef = collection(db, 'users', firebaseUser.uid, 'workoutHistory');
      const q = query(historyColRef, orderBy('date', 'desc')); // Order history

      const unsubscribeHistory = onSnapshot(q, (snapshot) => {
        const loadedHistory = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "Unknown workout",
            duration: data.duration || 0,
            exercises: data.exercises || [],
            totalSets: data.totalSets || 0,
            completedSets: data.completedSets || 0,
            date: ((data.date as Timestamp)?.toDate() || new Date()).toISOString(),
          } as WorkoutSummary;
        });
        setWorkoutHistory(loadedHistory);
        setLoading(false); // Set loading false after history is loaded/updated
      }, (error) => {
        console.error("Error listening to workout history:", error);
        setWorkoutHistory([]);
        setLoading(false);
      });

      return () => unsubscribeHistory();
    } else {
      setWorkoutHistory([]); // Clear if no user
      setLoading(false); // Ensure loading is false if no user
    }
  }, [firebaseUser]);

  // Load personal records from Firestore
  useEffect(() => {
    if (firebaseUser) {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists() && docSnap.data().personalRecords) {
          setPersonalRecords(docSnap.data().personalRecords);
        } else {
          // Initialize user's personal records
          updateDoc(userDocRef, {
            personalRecords: personalRecords
          });
        }
      });
    }
  }, [firebaseUser]);

  // --- Firestore Modification Functions ---

  const addRoutine = async (routineData: Omit<WorkoutRoutine, 'id' | 'createdAt'>): Promise<string | null> => {
    if (!firebaseUser) return null;
    try {
      const routinesColRef = collection(db, 'users', firebaseUser.uid, 'routines');
      const docRef = await addDoc(routinesColRef, {
        ...routineData,
        createdAt: Timestamp.now(), // Use Firestore Timestamp
      });
      return docRef.id; // Return the new document ID
    } catch (error) {
      console.error('Failed to add routine:', error);
      return null;
    }
  };

  const updateRoutine = async (updatedRoutine: WorkoutRoutine) => {
    if (!firebaseUser || !updatedRoutine.id) return;
    try {
      const routineDocRef = doc(db, 'users', firebaseUser.uid, 'routines', updatedRoutine.id);
      // Prepare data, ensuring Dates are converted to Timestamps if needed before saving
      const { id, ...dataToUpdate } = updatedRoutine;
      const saveData = {
        ...dataToUpdate,
        // Ensure createdAt is a Timestamp if it exists in the object
        createdAt: dataToUpdate.createdAt ? Timestamp.fromDate(new Date(dataToUpdate.createdAt)) : Timestamp.now(),
      };
      await updateDoc(routineDocRef, saveData);
    } catch (error) {
      console.error('Failed to update routine:', error);
    }
  };

  const deleteRoutine = async (routineId: string) => {
    if (!firebaseUser) return;
    try {
      const routineDocRef = doc(db, 'users', firebaseUser.uid, 'routines', routineId);
      await deleteDoc(routineDocRef);
    } catch (error) {
      console.error('Failed to delete routine:', error);
    }
  };

  const addWorkoutToHistory = async (workoutData: Omit<WorkoutSummary, 'id' | 'date'>): Promise<string | null> => {
    if (!firebaseUser) return null;
    try {
      // Add workout to history as before
      const historyColRef = collection(db, 'users', firebaseUser.uid, 'workoutHistory');
      const docRef = await addDoc(historyColRef, {
        ...workoutData,
        date: Timestamp.now(),
      });
      
      // Check for personal records
      let updatedRecords = false;
      const newRecords = [...personalRecords];
      
      // Check each exercise
      workoutData.exercises.forEach(exercise => {
        if (!exercise.sets || exercise.sets.length === 0) return;
        
        // Get max weight from completed sets
        const completedSets = exercise.sets.filter(set => set.completed);
        if (completedSets.length === 0) return;
        
        // Find max weight
        let maxWeight = 0;
        completedSets.forEach(set => {
          const weight = parseFloat(set.weight);
          if (!isNaN(weight) && weight > maxWeight) {
            maxWeight = weight;
          }
        });
        
        if (maxWeight <= 0) return;
        
        // Check against records
        const exerciseName = exercise.name.toLowerCase();
        let recordName = '';
        
        if (exerciseName.includes('bench press')) recordName = 'Bench Press';
        else if (exerciseName.includes('squat')) recordName = 'Squat';
        else if (exerciseName.includes('deadlift')) recordName = 'Deadlift';
        
        if (recordName) {
          const recordIndex = newRecords.findIndex(r => r.name === recordName);
          if (recordIndex >= 0) {
            const currentRecord = parseFloat(newRecords[recordIndex].value);
            if (isNaN(currentRecord) || maxWeight > currentRecord) {
              // New PR - update record
              newRecords[recordIndex] = {
                ...newRecords[recordIndex],
                value: `${maxWeight} ${user?.preferences?.useMetric ? 'kg' : 'lbs'}`,
                date: new Date().toISOString()
              };
              updatedRecords = true;
            }
          }
        }
      });
      
      // Save updated records if needed
      if (updatedRecords) {
        setPersonalRecords(newRecords);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        await updateDoc(userDocRef, { personalRecords: newRecords });
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Failed to add workout history:', error);
      return null;
    }
  };

  const deleteWorkout = async (workoutId: string) => {
     if (!firebaseUser) return;
     try {
       const workoutDocRef = doc(db, 'users', firebaseUser.uid, 'workoutHistory', workoutId);
       await deleteDoc(workoutDocRef);
     } catch (error) {
       console.error('Failed to delete workout history:', error);
     }
   };

  return (
    <WorkoutContext.Provider value={{ routines, workoutHistory, personalRecords, addRoutine, updateRoutine, deleteRoutine, addWorkoutToHistory, deleteWorkout, loading }}>
      {children}
    </WorkoutContext.Provider>
  );
};

// Add this function to your app somewhere and call it once
async function fixMissingRoutineNames() {
  if (!auth.currentUser) return;
  
  const routinesColRef = collection(db, 'users', auth.currentUser.uid, 'routines');
  const snapshot = await getDocs(routinesColRef);
  
  const updates = snapshot.docs
    .filter(doc => !doc.data().name)
    .map(doc => {
      const docRef = doc.ref;
      return updateDoc(docRef, {
        name: 'Routine ' + new Date(doc.data().createdAt?.toDate() || new Date()).toLocaleDateString()
      });
    });
    
  await Promise.all(updates);
  console.log(`Fixed ${updates.length} routines with missing names`);
}