import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorPalette, PALETTES } from '../constants/Palettes';

interface ThemeState {
  activePaletteId: string;
  palette: ColorPalette;
  setPalette: (id: string) => Promise<void>;
  loadPalette: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  activePaletteId: 'warmFocus',
  palette: PALETTES['warmFocus'],
  setPalette: async (id: string) => {
    if (PALETTES[id]) {
      set({ activePaletteId: id, palette: PALETTES[id] });
      await AsyncStorage.setItem('@focusqo_palette', id);
    }
  },
  loadPalette: async () => {
    try {
      const savedId = await AsyncStorage.getItem('@focusqo_palette');
      if (savedId && PALETTES[savedId]) {
        set({ activePaletteId: savedId, palette: PALETTES[savedId] });
      }
    } catch (e) {
      console.error('Failed to load palette', e);
    }
  },
}));
