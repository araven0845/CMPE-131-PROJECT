import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WorkoutSummary } from '@/types/workout';
import { colors, spacing, typography } from '@/constants/theme';
import { formatDate, formatDuration } from '@/utils/timeUtils';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

interface WorkoutCardProps {
  workout: WorkoutSummary;
}

export default function WorkoutCard({ workout }: WorkoutCardProps) {
  const completionPercentage = Math.round((workout.completedSets / workout.totalSets) * 100);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{workout.name}</Text>
        <Text style={styles.date}>{formatDate(workout.date)}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Feather name="clock" size={16} color={colors.text.secondary} />
          <Text style={styles.statText}>{formatDuration(workout.duration)}</Text>
        </View>
        
        <View style={styles.statItem}>
          <FontAwesome5 name="dumbbell" size={16} color={colors.text.secondary} />
          <Text style={styles.statText}>{workout.exercises.length} exercises</Text>
        </View>
        
        <View style={styles.statItem}>
          <Feather name="check-circle" size={16} color={colors.text.secondary} />
          <Text style={styles.statText}>
            {workout.completedSets}/{workout.totalSets} sets
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill,
              { width: `${completionPercentage}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{completionPercentage}% Completed</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  title: {
    ...typography.h3,
  },
  date: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.medium,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.medium,
  },
  statText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.xsmall,
  },
  progressContainer: {
    marginTop: spacing.xsmall,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: colors.cardAlt,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.xsmall,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'right',
  },
});