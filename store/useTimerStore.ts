import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';

export type SessionMode = 'focus' | 'break' | 'longBreak';
export type TimerStateEnum = 'idle' | 'running' | 'paused' | 'finished';

export interface Label {
  id: string;
  name: string;
}

export interface SessionRecord {
  id: string;
  mode: SessionMode;
  durationInSeconds: number;
  timestamp: number;
  labelId?: string | null;
}

interface TimerSettings {
  focusDurationMin: number;
  breakDurationMin: number;
  longBreakDurationMin: number;
  cyclesBeforeLongBreak: number;
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

interface TimerState extends TimerSettings {
  mode: SessionMode;
  timerState: TimerStateEnum;
  timeLeft: number; 
  expectedEndTime: number | null;
  todayHistory: SessionRecord[];
  
  currentCycleCount: number;

  labels: Label[];
  selectedLabelId: string | null;
  
  updateSettings: (settings: Partial<TimerSettings>) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  skipSession: () => void;
  resetTimer: () => void;
  tick: () => void;
  syncBackgroundTime: () => void;
  loadState: () => Promise<void>;
  _completeSession: () => void;
  
  addLabel: (name: string) => void;
  deleteLabel: (id: string) => void;
  selectLabel: (id: string | null) => void;
  
  _persistState: () => Promise<void>;
  _persistHistory: () => Promise<void>;
}

const STORAGE_KEY = '@focusqo_timer_state_v2';

const defaultSettings: TimerSettings = {
  focusDurationMin: 25,
  breakDurationMin: 5,
  longBreakDurationMin: 15,
  cyclesBeforeLongBreak: 4,
  soundEnabled: true,
  hapticEnabled: true,
};

async function playChime() {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/favicon.png') // Fallback if no audio asset exists right now, but we should handle nicely
    );
    // Realistically this needs a real sound file. We'll catch the error if it fails.
    await sound.playAsync();
  } catch (e) {
    // console.log("Audio not yet set up properly");
  }
}

