import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@focusqo_sleep_settings_v3';

interface SleepSettings {
  sleepTime: string;
  wakeTime: string;
  isSleepModeActive: boolean;
  restrictedAppIds: string[];
}

interface SleepState extends SleepSettings {
  setSleepTime: (time: string) => void;
  setWakeTime: (time: string) => void;
  setRestrictedApps: (ids: string[]) => void;
  toggleSleepMode: (active: boolean) => void;
  loadSettings: () => Promise<void>;
  _persist: () => Promise<void>;
}

export const useSleepStore = create<SleepState>((set, get) => ({
  sleepTime: '23:30',
  wakeTime: '07:30',
  isSleepModeActive: false,
  restrictedAppIds: ['Instagram', 'TikTok', 'Reddit', 'YouTube', 'Safari'],

  setSleepTime: (time) => {
    set({ sleepTime: time });
    get()._persist();
  },

  setWakeTime: (time) => {
    set({ wakeTime: time });
    get()._persist();
  },

  setRestrictedApps: (ids) => {
    set({ restrictedAppIds: ids });
    get()._persist();
  },

  toggleSleepMode: (active) => {
    set({ isSleepModeActive: active });
    get()._persist();
  },

  loadSettings: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        set(JSON.parse(raw));
      }
    } catch (e) {
      console.warn('Failed to load sleep settings', e);
    }
  },

  _persist: async () => {
    const { sleepTime, wakeTime, isSleepModeActive, restrictedAppIds } = get();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
      sleepTime, wakeTime, isSleepModeActive, restrictedAppIds
    }));
  }
}));
