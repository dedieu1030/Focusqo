import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { useTimerStore, TimerShape } from '../../store/useTimerStore';

interface TimerDisplayProps {
  timeLeft: number;
  onPress?: () => void;
  disabled?: boolean;
}

export function TimerDisplay({ timeLeft, onPress, disabled }: TimerDisplayProps) {
  const { palette } = useThemeStore();
  const { timerShape } = useTimerStore();

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const minStr = minutes.toString().padStart(2, '0');
  const secStr = seconds.toString().padStart(2, '0');

  const getShapeStyles = () => {
    let s: any = { borderRadius: 36 };
    if (timerShape === 'rounded') s = { borderRadius: 44 };
    if (timerShape === 'circle') s = { borderRadius: 120 }; // Very round pill
    if (timerShape === 'arch') s = { borderTopLeftRadius: 120, borderTopRightRadius: 120, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 };
    if (timerShape === 'leaf') s = { borderTopLeftRadius: 120, borderBottomRightRadius: 120, borderTopRightRadius: 36, borderBottomLeftRadius: 36 };
    
    return [styles.timeBlock, { backgroundColor: palette.timerBlock }, s];
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.8} 
      onPress={onPress}
      disabled={disabled}
    >
      <View style={getShapeStyles()}>
        <Text style={[styles.timeText, { color: palette.timerText }]}>{minStr}</Text>
      </View>
      <View style={getShapeStyles()}>
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
    width: 164,
    height: 190,
    justifyContent: 'center',
    alignItems: 'center',
    // Slight shadow to give it a little pop
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  timeText: {
    fontSize: 96,
    fontWeight: '700',
  },
});
