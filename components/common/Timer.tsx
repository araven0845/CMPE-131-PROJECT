import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { formatDuration } from '@/utils/timeUtils';

interface TimerProps {
  time: number;
  isRunning: boolean;
}

export default function Timer({ time, isRunning }: TimerProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 0,
        useNativeDriver: true,
      }).stop();
    }

    return () => {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 0,
        useNativeDriver: true,
      }).stop();
    };
  }, [isRunning, pulseAnim]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Workout Duration</Text>
      <View style={styles.timeContainer}>
        <Animated.View
          style={[
            styles.dot,
            { 
              backgroundColor: isRunning ? colors.accent : colors.text.disabled,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        <Text style={styles.time}>{formatDuration(time)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xsmall,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.small,
  },
  time: {
    ...typography.h2,
  },
});