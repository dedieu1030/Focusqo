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
      {/* Spacer to balance the mode button and keep start centered */}
      <View style={styles.spacer} />

      {/* Primary Action Button — Start / Pause — Centered */}
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={isRunning ? onPause : onStart}
      >
        {isRunning ? (
          <Pause size={56} color={palette.primaryText} variant="Bold" />
        ) : (
          <PlayCircle size={56} color={palette.primaryText} variant="Bold" />
        )}
      </TouchableOpacity>
      
      {/* Mode Toggle Button — Focus ↔ Break */}
      <View style={styles.modeWrapper}>
        <TouchableOpacity 
          style={styles.modeButton}
          onPress={onToggleMode}
        >
          {mode === 'focus' ? (
            <Coffee size={40} color={palette.breakColor} variant="Bold" />
          ) : (
            <LampOn size={40} color={palette.focusColor} variant="Bold" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  spacer: {
    width: 84, // 40 gap + 44 button width = matches modeWrapper
  },
  primaryButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeWrapper: {
    width: 84, // 40 gap + 44 button width
    paddingLeft: 40,
  },
  modeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
