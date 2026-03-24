import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTimerStore, SessionRecord } from '../store/useTimerStore';
import { useThemeStore } from '../store/useThemeStore';

export function InsightsScreen() {
  const { labels } = useTimerStore();
  const { palette } = useThemeStore();
  const [history, setHistory] = useState<SessionRecord[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const str = await AsyncStorage.getItem('@focusqo_timer_state_v2_history');
        if (str) {
          setHistory(JSON.parse(str));
        }
      } catch (e) {}
    };
    fetchHistory();
  }, []);

  const focusHistory = history.filter(r => r.mode === 'focus');
  
  const totalFocusSessions = focusHistory.length;
  const totalFocusSeconds = focusHistory.reduce((acc, r) => acc + r.durationInSeconds, 0);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Calculate Active Days
  const uniqueDays = new Set(focusHistory.map(r => {
    const d = new Date(r.timestamp);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }));
  const activeDaysCount = uniqueDays.size;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.screenTitle, { color: palette.primaryText }]}>Insights</Text>
      
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: palette.timerBlock }]}>
          <Text style={[styles.statLabel, { color: palette.secondaryText }]}>Total Focus Time</Text>
          <Text style={[styles.statValue, { color: palette.timerText }]}>{formatTime(totalFocusSeconds)}</Text>
          <Text style={[styles.statSub, { color: palette.timerText }]}>{totalFocusSessions} sessions completed</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: palette.timerBlock }]}>
          <Text style={[styles.statLabel, { color: palette.secondaryText }]}>Active Days</Text>
          <Text style={[styles.statValue, { color: palette.timerText }]}>{activeDaysCount}</Text>
          <Text style={[styles.statSub, { color: palette.timerText }]}>Days with focus sessions</Text>
        </View>

        {labels.length > 0 && (
          <View style={[styles.statCard, { backgroundColor: palette.timerBlock }]}>
            <Text style={[styles.statLabel, { color: palette.secondaryText, marginBottom: 12 }]}>Time per Label</Text>
            {labels.map(label => {
              const seconds = focusHistory
                .filter(r => r.labelId === label.id)
                .reduce((acc, r) => acc + r.durationInSeconds, 0);
              
              if (seconds === 0) return null;

              return (
                <View key={label.id} style={styles.labelRow}>
                  <Text style={[styles.labelName, { color: palette.timerText }]}>{label.name}</Text>
                  <Text style={[styles.labelTime, { color: palette.accentColor }]}>{formatTime(seconds)}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
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
  },
  content: {
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 40,
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  labelName: {
    fontSize: 16,
    fontWeight: '500',
  },
  labelTime: {
    fontSize: 14,
    fontWeight: '500',
  },
});
