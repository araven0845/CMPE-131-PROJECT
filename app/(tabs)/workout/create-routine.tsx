import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';
import { WorkoutContext } from '@/context/WorkoutContext';
import { WorkoutExercise, WorkoutRoutine } from '@/types/workout';
import { generateUniqueId } from '@/utils/idUtils';
import ExerciseDatabase from '@/components/workout/ExerciseDatabase';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function CreateRoutineScreen() {
  const { addRoutine } = useContext(WorkoutContext);
  const router = useRouter();
  
  const [routineName, setRoutineName] = useState('New Routine');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [showExerciseDatabase, setShowExerciseDatabase] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const updateExerciseName = (exerciseId: string, name: string) => {
    setExercises(
      exercises.map(ex => 
        ex.id === exerciseId ? { ...ex, name } : ex
      )
    );
  };

  const addEmptyExercise = () => {
    const newExercise: WorkoutExercise = {
      id: generateUniqueId(),
      name: 'New Exercise',
      targetSets: 3,
      targetReps: 10,
      notes: ''
    };
    setExercises([...exercises, newExercise]);
  };

  const addExerciseFromDatabase = (exerciseName: string) => {
    const newExercise: WorkoutExercise = {
      id: generateUniqueId(),
      name: exerciseName,
      targetSets: 3,
      targetReps: 10,
      notes: ''
    };
    setExercises([...exercises, newExercise]);
    setShowExerciseDatabase(false);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const updateExerciseDetail = (exerciseId: string, field: keyof WorkoutExercise, value: any) => {
    setExercises(
      exercises.map(ex => 
        ex.id === exerciseId ? { ...ex, [field]: value } : ex
      )
    );
  };

  const moveExercise = (exerciseId: string, direction: 'up' | 'down') => {
    const index = exercises.findIndex(ex => ex.id === exerciseId);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === exercises.length - 1)
    ) {
      return;
    }

    const newExercises = [...exercises];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newExercises[index], newExercises[targetIndex]] = [newExercises[targetIndex], newExercises[index]];
    setExercises(newExercises);
  };

  const saveRoutine = () => {
    if (routineName.trim() === '') {
      Alert.alert('Invalid Name', 'Please enter a valid routine name.');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('Empty Routine', 'Please add at least one exercise to your routine.');
      return;
    }

    const newRoutine: WorkoutRoutine = {
      id: generateUniqueId(),
      name: routineName,
      exercises: exercises,
      createdAt: new Date().toISOString(),
    };

    addRoutine(newRoutine);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <AntDesign name="arrowleft" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <TextInput
          style={styles.routineNameInput}
          value={routineName}
          onChangeText={setRoutineName}
          placeholder="Routine Name"
          placeholderTextColor={colors.text.secondary}
        />
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveRoutine}
        >
          <Feather name="save" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {!showExerciseDatabase ? (
        <>
          <ScrollView style={styles.exercisesContainer}>
            {exercises.map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <TextInput
                    style={styles.exerciseNameInput}
                    value={exercise.name}
                    onChangeText={(text) => updateExerciseName(exercise.id, text)}
                    placeholder="Exercise Name"
                    placeholderTextColor={colors.text.secondary}
                  />
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeExercise(exercise.id)}
                  >
                    <Feather name="x" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.exerciseDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Target Sets:</Text>
                    <TextInput
                      style={styles.detailInput}
                      value={exercise.targetSets?.toString() || ''}
                      onChangeText={(text) => updateExerciseDetail(exercise.id, 'targetSets', parseInt(text) || 0)}
                      keyboardType="number-pad"
                      placeholder="3"
                      placeholderTextColor={colors.text.secondary}
                    />
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Target Reps:</Text>
                    <TextInput
                      style={styles.detailInput}
                      value={exercise.targetReps?.toString() || ''}
                      onChangeText={(text) => updateExerciseDetail(exercise.id, 'targetReps', parseInt(text) || 0)}
                      keyboardType="number-pad"
                      placeholder="10"
                      placeholderTextColor={colors.text.secondary}
                    />
                  </View>

                  <View style={styles.notesContainer}>
                    <Text style={styles.detailLabel}>Notes:</Text>
                    <TextInput
                      style={styles.notesInput}
                      value={exercise.notes || ''}
                      onChangeText={(text) => updateExerciseDetail(exercise.id, 'notes', text)}
                      placeholder="Add notes about this exercise..."
                      placeholderTextColor={colors.text.secondary}
                      multiline
                    />
                  </View>

                  <View style={styles.reorderButtons}>
                    <TouchableOpacity 
                      style={[styles.reorderButton, index === 0 ? styles.disabledButton : {}]}
                      onPress={() => moveExercise(exercise.id, 'up')}
                      disabled={index === 0}
                    >
                      <Text style={styles.reorderButtonText}>Move Up</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.reorderButton, index === exercises.length - 1 ? styles.disabledButton : {}]}
                      onPress={() => moveExercise(exercise.id, 'down')}
                      disabled={index === exercises.length - 1}
                    >
                      <Text style={styles.reorderButtonText}>Move Down</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.addButtonsContainer}>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={addEmptyExercise}
              >
                <Feather name="plus" size={20} color={colors.white} />
                <Text style={styles.addButtonText}>Add Custom Exercise</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.addButton, styles.browseButton]}
                onPress={() => setShowExerciseDatabase(true)}
              >
                <Feather name="search" size={20} color={colors.white} />
                <Text style={styles.addButtonText}>Browse Exercise Database</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.saveRoutineButton}
              onPress={saveRoutine}
            >
              <Feather name="save" size={20} color={colors.white} />
              <Text style={styles.saveRoutineText}>Save Routine</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <ExerciseDatabase 
          onSelectExercise={addExerciseFromDatabase}
          onClose={() => setShowExerciseDatabase(false)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}
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
  routineNameInput: {
    flex: 1,
    ...typography.h2,
    padding: spacing.small,
  },
  saveButton: {
    padding: spacing.medium,
  },
  exercisesContainer: {
    flex: 1,
    padding: spacing.large,
  },
  exerciseCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: spacing.large,
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.cardAlt,
  },
  exerciseNameInput: {
    flex: 1,
    ...typography.h3,
    padding: spacing.small,
  },
  removeButton: {
    padding: spacing.small,
  },
  exerciseDetails: {
    padding: spacing.medium,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.medium,
  },
  detailLabel: {
    ...typography.bodyBold,
    flex: 1,
  },
  detailInput: {
    ...typography.body,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: spacing.small,
    textAlign: 'center',
  },
  notesContainer: {
    marginBottom: spacing.medium,
  },
  notesInput: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: spacing.small,
    height: 80,
    textAlignVertical: 'top',
    marginTop: spacing.small,
  },
  reorderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.small,
  },
  reorderButton: {
    flex: 1,
    backgroundColor: colors.cardAlt,
    padding: spacing.small,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: spacing.xsmall,
  },
  reorderButtonText: {
    ...typography.buttonSmall,
    color: colors.text.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  addButtonsContainer: {
    marginBottom: spacing.xlarge,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.medium,
  },
  browseButton: {
    backgroundColor: colors.accent,
  },
  addButtonText: {
    ...typography.button,
    color: colors.white,
    marginLeft: spacing.small,
  },
  footer: {
    padding: spacing.large,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveRoutineButton: {
    backgroundColor: colors.success,
    borderRadius: 8,
    padding: spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveRoutineText: {
    ...typography.button,
    color: colors.white,
    marginLeft: spacing.small,
  },
});