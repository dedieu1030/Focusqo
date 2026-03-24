import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';

export type SessionMode = 'focus' | 'break' | 'longBreak';
export type TimerStateEnum = 'idle' | 'running' | 'paused' | 'finished';
export type TimerShape = 'rounded' | 'circle' | 'arch';

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
  focusDurationSec: number;
  breakDurationMin: number;
  breakDurationSec: number;
  longBreakDurationMin: number;
  longBreakDurationSec: number;
  cyclesBeforeLongBreak: number;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  timerShape: TimerShape;
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
  focusDurationSec: 0,
  breakDurationMin: 5,
  breakDurationSec: 0,
  longBreakDurationMin: 15,
  longBreakDurationSec: 0,
  cyclesBeforeLongBreak: 4,
  soundEnabled: true,
  hapticEnabled: true,
  timerShape: 'rounded'
};

async function playChime() {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/favicon.png') 
    );
    await sound.playAsync();
  } catch (e) {}
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
    
    // Immediately recaulate timeLeft if idle
    const updatedState = get();
    if (updatedState.timerState === 'idle') {
      let durMin = updatedState.focusDurationMin;
      let durSec = updatedState.focusDurationSec;
      if (updatedState.mode === 'break') { durMin = updatedState.breakDurationMin; durSec = updatedState.breakDurationSec; }
      if (updatedState.mode === 'longBreak') { durMin = updatedState.longBreakDurationMin; durSec = updatedState.longBreakDurationSec; }
      const totalSec = durMin * 60 + durSec;
      set({ timeLeft: totalSec > 0 ? totalSec : 60 }); // Prevent 0 time
    }
    
    await get()._persistState();
  },

  startTimer: async () => {
    const { hapticEnabled, timeLeft } = get();
    if (timeLeft <= 0) return;

    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    set({ 
      timerState: 'running', 
      expectedEndTime: Date.now() + timeLeft * 1000 
    });

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
    
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  resetTimer: () => {
    const { mode, focusDurationMin, focusDurationSec, breakDurationMin, breakDurationSec, longBreakDurationMin, longBreakDurationSec } = get();
    let durMin = focusDurationMin; let durSec = focusDurationSec;
    if (mode === 'break') { durMin = breakDurationMin; durSec = breakDurationSec; }
    if (mode === 'longBreak') { durMin = longBreakDurationMin; durSec = longBreakDurationSec; }
    
    const totalSec = durMin * 60 + durSec;
    
    set({
      timerState: 'idle',
      timeLeft: totalSec > 0 ? totalSec : 60,
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
      mode, focusDurationMin, focusDurationSec, breakDurationMin, breakDurationSec, longBreakDurationMin, longBreakDurationSec, 
      todayHistory, currentCycleCount, cyclesBeforeLongBreak, soundEnabled, hapticEnabled, selectedLabelId
    } = get();
    
    if (hapticEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (soundEnabled) playChime();

    let completedDurMin = focusDurationMin; let completedDurSec = focusDurationSec;
    if (mode === 'break') { completedDurMin = breakDurationMin; completedDurSec = breakDurationSec; }
    if (mode === 'longBreak') { completedDurMin = longBreakDurationMin; completedDurSec = longBreakDurationSec; }
    const duration = completedDurMin * 60 + completedDurSec;
    
    const newRecord: SessionRecord = {
      id: Date.now().toString(),
      mode,
      durationInSeconds: duration,
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

    let nextDurMin = focusDurationMin; let nextDurSec = focusDurationSec;
    if (nextMode === 'break') { nextDurMin = breakDurationMin; nextDurSec = breakDurationSec; }
    if (nextMode === 'longBreak') { nextDurMin = longBreakDurationMin; nextDurSec = longBreakDurationSec; }
    const nextTotalSec = nextDurMin * 60 + nextDurSec;

    set({
      mode: nextMode,
      timerState: 'finished',
      timeLeft: nextTotalSec > 0 ? nextTotalSec : 60,
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

  _persistState: async () => {
    const { focusDurationMin, focusDurationSec, breakDurationMin, breakDurationSec, longBreakDurationMin, longBreakDurationSec, cyclesBeforeLongBreak, soundEnabled, hapticEnabled, timerShape, labels, selectedLabelId } = get();
    await AsyncStorage.setItem(STORAGE_KEY + '_settings', JSON.stringify({
      focusDurationMin, focusDurationSec, breakDurationMin, breakDurationSec, longBreakDurationMin, longBreakDurationSec, cyclesBeforeLongBreak, soundEnabled, hapticEnabled, timerShape, labels, selectedLabelId
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
        const toLoad = { ...parsed };
        if (!toLoad.timerShape || toLoad.timerShape === 'leaf') toLoad.timerShape = 'rounded';

        // Add defaults for sec fields to support older saves
        if (toLoad.focusDurationSec === undefined) {
          toLoad.focusDurationSec = 0;
          toLoad.breakDurationSec = 0;
          toLoad.longBreakDurationSec = 0;
        }
        set(toLoad);
      }

      const historyStr = await AsyncStorage.getItem(STORAGE_KEY + '_history');
      if (historyStr) {
        const history: SessionRecord[] = JSON.parse(historyStr);
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todayHistory = history.filter(r => r.timestamp >= startOfToday.getTime());
        set({ todayHistory });
      }
      
      const { mode, focusDurationMin, focusDurationSec, breakDurationMin, breakDurationSec, longBreakDurationMin, longBreakDurationSec } = get();
      let durMin = focusDurationMin; let durSec = focusDurationSec;
      if (mode === 'break') { durMin = breakDurationMin; durSec = breakDurationSec; }
      if (mode === 'longBreak') { durMin = longBreakDurationMin; durSec = longBreakDurationSec; }
      
      const totalSec = durMin * 60 + durSec;
      set({ timeLeft: totalSec > 0 ? totalSec : 60 });
    } catch (e) {
      console.error('Failed to load timer state', e);
    }
  }
})); 
