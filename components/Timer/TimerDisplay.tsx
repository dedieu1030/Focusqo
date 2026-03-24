import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';

interface TimerDisplayProps {
  timeLeft: number;
}

export function TimerDisplay({ timeLeft }: TimerDisplayProps) {
  const { palette } = useThemeStore();
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const minStr = minutes.toString().padStart(2, '0');
  const secStr = seconds.toString().padStart(2, '0');

  return (
    <View style={styles.container}>
      <View style={[styles.timeBlock, { backgroundColor: palette.timerBlock }]}>
        <Text style={[styles.timeText, { color: palette.background }]}>{minStr}</Text>
      </View>
      <View style={[styles.timeBlock, { backgroundColor: palette.timerBlock }]}>
        <Text style={[styles.timeText, { color: palette.background }]}>{secStr}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  timeBlock: {
    width: 140,
    height: 140,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 5,
  },
  timeText: {
    fontSize: 72,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
