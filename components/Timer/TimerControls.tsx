import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { PlayCircle, Pause, Coffee, LampOn } from 'iconsax-react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { TimerStateEnum, SessionMode } from '../../store/useTimerStore';

interface TimerControlsProps {
  timerState: TimerStateEnum;
  mode: SessionMode;
  onStart: () => void;
  onPause: () => void;
  onToggleMode: () => void;
}

export function TimerControls({ timerState, mode, onStart, onPause, onToggleMode }: TimerControlsProps) {
  const { palette } = useThemeStore();

  const isRunning = timerState === 'running';

  return (
    <View style={styles.container}>
      {/* Primary Action Button — Start / Pause */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: palette.accentColor + '33' }]}
        onPress={isRunning ? onPause : onStart}
      >
        {isRunning ? (
          <Pause size={32} color={palette.primaryText} variant="Bold" />
        ) : (
          <PlayCircle size={36} color={palette.primaryText} variant="Bold" />
        )}
      </TouchableOpacity>
      
      {/* Mode Toggle Button — Focus ↔ Break */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: palette.accentColor + '33' }]}
        onPress={onToggleMode}
      >
        {mode === 'focus' ? (
          <Coffee size={30} color={palette.breakColor} variant="Bold" />
        ) : (
          <LampOn size={30} color={palette.focusColor} variant="Bold" />
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
