import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause, Next, Stop } from 'iconsax-react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { TimerStateEnum } from '../../store/useTimerStore';

interface TimerControlsProps {
  timerState: TimerStateEnum;
  onStart: () => void;
  onPause: () => void;
  onSkip: () => void;
  onReset: () => void;
}

export function TimerControls({ timerState, onStart, onPause, onSkip, onReset }: TimerControlsProps) {
  const { palette } = useThemeStore();

  const isRunning = timerState === 'running';
  const isFinished = timerState === 'finished';

  return (
    <View style={styles.container}>
      {/* Primary Action Button */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: palette.accentColor + '33' }]}
        onPress={isRunning ? onPause : onStart}
      >
        {isRunning ? (
          <Pause size={28} color={palette.primaryText} variant="Bold" />
        ) : (
          <Play size={28} color={palette.primaryText} variant="Bold" style={{ marginLeft: 4 }} />
        )}
      </TouchableOpacity>
      
      {/* Secondary Action Button (Skip / Reset) */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: palette.accentColor + '33' }]}
        onPress={isFinished ? onReset : onSkip}
      >
        {isFinished ? (
          <Stop size={24} color={palette.primaryText} variant="Bold" />
        ) : (
          <Next size={28} color={palette.primaryText} variant="Bold" />
        )}
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
