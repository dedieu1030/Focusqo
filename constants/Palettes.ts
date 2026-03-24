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
    background: '#1C1C1E', // Slightly lighter than true black base
    timerBlock: '#3A3A3C', // Contrasts with background
    timerText: '#FFFFFF', // High contrast text inside timerBlock
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
    timerBlock: '#333333', // Distinct dark gray
    timerText: '#FFFFFF',
    primaryText: '#111111',
    secondaryText: '#888888',
    focusColor: '#666666',
    breakColor: '#999999',
    accentColor: '#CCCCCC',
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    background: '#1A2F24', // Use a deep forest green
    timerBlock: '#2D4539', // Lighter block
    timerText: '#EAEFE9', // Light text
    primaryText: '#EAEFE9',
    secondaryText: '#899E93',
    focusColor: '#7BB396',
    breakColor: '#E09F7D',
    accentColor: '#4A5E52',
  },
  coral: {
    id: 'coral',
    name: 'Coral',
    background: '#FFF5F4',
    timerBlock: '#4A2522',
    timerText: '#FFF5F4',
    primaryText: '#4A2522',
    secondaryText: '#C49B99',
    focusColor: '#E57373',
    breakColor: '#81C784',
    accentColor: '#F0C9C7',
  },
  arctic: {
    id: 'arctic',
    name: 'Arctic',
    background: '#F0F6FA',
    timerBlock: '#2E3A45',
    timerText: '#F0F6FA',
    primaryText: '#2E3A45',
    secondaryText: '#99AAB8',
    focusColor: '#64B5F6',
    breakColor: '#FFB74D',
    accentColor: '#CFDCE6',
  },
};