export const useTimerStore = create<TimerState>((set, get) => ({
  ...defaultSettings,
  mode: 'focus',
  timerState: 'idle',
  timeLeft: defaultSettings.focusDurationMin * 60,
  expectedEndTime: null,
  todayHistory: [],
  currentCycleCount: 0,
  labels: [],
  selectedLabelId: null,

  updateSettings: async (newSettings) => {
    set((state) => ({ ...state, ...newSettings }));
    
    // If timer is idle, immediately apply the new duration to timeLeft
    const updatedState = get();
    if (updatedState.timerState === 'idle') {
      let duration = updatedState.focusDurationMin;
      if (updatedState.mode === 'break') duration = updatedState.breakDurationMin;
      if (updatedState.mode === 'longBreak') duration = updatedState.longBreakDurationMin;
      set({ timeLeft: duration * 60 });
    }
    
    await get()._persistState();
  },

  startTimer: async () => {
    const { hapticEnabled, timeLeft } = get();
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    set({ 
      timerState: 'running', 
      expectedEndTime: Date.now() + timeLeft * 1000 
    });

    // Schedule local notification
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Session Finished! ⏱️",
        body: "Time to switch gears.",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: timeLeft,
      },
    });
  },

  pauseTimer: async () => {
    const { hapticEnabled } = get();
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    set({ 
      timerState: 'paused', 
      expectedEndTime: null 
    });
    
    // Cancel notification since timer is paused
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  resetTimer: () => {
    const { mode, focusDurationMin, breakDurationMin, longBreakDurationMin } = get();
    let duration = focusDurationMin;
    if (mode === 'break') duration = breakDurationMin;
    if (mode === 'longBreak') duration = longBreakDurationMin;
    
    set({
      timerState: 'idle',
      timeLeft: duration * 60,
      expectedEndTime: null
    });
    Notifications.cancelAllScheduledNotificationsAsync();
  },

  skipSession: async () => {
    const { hapticEnabled, _completeSession } = get();
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await Notifications.cancelAllScheduledNotificationsAsync();
    _completeSession();
  },

  tick: () => {
    const { timerState, timeLeft, _completeSession } = get();
    if (timerState !== 'running') return;

    if (timeLeft > 0) {
      set({ timeLeft: timeLeft - 1 });
    } else {
      _completeSession();
    }
  },

  syncBackgroundTime: () => {
    const { timerState, expectedEndTime, _completeSession } = get();
    if (timerState !== 'running' || !expectedEndTime) return;

    const now = Date.now();
    const remainingSeconds = Math.round((expectedEndTime - now) / 1000);

    if (remainingSeconds <= 0) {
      _completeSession();
    } else {
      set({ timeLeft: remainingSeconds });
    }
  },

  _completeSession: async () => {
    const { 
      mode, focusDurationMin, breakDurationMin, longBreakDurationMin, 
      todayHistory, currentCycleCount, cyclesBeforeLongBreak, soundEnabled, hapticEnabled, selectedLabelId
    } = get();
    
    if (hapticEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (soundEnabled) playChime();

    const duration = mode === 'focus' ? focusDurationMin : (mode === 'break' ? breakDurationMin : longBreakDurationMin);
    
    const newRecord: SessionRecord = {
      id: Date.now().toString(),
      mode,
      durationInSeconds: duration * 60,
      timestamp: Date.now(),
      labelId: selectedLabelId
    };

    const newHistory = [...todayHistory, newRecord];
    let nextMode: SessionMode = 'break';
    let nextCycleCount = currentCycleCount;

    if (mode === 'focus') {
      nextCycleCount += 1;
      if (nextCycleCount >= cyclesBeforeLongBreak) {
        nextMode = 'longBreak';
        nextCycleCount = 0;
      } else {
        nextMode = 'break';
      }
    } else {
      nextMode = 'focus';
    }

    let nextDuration = focusDurationMin;
    if (nextMode === 'break') nextDuration = breakDurationMin;
    if (nextMode === 'longBreak') nextDuration = longBreakDurationMin;

    set({
      mode: nextMode,
      timerState: 'finished', // UI can detect this to auto-start or require user input
      timeLeft: nextDuration * 60,
      expectedEndTime: null,
      todayHistory: newHistory,
      currentCycleCount: nextCycleCount
    });

    await get()._persistHistory();
  },

  addLabel: async (name: string) => {
    const { labels } = get();
    const newLabel: Label = { id: Date.now().toString(), name };
    set({ labels: [...labels, newLabel], selectedLabelId: newLabel.id });
    await get()._persistState();
  },

  deleteLabel: async (id: string) => {
    const { labels, selectedLabelId } = get();
    set({ 
      labels: labels.filter(l => l.id !== id),
      selectedLabelId: selectedLabelId === id ? null : selectedLabelId
    });
    await get()._persistState();
  },

  selectLabel: async (id: string | null) => {
    set({ selectedLabelId: id });
    await get()._persistState();
  },

  // Helpers
  _persistState: async () => {
    const { focusDurationMin, breakDurationMin, longBreakDurationMin, cyclesBeforeLongBreak, soundEnabled, hapticEnabled, labels, selectedLabelId } = get();
    await AsyncStorage.setItem(STORAGE_KEY + '_settings', JSON.stringify({
      focusDurationMin, breakDurationMin, longBreakDurationMin, cyclesBeforeLongBreak, soundEnabled, hapticEnabled, labels, selectedLabelId
    }));
  },
  
  _persistHistory: async () => {
    await AsyncStorage.setItem(STORAGE_KEY + '_history', JSON.stringify(get().todayHistory));
  },

  loadState: async () => {
    try {
      const settingsStr = await AsyncStorage.getItem(STORAGE_KEY + '_settings');
      if (settingsStr) {
        const parsed = JSON.parse(settingsStr);
        set({ ...parsed });
      }

      const historyStr = await AsyncStorage.getItem(STORAGE_KEY + '_history');
      if (historyStr) {
        const history: SessionRecord[] = JSON.parse(historyStr);
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todayHistory = history.filter(r => r.timestamp >= startOfToday.getTime());
        set({ todayHistory });
      }
      
      const { mode, focusDurationMin, breakDurationMin, longBreakDurationMin } = get();
      let duration = focusDurationMin;
      if (mode === 'break') duration = breakDurationMin;
      if (mode === 'longBreak') duration = longBreakDurationMin;
      
      set({ timeLeft: duration * 60 });
    } catch (e) {
      console.error('Failed to load timer state', e);
    }
  }
}));
