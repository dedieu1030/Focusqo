import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause, SkipForward } from 'lucide-react-native';
import { useThemeStore } from '../../store/useThemeStore';

interface TimerControlsProps {
  isRunning: boolean;
  onToggleTimer: () => void;
  onSkip: () => void;
}

export function TimerControls({ isRunning, onToggleTimer, onSkip }: TimerControlsProps) {
  const { palette } = useThemeStore();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: palette.accentColor + '33' }]} // 20% opacity
        onPress={onToggleTimer}
      >
        {isRunning ? (
          <Pause size={28} color={palette.timerBlock} fill={palette.timerBlock} />
        ) : (
          <Play size={28} color={palette.timerBlock} fill={palette.timerBlock} style={{ marginLeft: 4 }} />
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: palette.accentColor + '33' }]}
        onPress={onSkip}
      >
        <SkipForward size={28} color={palette.timerBlock} fill={palette.timerBlock} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
