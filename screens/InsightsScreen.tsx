import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTimerStore, SessionRecord } from '../store/useTimerStore';
import { useThemeStore } from '../store/useThemeStore';
import { Timer1, Flash, Direct, Tag } from 'iconsax-react-native';
import { WeeklyActivityChart } from '../components/Insights/WeeklyActivityChart';
import { DailyActivityChart } from '../components/Insights/DailyActivityChart';
import { MonthlyActivityChart } from '../components/Insights/MonthlyActivityChart';
import { YearlyActivityChart } from '../components/Insights/YearlyActivityChart';

type InsightsView = 'day' | 'week' | 'month' | 'year';

export function InsightsScreen() {
  const { labels, history } = useTimerStore();
  const { palette } = useThemeStore();
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
              hideLegend={true}
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
      <View style={styles.headerRow}>
        <Text style={[styles.screenTitle, { color: palette.primaryText }]}>Insights</Text>
      </View>

      {/* Unified Navigation Toggles */}
      <View 
        className="flex-row justify-center mb-8 px-1 py-1 mx-4 rounded-3xl" 
        style={{ 
          backgroundColor: '#111111',
          gap: 4
        }}
      >
        {(['day', 'week', 'month', 'year'] as InsightsView[]).map((v) => (
          <TouchableOpacity 
            key={v}
            onPress={() => setActiveView(v)}
            style={{ 
              flex: 1, 
              paddingVertical: 10, 
              borderRadius: 20, 
              backgroundColor: activeView === v ? palette.timerText : 'transparent',
            }}
            className="items-center justify-center"
          >
            <Text style={{ 
              color: activeView === v ? '#111111' : palette.timerText,
              fontWeight: activeView === v ? '900' : '600',
              fontSize: 13,
              opacity: activeView === v ? 1 : 0.7
            }}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={[styles.chartContainer, { backgroundColor: '#111111' }]}>
         {renderChart}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  chartContainer: {
    borderRadius: 28,
    padding: 24,
    width: '100%',
  },
});
