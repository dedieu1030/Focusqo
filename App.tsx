import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TimerScreen } from './screens/TimerScreen';
import { InsightsScreen } from './screens/InsightsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { TodayRhythm } from './components/Rhythm/TodayRhythm';
import { BottomNav, ScreenName } from './components/Navigation/BottomNav';
import { useThemeStore } from './store/useThemeStore';
import { useTimerStore } from './store/useTimerStore';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('timer');
  const { palette, loadPalette } = useThemeStore();
  const { loadState, tick, syncBackgroundTime } = useTimerStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadPalette();
      await loadState();
      setIsLoaded(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    
    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoaded, tick]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        syncBackgroundTime();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [syncBackgroundTime]);

  if (!isLoaded) return null; // Or a loading spinner

  return (
    <View style={styles.container}>
      <StatusBar style={palette.id === 'midnight' ? 'light' : 'dark'} />
      
      {/* The main white/light card that stacks above */}
      <View style={styles.cardContainer}>
        {currentScreen === 'timer' && <TimerScreen />}
        {currentScreen === 'insights' && <InsightsScreen />}
        {currentScreen === 'settings' && <SettingsScreen />}
      </View>
      
      {/* The dark bottom section that stays fixed */}
      <SafeAreaView style={[styles.bottomSection, { backgroundColor: '#000000' }]}>
        <TodayRhythm />
        <View style={styles.spacer} />
        <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', 
  },
  cardContainer: {
    flex: 1,
    zIndex: 10,
  },
  bottomSection: {
    zIndex: 1,
  },
  spacer: {
    height: 16,
  }
});
