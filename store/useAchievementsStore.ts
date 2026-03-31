import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionRecord } from './useTimerStore';

export interface Achievement {
  id: number;
  title: string;
  description: string;
  era: 'wisp' | 'guardian' | 'sage' | 'deity';
  criteria: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  totalFocusSessions: number;
  totalFocusHours: number;
  totalLabelsUsed: number;
  longestStreakDays: number;
  currentStreakDays: number;
  totalActiveDays: number;
  longestSessionMinutes: number;
  totalSessions: number;
  maxHoursOnSingleLabel: number;
  sessionsBeforeHour: number; // before 7 AM
  sessionsAfterHour: number;  // after 11 PM
  maxSessionsInOneDay: number;
  maxHoursInOneDay: number;
}

const STORAGE_KEY = '@focusqo_achievements';

export const ACHIEVEMENTS_CATALOG: Achievement[] = [
  // WISP ERA (1-10)
  { id: 1, title: 'The Spark', description: 'Complete your 1st focus session', era: 'wisp', criteria: (s) => s.totalFocusSessions >= 1 },
  { id: 2, title: 'First Word', description: 'Create your 1st custom label', era: 'wisp', criteria: (s) => s.totalLabelsUsed >= 1 },
  { id: 3, title: 'The Rhythm', description: 'Focus 3 days in a row', era: 'wisp', criteria: (s) => s.longestStreakDays >= 3 },
  { id: 4, title: 'Full Week', description: '7-day focus streak', era: 'wisp', criteria: (s) => s.longestStreakDays >= 7 },
  { id: 5, title: 'Power User', description: 'Complete 10 focus sessions', era: 'wisp', criteria: (s) => s.totalFocusSessions >= 10 },
  { id: 6, title: 'Hour One', description: 'Reach 1 total hour of focus', era: 'wisp', criteria: (s) => s.totalFocusHours >= 1 },
  { id: 7, title: 'Night Owl', description: 'Focus after 11 PM', era: 'wisp', criteria: (s) => s.sessionsAfterHour >= 1 },
  { id: 8, title: 'Early Bird', description: 'Focus before 7 AM', era: 'wisp', criteria: (s) => s.sessionsBeforeHour >= 1 },
  { id: 9, title: 'Focused Friday', description: 'Complete 5 sessions in one day', era: 'wisp', criteria: (s) => s.maxSessionsInOneDay >= 5 },
  { id: 10, title: 'The Anchor', description: 'Spend 5 hours on a single label', era: 'wisp', criteria: (s) => s.maxHoursOnSingleLabel >= 5 },

  // GUARDIAN ERA (11-25)
  { id: 11, title: 'Deep Diver', description: 'Complete a 60min+ session', era: 'guardian', criteria: (s) => s.longestSessionMinutes >= 60 },
  { id: 12, title: 'The 10 Piece', description: 'Complete 25 focus sessions', era: 'guardian', criteria: (s) => s.totalFocusSessions >= 25 },
  { id: 13, title: 'Fortnight', description: '14-day focus streak', era: 'guardian', criteria: (s) => s.longestStreakDays >= 14 },
  { id: 14, title: 'Focus Half-Day', description: 'Focus 4 hours in a single day', era: 'guardian', criteria: (s) => s.maxHoursInOneDay >= 4 },
  { id: 15, title: 'Century Sessions', description: 'Complete 100 focus sessions', era: 'guardian', criteria: (s) => s.totalFocusSessions >= 100 },
  { id: 16, title: 'Sovereign of Categories', description: 'Use 10 different labels', era: 'guardian', criteria: (s) => s.totalLabelsUsed >= 10 },
  { id: 17, title: 'Month One', description: '30-day focus streak', era: 'guardian', criteria: (s) => s.longestStreakDays >= 30 },
  { id: 18, title: 'The 50 Club', description: 'Reach 50 total focus hours', era: 'guardian', criteria: (s) => s.totalFocusHours >= 50 },
  { id: 19, title: 'Marathon', description: 'Complete a 90min+ session', era: 'guardian', criteria: (s) => s.longestSessionMinutes >= 90 },
  { id: 20, title: 'Weekend Warrior', description: 'Focus 10 days total', era: 'guardian', criteria: (s) => s.totalActiveDays >= 10 },
  { id: 21, title: 'Triple Digit', description: 'Reach 100 total focus hours', era: 'guardian', criteria: (s) => s.totalFocusHours >= 100 },
  { id: 22, title: 'The Specialist', description: 'Spend 50 hours on a single label', era: 'guardian', criteria: (s) => s.maxHoursOnSingleLabel >= 50 },
  { id: 23, title: 'Consistency Titan', description: '60-day focus streak', era: 'guardian', criteria: (s) => s.longestStreakDays >= 60 },
  { id: 24, title: 'Early Adopter', description: 'Use the app for 100 days', era: 'guardian', criteria: (s) => s.totalActiveDays >= 100 },
  { id: 25, title: 'Peak Energy', description: 'Focus 5 sessions before 7 AM', era: 'guardian', criteria: (s) => s.sessionsBeforeHour >= 5 },

  // SAGE ERA (26-40)
  { id: 26, title: 'Midnight Oil', description: 'Focus 5 sessions after 11 PM', era: 'sage', criteria: (s) => s.sessionsAfterHour >= 5 },
  { id: 27, title: 'Focus Nomad', description: 'Use 5 different labels', era: 'sage', criteria: (s) => s.totalLabelsUsed >= 5 },
  { id: 28, title: 'Quarter Year', description: '90-day focus streak', era: 'sage', criteria: (s) => s.longestStreakDays >= 90 },
  { id: 29, title: 'Half Way', description: 'Unlock 25 achievements', era: 'sage', criteria: (_s) => false }, // Special: checked separately
  { id: 30, title: 'The Architect', description: 'Reach 250 total focus hours', era: 'sage', criteria: (s) => s.totalFocusHours >= 250 },
  { id: 31, title: 'Unstoppable', description: '100-day focus streak', era: 'sage', criteria: (s) => s.longestStreakDays >= 100 },
  { id: 32, title: 'The 500', description: 'Reach 500 total focus hours', era: 'sage', criteria: (s) => s.totalFocusHours >= 500 },
  { id: 33, title: 'Label Legend', description: 'Spend 100 hours on a single label', era: 'sage', criteria: (s) => s.maxHoursOnSingleLabel >= 100 },
  { id: 34, title: 'Iron Focus', description: '10 sessions in a single day', era: 'sage', criteria: (s) => s.maxSessionsInOneDay >= 10 },
  { id: 35, title: 'The Serene Sage', description: 'Complete 500 total sessions', era: 'sage', criteria: (s) => s.totalFocusSessions >= 500 },
  { id: 36, title: 'Focus Master', description: 'Complete 1000 total sessions', era: 'sage', criteria: (s) => s.totalFocusSessions >= 1000 },
  { id: 37, title: 'The Voyager', description: 'Focus for 200 active days', era: 'sage', criteria: (s) => s.totalActiveDays >= 200 },
  { id: 38, title: 'Blink of an Eye', description: 'Reach 750 total focus hours', era: 'sage', criteria: (s) => s.totalFocusHours >= 750 },
  { id: 39, title: 'The Alchemist', description: 'Complete 2000 total sessions', era: 'sage', criteria: (s) => s.totalFocusSessions >= 2000 },
  { id: 40, title: 'Steel Will', description: '180-day focus streak', era: 'sage', criteria: (s) => s.longestStreakDays >= 180 },

  // DEITY ERA (41-50)
  { id: 41, title: 'Millennium', description: 'Reach 1000 total focus hours', era: 'deity', criteria: (s) => s.totalFocusHours >= 1000 },
  { id: 42, title: 'Grand Sovereign', description: 'Complete 2500 total sessions', era: 'deity', criteria: (s) => s.totalFocusSessions >= 2500 },
  { id: 43, title: 'The Sage', description: 'Use 20 different labels', era: 'deity', criteria: (s) => s.totalLabelsUsed >= 20 },
  { id: 44, title: 'Absolute Focus', description: 'Focus 10 hours in a single day', era: 'deity', criteria: (s) => s.maxHoursInOneDay >= 10 },
  { id: 45, title: 'Focus Veteran', description: 'Focus for 300 active days', era: 'deity', criteria: (s) => s.totalActiveDays >= 300 },
  { id: 46, title: 'Diamond Will', description: '300-day focus streak', era: 'deity', criteria: (s) => s.longestStreakDays >= 300 },
  { id: 47, title: 'The Oracle', description: 'Reach 2500 total focus hours', era: 'deity', criteria: (s) => s.totalFocusHours >= 2500 },
  { id: 48, title: 'Infinity Core', description: 'Reach 5000 total focus hours', era: 'deity', criteria: (s) => s.totalFocusHours >= 5000 },
  { id: 49, title: 'Guardian of Time', description: '5 days in a row with 8h+ focus', era: 'deity', criteria: (s) => s.maxHoursInOneDay >= 8 && s.longestStreakDays >= 5 },
  { id: 50, title: 'Omega', description: '365-day focus streak', era: 'deity', criteria: (s) => s.longestStreakDays >= 365 },
];

