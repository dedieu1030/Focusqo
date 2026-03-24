import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTimerStore } from '../../store/useTimerStore';
import { useThemeStore } from '../../store/useThemeStore';

export function TodayRhythm() {
  const { todayHistory } = useTimerStore();
  const { palette } = useThemeStore();

  const totalFocusSeconds = todayHistory
    .filter(r => r.mode === 'focus')
    .reduce((acc, r) => acc + r.durationInSeconds, 0);
  
  const totalBreakSeconds = todayHistory
    .filter(r => r.mode === 'break')
    .reduce((acc, r) => acc + r.durationInSeconds, 0);

  const formatMinutes = (seconds: number) => Math.floor(seconds / 60) + 'm';

  return (
    <View style={[styles.container, { backgroundColor: palette.timerBlock }]}>
      <Text style={[styles.title, { color: palette.timerText }]}>Today's rhythm</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.barsContainer}
      >
        {todayHistory.length === 0 ? (
          <View style={[styles.emptyBar, { backgroundColor: palette.accentColor + '40' }]} />
        ) : (
          todayHistory.map((session, index) => (
            <View 
              key={session.id} 
              style={[
                styles.bar, 
                { backgroundColor: session.mode === 'focus' ? palette.focusColor : palette.breakColor }
              ]} 
            />
          ))
        )}
      </ScrollView>

      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <View style={[styles.statDot, { backgroundColor: palette.focusColor }]} />
          <Text style={[styles.statText, { color: palette.timerText }]}>
            {formatMinutes(totalFocusSeconds)}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statText, { color: palette.timerText }]}>
            {formatMinutes(totalBreakSeconds)}
          </Text>
          <View style={[styles.statDot, { backgroundColor: palette.breakColor }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 20,
    marginTop: 24,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    gap: 4,
  },
  bar: {
    width: 6,
    height: 16,
    borderRadius: 3,
  },
  emptyBar: {
    width: 40,
    height: 16,
    borderRadius: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statDot: {
    width: 12,
    height: 12,
    borderRadius: 4, // Hexagon-like icon in the reference
  },
  statText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
