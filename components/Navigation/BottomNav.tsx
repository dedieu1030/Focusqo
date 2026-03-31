import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Chart, Setting2, Timer1 } from 'iconsax-react-native';
import { useThemeStore } from '../../store/useThemeStore';

export type ScreenName = 'timer' | 'insights' | 'settings';

interface BottomNavProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const { palette } = useThemeStore();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.navItem, currentScreen === 'insights' && { backgroundColor: palette.timerBlock }]} 
        onPress={() => onNavigate('insights')}
      >
        <Chart 
          size={24} 
          color={currentScreen === 'insights' ? palette.timerText : palette.secondaryText} 
          variant={currentScreen === 'insights' ? 'Bold' : 'Linear'}
        />
        <Text style={[styles.navText, { color: currentScreen === 'insights' ? palette.timerText : palette.secondaryText }]}>Insights</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[
          styles.centerItem, 
          currentScreen === 'timer' && { backgroundColor: palette.timerBlock }
        ]} 
        onPress={() => onNavigate('timer')}
      >
        <Timer1 
          size={32} 
          color={currentScreen === 'timer' ? palette.timerText : palette.secondaryText} 
          variant={currentScreen === 'timer' ? 'Bold' : 'Linear'}
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.navItem, currentScreen === 'settings' && { backgroundColor: palette.timerBlock }]} 
        onPress={() => onNavigate('settings')}
      >
        <Setting2 
          size={24} 
          color={currentScreen === 'settings' ? palette.timerText : palette.secondaryText} 
          variant={currentScreen === 'settings' ? 'Bold' : 'Linear'}
        />
        <Text style={[styles.navText, { color: currentScreen === 'settings' ? palette.timerText : palette.secondaryText }]}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 0, 
    gap: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 24,
    gap: 8,
    justifyContent: 'center',
  },
  centerItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  navText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
