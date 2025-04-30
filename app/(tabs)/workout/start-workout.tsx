import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Play, Pause, Save, Plus, X, ArrowLeft, Trash2 } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { WorkoutContext } from '@/context/WorkoutContext';
import Timer from '@/components/common/Timer';
import { ExerciseSet, WorkoutExercise, WorkoutRoutine } from '@/types/workout';
import ExerciseCard from '@/components/workout/ExerciseCard';
import { formatDuration } from '@/utils/timeUtils';
import { generateUniqueId } from '@/utils/idUtils';

export default function StartWorkoutScreen() {
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const { routines, addWorkoutToHistory, deleteRoutine } = useContext(WorkoutContext);
  const router = useRouter();
  
  const [activeRoutine, setActiveRoutine] = useState<WorkoutRoutine | null>(null);
  const [workoutName, setWorkoutName] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentExercises, setCurrentExercises] = useState<WorkoutExercise[]>([]);
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Initialize workout from routine if routineId is provided
  useEffect(() => {
    if (routineId) {
      const routine = routines.find(r => r.id === routineId);
      if (routine) {
        setActiveRoutine(routine);
        setWorkoutName(routine.name);
        setCurrentExercises(routine.exercises.map(exercise => ({
          ...exercise,
          sets: exercise.sets || [{ id: generateUniqueId(), weight: '', reps: '', completed: false }],
        })));
      }
    } else {
      // Empty workout
      setWorkoutName('Quick Workout');
    }
  }, [routineId, routines]);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now() - elapsedTime * 1000;
      }
      
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setElapsedTime(elapsed);
        }
      }, 1000) as unknown as number;
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const addExercise = () => {
    const newExercise: WorkoutExercise = {
      id: generateUniqueId(),
      name: 'New Exercise',
      sets: [{ id: generateUniqueId(), weight: '', reps: '', completed: false }],
    };
    setCurrentExercises([...currentExercises, newExercise]);
  };

  const updateExerciseName = (exerciseId: string, name: string) => {
    setCurrentExercises(
      currentExercises.map(ex => 
        ex.id === exerciseId ? { ...ex, name } : ex
      )
    );
  };

  const addSet = (exerciseId: string) => {
    setCurrentExercises(
      currentExercises.map(ex => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: [...(ex.sets || []), { id: generateUniqueId(), weight: '', reps: '', completed: false }]
          };
        }
        return ex;
      })
    );
  };

  const updateSet = (exerciseId: string, setId: string, field: keyof ExerciseSet, value: any) => {
    setCurrentExercises(
      currentExercises.map(ex => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets?.map(set => 
              set.id === setId ? { ...set, [field]: value } : set
            )
          };
        }
        return ex;
      })
    );
  };

  const toggleSetCompletion = (exerciseId: string, setId: string) => {
    setCurrentExercises(
      currentExercises.map(ex => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets?.map(set => 
              set.id === setId ? { ...set, completed: !set.completed } : set
            )
          };
        }
        return ex;
      })
    );
  };

  const removeExercise = (exerciseId: string) => {
    setCurrentExercises(currentExercises.filter(ex => ex.id !== exerciseId));
  };

  const completeWorkout = () => {
    if (currentExercises.length === 0) {
      Alert.alert('Empty Workout', 'Please add at least one exercise before completing the workout.');
      return;
    }

    const completedWorkout = {
      id: generateUniqueId(),
      name: workoutName,
      date: new Date().toISOString(),
      duration: elapsedTime,
      exercises: currentExercises,
      totalSets: currentExercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0),
      completedSets: currentExercises.reduce(
        (sum, ex) => sum + (ex.sets?.filter(set => set.completed)?.length || 0), 
        0
      ),
    };

    addWorkoutToHistory(completedWorkout);
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <TextInput
          style={styles.workoutNameInput}
          value={workoutName}
          onChangeText={setWorkoutName}
          placeholder="Workout Name"
          placeholderTextColor={colors.text.secondary}
        />
      </View>

      <View style={styles.timerContainer}>
        <Timer time={elapsedTime} isRunning={isTimerRunning} />
        <TouchableOpacity 
          style={[
            styles.timerButton, 
            isTimerRunning ? styles.timerButtonRunning : {}
          ]}
          onPress={toggleTimer}
        >
          {isTimerRunning ? (
            <Pause size={24} color={colors.white} />
          ) : (
            <Play size={24} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.exercisesContainer}>
        {currentExercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onUpdateName={(name) => updateExerciseName(exercise.id, name)}
            onAddSet={() => addSet(exercise.id)}
            onUpdateSet={(setId, field, value) => updateSet(exercise.id, setId, field, value)}
            onToggleSet={(setId) => toggleSetCompletion(exercise.id, setId)}
            onRemove={() => removeExercise(exercise.id)}
          />
        ))}

        <TouchableOpacity style={styles.addExerciseButton} onPress={addExercise}>
          <Plus size={20} color={colors.primary} />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.workoutStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{formatDuration(elapsedTime)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Exercises</Text>
            <Text style={styles.statValue}>{currentExercises.length}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Sets</Text>
            <Text style={styles.statValue}>
              {currentExercises.reduce((sum, ex) => sum + (ex.sets?.filter(set => set.completed)?.length || 0), 0)}/
              {currentExercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0)}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.completeButton} onPress={completeWorkout}>
          <Save size={20} color={colors.white} />
          <Text style={styles.completeButtonText}>Complete Workout</Text>
        </TouchableOpacity>

        {activeRoutine && (
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => {
              Alert.alert('Delete Routine', 'Are you sure you want to delete this routine?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => {
                    deleteRoutine(activeRoutine.id);
                    router.replace('/(tabs)/workout');
                  } 
                }
              ]);
            }}
          >
            <Trash2 size={20} color={colors.white} />
            <Text style={styles.deleteButtonText}>Delete Routine</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.large,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.small,
    marginRight: spacing.medium,
  },
  workoutNameInput: {
    flex: 1,
    ...typography.h2,
    padding: spacing.small,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.large,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timerButton: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerButtonRunning: {
    backgroundColor: colors.accent,
  },
  exercisesContainer: {
    flex: 1,
    paddingHorizontal: spacing.large,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.medium,
    marginVertical: spacing.large,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  addExerciseText: {
    ...typography.button,
    color: colors.primary,
    marginLeft: spacing.small,
  },
  footer: {
    padding: spacing.large,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.medium,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statValue: {
    ...typography.h3,
  },
  completeButton: {
    backgroundColor: colors.success,
    borderRadius: 8,
    padding: spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    ...typography.button,
    color: colors.white,
    marginLeft: spacing.small,
  },
  deleteButton: {
    backgroundColor: colors.error,
    borderRadius: 8,
    padding: spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.medium,
  },
  deleteButtonText: {
    ...typography.button,
    color: colors.white,
    marginLeft: spacing.small,
  },
});