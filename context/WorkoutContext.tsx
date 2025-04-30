import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutRoutine, WorkoutSummary } from '@/types/workout';
import { initialRoutines, initialWorkoutHistory } from '@/data/initialData';

interface WorkoutContextProps {
  routines: WorkoutRoutine[];
  workoutHistory: WorkoutSummary[];
  addRoutine: (routine: WorkoutRoutine) => void;
  updateRoutine: (routine: WorkoutRoutine) => void;
  deleteRoutine: (routineId: string) => void;
  addWorkoutToHistory: (workout: WorkoutSummary) => void;
  deleteWorkout: (workoutId: string) => void;
}

export const WorkoutContext = createContext<WorkoutContextProps>({
  routines: [],
  workoutHistory: [],
  addRoutine: () => {},
  updateRoutine: () => {},
  deleteRoutine: () => {},
  addWorkoutToHistory: () => {},
  deleteWorkout: () => {},
});

export const useWorkout = () => useContext(WorkoutContext);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSummary[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const routinesData = await AsyncStorage.getItem('routines');
        const historyData = await AsyncStorage.getItem('workoutHistory');
        
        if (routinesData) {
          setRoutines(JSON.parse(routinesData));
        } else {
          // Load initial data if no data exists
          setRoutines(initialRoutines);
        }
        
        if (historyData) {
          setWorkoutHistory(JSON.parse(historyData));
        } else {
          // Load initial data if no data exists
          setWorkoutHistory(initialWorkoutHistory);
        }
      } catch (error) {
        console.error('Failed to load workout data:', error);
        // Fallback to initial data if there's an error
        setRoutines(initialRoutines);
        setWorkoutHistory(initialWorkoutHistory);
      }
      
      setIsInitialized(true);
    };

    loadData();
  }, []);

  // Save data to AsyncStorage whenever it changes
  useEffect(() => {
    const saveData = async () => {
      if (!isInitialized) return;
      
      try {
        await AsyncStorage.setItem('routines', JSON.stringify(routines));
        await AsyncStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
      } catch (error) {
        console.error('Failed to save workout data:', error);
      }
    };

    saveData();
  }, [routines, workoutHistory, isInitialized]);

  const addRoutine = (routine: WorkoutRoutine) => {
    setRoutines(prevRoutines => [...prevRoutines, routine]);
  };

  const updateRoutine = (updatedRoutine: WorkoutRoutine) => {
    setRoutines(prevRoutines => 
      prevRoutines.map(routine => 
        routine.id === updatedRoutine.id ? updatedRoutine : routine
      )
    );
  };

  const deleteRoutine = (routineId: string) => {
    setRoutines(prevRoutines => 
      prevRoutines.filter(routine => routine.id !== routineId)
    );
  };

  const addWorkoutToHistory = (workout: WorkoutSummary) => {
    setWorkoutHistory(prevHistory => [workout, ...prevHistory]);
  };

  const deleteWorkout = (workoutId: string) => {
    setWorkoutHistory(prevHistory => 
      prevHistory.filter(workout => workout.id !== workoutId)
    );
  };

  return (
    <WorkoutContext.Provider value={{
      routines,
      workoutHistory,
      addRoutine,
      updateRoutine,
      deleteRoutine,
      addWorkoutToHistory,
      deleteWorkout,
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};