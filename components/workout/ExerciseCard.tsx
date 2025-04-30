import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Trash2, Plus } from 'lucide-react-native';
import { WorkoutExercise, ExerciseSet } from '@/types/workout';
import { colors, spacing, typography } from '@/constants/theme';

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  onUpdateName: (name: string) => void;
  onUpdateSet: (setId: string, field: keyof ExerciseSet, value: any) => void;
  onToggleSet: (setId: string) => void;
  onRemove: () => void;
  onAddSet: () => void;
}

export default function ExerciseCard({
  exercise,
  onUpdateName,
  onUpdateSet,
  onToggleSet,
  onRemove,
  onAddSet,
}: ExerciseCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TextInput
          style={styles.nameInput}
          value={exercise.name}
          onChangeText={onUpdateName}
          placeholder="Exercise Name"
          placeholderTextColor={colors.text.secondary}
        />
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Trash2 size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
      <View style={styles.setsContainer}>
        <View style={styles.setHeaderRow}>
          <Text style={[styles.headerCell, { flex: 1 }]}>SET</Text>
          <Text style={[styles.headerCell, { flex: 2 }]}>WEIGHT</Text>
          <Text style={[styles.headerCell, { flex: 2 }]}>REPS</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>✓</Text>
        </View>
        {exercise.sets?.map((set, index) => (
          <View key={set.id} style={styles.setRow}>
            <Text style={[styles.setCell, { flex: 1 }]}>{index + 1}</Text>
            <TextInput
              style={[styles.inputCell, { flex: 2 }]}
              value={set.weight}
              onChangeText={(value) => onUpdateSet(set.id, 'weight', value)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.text.secondary}
            />
            <TextInput
              style={[styles.inputCell, { flex: 2 }]}
              value={set.reps}
              onChangeText={(value) => onUpdateSet(set.id, 'reps', value)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.text.secondary}
            />
            <TouchableOpacity
              style={[styles.checkboxCell, { flex: 1 }]}
              onPress={() => onToggleSet(set.id)}
            >
              <View style={[
                styles.checkbox,
                set.completed ? styles.checkboxChecked : {}
              ]} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addSetButton} onPress={onAddSet}>
          <Plus size={20} color={colors.primary} />
          <Text style={styles.addSetButtonText}>Add Set</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginTop: spacing.medium,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardAlt,
    padding: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  nameInput: {
    ...typography.h3,
    flex: 1,
    color: colors.text.primary,
  },
  removeButton: {
    padding: spacing.small,
  },
  setsContainer: {
    padding: spacing.medium,
  },
  setHeaderRow: {
    flexDirection: 'row',
    paddingBottom: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.small,
  },
  headerCell: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,
    paddingVertical: spacing.small,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  setCell: {
    ...typography.body,
    textAlign: 'center',
  },
  inputCell: {
    ...typography.body,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: spacing.small,
    marginHorizontal: spacing.xsmall,
    color: colors.text.primary,
  },
  checkboxCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.medium,
    paddingVertical: spacing.small,
    backgroundColor: colors.cardAlt,
    borderRadius: 8,
    width: '100%', // Expanded to full width
  },
  addSetButtonText: {
    ...typography.bodyBold,
    color: colors.primary,
    marginLeft: spacing.small,
  },
});