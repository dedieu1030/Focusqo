import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppData = {
  id: string;
  name: string;
  iconRef: any; // React Native require()
};

// The full catalog of supported mock apps
export const APP_CATALOG: AppData[] = [
  { id: '1', name: 'Instagram', iconRef: require('../assets/app-logos/instagram.png') },
  { id: '2', name: 'YouTube', iconRef: require('../assets/app-logos/youtube.png') },
  { id: '3', name: 'TikTok', iconRef: require('../assets/app-logos/tiktok.png') },
  { id: '4', name: 'Reddit', iconRef: require('../assets/app-logos/reddit.png') },
  { id: '5', name: 'X', iconRef: require('../assets/app-logos/x.png') },
  { id: '6', name: 'Pinterest', iconRef: require('../assets/app-logos/pinterest.png') },
  { id: '7', name: 'Facebook', iconRef: require('../assets/app-logos/facebook.png') },
  { id: '8', name: 'LinkedIn', iconRef: require('../assets/app-logos/linkedin.png') },
];

interface AppsStore {
  restrictedAppIds: string[];
  addApp: (appId: string) => void;
  removeApp: (appId: string) => void;
  getRestrictedApps: () => AppData[];
}

export const useAppsStore = create<AppsStore>()(
  persist(
    (set, get) => ({
      // Initially, let's say they are all blocked by default
      restrictedAppIds: APP_CATALOG.map(a => a.id),
      
      addApp: (appId) => set((state) => {
        if (!state.restrictedAppIds.includes(appId)) {
          return { restrictedAppIds: [...state.restrictedAppIds, appId] };
        }
        return state;
      }),
      
      removeApp: (appId) => set((state) => ({
        restrictedAppIds: state.restrictedAppIds.filter(id => id !== appId)
      })),
      
      getRestrictedApps: () => {
        const ids = get().restrictedAppIds;
        return APP_CATALOG.filter(app => ids.includes(app.id));
      }
    }),
    {
      name: 'focusqo-restricted-apps',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
