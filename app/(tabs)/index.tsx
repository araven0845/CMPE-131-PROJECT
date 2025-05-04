import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { WorkoutContext } from '@/context/WorkoutContext';
import WorkoutCard from '@/components/home/WorkoutCard';
import ProgressMetrics from '@/components/home/ProgressMetrics';
import { useRouter } from 'expo-router';
import { WorkoutSummary } from '@/types/workout';
import { colors, spacing, typography } from '@/constants/theme';
import Feather from '@expo/vector-icons/Feather';

export default function HomeScreen() {
  const { workoutHistory, clearWorkoutHistory } = useContext(WorkoutContext);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const filteredWorkouts = workoutHistory.filter(workout => 
    workout.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleWorkoutPress = (workout: WorkoutSummary) => {
    router.push(`/workout-details/${workout.id}`);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Workout History',
      'Are you sure you want to clear all your workout history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive', 
          onPress: async () => {
            await clearWorkoutHistory();
            Alert.alert('Success', 'Your workout history has been cleared.');
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout History</Text>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Workouts"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.text.secondary}
          />
        </View>
      </View>

      <ProgressMetrics workouts={workoutHistory} />

      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <View style={styles.historyActions}>
            <TouchableOpacity style={styles.calendarButton}>
              <Feather name="calendar" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.clearHistoryButton} 
              onPress={handleClearHistory}
            >
              <Feather name="trash-2" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={filteredWorkouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleWorkoutPress(item)}>
              <WorkoutCard workout={item} />
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No workouts found</Text>
              <Text style={styles.emptySubtext}>
                Start tracking your fitness journey today!
              </Text>
            </View>
          }
        />
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
    padding: spacing.large,
    paddingBottom: spacing.small,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.medium,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.medium,
    height: 48,
  },
  searchIcon: {
    marginRight: spacing.small,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: colors.text.primary,
    fontFamily: 'Inter-Regular',
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: spacing.large,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  sectionTitle: {
    ...typography.h2,
  },
  calendarButton: {
    padding: spacing.small,
  },
  historyActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearHistoryButton: {
    padding: spacing.small,
    marginLeft: spacing.small,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxlarge,
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
});