interface AchievementsState {
  unlockedIds: number[];
  checkAchievements: (history: SessionRecord[], labelsCount: number) => void;
  loadAchievements: () => Promise<void>;
}

function computeStats(history: SessionRecord[], labelsCount: number): AchievementStats {
  const focusHistory = history.filter(r => r.mode === 'focus');

  const totalFocusSessions = focusHistory.length;
  const totalFocusHours = focusHistory.reduce((acc, r) => acc + r.durationInSeconds, 0) / 3600;
  const totalSessions = history.length;

  // Active days
  const daySet = new Set(focusHistory.map(r => new Date(r.timestamp).toDateString()));
  const totalActiveDays = daySet.size;

  // Longest session
  const longestSessionMinutes = focusHistory.length > 0
    ? Math.max(...focusHistory.map(r => r.durationInSeconds / 60))
    : 0;

  // Streak calculation
  const sortedDays = Array.from(daySet).map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
  let longestStreakDays = 0;
  let currentStreakDays = 0;
  let streak = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const diff = (sortedDays[i].getTime() - sortedDays[i - 1].getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
    } else {
      streak = 1;
    }
    longestStreakDays = Math.max(longestStreakDays, streak);
  }
  if (sortedDays.length === 1) longestStreakDays = 1;

  // Check if today is part of the streak
  const todayStr = new Date().toDateString();
  const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
  if (daySet.has(todayStr) || daySet.has(yesterdayStr)) {
    let cs = 1;
    const sorted = sortedDays.reverse();
    for (let i = 1; i < sorted.length; i++) {
      const diff = (sorted[i - 1].getTime() - sorted[i].getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) { cs++; } else { break; }
    }
    currentStreakDays = cs;
  }

  // Labels used
  const uniqueLabels = new Set(focusHistory.map(r => r.labelId).filter(Boolean));
  const totalLabelsUsed = Math.max(uniqueLabels.size, labelsCount);

  // Max hours on single label
  const labelHours: Record<string, number> = {};
  focusHistory.forEach(r => {
    if (r.labelId) {
      labelHours[r.labelId] = (labelHours[r.labelId] || 0) + r.durationInSeconds / 3600;
    }
  });
  const maxHoursOnSingleLabel = Object.values(labelHours).length > 0
    ? Math.max(...Object.values(labelHours))
    : 0;

  // Time-of-day sessions
  let sessionsBeforeHour = 0;
  let sessionsAfterHour = 0;
  focusHistory.forEach(r => {
    const hour = new Date(r.timestamp).getHours();
    if (hour < 7) sessionsBeforeHour++;
    if (hour >= 23) sessionsAfterHour++;
  });

  // Max sessions in one day
  const daySessions: Record<string, number> = {};
  const dayHoursMap: Record<string, number> = {};
  focusHistory.forEach(r => {
    const day = new Date(r.timestamp).toDateString();
    daySessions[day] = (daySessions[day] || 0) + 1;
    dayHoursMap[day] = (dayHoursMap[day] || 0) + r.durationInSeconds / 3600;
  });
  const maxSessionsInOneDay = Object.values(daySessions).length > 0
    ? Math.max(...Object.values(daySessions))
    : 0;
  const maxHoursInOneDay = Object.values(dayHoursMap).length > 0
    ? Math.max(...Object.values(dayHoursMap))
    : 0;

  return {
    totalFocusSessions,
    totalFocusHours,
    totalLabelsUsed,
    longestStreakDays,
    currentStreakDays,
    totalActiveDays,
    longestSessionMinutes,
    totalSessions,
    maxHoursOnSingleLabel,
    sessionsBeforeHour,
    sessionsAfterHour,
    maxSessionsInOneDay,
    maxHoursInOneDay,
  };
}

export const useAchievementsStore = create<AchievementsState>((set, get) => ({
  unlockedIds: [],

  checkAchievements: (history: SessionRecord[], labelsCount: number) => {
    const stats = computeStats(history, labelsCount);
    const currentUnlocked = get().unlockedIds;
    const newUnlocked = [...currentUnlocked];

    ACHIEVEMENTS_CATALOG.forEach(achievement => {
      if (!newUnlocked.includes(achievement.id)) {
        // Special case: "Half Way" requires 25 achievements
        if (achievement.id === 29) {
          if (newUnlocked.length >= 25) {
            newUnlocked.push(achievement.id);
          }
        } else if (achievement.criteria(stats)) {
          newUnlocked.push(achievement.id);
        }
      }
    });

    if (newUnlocked.length !== currentUnlocked.length) {
      set({ unlockedIds: newUnlocked });
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUnlocked));
    }
  },

  loadAchievements: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ unlockedIds: JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Failed to load achievements', e);
    }
  },
}));
