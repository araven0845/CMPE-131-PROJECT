import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';

interface SettingsItemProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  control?: React.ReactNode;
  onPress?: () => void;
  labelStyle?: TextStyle;
}

export default function SettingsItem({
  label,
  description,
  icon,
  control,
  onPress,
  labelStyle,
}: SettingsItemProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container 
      style={styles.container}
      onPress={onPress}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      
      <View style={styles.textContainer}>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      
      {control ? (
        <View style={styles.controlContainer}>
          {control}
        </View>
      ) : onPress ? (
        <ChevronRight size={20} color={colors.text.secondary} />
      ) : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.medium,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    marginRight: spacing.medium,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    ...typography.bodyBold,
  },
  description: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xsmall,
  },
  controlContainer: {
    marginLeft: spacing.medium,
  },
});