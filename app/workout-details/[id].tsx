import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Clock, Calendar, Dumbbell } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { WorkoutContext } from '@/context/WorkoutContext';
import { formatDate, formatDuration } from '@/utils/timeUtils';

export default function WorkoutDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workoutHistory } = useContext(WorkoutContext);
  const router = useRouter();

  const workout = workoutHistory.find(w => w.id === id);
  
  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workout Not Found</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Workout not found</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{workout.name}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.overviewCard}>
          <View style={styles.overviewItem}>
            <Calendar size={20} color={colors.primary} />
            <Text style={styles.overviewValue}>{formatDate(workout.date)}</Text>
            <Text style={styles.overviewLabel}>Date</Text>
          </View>
          
          <View style={styles.overviewDivider} />
          
          <View style={styles.overviewItem}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.overviewValue}>{formatDuration(workout.duration)}</Text>
            <Text style={styles.overviewLabel}>Duration</Text>
          </View>
          
          <View style={styles.overviewDivider} />
          
          <View style={styles.overviewItem}>
            <Dumbbell size={20} color={colors.primary} />
            <Text style={styles.overviewValue}>{workout.exercises.length}</Text>
            <Text style={styles.overviewLabel}>Exercises</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          
          {workout.exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseTitle}>{exercise.name}</Text>
                <Text style={styles.exerciseIndex}>{index + 1}</Text>
              </View>
              
              <View style={styles.setsContainer}>
                <View style={styles.setHeaderRow}>
                  <Text style={[styles.setCell, styles.setHeader, { flex: 1 }]}>SET</Text>
                  <Text style={[styles.setCell, styles.setHeader, { flex: 2 }]}>WEIGHT</Text>
                  <Text style={[styles.setCell, styles.setHeader, { flex: 2 }]}>REPS</Text>
                  <Text style={[styles.setCell, styles.setHeader, { flex: 2 }]}>COMPLETED</Text>
                </View>
                
                {exercise.sets?.map((set, setIndex) => (
                  <View key={set.id} style={styles.setRow}>
                    <Text style={[styles.setCell, { flex: 1 }]}>{setIndex + 1}</Text>
                    <Text style={[styles.setCell, { flex: 2 }]}>{set.weight || '-'}</Text>
                    <Text style={[styles.setCell, { flex: 2 }]}>{set.reps || '-'}</Text>
                    <View style={[styles.setCell, { flex: 2 }]}>
                      <View style={[styles.statusDot, set.completed ? styles.completedDot : styles.incompleteDot]} />
                    </View>
                  </View>
                ))}
              </View>
              
              {exercise.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{exercise.notes}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
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
  headerTitle: {
    ...typography.h2,
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.large,
  },
  errorText: {
    ...typography.h3,
    color: colors.text.secondary,
    marginBottom: spacing.large,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.medium,
    borderRadius: 8,
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
  },
  overviewCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: spacing.large,
    marginTop: spacing.large,
    borderRadius: 12,
    padding: spacing.large,
    justifyContent: 'space-between',
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.medium,
  },
  overviewValue: {
    ...typography.h3,
    marginTop: spacing.small,
  },
  overviewLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xsmall,
  },
  section: {
    margin: spacing.large,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.medium,
  },
  exerciseCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: spacing.large,
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.medium,
    backgroundColor: colors.cardAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exerciseTitle: {
    ...typography.h3,
  },
  exerciseIndex: {
    ...typography.bodyBold,
    color: colors.text.secondary,
  },
  setsContainer: {
    padding: spacing.medium,
  },
  setHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.small,
    marginBottom: spacing.small,
  },
  setHeader: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  setRow: {
    flexDirection: 'row',
    paddingVertical: spacing.small,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  setCell: {
    ...typography.body,
    paddingHorizontal: spacing.xsmall,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  completedDot: {
    backgroundColor: colors.success,
  },
  incompleteDot: {
    backgroundColor: colors.error,
  },
  notesContainer: {
    padding: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notesLabel: {
    ...typography.bodyBold,
    marginBottom: spacing.small,
  },
  notesText: {
    ...typography.body,
    color: colors.text.secondary,
  },
});