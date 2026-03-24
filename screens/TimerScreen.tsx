import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimerDisplay } from '../components/Timer/TimerDisplay';
import { TimerControls } from '../components/Timer/TimerControls';
import { useTimerStore } from '../store/useTimerStore';
import { useThemeStore } from '../store/useThemeStore';
import { Tag } from 'lucide-react-native';

export function TimerScreen() {
  const { mode, timeLeft, isRunning, startTimer, pauseTimer, skipSession } = useTimerStore();
  const { palette } = useThemeStore();

  const handleToggle = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Tag size={16} color={palette.secondaryText} style={{ marginRight: 6 }} />
          <Text style={[styles.headerLabelText, { color: palette.secondaryText }]}>No Label</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.headerModeText, { color: mode === 'focus' ? palette.secondaryText : palette.breakColor }]}>
            {mode === 'focus' ? 'Focus 25m' : 'Break 5m'}
          </Text>
        </View>
      </View>

      <View style={styles.timerContent}>
        <Text style={[
          styles.modeTitle, 
          { color: mode === 'focus' ? palette.primaryText : palette.breakColor }
        ]}>
          {mode === 'focus' ? 'Focus' : 'Break'}
        </Text>
        
        <TimerDisplay timeLeft={timeLeft} />
        
        <TimerControls 
          isRunning={isRunning} 
          onToggleTimer={handleToggle} 
          onSkip={skipSession} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    paddingTop: 60, // Safe area roughly
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLabelText: {
    fontSize: 15,
    fontWeight: '500',
  },
  headerRight: {},
  headerModeText: {
    fontSize: 15,
    fontWeight: '500',
  },
  timerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: '500',
  },
});
