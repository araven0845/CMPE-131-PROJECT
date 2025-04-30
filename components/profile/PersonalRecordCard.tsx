import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Award } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { formatDate } from '@/utils/timeUtils';

interface PersonalRecord {
  id: string;
  name: string;
  value: string;
  date: string;
}

interface PersonalRecordCardProps {
  record: PersonalRecord;
}

export default function PersonalRecordCard({ record }: PersonalRecordCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Award size={24} color={colors.accent} />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{record.name}</Text>
        <Text style={styles.date}>{formatDate(record.date)}</Text>
      </View>
      
      <Text style={styles.value}>{record.value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: spacing.medium,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.xsmall,
  },
  date: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  value: {
    ...typography.h2,
    color: colors.accent,
  },
});