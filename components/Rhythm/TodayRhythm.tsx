import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Settings, Pause } from 'lucide-react-native';
import { useTimerStore } from '../../store/useTimerStore';
import { useThemeStore } from '../../store/useThemeStore';

export function TodayRhythm() {
  const { todayHistory } = useTimerStore();
  const { palette } = useThemeStore();

  const totalFocusSec = todayHistory
    .filter(r => r.mode === 'focus')
    .reduce((acc, r) => acc + r.durationInSeconds, 0);
  
  const totalBreakSec = todayHistory
    .filter(r => r.mode === 'break')
    .reduce((acc, r) => acc + r.durationInSeconds, 0);

  const totalSec = totalFocusSec + totalBreakSec;
  const formatMins = (sec: number) => Math.floor(sec / 60) + 'm';

  const TOTAL_PILLS = 28;
  // If no sessions, show default state (maybe all gray or all focus template)
  const focusRatio = totalSec > 0 ? totalFocusSec / totalSec : 1;
  const focusPillsCount = totalSec > 0 ? Math.round(TOTAL_PILLS * focusRatio) : 0;

  return (
    <View style={[styles.container, { backgroundColor: palette.timerBlock }]}>
      <Text style={[styles.title, { color: palette.timerText }]}>Today's rhythm</Text>
      
      <View style={styles.barsContainer}>
        {Array.from({ length: TOTAL_PILLS }).map((_, i) => {
          let pillColor = palette.secondaryText + '20'; // Gray by default
          if (totalSec > 0) {
            pillColor = i < focusPillsCount ? '#3B82F6' : palette.breakColor;
          }
          return (
            <View 
              key={i} 
              style={[styles.pill, { backgroundColor: pillColor }]} 
            />
          );
        })}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Settings size={14} color="#3B82F6" strokeWidth={3} />
          <Text style={[styles.statValue, { color: palette.timerText }]}>{formatMins(totalFocusSec)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: palette.timerText }]}>{formatMins(totalBreakSec)}</Text>
          <View style={[styles.iconContainer, { backgroundColor: palette.breakColor }]}>
            <Pause size={10} color="white" strokeWidth={4} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 28,
    marginTop: 24,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 20,
    marginBottom: 12,
  },
  pill: {
    width: 4.5,
    height: 16,
    borderRadius: 2.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  iconContainer: {
    width: 14,
    height: 14,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
