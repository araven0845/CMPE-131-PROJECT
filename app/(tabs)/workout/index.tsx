import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Play, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';
import RoutineCard from '@/components/workout/RoutineCard';
import { useWorkout } from '@/context/WorkoutContext';

export default function WorkoutScreen() {
  const router = useRouter();
  const { routines } = useWorkout();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Workouts</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start Workout</Text>
          <Text style={styles.sectionDescription}>
            Choose one of your saved routines or create a new one
          </Text>

          <View style={styles.routinesList}>
            {routines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onPress={() => router.push(`/workout/start-workout?routineId=${routine.id}`)}
              />
            ))}
            
            {routines.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No Routines Found</Text>
                <Text style={styles.emptySubtext}>
                  Create your first workout routine to get started
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create Routine</Text>
          <Text style={styles.sectionDescription}>
            Build a new workout routine from scratch
          </Text>
          
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => router.push('/workout/create-routine')}
          >
            <Plus size={24} color={colors.white} />
            <Text style={styles.createButtonText}>Create New Routine</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickStartSection}>
          <Text style={styles.quickStartTitle}>Quick Start</Text>
          <TouchableOpacity 
            style={styles.quickStartButton}
            onPress={() => router.push('/workout/start-workout')}
          >
            <Play size={24} color={colors.white} />
            <Text style={styles.quickStartText}>Start Empty Workout</Text>
          </TouchableOpacity>
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
    padding: spacing.large,
    paddingBottom: spacing.medium,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.small,
  },
  section: {
    marginBottom: spacing.xlarge,
    paddingHorizontal: spacing.large,
  },
  sectionTitle: {
    ...typography.h2,
  },
  sectionDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.medium,
  },
  routinesList: {
    marginTop: spacing.medium,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    padding: spacing.xlarge,
    borderRadius: 12,
    marginTop: spacing.medium,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.small,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.large,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.medium,
  },
  createButtonText: {
    color: colors.white,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginLeft: spacing.small,
  },
  quickStartSection: {
    backgroundColor: colors.card,
    padding: spacing.large,
    marginHorizontal: spacing.large,
    borderRadius: 12,
    marginBottom: spacing.xxlarge,
  },
  quickStartTitle: {
    ...typography.h3,
    marginBottom: spacing.medium,
  },
  quickStartButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.large,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStartText: {
    color: colors.white,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginLeft: spacing.small,
  },
});