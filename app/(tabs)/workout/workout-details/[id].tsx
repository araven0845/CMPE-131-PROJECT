import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { WorkoutContext } from '@/context/WorkoutContext';
import { colors, spacing, typography } from '@/constants/theme';

export default function RoutineDetailScreen() {
  const { updateRoutine, routines } = useContext(WorkoutContext);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const oldRoutine = routines.find(r => r.id === id);
  const [routineName, setRoutineName] = useState(oldRoutine?.name || '');
  // ...existing code handling exercises, sets, etc...

  const saveRoutine = () => {
    if (!id || !oldRoutine) return;
    if (!routineName.trim()) {
      Alert.alert('Invalid Name', 'Please enter a valid routine name.');
      return;
    }
    updateRoutine({ ...oldRoutine, name: routineName });
    Alert.alert('Changes Saved', 'Your routine has been updated.');
  };

  return (
    <View style={styles.container}>
      {/* Header with Routine Name + Save Button */}
      <View style={styles.header}>
        <TextInput
          style={styles.routineName}
          value={routineName}
          onChangeText={setRoutineName}
          placeholder="Routine Name"
          placeholderTextColor={colors.text.secondary}
        />
        <TouchableOpacity style={styles.saveButton} onPress={saveRoutine}>
          <Feather name="save" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ...existing body content with add exercise, sets, etc... */}

      {/* Existing footer with Complete and Delete buttons */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  routineName: {
    flex: 1,
    ...typography.h2,
    padding: spacing.small,
  },
  saveButton: {
    padding: spacing.small,
    marginLeft: spacing.small,
  },
});