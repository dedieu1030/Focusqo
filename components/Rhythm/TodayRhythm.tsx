import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Setting2, Pause } from 'iconsax-react-native';
import { useTimerStore } from '../../store/useTimerStore';
import { useThemeStore } from '../../store/useThemeStore';

export function TodayRhythm() {
  const { todayHistory } = useTimerStore();
  const { palette } = useThemeStore();

  const totalFocusSec = todayHistory.length > 0 
    ? todayHistory.filter(r => r.mode === 'focus').reduce((acc, r) => acc + r.durationInSeconds, 0)
    : 15800; // Simulated 4.5h 
  
  const totalBreakSec = todayHistory.length > 0
    ? todayHistory.filter(r => r.mode === 'break').reduce((acc, r) => acc + r.durationInSeconds, 0)
    : 3600; // Simulated 1h

  const totalSec = totalFocusSec + totalBreakSec;
  const formatMins = (sec: number) => Math.floor(sec / 60) + 'm';

  const TOTAL_PILLS = 18;
  const MAX_HEIGHT = 52;
  const MIN_HEIGHT = 24;

  // If no sessions, show default state (maybe all gray or all focus template)
  const focusRatio = totalSec > 0 ? totalFocusSec / totalSec : 1;
  const focusPillsCount = totalSec > 0 ? Math.round(TOTAL_PILLS * focusRatio) : 0;

  return (
    <View style={[styles.container, { backgroundColor: palette.timerBlock }]}>
      <View style={styles.barsContainer}>
        {Array.from({ length: TOTAL_PILLS }).map((_, i) => {
          let pillColor = palette.secondaryText + '20'; // Gray by default
          if (totalSec > 0) {
            pillColor = i < focusPillsCount ? palette.focusColor : palette.breakColor;
          }

          const pillHeight = MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * Math.sin(Math.PI * (i + 0.5) / TOTAL_PILLS);

          return (
            <View 
              key={i} 
              style={[styles.pill, { backgroundColor: pillColor, height: pillHeight }]} 
            />
          );
        })}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Setting2 size={14} color={palette.focusColor} variant="Bold" />
          <Text style={[styles.statValue, { color: palette.timerText }]}>{formatMins(totalFocusSec)}</Text>
        </View>

        <Text style={[styles.title, { color: palette.timerText }]}>Today</Text>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: palette.timerText }]}>{formatMins(totalBreakSec)}</Text>
          <View style={[styles.iconContainer, { backgroundColor: palette.breakColor }]}>
            <Pause size={10} color="white" variant="Bold" />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 28,
    marginTop: 16,
    minHeight: 108, // Standardized height for pagination
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    opacity: 0.5,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 54,
    marginTop: 4,
    marginBottom: 8,
  },
  pill: {
    width: 10,
    borderRadius: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 18,
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
