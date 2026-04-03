import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Chart, Setting2, Timer1, Moon } from 'iconsax-react-native';
import { useThemeStore } from '../../store/useThemeStore';

export type ScreenName = 'timer' | 'insights' | 'settings' | 'sleep';

interface BottomNavProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const { palette } = useThemeStore();

  return (
    <View style={styles.container}>
      {/* INSIGHTS */}
      <TouchableOpacity 
        style={[styles.navItem, currentScreen === 'insights' && { backgroundColor: palette.timerBlock }]} 
        onPress={() => onNavigate('insights')}
      >
        <Chart 
          size={24} 
          color={currentScreen === 'insights' ? palette.timerText : palette.secondaryText} 
          variant={currentScreen === 'insights' ? 'Bold' : 'Linear'}
        />
      </TouchableOpacity>

      {/* SLEEP (HERO) */}
      <TouchableOpacity 
        style={[
          styles.heroItem, 
          currentScreen === 'sleep' && { backgroundColor: palette.focusColor }
        ]} 
        onPress={() => onNavigate('sleep')}
      >
        <Moon 
          size={28} 
          color={currentScreen === 'sleep' ? '#FFFFFF' : palette.secondaryText} 
          variant={currentScreen === 'sleep' ? 'Bold' : 'Linear'}
        />
      </TouchableOpacity>

      {/* TIMER (HERO) */}
      <TouchableOpacity 
        style={[
          styles.heroItem, 
          currentScreen === 'timer' && { backgroundColor: palette.timerBlock }
        ]} 
        onPress={() => onNavigate('timer')}
      >
        <Timer1 
          size={28} 
          color={currentScreen === 'timer' ? palette.timerText : palette.secondaryText} 
          variant={currentScreen === 'timer' ? 'Bold' : 'Linear'}
        />
      </TouchableOpacity>

      {/* SETTINGS */}
      <TouchableOpacity 
        style={[styles.navItem, currentScreen === 'settings' && { backgroundColor: palette.timerBlock }]} 
        onPress={() => onNavigate('settings')}
      >
        <Setting2 
          size={24} 
          color={currentScreen === 'settings' ? palette.timerText : palette.secondaryText} 
          variant={currentScreen === 'settings' ? 'Bold' : 'Linear'}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 18,
    paddingBottom: 8, 
  },
  navItem: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  heroItem: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  navText: {
    display: 'none',
  },
});
