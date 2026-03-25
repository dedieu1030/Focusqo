import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTimerStore, SessionRecord } from '../store/useTimerStore';
import { useThemeStore } from '../store/useThemeStore';
import { Clock, Flame, Target, Tag, BarChart3 } from 'lucide-react-native';
import { WeeklyActivityChart } from '../components/Insights/WeeklyActivityChart';

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

  const uniqueDays = new Set(focusHistory.map(r => {
    const d = new Date(r.timestamp);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }));
  const activeDaysCount = uniqueDays.size;

  const labelTimes = labels.map(label => ({
    ...label,
    seconds: focusHistory
      .filter(r => r.labelId === label.id)
      .reduce((acc, r) => acc + r.durationInSeconds, 0)
  })).filter(l => l.seconds > 0).sort((a,b) => b.seconds - a.seconds);

  const maxLabelTime = labelTimes.length > 0 ? Math.max(...labelTimes.map(l => l.seconds)) : 0;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.screenTitle, { color: palette.primaryText }]}>Insights</Text>
      
      <View style={styles.bentoGrid}>
        {/* Weekly Activity Chart */}
        <View style={[styles.bentoCard, styles.bentoFull, { backgroundColor: palette.timerBlock }]}>
          <View style={styles.bentoHeaderRow}>
            <BarChart3 size={20} color={palette.focusColor} />
            <Text style={[styles.bentoLabel, { color: palette.secondaryText }]}>Weekly Activity</Text>
          </View>
          <WeeklyActivityChart history={history} palette={palette} />
        </View>

        {/* Full-width main card */}
        <View style={[styles.bentoCard, styles.bentoFull, { backgroundColor: palette.timerBlock }]}>
          <View style={styles.bentoHeaderRow}>
            <Clock size={20} color={palette.focusColor} />
            <Text style={[styles.bentoLabel, { color: palette.secondaryText }]}>Total Focus Time</Text>
          </View>
          <Text style={[styles.bentoHugeValue, { color: palette.timerText }]}>{formatTime(totalFocusSeconds)}</Text>
        </View>

        {/* Two-column sub cards */}
        <View style={styles.bentoSplit}>
          <View style={[styles.bentoCard, styles.bentoHalf, { backgroundColor: palette.timerBlock }]}>
            <Target size={24} color={palette.breakColor} style={{ marginBottom: 12 }} />
            <Text style={[styles.bentoValue, { color: palette.timerText }]}>{totalFocusSessions}</Text>
            <Text style={[styles.bentoSubLabel, { color: palette.secondaryText }]}>Sessions</Text>
          </View>

          <View style={[styles.bentoCard, styles.bentoHalf, { backgroundColor: palette.timerBlock }]}>
            <Flame size={24} color={palette.focusColor} style={{ marginBottom: 12 }} />
            <Text style={[styles.bentoValue, { color: palette.timerText }]}>{activeDaysCount}</Text>
            <Text style={[styles.bentoSubLabel, { color: palette.secondaryText }]}>Active Days</Text>
          </View>
        </View>

        {/* Labels Block */}
        {labelTimes.length > 0 && (
          <View style={[styles.bentoCard, styles.bentoFull, { backgroundColor: palette.timerBlock, marginTop: 16 }]}>
            <View style={styles.bentoHeaderRow}>
              <Tag size={20} color={palette.accentColor} />
              <Text style={[styles.bentoLabel, { color: palette.secondaryText }]}>Time by Label</Text>
            </View>
            
            <View style={styles.labelsContainer}>
              {labelTimes.map((label, idx) => {
                const ratio = maxLabelTime > 0 ? label.seconds / maxLabelTime : 0;
                return (
                  <View key={label.id} style={[styles.labelRow, idx !== labelTimes.length - 1 && styles.labelRowMargin]}>
                    <View style={styles.labelHeader}>
                      <Text style={[styles.labelName, { color: palette.timerText }]}>{label.name}</Text>
                      <Text style={[styles.labelTime, { color: palette.secondaryText }]}>{formatTime(label.seconds)}</Text>
                    </View>
                    <View style={[styles.progressTrack, { backgroundColor: palette.background + '20' }]}>
                      <View style={[styles.progressFill, { backgroundColor: palette.focusColor, width: `${ratio * 100}%` }]} />
                    </View>
                  </View>
                );
              })}
            </View>
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
  bentoGrid: {
    gap: 16,
  },
  bentoCard: {
    borderRadius: 24,
    padding: 24,
  },
  bentoFull: {
    width: '100%',
  },
  bentoSplit: {
    flexDirection: 'row',
    gap: 16,
  },
  bentoHalf: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 20,
  },
  bentoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  bentoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  bentoHugeValue: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1,
  },
  bentoValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  bentoSubLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  labelsContainer: {
    marginTop: 8,
  },
  labelRow: {
    // container for a single label
  },
  labelRowMargin: {
    marginBottom: 20,
  },
  labelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelName: {
    fontSize: 15,
    fontWeight: '600',
  },
  labelTime: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
