import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';

interface TimerDisplayProps {
  timeLeft: number;
  onPress?: () => void;
  disabled?: boolean;
}

export function TimerDisplay({ timeLeft, onPress, disabled }: TimerDisplayProps) {
  const { palette } = useThemeStore();

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const minStr = minutes.toString().padStart(2, '0');
  const secStr = seconds.toString().padStart(2, '0');

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.8} 
      onPress={onPress}
      disabled={disabled}
    >
      <View style={[styles.timeBlock, { backgroundColor: palette.timerBlock }]}>
        <Text style={[styles.timeText, { color: palette.timerText }]}>{minStr}</Text>
      </View>
      <View style={[styles.timeBlock, { backgroundColor: palette.timerBlock }]}>
        <Text style={[styles.timeText, { color: palette.timerText }]}>{secStr}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 48,
  },
  timeBlock: {
    width: 140,
    height: 160,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 72,
    fontWeight: '700',
  },
});
