import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { useTimerStore, TimerShape } from '../../store/useTimerStore';

interface TimerDisplayProps {
  timeLeft: number;
  onPressMin?: () => void;
  onPressSec?: () => void;
  disabled?: boolean;
}

export function TimerDisplay({ timeLeft, onPressMin, onPressSec, disabled }: TimerDisplayProps) {
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
    
    return [styles.timeBlock, { backgroundColor: palette.timerBlock }, s];
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={getShapeStyles()} 
        activeOpacity={0.8} 
        onPress={onPressMin}
        disabled={disabled}
      >
        <Text style={[styles.timeText, { color: palette.timerText }]} allowFontScaling={false} adjustsFontSizeToFit numberOfLines={1}>
          {minStr}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={getShapeStyles()} 
        activeOpacity={0.8} 
        onPress={onPressSec}
        disabled={disabled}
      >
        <Text style={[styles.timeText, { color: palette.timerText }]} allowFontScaling={false} adjustsFontSizeToFit numberOfLines={1}>
          {secStr}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 64,
    width: '100%',
    paddingHorizontal: 8,
  },
  timeBlock: {
    flex: 1, // Expand dynamically
    aspectRatio: 0.8, // Dynamic height relative to width
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 104,
    fontWeight: '700',
  },
});
