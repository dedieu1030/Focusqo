import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorPalette, PALETTES, BRAND_COLORS } from '../constants/Palettes';

interface ThemeState {
  activePaletteId: string;
  palette: ColorPalette;
  lockBrandColors: boolean;
  setPalette: (id: string) => Promise<void>;
  setLockBrandColors: (lock: boolean) => Promise<void>;
  loadPalette: () => Promise<void>;
}

const getEffectivePalette = (basePalette: ColorPalette, lock: boolean): ColorPalette => {
  if (!lock) return basePalette;
  return {
    ...basePalette,
    focusColor: BRAND_COLORS.focus,
    breakColor: BRAND_COLORS.break,
  };
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  activePaletteId: 'warmFocus',
  palette: getEffectivePalette(PALETTES['warmFocus'], false),
  lockBrandColors: false,
  setPalette: async (id: string) => {
    if (PALETTES[id]) {
      const lock = get().lockBrandColors;
      set({ 
        activePaletteId: id, 
        palette: getEffectivePalette(PALETTES[id], lock) 
      });
      await AsyncStorage.setItem('@focusqo_palette', id);
    }
  },
  setLockBrandColors: async (lock: boolean) => {
    const { activePaletteId } = get();
    const basePalette = PALETTES[activePaletteId];
    set({ 
      lockBrandColors: lock, 
      palette: getEffectivePalette(basePalette, lock) 
    });
    await AsyncStorage.setItem('@focusqo_lock_colors', lock ? 'true' : 'false');
  },
  loadPalette: async () => {
    try {
      const savedId = await AsyncStorage.getItem('@focusqo_palette');
      const savedLock = await AsyncStorage.getItem('@focusqo_lock_colors');
      
      const lock = savedLock === 'true';
      const id = (savedId && PALETTES[savedId]) ? savedId : 'warmFocus';
      
      set({ 
        activePaletteId: id, 
        lockBrandColors: lock,
        palette: getEffectivePalette(PALETTES[id], lock)
      });
    } catch (e) {
      console.error('Failed to load theme preference', e);
    }
  },
}));
