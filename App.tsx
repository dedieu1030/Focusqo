import React, { useEffect, useState, useRef } from 'react';
import "./global.css";
import { View, StyleSheet, SafeAreaView, AppState, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TimerScreen } from './screens/TimerScreen';
import { InsightsScreen } from './screens/InsightsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { TodayRhythm } from './components/Rhythm/TodayRhythm';
import { BlockedApps } from './components/Rhythm/BlockedApps';
import { BottomNav, ScreenName } from './components/Navigation/BottomNav';
import { useThemeStore } from './store/useThemeStore';
import { useTimerStore } from './store/useTimerStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('timer');
  const [activePage, setActivePage] = useState(0);
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

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setActivePage(page);
  };

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
      <SafeAreaView style={[styles.bottomSection, { backgroundColor: '#111111' }]}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={SCREEN_WIDTH}
        >
          <View style={{ width: SCREEN_WIDTH }}>
            <TodayRhythm />
          </View>
          <View style={{ width: SCREEN_WIDTH }}>
            <BlockedApps />
          </View>
        </ScrollView>
        
        {/* Pagination Dots (as seen in reference) */}
        <View className="flex-row justify-center gap-2 mt-6 mb-6">
           <View 
             className="h-1.5 rounded-full" 
             style={{ 
               width: activePage === 0 ? 24 : 6,
               backgroundColor: 'white', 
               opacity: activePage === 0 ? 0.9 : 0.2 
             }} 
           />
           <View 
             className="h-1.5 rounded-full" 
             style={{ 
               width: activePage === 1 ? 24 : 6,
               backgroundColor: 'white', 
               opacity: activePage === 1 ? 0.9 : 0.2 
             }} 
           />
        </View>

        <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111', 
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
