export const BRAND_COLORS = {
  focus: '#0A84FF', // Midnight Blue
  break: '#FF9F0A', // Midnight Orange
  danger: '#FF453A', // System Red
  deep: '#5E5CE6',   // System Indigo
};

export type ColorPalette = {
  id: string;
  name: string;
  background: string;
  timerBlock: string;
  timerText: string;
  primaryText: string;
  secondaryText: string;
  focusColor: string;
  breakColor: string;
  accentColor: string;
};

export const PALETTES: Record<string, ColorPalette> = {
  warmFocus: {
    id: 'warmFocus',
    name: 'Warm Focus',
    background: '#F8F0D8',
    timerBlock: '#222222', 
    timerText: '#F8F0D8',
    primaryText: '#333333',
    secondaryText: '#999999',
    focusColor: '#4A90E2',
    breakColor: '#FF8C42',
    accentColor: '#B0B0B0',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    background: '#1C1C1E',
    timerBlock: '#3A3A3C',
    timerText: '#FFFFFF',
    primaryText: '#FFFFFF',
    secondaryText: '#8E8E93',
    focusColor: '#0A84FF',
    breakColor: '#FF9F0A',
    accentColor: '#636366',
  },
  sage: {
    id: 'sage',
    name: 'Sage',
    background: '#EAEFE9',
    timerBlock: '#2C3E35',
    timerText: '#EAEFE9',
    primaryText: '#2C3E35',
    secondaryText: '#8A9A92',
    focusColor: '#5A937B',
    breakColor: '#D98A6C',
    accentColor: '#B4C4BC',
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    background: '#E6EBEF',
    timerBlock: '#1D2D3D',
    timerText: '#E6EBEF',
    primaryText: '#1D2D3D',
    secondaryText: '#879EAE',
    focusColor: '#4D8AB5',
    breakColor: '#C47761',
    accentColor: '#B5C4D0',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    background: '#FDF7F3',
    timerBlock: '#3D2B1F',
    timerText: '#FDF7F3',
    primaryText: '#3D2B1F',
    secondaryText: '#B19A8D',
    focusColor: '#D36F54',
    breakColor: '#F2A65A',
    accentColor: '#DFCEC5',
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender',
    background: '#F4F2F7',
    timerBlock: '#2D283E',
    timerText: '#F4F2F7',
    primaryText: '#2D283E',
    secondaryText: '#A19CB3',
    focusColor: '#8E7CC3',
    breakColor: '#E69E8C',
    accentColor: '#C9C4D9',
  },
  monochrome: {
    id: 'monochrome',
    name: 'Monochrome',
    background: '#FFFFFF',
    timerBlock: '#222222',
    timerText: '#FFFFFF',
    primaryText: '#111111',
    secondaryText: '#888888',
    focusColor: '#444444',
    breakColor: '#777777',
    accentColor: '#CCCCCC',
  },
  silver: {
    id: 'silver',
    name: 'Silver',
    background: '#F1F5F9',
    timerBlock: '#1E293B',
    timerText: '#F1F5F9',
    primaryText: '#1E293B',
    secondaryText: '#64748B',
    focusColor: '#475569',
    breakColor: '#94A3B8',
    accentColor: '#CBD5E1',
  },
  earthy: {
    id: 'earthy',
    name: 'Earthy',
    background: '#FAF9F6',
    timerBlock: '#453E3B',
    timerText: '#FAF9F6',
    primaryText: '#453E3B',
    secondaryText: '#A89081',
    focusColor: '#8B735B',
    breakColor: '#C1A88B',
    accentColor: '#D6CFC7',
  },
  nordicBlue: {
    id: 'nordicBlue',
    name: 'Nordic Blue',
    background: '#F0F9FF',
    timerBlock: '#0C4A6E',
    timerText: '#F0F9FF',
    primaryText: '#0C4A6E',
    secondaryText: '#075985',
    focusColor: '#0EA5E9',
    breakColor: '#BAE6FD',
    accentColor: '#BAE6FD',
  },
};
