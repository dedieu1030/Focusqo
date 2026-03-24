import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export type SessionMode = 'focus' | 'break';

export interface SessionRecord {
  id: string;
  mode: SessionMode;
  durationInSeconds: number;
  timestamp: number;
}

interface TimerSettings {
  focusDurationMin: number;
  breakDurationMin: number;
  longBreakDurationMin: number;
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

interface TimerState extends TimerSettings {
  mode: SessionMode;
  isRunning: boolean;
  timeLeft: number; 
  expectedEndTime: number | null;
  todayHistory: SessionRecord[];
  
  // Actions
  updateSettings: (settings: Partial<TimerSettings>) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  skipSession: () => void;
  tick: () => void;
  syncBackgroundTime: () => void;
  loadState: () => Promise<void>;
  _completeSession: () => void;
}

const STORAGE_KEY = '@focusqo_timer_state';

const defaultSettings: TimerSettings = {
  focusDurationMin: 25,
  breakDurationMin: 5,
  longBreakDurationMin: 15,
  soundEnabled: true,
  hapticEnabled: true,
};

export const useTimerStore = create<TimerState>((set, get) => ({
  ...defaultSettings,
  mode: 'focus',
  isRunning: false,
  timeLeft: defaultSettings.focusDurationMin * 60,
  expectedEndTime: null,
  todayHistory: [],

  updateSettings: async (newSettings) => {
    set((state) => ({ ...state, ...newSettings }));
    const { focusDurationMin, breakDurationMin, longBreakDurationMin, soundEnabled, hapticEnabled } = get();
    await AsyncStorage.setItem(STORAGE_KEY + '_settings', JSON.stringify({
      focusDurationMin, breakDurationMin, longBreakDurationMin, soundEnabled, hapticEnabled
    }));
  },

  startTimer: () => {
    const { hapticEnabled, timeLeft } = get();
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    set({ 
      isRunning: true, 
      expectedEndTime: Date.now() + timeLeft * 1000 
    });
  },

  pauseTimer: () => {
    const { hapticEnabled } = get();
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    set({ 
      isRunning: false, 
      expectedEndTime: null 
    });
  },

  skipSession: () => {
    const { _completeSession, hapticEnabled } = get();
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    _completeSession();
  },

  tick: () => {
    const { isRunning, timeLeft, _completeSession } = get();
    if (!isRunning) return;

    if (timeLeft > 0) {
      set({ timeLeft: timeLeft - 1 });
    } else {
      _completeSession();
    }
  },

  syncBackgroundTime: () => {
    const { isRunning, expectedEndTime, _completeSession } = get();
    if (!isRunning || !expectedEndTime) return;

    const now = Date.now();
    const remainingSeconds = Math.round((expectedEndTime - now) / 1000);

    if (remainingSeconds <= 0) {
      _completeSession();
    } else {
      set({ timeLeft: remainingSeconds });
    }
  },

  _completeSession: async () => {
    const { mode, focusDurationMin, breakDurationMin, todayHistory, hapticEnabled } = get();
    
    if (hapticEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // TODO: Play sound if soundEnabled

    const newRecord: SessionRecord = {
      id: Date.now().toString(),
      mode,
      durationInSeconds: mode === 'focus' ? focusDurationMin * 60 : breakDurationMin * 60,
      timestamp: Date.now()
    };

    const nextMode = mode === 'focus' ? 'break' : 'focus';
    const nextDuration = nextMode === 'focus' ? focusDurationMin : breakDurationMin;

    const newHistory = [...todayHistory, newRecord];

    set({
      mode: nextMode,
      timeLeft: nextDuration * 60,
      isRunning: false,
      expectedEndTime: null,
      todayHistory: newHistory
    });

    await AsyncStorage.setItem(STORAGE_KEY + '_history', JSON.stringify(newHistory));
  },

  loadState: async () => {
    try {
      const settingsStr = await AsyncStorage.getItem(STORAGE_KEY + '_settings');
      if (settingsStr) {
        set({ ...JSON.parse(settingsStr) });
      }

      const historyStr = await AsyncStorage.getItem(STORAGE_KEY + '_history');
      if (historyStr) {
        const history: SessionRecord[] = JSON.parse(historyStr);
        // Filter history to only include today
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todayHistory = history.filter(r => r.timestamp >= startOfToday.getTime());
        set({ todayHistory });
      }
      
      // Initialize timeLeft properly if just loaded
      const { mode, focusDurationMin, breakDurationMin } = get();
      set({ timeLeft: mode === 'focus' ? focusDurationMin * 60 : breakDurationMin * 60 });
    } catch (e) {
      console.error('Failed to load timer state', e);
    }
  }
}));
