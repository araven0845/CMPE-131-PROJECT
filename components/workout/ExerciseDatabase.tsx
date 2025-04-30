import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Search, X, Filter } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { exerciseDatabase } from '@/data/initialData';

interface ExerciseDatabaseProps {
  onSelectExercise: (exerciseName: string) => void;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
}

type CategoryFilter = string | null;

export default function ExerciseDatabase({ 
  onSelectExercise, 
  onClose,
  searchQuery,
  onSearchChange
}: ExerciseDatabaseProps) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(null);
  
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(exerciseDatabase.map(exercise => exercise.category))
    );
    return uniqueCategories.sort();
  }, []);

  const filteredExercises = useMemo(() => {
    return exerciseDatabase.filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter ? exercise.category === categoryFilter : true;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Exercise Database</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises"
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholderTextColor={colors.text.secondary}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <X size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        ) : null}
      </View>
      
      <View style={styles.filterContainer}>
        <View style={styles.filterHeaderRow}>
          <Filter size={16} color={colors.text.secondary} />
          <Text style={styles.filterHeaderText}>Filter by category</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
          <TouchableOpacity
            style={[
              styles.categoryChip,
              !categoryFilter ? styles.activeCategory : {}
            ]}
            onPress={() => setCategoryFilter(null)}
          >
            <Text 
              style={[
                styles.categoryChipText,
                !categoryFilter ? styles.activeCategoryText : {}
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                categoryFilter === category ? styles.activeCategory : {}
              ]}
              onPress={() => setCategoryFilter(category)}
            >
              <Text 
                style={[
                  styles.categoryChipText,
                  categoryFilter === category ? styles.activeCategoryText : {}
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.exerciseItem}
            onPress={() => onSelectExercise(item.name)}
          >
            <View>
              <Text style={styles.exerciseName}>{item.name}</Text>
              <Text style={styles.exerciseDetails}>
                {item.category} • {item.equipment}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.exerciseList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No exercises found</Text>
            <Text style={styles.emptySubtext}>Try a different search term or category</Text>
          </View>
        }
      />
    </View>
  );
}

import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.large,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
  },
  closeButton: {
    padding: spacing.small,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    margin: spacing.large,
    marginTop: spacing.medium,
    marginBottom: spacing.medium,
    borderRadius: 8,
    paddingHorizontal: spacing.medium,
    height: 48,
  },
  searchIcon: {
    marginRight: spacing.small,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    height: '100%',
  },
  filterContainer: {
    paddingHorizontal: spacing.large,
    marginBottom: spacing.medium,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  filterHeaderText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.small,
  },
  categoryList: {
    marginBottom: spacing.small,
  },
  categoryChip: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    backgroundColor: colors.card,
    borderRadius: 20,
    marginRight: spacing.small,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipText: {
    ...typography.caption,
    color: colors.text.primary,
  },
  activeCategory: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  activeCategoryText: {
    color: colors.white,
  },
  exerciseList: {
    padding: spacing.large,
    paddingTop: 0,
  },
  exerciseItem: {
    backgroundColor: colors.card,
    padding: spacing.medium,
    borderRadius: 8,
    marginBottom: spacing.medium,
  },
  exerciseName: {
    ...typography.bodyBold,
    marginBottom: spacing.xsmall,
  },
  exerciseDetails: {
    ...typography.caption,
    color: colors.text.secondary,
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