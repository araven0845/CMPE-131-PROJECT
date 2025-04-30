import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Dumbbell } from 'lucide-react-native';
import { WorkoutRoutine } from '@/types/workout';
import { colors, spacing, typography } from '@/constants/theme';
import { formatDate } from '@/utils/timeUtils';

interface RoutineCardProps {
  routine: WorkoutRoutine;
  onPress: () => void;
}

export default function RoutineCard({ routine, onPress }: RoutineCardProps) {
  const lastUsedText = `Created: ${formatDate(routine.createdAt)}`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Dumbbell size={24} color={colors.white} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{routine.name}</Text>
          <Text style={styles.subtitle}>{routine.exercises.length} exercises</Text>
          <Text style={styles.lastUsed}>{lastUsedText}</Text>
        </View>
      </View>
      
      <View style={styles.startButtonContainer}>
        <TouchableOpacity style={styles.startButton} onPress={onPress}>
          <Play size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.medium,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.xsmall,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xsmall,
  },
  lastUsed: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  startButtonContainer: {
    marginLeft: spacing.small,
  },
  startButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});