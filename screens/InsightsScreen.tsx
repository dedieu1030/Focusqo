import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTimerStore, SessionRecord } from '../store/useTimerStore';
import { useThemeStore } from '../store/useThemeStore';
import { Clock, Flame, Target, Tag } from 'lucide-react-native';
import { WeeklyActivityChart } from '../components/Insights/WeeklyActivityChart';
import { DailyActivityChart } from '../components/Insights/DailyActivityChart';
import { MonthlyActivityChart } from '../components/Insights/MonthlyActivityChart';
import { YearlyActivityChart } from '../components/Insights/YearlyActivityChart';

type InsightsView = 'day' | 'week' | 'month' | 'year';

export function InsightsScreen() {
  const { labels } = useTimerStore();
  const { palette } = useThemeStore();
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [activeView, setActiveView] = useState<InsightsView>('day');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(new Date().getDay());

  // Sunday-start logic matching WeeklyActivityChart
  const today = new Date();
  const dayOfWeek = today.getDay(); 
  const mondayOffset = new Date(today.getTime());
  mondayOffset.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  mondayOffset.setHours(0, 0, 0, 0);
  const displaySundayOffset = new Date(mondayOffset);
  displaySundayOffset.setDate(mondayOffset.getDate() - 1);

  const selectedDate = new Date(displaySundayOffset);
  selectedDate.setDate(displaySundayOffset.getDate() + selectedDayIndex);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const str = await AsyncStorage.getItem('@focusqo_timer_state_v2_history');
        let parsed: SessionRecord[] = [];
        if (str) {
          parsed = JSON.parse(str);
        }

        // INJECT DUMMY DATA FOR 365 DAYS (Seasonal Variance)
        const now = Date.now();
        const dummyRecords: SessionRecord[] = [];
        
        for (let i = 0; i < 365; i++) {
          const dayStart = now - (i * 86400000);
          const monthIndex = new Date(dayStart).getMonth();
          
          // Seasonal variance: busier in Spring (March-May) and Autumn (Sept-Nov)
          let intensity = 1.0;
          if (monthIndex >= 2 && monthIndex <= 4) intensity = 1.4; // Spring burst
          if (monthIndex >= 8 && monthIndex <= 10) intensity = 1.2; // Autumn focus
          if (monthIndex === 7 || monthIndex === 11) intensity = 0.6; // Holiday dips

          const sessions = Math.floor((3 + Math.floor(Math.random() * 4)) * intensity);
          for (let s = 0; s < sessions; s++) {
            dummyRecords.push({
              id: `dummy-${i}-${s}`,
              mode: 'focus',
              durationInSeconds: (1200 + Math.floor(Math.random() * 2400)) * intensity,
              timestamp: dayStart - (s * 3600000 * 3), // Spaced by 3h
              labelId: labels.length > 0 ? labels[s % labels.length].id : 'default'
            });
          }
          // Random break
          if (sessions > 0) {
            dummyRecords.push({
              id: `dummy-break-${i}`,
              mode: 'break',
              durationInSeconds: (600 + Math.floor(Math.random() * 1200)) * intensity,
              timestamp: dayStart - 3600000,
              labelId: 'break'
            });
          }
        }
        
        setHistory([...parsed, ...dummyRecords]);
      } catch (e) {}
    };
    fetchHistory();
  }, [labels]);

  const focusHistory = history.filter(r => r.mode === 'focus');
  const totalFocusSeconds = focusHistory.reduce((acc, r) => acc + r.durationInSeconds, 0);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const activeDaysCount = new Set(focusHistory.map(r => new Date(r.timestamp).toDateString())).size;

  const labelTimes = labels.map(label => ({
    ...label,
    seconds: focusHistory
      .filter(r => r.labelId === label.id)
      .reduce((acc, r) => acc + r.durationInSeconds, 0)
  })).filter(l => l.seconds > 0).sort((a,b) => b.seconds - a.seconds);

  const maxLabelTime = labelTimes.length > 0 ? Math.max(...labelTimes.map(l => l.seconds)) : 0;


  const renderChart = useMemo(() => {
    switch (activeView) {
      case 'day':
        return (
          <>
            <WeeklyActivityChart 
              history={history} 
              palette={palette} 
              selectedDayIndex={selectedDayIndex}
              onSelectDay={setSelectedDayIndex}
              hideTooltip={true}
            />
            <DailyActivityChart 
              history={history} 
              palette={palette} 
              date={selectedDate}
            />
          </>
        );
      case 'week':
        return <WeeklyActivityChart history={history} palette={palette} />;
      case 'month':
        return <MonthlyActivityChart history={history} palette={palette} />;
      case 'year':
        return <YearlyActivityChart history={history} palette={palette} />;
      default:
        return null;
    }
  }, [activeView, history, palette, selectedDayIndex, selectedDate]);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.screenTitle, { color: palette.primaryText }]}>Insights</Text>

      {/* Unified Navigation Toggles */}
      <View 
        className="flex-row justify-center mb-8 px-1 py-1 mx-4 rounded-3xl" 
        style={{ 
          backgroundColor: '#111111',
          borderWidth: 1,
          borderColor: '#333333'
        }}
      >
        {(['day', 'week', 'month', 'year'] as InsightsView[]).map((v) => (
          <TouchableOpacity 
            key={v}
            onPress={() => setActiveView(v)}
            style={{ 
              flex: 1, 
              paddingVertical: 12, 
              paddingHorizontal: 16,
              borderRadius: 20, 
              backgroundColor: activeView === v ? palette.timerBlock : 'transparent',
            }}
            className="items-center justify-center"
          >
            <Text style={{ 
              color: palette.timerText,
              fontWeight: activeView === v ? '900' : '600',
              fontSize: 13,
              opacity: activeView === v ? 1 : 0.4
            }}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.bentoGrid}>
        {/* Main "Combo" Card */}
        <View style={[styles.bentoCard, styles.bentoFull, { backgroundColor: '#111111' }]}>
           {renderChart}
        </View>

        {/* Total Focus Time Card */}
        <View style={[styles.bentoCard, styles.bentoFull, { backgroundColor: '#111111' }]}>
          <View style={styles.bentoHeaderRow}>
            <Clock size={14} color={palette.focusColor} />
            <Text style={[styles.bentoLabel, { color: palette.timerText }]}>Total focus time</Text>
          </View>
          <Text style={[styles.bentoHugeValue, { color: palette.timerText }]}>{formatTime(totalFocusSeconds)}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.bentoSplit}>
          <View style={[styles.bentoCard, styles.bentoHalf, { backgroundColor: '#111111' }]}>
            <Target size={18} color={palette.breakColor} style={{ marginBottom: 10 }} />
            <Text style={[styles.bentoValue, { color: palette.timerText }]}>{focusHistory.length}</Text>
            <Text style={[styles.bentoSubLabel, { color: palette.timerText }]}>Sessions</Text>
          </View>

          <View style={[styles.bentoCard, styles.bentoHalf, { backgroundColor: '#111111' }]}>
            <Flame size={18} color={palette.focusColor} style={{ marginBottom: 10 }} />
            <Text style={[styles.bentoValue, { color: palette.timerText }]}>{activeDaysCount}</Text>
            <Text style={[styles.bentoSubLabel, { color: palette.timerText }]}>Active days</Text>
          </View>
        </View>

        {/* Labels Content */}
        {labelTimes.length > 0 && (
          <View style={[styles.bentoCard, styles.bentoFull, { backgroundColor: '#111111' }]}>
            <View style={styles.bentoHeaderRow}>
              <Tag size={18} color={palette.accentColor} />
              <Text style={[styles.bentoLabel, { color: palette.timerText }]}>Labels distribution</Text>
            </View>
            <View className="mt-4">
              {labelTimes.map((label, idx) => {
                const ratio = label.seconds / maxLabelTime;
                return (
                  <View key={label.id} className={idx !== labelTimes.length - 1 ? "mb-6" : ""}>
                    <View className="flex-row justify-between mb-2">
                       <Text style={{ color: palette.timerText }} className="font-bold text-sm">{label.name}</Text>
                       <Text style={{ color: palette.timerText }} className="text-sm font-medium opacity-60">{formatTime(label.seconds)}</Text>
                    </View>
                    <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: palette.timerText + '10' }}>
                       <View className="h-full rounded-full" style={{ backgroundColor: palette.focusColor, width: `${ratio * 100}%` }} />
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
    borderRadius: 28,
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
    padding: 20,
    borderRadius: 24,
  },
  bentoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  bentoLabel: {
    fontSize: 14,
    fontWeight: '700',
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bentoHugeValue: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  bentoValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  bentoSubLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.6,
  },
});
