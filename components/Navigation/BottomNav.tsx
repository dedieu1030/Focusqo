import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BarChart2, Settings, Timer } from 'lucide-react-native';
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
        <BarChart2 size={20} color={currentScreen === 'insights' ? palette.background : palette.secondaryText} />
        <Text style={[styles.navText, { color: currentScreen === 'insights' ? palette.background : palette.secondaryText }]}>Insights</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.navItem, styles.centerItem, currentScreen === 'timer' && { backgroundColor: palette.timerBlock }]} 
        onPress={() => onNavigate('timer')}
      >
        <Timer size={20} color={currentScreen === 'timer' ? palette.background : palette.secondaryText} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.navItem, currentScreen === 'settings' && { backgroundColor: palette.timerBlock }]} 
        onPress={() => onNavigate('settings')}
      >
        <Settings size={20} color={currentScreen === 'settings' ? palette.background : palette.secondaryText} />
        <Text style={[styles.navText, { color: currentScreen === 'settings' ? palette.background : palette.secondaryText }]}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40, // Base bottom padding for rounded screens
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  centerItem: {
    paddingHorizontal: 24, // Wider for the center main button
  },
  navText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
