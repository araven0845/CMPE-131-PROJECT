import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { WorkoutSummary } from '@/types/workout';
import { colors, spacing, typography } from '@/constants/theme';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

interface ProgressMetricsProps {
  workouts: WorkoutSummary[];
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export default function ProgressMetrics({ workouts }: ProgressMetricsProps) {
  const metrics = useMemo(() => {
    // Get current date at midnight for consistent comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    
    // Calculate metrics
    const workoutsThisWeek = workouts.filter(workout => {
      const workoutDate = new Date(workout.date).getTime();
      return todayMs - workoutDate < 7 * DAY_IN_MS;
    }).length;
    
    const workoutsThisMonth = workouts.filter(workout => {
      const workoutDate = new Date(workout.date).getTime();
      return todayMs - workoutDate < 30 * DAY_IN_MS;
    }).length;
    
    // Calculate streak (consecutive days with workouts)
    let streak = 0;
    const workoutDays = new Set();
    
    // Add all workout dates to a set
    workouts.forEach(workout => {
      const date = new Date(workout.date);
      date.setHours(0, 0, 0, 0);
      workoutDays.add(date.getTime());
    });
    
    // Count consecutive days with workouts, starting from today and going backwards
    for (let i = 0; i < 60; i++) { // Check up to 60 days back
      const checkDate = new Date(todayMs - i * DAY_IN_MS);
      if (workoutDays.has(checkDate.getTime())) {
        streak++;
      } else if (streak > 0) {
        // Break once the streak is broken
        break;
      }
    }
    
    return {
      workoutsThisWeek,
      workoutsThisMonth,
      streak,
    };
  }, [workouts]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.metricItem}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <Feather name="calendar" size={24} color={colors.primary} />
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricValue}>{metrics.workoutsThisWeek}</Text>
            <Text style={styles.metricLabel}>This Week</Text>
          </View>
        </View>
        
        <View style={styles.metricItem}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
            <FontAwesome5 name="dumbbell" size={24} color={colors.accent} />
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricValue}>{metrics.workoutsThisMonth}</Text>
            <Text style={styles.metricLabel}>This Month</Text>
          </View>
        </View>
        
        <View style={styles.metricItem}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <Feather name="award" size={24} color={colors.success} />
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricValue}>{metrics.streak}</Text>
            <Text style={styles.metricLabel}>Day Streak</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xlarge, // keep overall padding same
    backgroundColor: colors.card,
    marginHorizontal: spacing.large,
    marginBottom: spacing.large,
    borderRadius: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.medium, // space between items
    paddingVertical: spacing.medium,    // vertical padding for each item
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.small,
  },
  metricContent: {
    justifyContent: 'center',
  },
  metricValue: {
    ...typography.h2,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});