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
    let s: any = { borderRadius: 48 };
    if (timerShape === 'rounded') s = { borderRadius: 54 };
    if (timerShape === 'circle') s = { borderRadius: 999 }; // Pill
    if (timerShape === 'arch') s = { borderTopLeftRadius: 999, borderTopRightRadius: 999, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 };
    if (timerShape === 'leaf') s = { borderTopLeftRadius: 999, borderBottomRightRadius: 999, borderTopRightRadius: 36, borderBottomLeftRadius: 36 };
    
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
        <Text style={[styles.timeText, { color: palette.timerText }]} allowFontScaling={false} adjustsFontSizeToFit numberOfLines={1}>
          {minStr}
        </Text>
      </View>
      <View style={getShapeStyles()}>
        <Text style={[styles.timeText, { color: palette.timerText }]} allowFontScaling={false} adjustsFontSizeToFit numberOfLines={1}>
          {secStr}
        </Text>
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
    marginBottom: 64, // Pulled away from controls significantly
    width: '100%', // Take full width
    paddingHorizontal: 8,
  },
  timeBlock: {
    flex: 1, // Expand dynamically
    aspectRatio: 0.8, // Dynamic height relative to width
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  timeText: {
    fontSize: 104, // Absolutely massive
    fontWeight: '700',
  },
});
