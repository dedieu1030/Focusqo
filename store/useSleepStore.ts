import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@focusqo_sleep_settings';

export interface SleepSettings {
  sleepTime: string; // HH:mm
  wakeTime: string;  // HH:mm
  scrollAppIds: string[];
  isOnboarded: boolean;
}

interface SleepState extends SleepSettings {
  screenOffTime: string; // HH:mm (sleepTime - 45m)
  sleepDuration: number; // hours
  
  setSleepTime: (time: string) => void;
  setWakeTime: (time: string) => void;
  setScrollApps: (ids: string[]) => void;
  completeOnboarding: () => void;
  loadSleepSettings: () => Promise<void>;
  _persist: () => void;
  resetSleep: () => void;
}

const calculateMetrics = (sleepTime: string, wakeTime: string) => {
  const [sH, sM] = sleepTime.split(':').map(Number);
  const [wH, wM] = wakeTime.split(':').map(Number);

  // Screen Off: sleep - 45 mins
  let offH = sH;
  let offM = sM - 45;
  if (offM < 0) {
    offM += 60;
    offH = (offH - 1 + 24) % 24;
  }
  const screenOffTime = `${offH.toString().padStart(2, '0')}:${offM.toString().padStart(2, '0')}`;

  // Duration
  let startMins = sH * 60 + sM;
  let endMins = wH * 60 + wM;
  if (endMins < startMins) endMins += 24 * 60; // Next day
  const sleepDuration = (endMins - startMins) / 60;

  return { screenOffTime, sleepDuration };
};

export const useSleepStore = create<SleepState>((set, get) => ({
  sleepTime: '23:30',
  wakeTime: '07:30',
  scrollAppIds: [],
  isOnboarded: false,
  screenOffTime: '22:45',
  sleepDuration: 8,

  setSleepTime: (time) => {
    const { wakeTime } = get();
    const metrics = calculateMetrics(time, wakeTime);
    set({ sleepTime: time, ...metrics });
    get()._persist();
  },

  setWakeTime: (time) => {
    const { sleepTime } = get();
    const metrics = calculateMetrics(sleepTime, time);
    set({ wakeTime: time, ...metrics });
    get()._persist();
  },

  setScrollApps: (ids) => {
    set({ scrollAppIds: ids });
    get()._persist();
  },

  completeOnboarding: () => {
    set({ isOnboarded: true });
    get()._persist();
  },

  loadSleepSettings: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const metrics = calculateMetrics(saved.sleepTime || '23:30', saved.wakeTime || '07:30');
        set({ ...saved, ...metrics });
      }
    } catch (e) {
      console.warn('Failed to load sleep settings', e);
    }
  },

  _persist: () => {
    const { sleepTime, wakeTime, scrollAppIds, isOnboarded } = get();
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
      sleepTime, wakeTime, scrollAppIds, isOnboarded
    }));
  },

  resetSleep: () => {
    set({ isOnboarded: false });
    AsyncStorage.removeItem(STORAGE_KEY);
  }
}));
