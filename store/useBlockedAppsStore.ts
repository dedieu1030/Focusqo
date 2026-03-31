import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BlockedApp {
  id: string;
  name: string;
  icon: any | null; // require() image or null for custom apps
}

// Pre-loaded apps with real icons
export const KNOWN_ICONS: Record<string, any> = {
  instagram: require('../assets/app-logos/instagram.png'),
  youtube: require('../assets/app-logos/youtube.png'),
  tiktok: require('../assets/app-logos/tiktok.png'),
  reddit: require('../assets/app-logos/reddit.png'),
  x: require('../assets/app-logos/x.png'),
  twitter: require('../assets/app-logos/x.png'),
  pinterest: require('../assets/app-logos/pinterest.png'),
  facebook: require('../assets/app-logos/facebook.png'),
  linkedin: require('../assets/app-logos/linkedin.png'),
};

const DEFAULT_APPS: BlockedApp[] = [
  { id: '1', name: 'Instagram', icon: KNOWN_ICONS.instagram },
  { id: '2', name: 'YouTube', icon: KNOWN_ICONS.youtube },
  { id: '3', name: 'TikTok', icon: KNOWN_ICONS.tiktok },
  { id: '4', name: 'Reddit', icon: KNOWN_ICONS.reddit },
  { id: '5', name: 'X', icon: KNOWN_ICONS.x },
  { id: '6', name: 'Pinterest', icon: KNOWN_ICONS.pinterest },
  { id: '7', name: 'Facebook', icon: KNOWN_ICONS.facebook },
  { id: '8', name: 'LinkedIn', icon: KNOWN_ICONS.linkedin },
];

const STORAGE_KEY = '@focusqo_blocked_apps';

interface BlockedAppsState {
  apps: BlockedApp[];
  loadApps: () => Promise<void>;
  addApp: (name: string) => void;
  removeApp: (id: string) => void;
}

export const useBlockedAppsStore = create<BlockedAppsState>((set, get) => ({
  apps: DEFAULT_APPS,

  loadApps: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: { id: string; name: string }[] = JSON.parse(raw);
        // Restore icons for known apps, null for custom
        const restored = saved.map((app) => ({
          ...app,
          icon: KNOWN_ICONS[app.name.toLowerCase()] || null,
        }));
        set({ apps: restored });
      }
    } catch (e) {
      console.warn('Failed to load blocked apps', e);
    }
  },

  addApp: (name: string) => {
    const { apps } = get();
    const trimmed = name.trim();
    if (!trimmed) return;
    // Avoid duplicates
    if (apps.some((a) => a.name.toLowerCase() === trimmed.toLowerCase())) return;

    const newApp: BlockedApp = {
      id: Date.now().toString(),
      name: trimmed,
      icon: KNOWN_ICONS[trimmed.toLowerCase()] || null,
    };
    const updated = [...apps, newApp];
    set({ apps: updated });
    // Persist (save names only, icons are resolved at load)
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated.map(({ id, name }) => ({ id, name })))
    );
  },

  removeApp: (id: string) => {
    const { apps } = get();
    const updated = apps.filter((a) => a.id !== id);
    set({ apps: updated });
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated.map(({ id, name }) => ({ id, name })))
    );
  },
}));
