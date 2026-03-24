import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTimerStore } from '../store/useTimerStore';
import { useThemeStore } from '../store/useThemeStore';

export function InsightsScreen() {
  const { todayHistory } = useTimerStore();
  const { palette } = useThemeStore();

  const totalFocusSessions = todayHistory.filter(r => r.mode === 'focus').length;
  const totalBreakSessions = todayHistory.filter(r => r.mode === 'break').length;

  const totalFocusSeconds = todayHistory
    .filter(r => r.mode === 'focus')
    .reduce((acc, r) => acc + r.durationInSeconds, 0);
  
  const totalBreakSeconds = todayHistory
    .filter(r => r.mode === 'break')
    .reduce((acc, r) => acc + r.durationInSeconds, 0);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Text style={[styles.screenTitle, { color: palette.primaryText }]}>Insights</Text>
      
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: palette.timerBlock }]}>
          <Text style={[styles.statLabel, { color: palette.secondaryText }]}>Total Focus</Text>
          <Text style={[styles.statValue, { color: palette.background }]}>{formatTime(totalFocusSeconds)}</Text>
          <Text style={[styles.statSub, { color: palette.background }]}>{totalFocusSessions} sessions</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: palette.timerBlock }]}>
          <Text style={[styles.statLabel, { color: palette.secondaryText }]}>Total Break</Text>
          <Text style={[styles.statValue, { color: palette.background }]}>{formatTime(totalBreakSeconds)}</Text>
          <Text style={[styles.statSub, { color: palette.background }]}>{totalBreakSessions} sessions</Text>
        </View>
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
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 40,
    textAlign: 'center',
  },
  statsContainer: {
    gap: 16,
  },
  statCard: {
    padding: 24,
    borderRadius: 24,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  statSub: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.8,
  },
});
